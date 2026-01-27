import type { Metadata } from 'next'
import { seo } from '../lib/seo'

export const metadata: Metadata = {
	title: 'Book an Appointment',
	description:
		'Book your hair appointment with Yuriy Pantel at Hair Studio, Amsterdam. Choose your service and time slot online.',
	alternates: {
		canonical: `${seo.siteUrl}/book`,
	},
	openGraph: {
		url: `${seo.siteUrl}/book`,
		title: 'Book an Appointment | Hair Studio',
		description:
			'Book your hair appointment with Yuriy Pantel at Hair Studio, Amsterdam.',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Book an Appointment | Hair Studio',
		description:
			'Book your hair appointment with Yuriy Pantel at Hair Studio, Amsterdam.',
	},
}

export default function BookLayout({
	children,
}: { children: React.ReactNode }) {
	return children
}
