import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Temporary endpoint to force-update phone numbers in the database
// Call this once after deployment: GET /api/admin/update-phone
export async function GET() {
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'whatsapp_number' },
      update: { value: '447519460614' },
      create: { key: 'whatsapp_number', value: '447519460614', description: 'Business WhatsApp number' },
    })

    await prisma.systemSetting.upsert({
      where: { key: 'contact_phone' },
      update: { value: '+447519460614' },
      create: { key: 'contact_phone', value: '+447519460614', description: 'Business contact phone number' },
    })

    return NextResponse.json({ success: true, message: 'Phone numbers updated in database', whatsapp: '447519460614', phone: '+447519460614' })
  } catch (error) {
    console.error('Update phone error:', error)
    return NextResponse.json({ error: 'Failed to update phone numbers', detail: String(error) }, { status: 500 })
  }
}
