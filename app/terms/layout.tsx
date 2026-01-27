import type { Metadata } from 'next'
import { seo } from '../lib/seo'

export const metadata: Metadata = {
	title: 'Terms of Service',
	description:
		'Terms of service for Hair Studio (Yuriy Pantel). Booking, cancellation, and use of our hair design services.',
	robots: { index: true, follow: true },
	alternates: {
		canonical: `${seo.siteUrl}/terms`,
	},
	openGraph: {
		url: `${seo.siteUrl}/terms`,
		title: 'Terms of Service | Hair Studio',
		description: 'Terms of service for Hair Studio (Yuriy Pantel).',
	},
	twitter: {
		card: 'summary',
		title: 'Terms of Service | Hair Studio',
		description: 'Terms of service for Hair Studio (Yuriy Pantel).',
	},
}

export default function TermsLayout({
	children,
}: { children: React.ReactNode }) {
	return children
}
