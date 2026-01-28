'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { navigation } from '../lib/constants'

interface HamburgerMenuProps {
	isOpen: boolean
	onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
	const pathname = usePathname()
	const router = useRouter()

	const handleAnchorClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		if (!href.startsWith('#')) return
		e.preventDefault()
		onClose()

		const isHome = pathname === '/' || pathname === ''

		// Condition 1: From main page (/) – scroll to the right area
		if (isHome) {
			const el = document.querySelector(href) as HTMLElement
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' })
			} else {
				setTimeout(() => {
					const retry = document.querySelector(href) as HTMLElement
					if (retry)
						retry.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}, 100)
			}
			return
		}

		// Condition 2: From another page – go to main page and land in the right area
		router.push(`/${href}`)
	}

	return (
		<>
			{/* Backdrop blur overlay when menu is open */}
			<div
				onClick={onClose}
				className={`lg:hidden fixed inset-0 transition-all duration-300 ease-in-out z-10 ${
					isOpen
						? 'opacity-100 pointer-events-auto'
						: 'opacity-0 pointer-events-none'
				}`}
				aria-hidden='true'
			/>

			{/* Mobile/Tablet Menu - side panel, right side, 1/4 width, 1/4 screen height, white background */}
			<div
				className={`lg:hidden fixed top-20 w-1/4 h-[20vh] bg-white border border-zinc-200/80 backdrop-blur-md z-20 right-2 overflow-y-auto transition-all duration-300 rounded-lg ease-in-out ${
					isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
				}`}
			>
				<nav className='px-2 py-4 flex flex-col gap-6'>
					<Link
						href='/book'
						onClick={onClose}
						className={`font-medium text-zinc-600 hover:text-zinc-900 transition-all duration-300 ${
							isOpen
								? 'opacity-100 translate-y-0 delay-100'
								: 'opacity-0 -translate-y-2 delay-0'
						}`}
					>
						Book Appointment
					</Link>
					{navigation.header.map((item, index) => {
						const delayClass = isOpen
							? `delay-[${150 + index * 50}ms]`
							: 'delay-0'
						return (
							<a
								key={item.href}
								href={item.href}
								onClick={e => {
									handleAnchorClick(e, item.href)
									onClose()
								}}
								className={`font-medium text-zinc-600 hover:text-zinc-900 transition-all duration-300 cursor-pointer ${delayClass} ${
									isOpen
										? 'opacity-100 translate-y-0'
										: 'opacity-0 -translate-y-2'
								}`}
							>
								{item.label}
							</a>
						)
					})}
				</nav>
			</div>
		</>
	)
}
