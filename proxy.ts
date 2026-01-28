import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const APEX_HOST = 'blondhouse.nl'
const WWW_HOST = 'www.blondhouse.nl'

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl
	const host = request.headers.get('host') ?? request.nextUrl.hostname

	// Redirect www → apex (canonical) to avoid redirect loops with hosting
	if (host === WWW_HOST || host.toLowerCase() === WWW_HOST) {
		const apexUrl = new URL(pathname + search, `https://${APEX_HOST}`)
		return NextResponse.redirect(apexUrl, 308)
	}

	const response = NextResponse.next()

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
		// Match all paths so www→apex redirect runs for every request (including /api).
		// Exclude only internal Next.js assets to avoid breaking static/files.
		'/((?!_next/static|_next/image|favicon\\.ico).*)',
		'/', // root
	],
}
