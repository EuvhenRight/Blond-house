import CredentialsProvider from 'next-auth/providers/credentials'

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
		async jwt({ token, user }: any) {
			if (user) {
				token.role = (user as any).role
			}
			return token
		},
		async session({ session, token }: any) {
			if (session.user) {
				session.user.id = token.sub
				;(session.user as any).role = token.role
			}
			return session
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
}
