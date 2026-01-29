import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Footer from './components/Footer'
import Header from './components/Header'
import { JsonLd } from './components/JsonLd'
import './globals.css'
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, seo } from './lib/seo'
import { Providers } from './providers'

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: '--font-plus-jakarta-sans',
	subsets: ['latin'],
	weight: ['200', '300', '400', '500', '600', '700', '800'],
})

export const viewport: Viewport = {
	themeColor: '#fef3c7',
	width: 'device-width',
	initialScale: 1,
}

export const metadata: Metadata = {
	metadataBase: new URL(seo.siteUrl),
	title: {
		default: seo.defaultTitle,
		template: `%s | ${seo.siteName}`,
	},
	description: seo.defaultDescription,
	keywords: [...seo.keywords],
	applicationName: seo.siteName,
	authors: [{ name: 'Yuriy Pantel', url: seo.siteUrl }],
	creator: 'Yuriy Pantel',
	publisher: 'Hair Studio',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	openGraph: {
		type: 'website',
		locale: seo.locale,
		url: seo.siteUrl,
		siteName: seo.siteName,
		title: seo.defaultTitle,
		description: seo.defaultDescription,
		images: [
			{
				url: seo.defaultImageUrl,
				width: OG_IMAGE_WIDTH,
				height: OG_IMAGE_HEIGHT,
				alt: seo.defaultImageAlt,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: seo.defaultTitle,
		description: seo.defaultDescription,
		images: [
			{
				url: seo.defaultImageUrl,
				width: OG_IMAGE_WIDTH,
				height: OG_IMAGE_HEIGHT,
				alt: seo.defaultImageAlt,
			},
		],
		...(seo.twitterHandle ? { creator: seo.twitterHandle } : {}),
	},
	alternates: {
		canonical: seo.siteUrl,
	},
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-icon.png',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className='overflow-x-hidden'>
			<body
				className={`${plusJakartaSans.variable} antialiased bg-linear-to-r from-amber-50 via-white to-amber-250 text-zinc-900 min-h-screen overflow-x-hidden`}
			>
				<JsonLd />
				<Providers>
					<Header />
					{children}
					<Footer />
				</Providers>
				<Analytics />
			</body>
		</html>
	)
}
