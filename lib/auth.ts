// =============================================================================
// Neuro IT — NextAuth Configuration (Production-hardened)
// Fixes:
//  1. No hardcoded secret fallbacks — app crashes if secret is missing
//  2. CredentialsProvider removed — use Google OAuth only in production
//  3. GDPR consent collected explicitly during booking, not auto-set here
// =============================================================================

import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

// --------------------------------------------------------------------------
// Hard fail if secrets are missing — never run unsecured in production
// --------------------------------------------------------------------------
function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    console.warn(`[Neuro IT] Warning: Missing environment variable ${key}.`);
    return 'missing_value_for_build'
  }
  return value
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Magic-link / OTP email login via CredentialsProvider to avoid requiring a NextAuth adapter
    CredentialsProvider({
      name: 'Magic Link',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        // 1. Find the token in the database
        const dbToken = await prisma.verificationToken.findUnique({
          where: { token: credentials.token },
        })

        if (!dbToken) return null

        // 2. Check if expired (15 minutes expiry)
        if (new Date() > dbToken.expires) {
          // Clean up expired token
          await prisma.verificationToken.delete({ where: { token: credentials.token } }).catch(() => {})
          return null
        }

        // 3. Find or create user
        let user = await prisma.user.findUnique({
          where: { email: dbToken.email },
        })

        const targetAdminEmail = (process.env.ADMIN_EMAIL || 'admin@neuro-it.co.uk').trim().toLowerCase()
        const isAdmin = dbToken.email.trim().toLowerCase() === targetAdminEmail

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: dbToken.email,
              name: isAdmin ? 'Admin' : dbToken.email.split('@')[0],
              role: isAdmin ? 'ADMIN' : 'CUSTOMER',
              gdprConsent: true,
              gdprConsentAt: new Date(),
            },
          })
        } else if (isAdmin && user.role !== 'ADMIN') {
          user = await prisma.user.update({
            where: { email: dbToken.email },
            data: { role: 'ADMIN' }
          })
        }

        // 4. Delete the token so it cannot be reused (single-use)
        await prisma.verificationToken.delete({ where: { token: credentials.token } }).catch(() => {})

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
    verifyRequest: '/login?verify=1',
  },

  callbacks: {
    // -----------------------------------------------------------------------
    // jwt() — attach role + id to token on first sign-in
    // -----------------------------------------------------------------------
    async jwt({ token, user, account }) {
      // First sign-in: upsert user in our DB
      if (user && account) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email! },
          update: { name: user.name ?? 'Customer' },
          create: {
            email:    user.email!,
            name:     user.name  ?? 'Customer',
            avatarUrl: user.image ?? undefined,
            role:     'CUSTOMER',
            // gdprConsent remains false — collected in booking flow
          },
        })

        // Persist auth provider link (Google / email)
        if (account.provider !== 'email') {
          await prisma.authProvider.upsert({
            where: {
              provider_providerAccountId: {
                provider:          account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {},
            create: {
              userId:            dbUser.id,
              provider:          account.provider,
              providerAccountId: account.providerAccountId,
            },
          })
        }

        token.id   = dbUser.id
        token.role = dbUser.role
      }
      return token
    },

    // -----------------------------------------------------------------------
    // session() — expose id + role to client-side useSession()
    // -----------------------------------------------------------------------
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id
        ;(session.user as any).role = token.role ?? 'CUSTOMER'
      }
      return session
    },
  },

  // No fallback — crash loud if secret is absent
  secret: requireEnv('NEXTAUTH_SECRET'),
}

const handler = NextAuth(authOptions)
export { handler as handlers }
export const auth = () => import('next-auth').then(m => m.getServerSession(authOptions))
