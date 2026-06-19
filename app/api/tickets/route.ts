import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, sendAdminNewTicketNotification } from '@/lib/resend'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const tickets = await prisma.ticket.findMany({
    where: { customerId: userId },
    include: { service: true, address: true, technician: { include: { techProfile: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ tickets })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  try {
    const body = await req.json()
    let userId = ''
    let userEmail = ''

    if (session?.user) {
      userId = (session.user as any).id
      userEmail = session.user.email || ''
    } else if (body.guestDetails) {
      const { email, name, phone } = body.guestDetails
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Invalid guest email address' }, { status: 400 })
      }
      
      const cleanEmail = email.trim().toLowerCase()
      
      let user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      })
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: name || cleanEmail.split('@')[0],
            phone: phone || null,
            role: 'CUSTOMER',
            gdprConsent: true,
            gdprConsentAt: new Date(),
          },
        })
      }
      
      userId = user.id
      userEmail = user.email || ''
    } else {
      return NextResponse.json({ error: 'Unauthorized: Session or Guest details required' }, { status: 401 })
    }

    // OTP validation for Pay on Arrival / £0 checkout
    if (body.paymentOption === 'ON_ARRIVAL') {
      if (!userEmail) {
        return NextResponse.json({ error: 'Email address is required for verification' }, { status: 400 })
      }
      if (!body.otpCode) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
      }
      
      const cleanEmail = userEmail.trim().toLowerCase()
      const otpToken = body.otpCode.trim()
      
      const dbToken = await prisma.verificationToken.findFirst({
        where: {
          email: cleanEmail,
          token: otpToken,
        }
      })
      
      if (!dbToken) {
        return NextResponse.json({ error: 'Invalid verification code. Please check your email and try again.' }, { status: 400 })
      }
      
      if (new Date() > dbToken.expires) {
        await prisma.verificationToken.delete({ where: { token: dbToken.token } }).catch(() => {})
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 })
      }
      
      await prisma.verificationToken.delete({ where: { token: dbToken.token } }).catch(() => {})
    }

    const serviceType = body.serviceType || 'HOME_VISIT'
    const isHomeVisit = serviceType === 'HOME_VISIT'
    const isMailIn = serviceType === 'MAIL_IN'
    const isDropOff = serviceType === 'DROP_OFF'

    if (!body.serviceId || !body.issueDescription) {
      return NextResponse.json({ error: 'Missing required service ID or issue description' }, { status: 400 })
    }

    if ((isHomeVisit || isMailIn) && !body.address) {
      return NextResponse.json({ error: 'Address is required for this service method' }, { status: 400 })
    }

    if (isDropOff && (!body.dropOffDate || !body.dropOffSlot)) {
      return NextResponse.json({ error: 'Drop-off date and slot are required' }, { status: 400 })
    }

    if (isMailIn) {
      if (!body.photoUrls || !Array.isArray(body.photoUrls) || body.photoUrls.length < 2) {
        return NextResponse.json({ error: 'Please upload at least 2 photos of your device before submitting.' }, { status: 400 })
      }
      if (body.photoUrls.length > 3) {
        return NextResponse.json({ error: 'Maximum 3 photos are allowed.' }, { status: 400 })
      }
    }

    const { checkUlez } = await import('@/lib/ulez-static')
    const { createCheckoutSession } = await import('@/lib/stripe')
    const { getCongestionSurcharge } = await import('@/lib/ulez-static')

    // 1. Find or create the address for this customer
    let address = null
    if (body.address) {
      address = await prisma.address.findFirst({
        where: {
          userId,
          postcode: body.address.postcode,
          houseNumber: body.address.houseNumber,
        },
      })

      if (!address) {
        address = await prisma.address.create({
          data: {
            userId,
            postcode: body.address.postcode,
            houseNumber: body.address.houseNumber,
            addressLine1: body.address.addressLine1,
            city: body.address.city || 'London',
            isUlezZone: body.address.isUlez || false,
            isCongestionZone: body.address.isCongestion || false,
          },
        })
      }
    }

    // 2. Fetch the service data to calculate pricing and deposit
    const service = await prisma.service.findUnique({
      where: { id: body.serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate pricing surcharges
    const ulezFee = 0
    const congestionFee = (isHomeVisit && address?.isCongestionZone) ? getCongestionSurcharge() : 0
    const callOutFee = isHomeVisit ? service.callOutFee : 0
    
    const totalMin = service.basePriceMin + callOutFee + ulezFee + congestionFee
    const totalMax = service.basePriceMax + callOutFee + ulezFee + congestionFee
    
    // Check postcode coverage
    const { isPostcodeInOperatingArea } = await import('@/lib/coverage')
    const inCoverage = isHomeVisit 
      ? (address ? await isPostcodeInOperatingArea(address.postcode) : false)
      : true
    
    // Retrieve dynamic deposit amount based on postcode zone
    let flatDeposit = 10.00
    try {
      const { getPostcodeZone } = await import('@/lib/coverage')
      const postcodeZone = address ? await getPostcodeZone(address.postcode) : null
      if (postcodeZone === 'STANDARD_999') {
        flatDeposit = 15.00
      } else if (postcodeZone === 'FREE_CALL_OUT') {
        flatDeposit = 10.00
      }
    } catch (err) {
      console.error('Failed to retrieve dynamic zone deposit, using fallback:', err)
    }

    let status = 'CREATED'
    if (isHomeVisit) {
      status = inCoverage ? 'PENDING_PAYMENT' : 'CREATED'
      if (body.paymentOption === 'ON_ARRIVAL') {
        status = 'CREATED'
      }
    }

    const isEmergency = body.isEmergency || service.slug.includes('emergency') || service.slug.includes('out-of-hours')

    // 3. Generate reference code and security token
    const referenceCode = `NEURO-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    const securityToken = globalThis.crypto.randomUUID()

    // 4. Create the Ticket
    const ticket = await prisma.ticket.create({
      data: {
        referenceCode,
        securityToken,
        customerId: userId,
        serviceId: service.id,
        addressId: address ? address.id : null,
        issueDescription: body.issueDescription,
        estimatedPriceMin: totalMin,
        estimatedPriceMax: totalMax,
        priority: isEmergency ? 'EMERGENCY' : 'STANDARD',
        status,
        serviceType,
        dropOffSlot: isDropOff ? body.dropOffSlot : null,
        scheduledFor: isDropOff ? new Date(body.dropOffDate) : null,
        returnAddress: isMailIn && body.address 
          ? `${body.address.houseNumber} ${body.address.addressLine1}, ${body.address.postcode}, London`
          : null,
        isUlezSurcharge: false,
        isCongestionSurcharge: (isHomeVisit && address) ? address.isCongestionZone : false,
        adminNote: isHomeVisit 
          ? (body.paymentOption === 'ON_ARRIVAL'
              ? `Payment: Pay on Arrival (Awaiting Operator Phone Call Confirmation)${inCoverage ? '' : '. Out of coverage zone. Travel fee negotiation required.'}`
              : inCoverage ? null : 'Out of coverage zone. Travel fee negotiation required.')
          : isMailIn 
            ? 'Service: Mail-in (Awaiting postage label upload)'
            : `Service: Drop-off (Scheduled for ${body.dropOffDate} - ${body.dropOffSlot})`,
      },
    })

    // Process uploaded photos for Mail-in
    if (isMailIn && body.photoUrls && Array.isArray(body.photoUrls)) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'tickets')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      for (const photoUrl of body.photoUrls) {
        const filename = photoUrl.split('/').pop()
        if (filename && filename.startsWith('temp_')) {
          const tempPath = path.join(process.cwd(), 'uploads', 'temp', filename)
          if (fs.existsSync(tempPath)) {
            const parts = filename.split('_')
            const labelAndExt = parts[parts.length - 1]
            const label = labelAndExt.split('.')[0]
            const ext = labelAndExt.split('.').pop() || 'jpg'

            const photoRecord = await prisma.devicePhoto.create({
              data: {
                ticketId: ticket.id,
                url: '',
                label,
              }
            })

            const newFilename = `${photoRecord.id}.${ext}`
            const destPath = path.join(uploadDir, newFilename)

            fs.renameSync(tempPath, destPath)

            await prisma.devicePhoto.update({
              where: { id: photoRecord.id },
              data: { url: `/api/tickets/photos/view/${newFilename}` }
            })
          }
        }
      }
    }

    // Construct dynamic baseUrl to support port 4000
    const host = req.headers.get('host') || 'localhost:4000'
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    const portalUrl = `${baseUrl}/portal/ticket/${ticket.id}?token=${securityToken}`

    // Trigger Admin Notifications (Email, Telegram, Discord Webhooks)
    try {
      // 1. Email notification to Admin
      sendAdminNewTicketNotification({
        referenceCode,
        serviceName: service.name,
        customerEmail: userEmail,
        serviceType,
        estimatedPrice: `£${totalMin.toFixed(0)}–£${totalMax.toFixed(0)}`,
      }).catch(err => console.error('Failed to send admin new ticket email:', err))

      // 2. Telegram Alert
      const alertMsg = `<b>[NEW TICKET]</b>\n` +
        `Reference: <code>${referenceCode}</code>\n` +
        `Service: ${service.name}\n` +
        `Type: ${serviceType}\n` +
        `Customer: ${userEmail}\n` +
        `Est. Price: £${totalMin.toFixed(0)}–£${totalMax.toFixed(0)}\n\n` +
        `<a href="${baseUrl}/admin/tickets">View Ticket Dashboard</a>`

      import('@/lib/notifications').then(m => {
        m.sendTelegramAlert(alertMsg)
      }).catch(err => console.error('Failed to import Telegram notifications:', err))

      // 3. Discord Alert
      const discordMsg = `**[NEW TICKET]**\n` +
        `Reference: \`${referenceCode}\`\n` +
        `Service: ${service.name}\n` +
        `Type: ${serviceType}\n` +
        `Customer: ${userEmail}\n` +
        `Est. Price: £${totalMin.toFixed(0)}–£${totalMax.toFixed(0)}\n` +
        `Link: ${baseUrl}/admin/tickets`

      import('@/lib/notifications').then(m => {
        m.sendDiscordAlert(discordMsg)
      }).catch(err => console.error('Failed to import Discord notifications:', err))
    } catch (notiErr) {
      console.error('Failed to trigger admin notification alerts:', notiErr)
    }

    // 5. Generate Stripe Checkout Session if in coverage area and ONLINE payment chosen (only for HOME_VISIT)
    let checkoutUrl = null
    const isOnlinePayment = body.paymentOption !== 'ON_ARRIVAL'
    if (isHomeVisit && inCoverage && isOnlinePayment) {
      const stripeSession = await createCheckoutSession({
        ticketId: ticket.id,
        referenceCode,
        amount: flatDeposit,
        customerEmail: userEmail,
        serviceName: service.name,
        baseUrl,
      })
      checkoutUrl = stripeSession.url
    }

    // Send transaction email confirmation for Mail-in / Drop-off
    if (userEmail) {
      if (isMailIn) {
        await sendEmail({
          to: userEmail,
          subject: `Mail-in Repair Request Received — ${referenceCode}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #00D2FF;">Mail-in Repair Request Received</h2>
              <p>Hello,</p>
              <p>Your mail-in repair request for <strong>${service.name}</strong> has been received (Reference: <code>${referenceCode}</code>).</p>
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>We will prepare and email your prepaid Royal Mail Special Delivery shipping label within 24 hours.</li>
                <li>Once you receive the label, package your device securely (remove passwords/back up data) and drop it off at any Post Office.</li>
                <li>We aim to repair and return your device within 3–5 working days of receiving it.</li>
              </ol>
              <p><strong>Workshop Return Address:</strong></p>
              <p style="background-color: #f7f7f7; padding: 12px; border-radius: 4px; font-family: monospace;">
                High Street, Barnet, London, EN5 5YL
              </p>
              <p style="margin: 25px 0; text-align: center;">
                <a href="${portalUrl}" style="background-color: #00D2FF; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Track Your Repair</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">NEURO IT · London, EN5 5YL</p>
            </div>
          `
        }).catch(err => console.error('Failed to send Mail-in confirmation email:', err))
      } else if (isDropOff) {
        await sendEmail({
          to: userEmail,
          subject: `Drop-off Appointment Confirmed — ${referenceCode}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #00D2FF;">Drop-off Appointment Confirmed</h2>
              <p>Hello,</p>
              <p>Your drop-off repair appointment for <strong>${service.name}</strong> has been scheduled (Reference: <code>${referenceCode}</code>).</p>
              <p><strong>Appointment Details:</strong></p>
              <ul>
                <li><strong>Date:</strong> ${body.dropOffDate}</li>
                <li><strong>Time Slot:</strong> ${body.dropOffSlot === 'MORNING' ? 'Morning (9:00 - 12:00)' : body.dropOffSlot === 'AFTERNOON' ? 'Afternoon (12:00 - 15:00)' : 'Evening (15:00 - 18:00)'}</li>
              </ul>
              <p><strong>Workshop Location:</strong></p>
              <p style="background-color: #f7f7f7; padding: 12px; border-radius: 4px; font-family: monospace;">
                High Street, Barnet, London, EN5 5YL
              </p>
              <p>Please drop off your device at our workshop during your selected time slot. No payment is required until the repair is fully completed.</p>
              <p style="margin: 25px 0; text-align: center;">
                <a href="${portalUrl}" style="background-color: #00D2FF; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Track Your Repair</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">NEURO IT · London, EN5 5YL</p>
            </div>
          `
        }).catch(err => console.error('Failed to send Drop-off confirmation email:', err))
      }
    }

    return NextResponse.json({
      ticket,
      referenceCode,
      securityToken,
      checkoutUrl,
      needsNegotiation: !inCoverage,
    })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
