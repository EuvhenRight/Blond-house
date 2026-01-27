/**
 * Application constants
 * Reusable data and configuration values
 */

export const siteConfig = {
	name: 'Yuriy Pantel',
	tagline: 'Experience',
	description: 'your beauty,',
	description_2: 'naturally',
	description_3: 'Flow.',
	location: 'Amsterdam',
	address: 'Warmoesstraat 155, floor 3, Amsterdam',
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
		{ label: 'Privacy', href: '/privacy' },
		{ label: 'Terms', href: '/terms' },
	],
} as const
