'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '../lib/constants'

export default function Header() {
	const pathname = usePathname()
	const isBookingPage = pathname === '/book'
	const isAdminPage = pathname?.startsWith('/admin')

	// Don't render header on admin pages
	if (isAdminPage) {
		return null
	}

	return (
		<header className='sticky top-0 z-20 border-b border-zinc-200/80 backdrop-blur-md '>
			{/* Left side blur effect */}
			<div className='absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-white/40 via-white/20 to-transparent' />
			<div className='mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8 lg:px-6 py-3 sm:py-4 relative z-10'>
				<Link
					href='/'
					className='flex items-center hover:opacity-80 transition-opacity'
				>
					{/* Logo - Blond House with gold font styling */}
					<div className='gold-font relative leading-tight text-shadow-lg'>
						<span
							className='block text-lg sm:text-xl md:text-2xl lg:text-2xl'
							style={{ fontStyle: 'bold', letterSpacing: '0.04em' }}
						>
							BLOND HOUSE
						</span>
					</div>
				</Link>
				<nav className='hidden items-center gap-4 md:gap-6 text-sm sm:text-base md:text-base lg:text-base font-medium text-zinc-600 lg:flex'>
					<Link href='/book' className='hover:text-zinc-900 transition-colors'>
						Book Appointment
					</Link>
					{navigation.header.map(item => {
						const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
							if (item.href.startsWith('#')) {
								e.preventDefault()
								const element = document.querySelector(item.href)
								if (element) {
									const headerOffset = 80
									const elementPosition = element.getBoundingClientRect().top
									const offsetPosition =
										elementPosition + window.pageYOffset - headerOffset

									window.scrollTo({
										top: offsetPosition,
										behavior: 'smooth',
									})
								}
							}
						}

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={handleClick}
								className='hover:text-zinc-900 transition-colors'
							>
								{item.label}
							</Link>
						)
					})}
				</nav>
				<div className='flex items-center gap-2 sm:gap-3'>
					{!isBookingPage && (
						<Link
							href='/book'
							className='group relative rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 text-sm sm:text-base md:text-base font-semibold text-white shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95'
							aria-label='Book an appointment'
						>
							{/* Shimmer animation overlay */}
							<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
							{/* Glow effect */}
							<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
							<span className='relative z-10 flex items-center gap-2'>
								<svg
									className='w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12 duration-300'
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
								<span className='hidden sm:inline'>Book appointment</span>
								<span className='sm:hidden'>Book</span>
							</span>
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}
