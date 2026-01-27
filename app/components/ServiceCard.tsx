'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDuration, Service } from '../lib/services'

interface ServiceCardProps {
	service: Service
	showGlassEffect?: boolean
	isVisible?: boolean
	animationDelay?: number // Delay in milliseconds for staggered animation
}

export default function ServiceCard({
	service,
	showGlassEffect = true,
	isVisible = true,
	animationDelay = 0,
}: ServiceCardProps) {
	const baseClasses = showGlassEffect
		? 'group relative bg-transparent backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
		: 'group relative bg-transparent rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'

	const animationClasses = isVisible
		? 'opacity-100 translate-y-0'
		: 'opacity-0 translate-y-8'

	const cardClasses = `${baseClasses} ${animationClasses}`

	return (
		<div
			className={`${cardClasses} h-full flex flex-col`}
			style={{
				transitionDelay: `${animationDelay}ms`,
				transitionDuration: '600ms',
				transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			<div className='flex flex-col h-full'>
				{/* Icon */}
				<div className='inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 mb-4 overflow-hidden shrink-0'>
					<Image
						src='/images/newLogo.png'
						alt='Hair styling service'
						width={56}
						height={56}
						quality={90}
						className='w-full h-full object-contain p-2'
					/>
				</div>
				
				{/* Title */}
				<h4 className='font-bold text-zinc-900 mb-3 shrink-0'>{service.name}</h4>
				
				{/* Description - fixed height to ensure consistency */}
				<div className='grow mb-4 min-h-[4.5rem] sm:min-h-20'>
					<p className='text-zinc-600 line-clamp-3'>
						{service.description}
					</p>
				</div>
				
				{/* Price and Duration - fixed at bottom */}
				<div className='flex items-center justify-between mb-4 shrink-0'>
					<span className='font-medium text-amber-600'>
						{service.price}
					</span>
					<span className='small text-zinc-500'>
						{formatDuration(service.duration)}
					</span>
				</div>
				
				{/* Button - fixed at bottom */}
				<Link
					href={`/book?service=${service.id}`}
					className='group relative block w-full overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 text-center shrink-0'
				>
					{/* Shimmer animation overlay */}
					<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
					{/* Glow effect */}
					<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
					<span className='relative z-10'>Book Now</span>
				</Link>
			</div>
		</div>
	)
}
