import type { MetadataRoute } from 'next'
import { seo } from './lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
	const base = seo.siteUrl
	return [
		{
			url: base,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${base}/book`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${base}/privacy`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${base}/terms`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.3,
		},
	]
}
