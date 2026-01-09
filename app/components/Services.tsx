'use client'

import Link from 'next/link'
import { services, formatDuration } from '../lib/services'

interface ServicesProps {
	showNotes?: boolean
	gridCols?: '2' | '3' | '4'
	noteTextColor?: 'white' | 'zinc'
}

export default function Services({
	showNotes = true,
	gridCols = '4',
	noteTextColor = 'white',
}: ServicesProps) {
	const gridClass =
		gridCols === '2'
			? 'md:grid-cols-2'
			: gridCols === '3'
				? 'md:grid-cols-3'
				: 'md:grid-cols-2 lg:grid-cols-4'

	return (
		<>
			<div className={`grid gap-6 sm:gap-8 ${gridClass}`}>
				{services.map((service) => (
					<div
						key={service.id}
						className='group relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
					>
						<div className='mb-4'>
							<div className='inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 mb-4'>
								<svg
									className='w-6 h-6 sm:w-7 sm:h-7 text-amber-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
									/>
								</svg>
							</div>
							<h3 className='text-lg sm:text-xl font-bold text-zinc-900 mb-3'>
								{service.name}
							</h3>
							<p className='text-sm sm:text-base text-zinc-600 leading-relaxed mb-4 line-clamp-3'>
								{service.description}
							</p>
							<div className='flex items-center justify-between mb-4'>
								<span className='text-sm font-medium text-amber-600'>
									{service.price}
								</span>
								<span className='text-xs text-zinc-500'>
									{formatDuration(service.duration)}
								</span>
							</div>
									<Link
										href={`/book?service=${service.id}`}
										className='group relative block w-full overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 text-center'
									>
										{/* Shimmer animation overlay */}
										<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
										{/* Glow effect */}
										<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
										<span className='relative z-10'>Book Now</span>
									</Link>
						</div>
					</div>
				))}
			</div>

			{/* Service Footer Notes */}
			{showNotes && (
				<div className='mt-12 text-center'>
					<p className={`text-sm ${noteTextColor === 'white' ? 'text-white/90' : 'text-zinc-500'}`}>
						* Additional charges may apply for certain services—please consult with your stylist.
					</p>
					<p className={`text-sm ${noteTextColor === 'white' ? 'text-white/90' : 'text-zinc-500'} mt-2`}>
						* All services include shampoo, styling, and blow-dry in the desired direction.
					</p>
				</div>
			)}
		</>
	)
}

