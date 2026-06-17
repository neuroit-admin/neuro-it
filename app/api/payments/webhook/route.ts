import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmation } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.text()

  try {
    let ticketId: string | undefined
    let referenceCode: string | undefined
    let amountTotal = 0
    let stripeIntentId = ''
    let stripeCustomerId = ''

    const isProduction = process.env.NODE_ENV === 'production'
    const hasStripeSecret = process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.startsWith('your-')

    if (isProduction && !hasStripeSecret) {
      console.error('[STRIPE WEBHOOK] Missing Stripe webhook secret in production!')
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 })
    }

    if (hasStripeSecret) {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any })
      const sig = req.headers.get('stripe-signature')!

      const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any
        ticketId = session.metadata?.ticketId
        referenceCode = session.metadata?.referenceCode
        amountTotal = (session.amount_total ?? 0) / 100
        stripeIntentId = session.payment_intent || ''
        stripeCustomerId = session.customer || ''
      }
    } else {
      // Mock webhook event for local development only
      try {
        const jsonBody = JSON.parse(body)
        if (jsonBody.type === 'checkout.session.completed' || jsonBody.mock_success) {
          ticketId = jsonBody.ticketId
          referenceCode = jsonBody.referenceCode
          amountTotal = jsonBody.amount || 25
          stripeIntentId = jsonBody.paymentIntentId || `pi_mock_${Date.now()}`
        }
      } catch (err) {
        console.log('[MOCK STRIPE WEBHOOK] Received raw web request:', body)
      }
    }

    if (ticketId) {
      // 1. Fetch the ticket with its service and customer details
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { service: true, customer: true },
      })

      if (ticket) {
        // 2. Update the ticket status to 'CREATED'
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: 'CREATED' },
        })

        // 3. Create or update the Payment record in the database
        await prisma.payment.upsert({
          where: { ticketId },
          update: {
            status: 'PAID',
            amount: amountTotal,
            paidAt: new Date(),
            stripeIntentId,
            stripeCustomerId,
          },
          create: {
            ticketId,
            customerId: ticket.customerId,
            amount: amountTotal,
            currency: 'GBP',
            status: 'PAID',
            paidAt: new Date(),
            stripeIntentId,
            stripeCustomerId,
          },
        })

        // 4. Create an AuditLog entry
        await prisma.auditLog.create({
          data: {
            ticketId,
            action: 'PAYMENT_RECEIVED',
            metadata: JSON.stringify({ amount: amountTotal, stripeIntentId }),
          },
        })

        // 5. Send booking confirmation email
        if (ticket.customer.email) {
          await sendBookingConfirmation(
            ticket.customer.email,
            ticket.referenceCode,
            ticket.service?.name || 'Diagnostic/Repair'
          ).catch((e) => console.error('Failed to send confirmation email:', e))
        }

        console.log(`[STRIPE WEBHOOK] Successfully processed ticket booking payment: ${ticket.referenceCode}`)
      } else {
        console.warn(`[STRIPE WEBHOOK] Ticket not found for ID: ${ticketId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 })
  }
}
