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
	address: 'Warmoesstraat 155, floor 4, Amsterdam',
	email: 'yuri.prodjhair@gmail.com',
	phone: '+31620991336',
	whatsapp: 'https://wa.me/31620991336',
	googleMaps: 'https://maps.google.com/?q=Warmoesstraat+155,+Amsterdam',
} as const

export const navigation = {
	header: [
		{ label: 'About', href: '#about' },
		{ label: 'Services', href: '#services' },
	],
	footer: [
		{ label: 'Privacy', href: '#' },
		{ label: 'Terms', href: '#' },
		{ label: 'Support', href: '#' },
	],
} as const
