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
		<div className='space-y-4 sm:space-y-6' role='group' aria-label='Service selection'>
			<p className='text-sm sm:text-base text-zinc-600 mb-4 sm:mb-6'>
				Choose the service you&apos;d like to book:
			</p>
			<div className='space-y-3 sm:space-y-4'>
				{services.map(service => (
					<button
						key={service.id}
						type='button'
						onClick={() => onServiceSelect(service.id)}
						aria-label={`Select ${service.name} service - ${service.price} - ${formatDuration(service.duration)}`}
						aria-pressed={selectedServiceId === service.id}
						className={`w-full text-left p-4 sm:p-5 border-2 rounded-lg transition-all cursor-pointer min-h-[100px] sm:min-h-[120px] flex flex-col justify-between ${
							selectedServiceId === service.id
								? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 ring-offset-2'
								: 'border-zinc-200 hover:border-amber-500 hover:bg-amber-50 active:border-amber-600 active:bg-amber-100'
						}`}
					>
						<div className='flex justify-between items-start mb-2 sm:mb-3 gap-2'>
							<h3 className='font-semibold text-base sm:text-lg text-zinc-900 flex-1'>
								{service.name}
							</h3>
							<span
								className={`text-sm sm:text-base font-medium ml-4 whitespace-nowrap ${
									selectedServiceId === service.id
										? 'text-amber-700'
										: 'text-amber-600'
								}`}
							>
								{service.price}
							</span>
						</div>
						<p className='text-sm sm:text-base text-zinc-600 mb-2 sm:mb-3 leading-relaxed'>
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
			<div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-200'>
				<p className='text-xs sm:text-sm text-zinc-500 mb-2 leading-relaxed'>
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

