'use client'

import { services, formatDuration } from '../../lib/services'

interface ServiceSelectorProps {
	onServiceSelect: (serviceId: string) => void
	selectedServiceId?: string | null
}

export default function ServiceSelector({
	onServiceSelect,
	selectedServiceId,
}: ServiceSelectorProps) {
	return (
		<div className='space-y-3 sm:space-y-6' role='group' aria-label='Service selection'>
			<p className='text-sm sm:text-base text-zinc-600 mb-3 sm:mb-6'>
				Choose the service you&apos;d like to book:
			</p>
			<div className='space-y-2.5 sm:space-y-4'>
				{services.map(service => (
					<button
						key={service.id}
						type='button'
						onClick={() => onServiceSelect(service.id)}
						aria-label={`Select ${service.name} service - ${service.price} - ${formatDuration(service.duration)}`}
						aria-pressed={selectedServiceId === service.id}
						className={`w-full text-left p-3.5 sm:p-5 border-2 rounded-xl transition-all cursor-pointer min-h-[88px] sm:min-h-[120px] flex flex-col justify-between touch-manipulation active:scale-[0.99] ${
							selectedServiceId === service.id
								? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 ring-offset-2'
								: 'border-zinc-200 hover:border-amber-500 hover:bg-amber-50 active:border-amber-600 active:bg-amber-100'
						}`}
					>
						{/* Mobile: stack name then price; desktop: row */}
						<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5 sm:gap-2 mb-1.5 sm:mb-3'>
							<h3 className='font-semibold text-sm sm:text-lg text-zinc-900 flex-1 min-w-0'>
								{service.name}
							</h3>
							<span
								className={`text-xs sm:text-base font-medium shrink-0 sm:ml-4 ${
									selectedServiceId === service.id
										? 'text-amber-700'
										: 'text-amber-600'
								}`}
							>
								{service.price}
							</span>
						</div>
						<p className='text-xs sm:text-base text-zinc-600 mb-1.5 sm:mb-3 leading-relaxed'>
							{service.description}
						</p>
						<p className='text-xs sm:text-sm text-zinc-500 mt-auto'>
							Duration: <span className='font-medium'>{formatDuration(service.duration)}</span>
						</p>
						{selectedServiceId === service.id && (
							<div className='mt-2 flex items-center gap-2 text-amber-700 text-xs sm:text-sm'>
								<svg
									className='w-4 h-4'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
									aria-hidden='true'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M5 13l4 4L19 7'
									/>
								</svg>
								<span className='font-medium'>Selected</span>
							</div>
						)}
					</button>
				))}
			</div>

			{/* Service Footer Notes */}
			<div className='mt-4 sm:mt-8 pt-3 sm:pt-6 border-t border-zinc-200'>
				<p className='text-xs sm:text-sm text-zinc-500 mb-1.5 sm:mb-2 leading-relaxed'>
					* Additional charges may apply for certain services—please consult
					with your stylist.
				</p>
				<p className='text-xs sm:text-sm text-zinc-500 leading-relaxed'>
					* All services include shampoo, styling, and blow-dry in the desired
					direction.
				</p>
			</div>
		</div>
	)
}

