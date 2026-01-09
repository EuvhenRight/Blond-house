/**
 * Suppress Firebase connection management warnings in development
 * These warnings are harmless - Firebase closes idle connections to save resources
 */
let isSuppressed = false

export function suppressFirebaseWarnings() {
	if (process.env.NODE_ENV !== 'development') {
		return // Only suppress in development
	}

	if (isSuppressed) {
		return // Already suppressed, prevent multiple wrapping
	}

	isSuppressed = true

	const originalWarn = console.warn.bind(console)
	const originalError = console.error.bind(console)

	console.warn = (...args: unknown[]) => {
		const message = args[0]
		if (
			typeof message === 'string' &&
			(message.includes('GrpcConnection') ||
				message.includes('Disconnecting idle stream') ||
				message.includes('Timed out waiting for new targets') ||
				message.includes('CANCELLED: Disconnecting idle stream'))
		) {
			// Suppress Firebase connection management warnings
			return
		}
		originalWarn(...args)
	}

	console.error = (...args: unknown[]) => {
		const message = args[0]
		if (
			typeof message === 'string' &&
			(message.includes('GrpcConnection') ||
				message.includes('Disconnecting idle stream') ||
				message.includes('Timed out waiting for new targets'))
		) {
			// Suppress Firebase connection management warnings
			return
		}
		originalError(...args)
	}
}

