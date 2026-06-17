import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('your-')
  ? process.env.STRIPE_SECRET_KEY
  : null

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any }) : null

export async function createCheckoutSession({
  ticketId,
  referenceCode,
  amount,
  customerEmail,
  serviceName,
  baseUrl,
}: {
  ticketId: string
  referenceCode: string
  amount: number
  customerEmail: string
  serviceName: string
  baseUrl: string
}) {

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `Deposit: ${serviceName}`,
                description: `Booking deposit for repair reference ${referenceCode}`,
              },
              unit_amount: Math.round(amount * 100), // in pence
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/book?step=2&referenceCode=${referenceCode}&ticketId=${ticketId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/book?step=1`,
        metadata: {
          ticketId,
          referenceCode,
        },
      })
      return { url: session.url }
    } catch (err) {
      console.error('Stripe checkout session creation failed:', err)
      throw err
    }
  }

  // Fallback mock session
  const mockSessionId = `cs_mock_${Date.now()}`
  const mockUrl = `${baseUrl}/book?step=2&referenceCode=${referenceCode}&ticketId=${ticketId}&session_id=${mockSessionId}&mock_success=true`
  console.log(`[MOCK STRIPE] Created checkout session: £${amount} for ticket ${referenceCode}. Redirect URL: ${mockUrl}`)
  return { url: mockUrl }
}

export function confirmPayment(paymentIntentId: string) {
  console.log(`[MOCK STRIPE] Payment confirmed: ${paymentIntentId}`)
  return { status: 'succeeded', paymentIntentId }
}

export function createRefund(paymentIntentId: string, amount?: number) {
  console.log(`[MOCK STRIPE] Refund created for ${paymentIntentId}${amount ? ` (£${amount})` : ' (full)'}`)
  return { status: 'succeeded', refundId: `re_mock_${Date.now()}` }
}
