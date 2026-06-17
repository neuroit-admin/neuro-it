interface SendNotificationOptions {
  channel: string
  to: string
  templateKey: string
  data: Record<string, any>
}

/**
 * Generic notification router (Email, SMS, WhatsApp, etc.)
 */
export async function sendNotification({ channel, to, templateKey, data }: SendNotificationOptions) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[sendNotification] Channel: ${channel}, To: ${to}, Template: ${templateKey}, Data:`, data)
  }

  // If EMAIL channel, use Resend helper
  if (channel.toUpperCase() === 'EMAIL') {
    try {
      const { sendEmail } = await import('./resend')
      
      let subject = `Notification: ${templateKey}`
      let html = `<p>Template: ${templateKey}</p>`

      if (templateKey === 'OTP_VERIFICATION') {
        const otpCode = data.otpCode || data.code || ''
        subject = `Your Verification Code: ${otpCode} — Neuro IT`
        html = `<p>Your code is: <strong>${otpCode}</strong></p>`
      } else if (templateKey === 'BOOKING_CONFIRMATION') {
        const ref = data.referenceCode || ''
        const svc = data.serviceName || ''
        subject = `Booking Confirmed — ${ref}`
        html = `<h2>Booking Confirmed</h2><p>Reference: <code>${ref}</code></p><p>Service: ${svc}</p>`
      }

      return await sendEmail({ to, subject, html })
    } catch (err) {
      console.error('Failed to dispatch notification email:', err)
      throw err
    }
  }

  // Fallback / Mock for other channels (SMS, WHATSAPP, etc.)
  return { id: `mock_noti_${Date.now()}`, status: 'sent' }
}

/**
 * Send alert to Telegram Channel or Group
 */
export async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n======================================================`)
      console.log(`[MOCK TELEGRAM ALERT] Telegram config missing (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID). Alert content:`)
      console.log(message.replace(/<[^>]*>/g, '')) // Strip HTML tags for terminal print
      console.log(`======================================================\n`)
    }
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    
    if (!res.ok) {
      const errText = await res.text()
      console.error('Telegram notification error response:', errText)
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    return false
  }
}

/**
 * Send alert to Discord Channel Webhook
 */
export async function sendDiscordAlert(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n======================================================`)
      console.log(`[MOCK DISCORD ALERT] Discord webhook config missing (DISCORD_WEBHOOK_URL). Alert content:`)
      console.log(message)
      console.log(`======================================================\n`)
    }
    return false
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
      }),
    })
    
    if (!res.ok) {
      console.error('Discord webhook error status:', res.status)
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to send Discord alert:', error)
    return false
  }
}
