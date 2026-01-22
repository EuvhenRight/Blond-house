'use client'

import Link from 'next/link'
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import { navigation, siteConfig } from '../lib/constants'

export default function Footer() {
	const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		if (href.startsWith('#')) {
			e.preventDefault()
			const element = document.querySelector(href)
			if (element) {
				const headerOffset = 80
				const elementPosition = element.getBoundingClientRect().top
				const offsetPosition = elementPosition + window.pageYOffset - headerOffset

				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth',
				})
			}
		}
	}

	return (
		<footer className='border-t border-zinc-200 bg-linear-to-r from-amber-50 via-white to-amber-50'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12'>
					{/* Brand Section */}
					<div className='lg:col-span-1'>
						<Link href='/' className='inline-block mb-4'>
							<div className='gold-font relative leading-tight text-shadow-lg'>
								<span
									className='block text-xl sm:text-2xl font-bold'
									style={{ fontStyle: 'bold', letterSpacing: '0.04em' }}
								>
									BLOND HOUSE
								</span>
							</div>
						</Link>
						<p className='text-sm sm:text-base text-zinc-600 mb-4 leading-relaxed'>
							A small, calm studio with a homely atmosphere, right in the heart of
							Amsterdam.
						</p>
						<p className='text-xs sm:text-sm text-zinc-500 italic'>
							Everyone is welcome. Here, you can just be.
						</p>
					</div>

					{/* Navigation Links */}
					<div>
						<h3 className='text-base sm:text-lg font-semibold text-zinc-900 mb-4'>
							Navigation
						</h3>
						<nav className='flex flex-col gap-3'>
							<Link
								href='/book'
								className='text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors'
							>
								Book Appointment
							</Link>
							{navigation.header.map(item => (
								<Link
									key={item.href}
									href={item.href}
									onClick={e => handleAnchorClick(e, item.href)}
									className='text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors'
								>
									{item.label}
								</Link>
							))}
						</nav>
					</div>

					{/* Contact Information */}
					<div>
						<h3 className='text-base sm:text-lg font-semibold text-zinc-900 mb-4'>
							Contact
						</h3>
						<div className='flex flex-col gap-4'>
							{/* Address */}
							<Link
								href={siteConfig.googleMaps}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-start gap-3 text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors group'
							>
								<FiMapPin className='w-5 h-5 shrink-0 mt-0.5 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span className='leading-relaxed'>{siteConfig.address}</span>
							</Link>

							{/* Phone */}
							<a
								href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
								className='flex items-center gap-3 text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors group'
							>
								<FiPhone className='w-5 h-5 shrink-0 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span>{siteConfig.phone}</span>
							</a>

							{/* Email */}
							<a
								href={`mailto:${siteConfig.email}`}
								className='flex items-center gap-3 text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors group'
							>
								<FiMail className='w-5 h-5 shrink-0 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span>{siteConfig.email}</span>
							</a>

							{/* WhatsApp */}
							<Link
								href={siteConfig.whatsapp}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-3 text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors group'
							>
								<ImWhatsapp className='w-5 h-5 shrink-0 text-zinc-400 group-hover:text-amber-600 transition-colors' />
								<span>WhatsApp</span>
							</Link>
						</div>
					</div>

					{/* Legal Links */}
					<div>
						<h3 className='text-base sm:text-lg font-semibold text-zinc-900 mb-4'>
							Legal
						</h3>
						<nav className='flex flex-col gap-3'>
							{navigation.footer.map(item => (
								<Link
									key={item.label}
									href={item.href}
									className='text-sm sm:text-base text-zinc-600 hover:text-amber-600 transition-colors'
								>
									{item.label}
								</Link>
							))}
						</nav>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='mt-12 sm:mt-16 pt-8 border-t border-zinc-200'>
					<div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
						<p className='text-xs sm:text-sm text-zinc-500 text-center sm:text-left'>
							© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
						</p>
						<p className='text-xs sm:text-sm text-zinc-500 text-center sm:text-right'>
							Hair design studio in Amsterdam
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
