import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/rbac'
import { sendEmail } from '@/lib/resend'
import fs from 'fs'
import path from 'path'

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Missing shipping label file' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'pdf'
    const filename = `shipping_label_${id}.${ext}`
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'tickets')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)

    const shippingLabelUrl = `/api/tickets/photos/view/${filename}`

    // Update ticket in database
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { shippingLabelUrl },
      include: { customer: true }
    })

    // Construct customer portal URL
    const host = req.headers.get('host') || 'localhost:4000'
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
    const portalUrl = `${protocol}/portal/ticket/${id}?token=${ticket.securityToken}`

    // Send notification email
    if (updatedTicket.customer.email) {
      await sendEmail({
        to: updatedTicket.customer.email,
        subject: `Your Prepaid Shipping Label is Ready — ${ticket.referenceCode}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #00D2FF;">Prepaid Shipping Label Ready</h2>
            <p>Hello ${updatedTicket.customer.name || 'Customer'},</p>
            <p>Your prepaid Royal Mail Special Delivery shipping label has been generated for your repair request (Reference: <code>${ticket.referenceCode}</code>).</p>
            <p>Please download your label and follow the packing instructions inside your tracking portal:</p>
            <p style="margin: 25px 0;">
              <a href="${portalUrl}" style="background-color: #00D2FF; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Download Shipping Label</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">NEURO IT SUPPORT SERVICES LTD · London, EN5 5YL</p>
          </div>
        `
      }).catch(err => console.error('Failed to send shipping label notification email:', err))
    }

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Save shipping label error:', error)
    return NextResponse.json({ error: 'Failed to save shipping label' }, { status: 500 })
  }
}
