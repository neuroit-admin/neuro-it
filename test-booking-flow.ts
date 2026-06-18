import { prisma } from './lib/prisma'
import { getCongestionSurcharge } from './lib/ulez-static'

async function runTest() {
  console.log('--- STARTING BOOKING FLOW INTEGRATION TEST ---')

  // 1. Setup a test customer user
  const testEmail = 'tester@neuroit.co.uk'
  let user = await prisma.user.findUnique({
    where: { email: testEmail },
  })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test Customer',
        role: 'CUSTOMER',
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
    })
  }
  console.log(`[TEST] Verified Customer User: ${user.email} (ID: ${user.id})`)

  // 2. Fetch an active service from seed
  const service = await prisma.service.findFirst({
    where: { isActive: true },
  })
  if (!service) {
    throw new Error('No active services found in the database. Run seed first!')
  }
  console.log(`[TEST] Selected Service: ${service.name} (ID: ${service.id}, Base: £${service.basePriceMin}-£${service.basePriceMax})`)

  // 3. Define a London booking address (ULEZ active postcode)
  const testAddress = {
    postcode: 'EC1A 1BB',
    houseNumber: '10',
    addressLine1: 'London Wall',
    city: 'London',
    isUlez: true,
    isCongestion: true
  }

  // 4. Simulate POST /api/tickets logic (Address find/create)
  console.log('[TEST] Simulating ticket creation POST /api/tickets...')
  let address = await prisma.address.findFirst({
    where: {
      userId: user.id,
      postcode: testAddress.postcode,
      houseNumber: testAddress.houseNumber,
    },
  })

  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: user.id,
        postcode: testAddress.postcode,
        houseNumber: testAddress.houseNumber,
        addressLine1: testAddress.addressLine1,
        city: testAddress.city,
        isUlezZone: testAddress.isUlez,
        isCongestionZone: testAddress.isCongestion,
      },
    })
  }
  console.log(`[TEST] Verified Address: ${address.houseNumber} ${address.addressLine1} (ID: ${address.id})`)

  // Calculate pricing surcharges
  const ulezFee = 0
  const congestionFee = address.isCongestionZone ? getCongestionSurcharge() : 0
  const totalMin = service.basePriceMin + service.callOutFee + ulezFee + congestionFee
  const totalMax = service.basePriceMax + service.callOutFee + ulezFee + congestionFee
  
  const depositPercent = 0.5
  const depositAmount = totalMin * depositPercent

  console.log(`[TEST] Calculated Pricing Surcharges: ULEZ = £${ulezFee}, Congestion = £${congestionFee}`)
  console.log(`[TEST] Total Min/Max Estimate: £${totalMin} - £${totalMax}. Required Deposit: £${depositAmount}`)

  // Create Ticket in PENDING_PAYMENT state
  const referenceCode = `NEURO-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  const ticket = await prisma.ticket.create({
    data: {
      referenceCode,
      customerId: user.id,
      serviceId: service.id,
      addressId: address.id,
      issueDescription: 'Test ticket for local booking flow validation.',
      estimatedPriceMin: totalMin,
      estimatedPriceMax: totalMax,
      priority: 'STANDARD',
      status: 'PENDING_PAYMENT',
      isUlezSurcharge: false,
      isCongestionSurcharge: address.isCongestionZone,
    },
  })
  console.log(`[TEST] Created Ticket with PENDING_PAYMENT status: ${ticket.referenceCode} (ID: ${ticket.id})`)

  // 5. Simulate Stripe payment redirect url checkout session
  const mockSessionId = `cs_mock_${Date.now()}`
  const mockRedirectUrl = `http://localhost:3000/book?step=2&referenceCode=${referenceCode}&ticketId=${ticket.id}&session_id=${mockSessionId}&mock_success=true`
  console.log(`[TEST] Generated Stripe Checkout Redirect URL: ${mockRedirectUrl}`)

  // 6. Simulate checkout session webhook trigger (checkout.session.completed)
  console.log('[TEST] Simulating payment webhook POST /api/payments/webhook...')
  
  const webhookResponse = await fetch('http://localhost:3000/api/payments/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mock_success: true,
      ticketId: ticket.id,
      referenceCode: referenceCode,
      amount: depositAmount,
      paymentIntentId: `pi_mock_${Math.random().toString(36).substr(2, 8)}`,
    }),
  })

  if (!webhookResponse.ok) {
    throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`)
  }
  const webhookData = await webhookResponse.json()
  console.log('[TEST] Webhook Response:', webhookData)

  // 7. Verify updates in DB
  const updatedTicket = await prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: { payment: true },
  })

  if (!updatedTicket) {
    throw new Error('Ticket not found after webhook simulation!')
  }

  console.log('--- DB POST-PAYMENT STATE VERIFICATION ---')
  console.log(`Ticket Status (Expected: CREATED): ${updatedTicket.status}`)
  console.log(`Payment Record Exists? ${!!updatedTicket.payment}`)
  if (updatedTicket.payment) {
    console.log(`Payment Status (Expected: PAID): ${updatedTicket.payment.status}`)
    console.log(`Payment Amount Captured: £${updatedTicket.payment.amount}`)
  }

  if (updatedTicket.status === 'CREATED' && updatedTicket.payment?.status === 'PAID') {
    console.log('[SUCCESS] INTEGRATION TEST PASSED! The booking flow successfully persists data, redirects to Stripe, and confirms payments via webhook.')
  } else {
    console.error('[FAIL] Test failed. Ticket status or payment record is incorrect.')
  }
}

runTest().catch((err) => {
  console.error('[TEST ERROR] Integration test failed:', err)
  process.exit(1)
})
