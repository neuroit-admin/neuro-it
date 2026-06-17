import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  return session
}

export async function requireRole(role: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== role) {
    return null
  }
  return session
}

export function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN'
}

export function isTechnician(session: any) {
  return session?.user?.role === 'TECHNICIAN'
}
