import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Footer from './components/Footer'
import Header from './components/Header'
import './globals.css'
import { Providers } from './providers'

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: '--font-plus-jakarta-sans',
	subsets: ['latin'],
	weight: ['200', '300', '400', '500', '600', '700', '800'], // Load all weights including bold (700)
})

export const metadata: Metadata = {
	title: 'Yuriy Pantel - Hair Design Amsterdam | Professional Hair Stylist',
	description:
		'Professional hair design in Amsterdam. Balance. Precision. Flow. Book your appointment with Yuriy Pantel for expert hair styling services.',
	keywords: [
		'hair design',
		'Amsterdam',
		'hair stylist',
		'hair salon',
		'Yuriy Pantel',
		'professional hair styling',
	],
	openGraph: {
		title: 'Yuriy Pantel - Hair Design Amsterdam',
		description:
			'Professional hair design in Amsterdam. Balance. Precision. Flow.',
		type: 'website',
		locale: 'en_US',
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
				<Providers>
					<Header />
					{children}
					<Footer />
				</Providers>
			</body>
		</html>
	)
}
