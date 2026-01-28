import type { Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
// cspell:ignore Firestore

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				// Check credentials against environment variables
				// In production, you'd check against Firestore or another database
				const adminEmail = process.env.ADMIN_EMAIL
				const adminPassword = process.env.ADMIN_PASSWORD

				const email = String(credentials.email)
				const password = String(credentials.password)

				if (email === adminEmail && password === adminPassword) {
					return {
						id: '1',
						email: email,
						name: 'Admin',
						role: 'admin',
					}
				}

				return null
			},
		}),
	],
	pages: {
		signIn: '/admin/login',
	},
	session: {
		strategy: 'jwt' as const,
	},
	callbacks: {
		async jwt({ token, user }: { token: JWT; user?: User | null }) {
			if (user) {
				token.role = (user as User).role
			}
			return token
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if (session.user) {
				session.user.id = token.sub
				;(session.user as User & { role?: string }).role = token.role as
					| string
					| undefined
			}
			return session
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
}
