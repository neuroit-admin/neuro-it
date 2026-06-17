// Mock Twilio client for development
// Replace with real Twilio when deploying

export async function sendSms(to: string, body: string) {
  console.log(`[MOCK TWILIO SMS] To: ${to}`)
  console.log(`[MOCK TWILIO SMS] Body: ${body}`)
  return { sid: `SM_mock_${Date.now()}`, status: 'sent' }
}

export async function sendWhatsApp(to: string, body: string) {
  console.log(`[MOCK TWILIO WHATSAPP] To: ${to}`)
  console.log(`[MOCK TWILIO WHATSAPP] Body: ${body}`)
  return { sid: `WA_mock_${Date.now()}`, status: 'sent' }
}
