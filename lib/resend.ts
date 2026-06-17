import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('your-')
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@neuro-it.co.uk',
        to,
        subject,
        html,
      })
      if (response.error) {
        throw new Error(JSON.stringify(response.error))
      }
      return { id: response.data?.id, status: 'sent' }
    } catch (error) {
      console.error('Resend email failed:', error)
      throw error
    }
  }

  // Fallback mock
  console.log(`[MOCK RESEND] To: ${to}`)
  console.log(`[MOCK RESEND] Subject: ${subject}`)
  console.log(`[MOCK RESEND] HTML length: ${html.length} chars`)
  return { id: `email_mock_${Date.now()}`, status: 'sent' }
}

export async function sendBookingConfirmation(email: string, referenceCode: string, serviceName: string) {
  return sendEmail({
    to: email,
    subject: `Booking Confirmed — ${referenceCode}`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Your booking for <strong>${serviceName}</strong> has been confirmed.</p>
      <p>Reference: <code>${referenceCode}</code></p>
      <p>Track your repair at: <a href="https://neuro-it.co.uk/portal">My Portal</a></p>
    `,
  })
}

export async function sendTechAssignedNotification(email: string, referenceCode: string, techName: string) {
  return sendEmail({
    to: email,
    subject: `Technician Assigned — ${referenceCode}`,
    html: `
      <h2>Technician Assigned</h2>
      <p><strong>${techName}</strong> has been assigned to your repair.</p>
      <p>Reference: <code>${referenceCode}</code></p>
    `,
  })
}

export async function sendAdminNewTicketNotification(ticketDetails: {
  referenceCode: string
  serviceName: string
  customerEmail: string
  serviceType: string
  estimatedPrice: string
}) {
  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@neuro-it.co.uk',
    subject: `[NEW TICKET] Repair Request Received — ${ticketDetails.referenceCode}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #0A0A0A; color: #FFFFFF; border: 1px solid #2A2A2A; border-radius: 8px;">
        <h2 style="font-family: sans-serif; color: #00D2FF; font-weight: 800; font-size: 1.3rem; margin-bottom: 1.5rem; text-align: center;">New Ticket Created</h2>
        <p style="font-size: 1rem; color: #E0E0E0; line-height: 1.6;">A new repair booking has been submitted on Neuro IT.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1.5rem; margin-bottom: 2rem;">
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem; width: 140px;">Reference Code</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem; font-weight: bold; font-family: monospace;">${ticketDetails.referenceCode}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem;">Service</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem;">${ticketDetails.serviceName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem;">Customer Email</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem;">${ticketDetails.customerEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem;">Service Type</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem;">${ticketDetails.serviceType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem;">Price Estimate</td>
            <td style="padding: 0.75rem 0; color: #00D2FF; font-size: 0.95rem; font-weight: bold;">${ticketDetails.estimatedPrice}</td>
          </tr>
        </table>
        <div style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/tickets" style="display: inline-block; padding: 0.8rem 1.75rem; background: #00D2FF; color: #0A0A0A; text-decoration: none; font-weight: 700; border-radius: 4px; font-size: 0.9rem;">
            View in Admin Dashboard
          </a>
        </div>
      </div>
    `,
  })
}
