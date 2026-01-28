'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { navigation } from '../lib/constants'
import HamburgerMenu from './HamburgerMenu'

export default function Header() {
	const pathname = usePathname()
	const isBookingPage = pathname === '/book'
	const isAdminPage = pathname?.startsWith('/admin')
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	// Don't render header on admin pages
	if (isAdminPage) {
		return null
	}

	return (
		<header className='sticky top-0 z-20 border-b border-zinc-200/80 backdrop-blur-md'>
			{/* Left side blur effect */}
			<div className='absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-white/40 via-white/20 to-transparent' />

			<div className='mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8 lg:px-6 py-3 sm:py-4 relative z-10'>
				<Link
					href='/'
					className='flex items-center hover:opacity-80 transition-opacity'
				>
					{/* Logo - Hair Studio with gold font styling */}
					<div className='gold-font relative leading-tight text-shadow-lg'>
						<span className='block font-bold tracking-[0.04em] text-[clamp(1.125rem,2vw,1.5rem)]'>
							HAIR STUDIO
						</span>
					</div>
				</Link>

				{/* Desktop Navigation - hidden on mobile/tablet */}
				{!isBookingPage && (
					<nav className='hidden items-center gap-4 md:gap-6 font-medium text-zinc-600 lg:flex'>
						<Link
							href='/book'
							className='hover:text-zinc-900 transition-colors'
						>
							Book Appointment
						</Link>
						{navigation.header.map(item => (
							<a
								key={item.href}
								href={item.href}
								className='hover:text-zinc-900 transition-colors cursor-pointer'
							>
								{item.label}
							</a>
						))}
					</nav>
				)}

				{/* Right side: hamburger on mobile/tablet, Book button on desktop only */}
				<div className='flex items-center gap-2 sm:gap-3'>
					{/* Book button - desktop only (lg and up); mobile/tablet use hero button */}
					{!isBookingPage && (
						<Link
							href='/book'
							className='hidden lg:flex group relative items-center gap-2 rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 md:px-5 md:py-2.5 font-semibold text-white shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95'
							aria-label='Book an appointment'
						>
							<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
							<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
							<span className='relative z-10 flex items-center gap-2'>
								<svg
									className='w-5 h-5 transition-transform group-hover:rotate-12 duration-300'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
									/>
								</svg>
								Book appointment
							</span>
						</Link>
					)}

					{/* Hamburger menu - mobile/tablet only */}
					{!isBookingPage && (
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className='lg:hidden p-2.5 rounded-full text-zinc-600 hover:text-zinc-900 transition-all duration-300 bg-white/15 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-white/25 active:scale-95'
							aria-label='Toggle menu'
							aria-expanded={isMobileMenuOpen}
						>
							<div className='relative w-6 h-6'>
								<FiMenu
									className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
										isMobileMenuOpen
											? 'opacity-0 rotate-90 scale-0'
											: 'opacity-100 rotate-0 scale-100'
									}`}
								/>
								<FiX
									className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
										isMobileMenuOpen
											? 'opacity-100 rotate-0 scale-100'
											: 'opacity-0 -rotate-90 scale-0'
									}`}
								/>
							</div>
						</button>
					)}
				</div>
			</div>

			{/* Hamburger Menu Component */}
			{!isBookingPage && (
				<HamburgerMenu
					isOpen={isMobileMenuOpen}
					onClose={() => setIsMobileMenuOpen(false)}
				/>
			)}
		</header>
	)
}
