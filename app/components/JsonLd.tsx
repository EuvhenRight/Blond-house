/**
 * Injects JSON-LD structured data for SEO (LocalBusiness, Organization).
 * Used by crawlers and rich results (Google, Bing, social).
 */

import { siteConfig } from '../lib/constants'
import { seo } from '../lib/seo'

const localBusinessJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'HairSalon',
	name: seo.siteName,
	description: seo.defaultDescription,
	url: seo.siteUrl,
	image: seo.defaultImageUrl,
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Warmoesstraat 155, floor 3',
		addressLocality: siteConfig.location,
		addressCountry: 'NL',
	},
	geo: {
		'@type': 'GeoCoordinates',
		addressLocality: siteConfig.location,
	},
	telephone: siteConfig.phone,
	email: siteConfig.email,
	openingHoursSpecification: [],
	priceRange: '€€',
	sameAs: [],
}

export function JsonLd() {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(localBusinessJsonLd),
			}}
		/>
	)
}
