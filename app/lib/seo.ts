/**
 * Central SEO configuration for Hair Studio.
 * Used by layout metadata and anywhere we need canonical titles/descriptions.
 *
 * Social share image: GoldGirl_mob.png is used for Open Graph and Twitter cards.
 * For best display on socials, use 1200×630 px if you replace it.
 */

const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL || 'https://blondhouse.nl'

/** Recommended OG/Twitter image size used by Facebook, LinkedIn, WhatsApp, Telegram, Twitter */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** Default social share image for Open Graph, Twitter, etc. (Facebook, LinkedIn, WhatsApp, Telegram). */
export const SEO_DEFAULT_IMAGE_PATH = '/images/GoldGirl_mob.png'
/** Legacy fallback path. */
export const SEO_FALLBACK_IMAGE_PATH = '/images/Salon.png'

function getDefaultImagePath(): string {
	return SEO_DEFAULT_IMAGE_PATH
}

/** Full absolute URL for the default share image */
export function getDefaultImageUrl(): string {
	return `${siteUrl}${getDefaultImagePath()}`
}

export const seo = {
	siteUrl,
	siteName: 'Hair Studio | Yuriy Pantel',
	defaultTitle: 'Yuriy Pantel - Hair Design Amsterdam | Professional Hair Stylist',
	defaultDescription:
		'Professional hair design in Amsterdam. Balance. Precision. Flow. Book your appointment with Yuriy Pantel for expert hair styling services.',
	defaultImagePath: getDefaultImagePath(),
	defaultImageUrl: getDefaultImageUrl(),
	defaultImageAlt:
		'Hair Studio – blonde hair beauty shot, professional hair design by Yuriy Pantel in Amsterdam',
	keywords: [
		'hair design',
		'Amsterdam',
		'hair stylist',
		'hair salon',
		'Yuriy Pantel',
		'professional hair styling',
		'Hair Studio',
	],
	locale: 'en_US',
	twitterHandle: '', // e.g. '@blondhouse' if you have one
	facebookAppId: '', // optional, for Facebook Insights
} as const
