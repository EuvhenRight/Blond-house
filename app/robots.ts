import type { MetadataRoute } from 'next'
import { seo } from './lib/seo'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin/', '/api/'],
			},
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: ['/admin/', '/api/'],
			},
			{
				userAgent: 'Bingbot',
				allow: '/',
				disallow: ['/admin/', '/api/'],
			},
		],
		sitemap: `${seo.siteUrl}/sitemap.xml`,
		host: seo.siteUrl,
	}
}
