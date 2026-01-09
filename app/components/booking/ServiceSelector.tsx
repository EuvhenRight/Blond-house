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
		<div className='space-y-4'>
			<p className='text-zinc-600 mb-6'>
				Choose the service you&apos;d like to book:
			</p>
			<div className='space-y-3'>
				{services.map(service => (
					<button
						key={service.id}
						onClick={() => onServiceSelect(service.id)}
						className={`w-full text-left p-4 border-2 rounded-lg transition-all cursor-pointer ${
							selectedServiceId === service.id
								? 'border-amber-500 bg-amber-50'
								: 'border-zinc-200 hover:border-amber-500 hover:bg-amber-50'
						}`}
					>
						<div className='flex justify-between items-start mb-2'>
							<h3 className='font-semibold text-zinc-900'>{service.name}</h3>
							<span className='text-sm font-medium text-amber-600 ml-4'>
								{service.price}
							</span>
						</div>
						<p className='text-sm text-zinc-600 mb-2'>{service.description}</p>
						<p className='text-xs text-zinc-500'>
							Duration: {formatDuration(service.duration)}
						</p>
					</button>
				))}
			</div>

			{/* Service Footer Notes */}
			<div className='mt-6 pt-6 border-t border-zinc-200'>
				<p className='text-xs text-zinc-500 mb-2'>
					* Additional charges may apply for certain services—please consult
					with your stylist.
				</p>
				<p className='text-xs text-zinc-500'>
					* All services include shampoo, styling, and blow-dry in the desired
					direction.
				</p>
			</div>
		</div>
	)
}

