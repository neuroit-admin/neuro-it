import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'dispatch_status',
            'technicians_remaining',
            'target_region',
            'next_dispatch_time',
            'mail_in_promo',
            'workshop_status_message',
            'whatsapp_number',
            'admin_notification_email'
          ]
        }
      }
    })
    
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({
      settings: {
        dispatch_status: settingsMap.dispatch_status || 'HIGH_DEMAND',
        technicians_remaining: settingsMap.technicians_remaining || '3',
        target_region: settingsMap.target_region || 'London',
        next_dispatch_time: settingsMap.next_dispatch_time || '12:15 PM',
        mail_in_promo: settingsMap.mail_in_promo || '',
        workshop_status_message: settingsMap.workshop_status_message || '',
        whatsapp_number: settingsMap.whatsapp_number || '447700000000',
        admin_notification_email: settingsMap.admin_notification_email || 'neuroit.london@gmail.com'
      }
    })
  } catch (error) {
    console.error('Fetch public settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
