/**
 * Central SEO configuration for Hair Studio.
 * Used by layout metadata and anywhere we need canonical titles/descriptions.
 *
 * Social share image: Salon.png (studio interior) is used for Open Graph and Twitter cards.
 * For best display on socials, use 1200×630 px if you replace it.
 *
 * When NEXT_PUBLIC_SITE_URL is not set (e.g. during build), we use a placeholder so that
 * new URL(siteUrl) and other URL-dependent code never receive an empty string (Invalid URL).
 * Set NEXT_PUBLIC_SITE_URL in Vercel (or .env) for correct production URLs.
 */
const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://blond-house.vercel.app'

/** Recommended OG/Twitter image size used by Facebook, LinkedIn, WhatsApp, Telegram, Twitter */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** Default social share image for Open Graph, Twitter, etc. (Facebook, LinkedIn, WhatsApp, Telegram). */
export const SEO_DEFAULT_IMAGE_PATH = '/images/Salon.png'
/** Fallback share image. */
export const SEO_FALLBACK_IMAGE_PATH = '/images/GoldGirl_mob.png'

function getDefaultImagePath(): string {
	return SEO_DEFAULT_IMAGE_PATH
}

/** Full absolute URL for the default share image. Telegram requires absolute URLs for og:image. */
export function getDefaultImageUrl(): string {
	return `${siteUrl}${getDefaultImagePath()}`
}

export const seo = {
	siteUrl,
	siteName: 'Hair Studio | Hair Chief',
	defaultTitle: 'Hair Studio Amsterdam | Professional Hair Stylist',
	defaultDescription:
		'Hair Studio – professional hair design and blonde hair styling by Hair Chief in Amsterdam. Book your appointment online.',
	defaultImagePath: getDefaultImagePath(),
	defaultImageUrl: getDefaultImageUrl(),
	defaultImageAlt:
		'Hair Studio – professional hair design by Hair Chief in Amsterdam',
	keywords: [
		'Hair Studio',
		'hair design',
		'Amsterdam',
		'hair stylist',
		'hair salon',
		'Hair Chief',
		'blonde hair',
		'professional hair styling',
	],
	locale: 'en_US',
	twitterHandle: '',
	facebookAppId: '', // optional, for Facebook Insights
} as const
