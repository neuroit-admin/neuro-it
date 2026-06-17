import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/rbac'
import { sendEmail } from '@/lib/resend'

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const body = await req.json()
    const { returnTrackingNum } = body

    if (!returnTrackingNum) {
      return NextResponse.json({ error: 'Missing return tracking number' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { customer: true }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Update ticket return tracking number
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { returnTrackingNum },
      include: { customer: true }
    })

    const trackingUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${returnTrackingNum.trim()}`

    // Send dispatch email
    if (updatedTicket.customer.email) {
      await sendEmail({
        to: updatedTicket.customer.email,
        subject: `Your Repaired Device Has Been Dispatched — ${ticket.referenceCode}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #22C55E;">Device Dispatched</h2>
            <p>Hello ${updatedTicket.customer.name || 'Customer'},</p>
            <p>We have successfully repaired and dispatched your device back to you (Reference: <code>${ticket.referenceCode}</code>).</p>
            <p>It has been shipped via Royal Mail Special Delivery. Here is your tracking number:</p>
            <p style="background-color: #f7f7f7; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; letter-spacing: 0.05em; color: #333;">
              ${returnTrackingNum}
            </p>
            <p style="margin: 25px 0; text-align: center;">
              <a href="${trackingUrl}" style="background-color: #22C55E; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Track Shipment on Royal Mail</a>
            </p>
            <p style="font-size: 13px; color: #555;">Please note that tracking information can take a few hours to populate on the carrier website.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">NEURO IT SUPPORT SERVICES LTD · London, EN5 5YL</p>
          </div>
        `
      }).catch(err => console.error('Failed to send dispatch tracking email:', err))
    }

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Save return tracking number error:', error)
    return NextResponse.json({ error: 'Failed to save return tracking number' }, { status: 500 })
  }
}
