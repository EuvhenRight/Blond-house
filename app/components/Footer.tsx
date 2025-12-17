import Link from 'next/link'
import { navigation, siteConfig } from '../lib/constants'

export default function Footer() {
	return (
		<footer className='border-t border-zinc-200 bg-linear-to-r from-amber-50 via-white to-amber-50 py-6 sm:py-8 md:py-10'>
			<div className='mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:px-8 lg:px-6 sm:flex-row sm:items-center sm:justify-between'>
				<div className='text-xs sm:text-sm md:text-base font-semibold text-zinc-700'>
					{siteConfig.name}
				</div>
				<div className='flex gap-3 sm:gap-4 text-xs sm:text-sm md:text-base text-zinc-500'>
					{navigation.footer.map(item => (
						<Link
							key={item.label}
							href={item.href}
							className='hover:text-zinc-700 transition-colors'
						>
							{item.label}
						</Link>
					))}
				</div>
			</div>
		</footer>
	)
}
