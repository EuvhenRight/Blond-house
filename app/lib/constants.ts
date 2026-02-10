/**
 * Application constants
 * Reusable data and configuration values
 */

export const siteConfig = {
	name: 'Hair Chief',
	tagline: 'Experience',
	description: 'your beauty,',
	description_2: 'naturally',
	description_3: 'Flow.',
	location: 'Amsterdam',
	address: '123 Example Street, floor 1, Amsterdam',
	email: 'contact@example.com',
	phone: '+31201234567',
	whatsapp: 'https://wa.me/31201234567',
	googleMaps: 'https://maps.google.com/?q=Example+Street+123,+Amsterdam',
} as const

export const navigation = {
	header: [
		{ label: 'About', href: '#about' },
		{ label: 'Services', href: '#services' },
	],
	footer: [
		{ label: 'Privacy', href: '/privacy' },
		{ label: 'Terms', href: '/terms' },
	],
} as const
