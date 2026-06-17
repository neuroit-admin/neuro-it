import { NextResponse } from 'next/server'

// Mock Stripe payment intent creation
export async function POST(req: Request) {
  try {
    const { amount, currency = 'gbp', metadata } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const hasStripeSecret = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('your-')

    if (isProduction && !hasStripeSecret) {
      console.error('[STRIPE INTENT] Missing Stripe secret key in production!')
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 })
    }

    if (hasStripeSecret) {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency,
        metadata: metadata || {},
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      })
    }

    // Mock response for development only
    const mockId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    console.log(`[MOCK STRIPE] Payment intent created: £${amount} (${mockId})`)

    return NextResponse.json({
      clientSecret: `${mockId}_secret_mock`,
      paymentIntentId: mockId,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
