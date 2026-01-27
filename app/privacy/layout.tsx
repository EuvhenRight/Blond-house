import type { Metadata } from 'next'
import { seo } from '../lib/seo'

export const metadata: Metadata = {
	title: 'Privacy Policy',
	description:
		'Privacy policy for Hair Studio (Yuriy Pantel). How we collect, use, and protect your data.',
	robots: { index: true, follow: true },
	alternates: {
		canonical: `${seo.siteUrl}/privacy`,
	},
	openGraph: {
		url: `${seo.siteUrl}/privacy`,
		title: 'Privacy Policy | Hair Studio',
		description: 'Privacy policy for Hair Studio (Yuriy Pantel).',
	},
	twitter: {
		card: 'summary',
		title: 'Privacy Policy | Hair Studio',
		description: 'Privacy policy for Hair Studio (Yuriy Pantel).',
	},
}

export default function PrivacyLayout({
	children,
}: { children: React.ReactNode }) {
	return children
}
