'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import { navigation, siteConfig } from '../lib/constants'

export default function Footer() {
	const pathname = usePathname()
	const isBookingPage = pathname === '/book'

	const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		if (!href.startsWith('#')) return
		e.preventDefault()

		const isHome = pathname === '/' || pathname === ''

		// Condition 1: From main page (/) – scroll to the right area
		if (isHome) {
			const el = document.querySelector(href) as HTMLElement
			if (el) {
				// scroll-margin-top on #about/#services in globals.css handles header offset
				el.scrollIntoView({ behavior: 'smooth', block: 'start' })
			} else {
				setTimeout(() => {
					const retry = document.querySelector(href) as HTMLElement
					if (retry) retry.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}, 100)
			}
			return
		}

		// Condition 2: From another page – go to main page and land in the right area
		window.location.href = `/${href}`
	}

	return (
		<footer className='border-t border-zinc-200 bg-linear-to-r from-amber-50 via-white to-amber-50'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 pt-12 sm:pt-16 md:pt-20 pb-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12'>
					{/* Brand Section */}
					<div className='lg:col-span-1'>
						<Link href='/' className='inline-block mb-4'>
							<h3 className='relative leading-tight text-black'>
								<span
									className='block'
									style={{ fontStyle: 'bold', letterSpacing: '0.04em', fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
								>
									HAIR STUDIO
								</span>
							</h3>
						</Link>
						<p className='text-zinc-600 mb-4 leading-relaxed italic'>
							A small, calm studio with a homely atmosphere, right in the heart of
							Amsterdam.
						</p>
					</div>

					{/* Navigation Links */}
					<div>
						<h4 className='font-semibold text-zinc-900 mb-4'>
							Navigation
						</h4>
						<nav className='flex flex-col gap-3'>
							<Link
								href='/book'
								className='text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 inline-block'
							>
								Book Appointment
							</Link>
							{navigation.header.map(item => (
								<a
									key={item.href}
									href={item.href}
									onClick={e => handleAnchorClick(e, item.href)}
									className='text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 inline-block cursor-pointer'
								>
									{item.label}
								</a>
							))}
							{/* Legal Links */}
							{navigation.footer.map(item => (
								<Link
									key={item.label}
									href={item.href}
									className='text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 inline-block'
								>
									{item.label}
								</Link>
							))}
						</nav>
					</div>

					{/* Contact Information */}
					<div>
						<h4 className='font-semibold text-zinc-900 mb-4'>
							Contact
						</h4>
						<div className='flex flex-col gap-4'>
							{/* Address */}
							<Link
								href={siteConfig.googleMaps}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-start gap-3 text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 group'
							>
								<FiMapPin className='w-5 h-5 shrink-0 mt-0.5 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span className='leading-relaxed'>{siteConfig.address}</span>
							</Link>

							{/* Phone */}
							<a
								href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
								className='flex items-center gap-3 text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 group'
							>
								<FiPhone className='w-5 h-5 shrink-0 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span>{siteConfig.phone}</span>
							</a>

							{/* Email */}
							<a
								href={`mailto:${siteConfig.email}`}
								className='flex items-center gap-3 text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 group'
							>
								<FiMail className='w-5 h-5 shrink-0 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span>{siteConfig.email}</span>
							</a>

							{/* WhatsApp */}
							<Link
								href={siteConfig.whatsapp}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-3 text-zinc-600 hover:text-amber-600 transition-all duration-300 hover:scale-105 group'
							>
								<ImWhatsapp className='w-5 h-5 shrink-0 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span>WhatsApp</span>
							</Link>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='mt-12 sm:mt-16 pt-8 border-t border-zinc-200'>
					<div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
						<p className='small text-zinc-500 text-center sm:text-left'>
							© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
						</p>
						<p className='small text-zinc-500 text-center sm:text-right'>
							Hair design studio in Amsterdam
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
