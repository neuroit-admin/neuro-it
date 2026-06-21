import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['dispatch_status', 'technicians_remaining', 'target_region']
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
        target_region: settingsMap.target_region || 'London'
      }
    })
  } catch (error) {
    console.error('Fetch public settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
