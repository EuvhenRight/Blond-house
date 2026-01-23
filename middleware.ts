import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const response = NextResponse.next()

	// Only protect admin routes
	if (pathname.startsWith('/admin')) {
		// Skip login page
		if (pathname.startsWith('/admin/login')) {
			return response
		}

		// Get token from request
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		})

		// Check if user is authenticated and is admin
		if (!token || (token as any).role !== 'admin') {
			const loginUrl = new URL('/admin/login', request.url)
			loginUrl.searchParams.set('callbackUrl', pathname)
			return NextResponse.redirect(loginUrl)
		}
	}

	// Content Security Policy - allow unsafe-eval in development for Next.js HMR and webpack
	const isDevelopment = process.env.NODE_ENV === 'development'
	
	if (isDevelopment) {
		// Development: More permissive CSP for Next.js HMR, webpack, and dev tools
		const cspHeader = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.live",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https: blob:",
			"font-src 'self' data: https:",
			"connect-src 'self' https: ws: wss:",
			"frame-src 'self'",
			"frame-ancestors 'none'",
		].join('; ')
		
		response.headers.set('Content-Security-Policy', cspHeader)
	} else {
		// Production: Stricter CSP without unsafe-eval
		const cspHeader = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self' data: https:",
			"connect-src 'self' https:",
			"frame-ancestors 'none'",
		].join('; ')
		
		response.headers.set('Content-Security-Policy', cspHeader)
	}

	return response
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
}
