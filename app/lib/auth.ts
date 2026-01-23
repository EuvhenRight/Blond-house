import { auth } from '../api/auth/[...nextauth]/route'

export async function getSession() {
	return await auth()
}

export async function getCurrentUser() {
	const session = await getSession()
	return session?.user
}

export async function requireAdmin() {
	const session = await getSession()
	if (!session || session.user?.role !== 'admin') {
		throw new Error('Unauthorized: Admin access required')
	}
	return session.user
}

