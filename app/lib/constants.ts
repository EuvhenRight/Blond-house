/**
 * Application constants
 * Reusable data and configuration values
 */

export const siteConfig = {
	name: 'Yuriy Pantel',
	tagline: 'Hair design. Amsterdam.',
	description: 'Balance.',
	description_2: 'Precision.',
	description_3: 'Flow.',
	location: 'Amsterdam',
	whatsapp: 'https://wa.me/31612345678',
	googleMaps: 'https://maps.google.com/?q=Amsterdam',
} as const

export const navigation = {
	header: [
		{ label: 'Features', href: '#features' },
		{ label: 'How it works', href: '#how-it-works' },
		{ label: 'Pricing', href: '#pricing' },
		{ label: 'Stories', href: '#testimonials' },
	],
	footer: [
		{ label: 'Privacy', href: '#' },
		{ label: 'Terms', href: '#' },
		{ label: 'Support', href: '#' },
	],
} as const
