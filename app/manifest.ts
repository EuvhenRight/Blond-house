import type { MetadataRoute } from 'next'
import { seo } from './lib/seo'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: seo.siteName,
		short_name: 'Hair Studio',
		description: seo.defaultDescription,
		start_url: seo.siteUrl,
		display: 'standalone',
		background_color: '#fffbeb',
		theme_color: '#fef3c7',
		orientation: 'portrait-primary',
		icons: [
			{
				src: '/icon.png',
				sizes: 'any',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/apple-icon.png',
				sizes: 'any',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
		categories: ['lifestyle', 'business'],
		lang: 'en',
	}
}
