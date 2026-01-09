'use client'

import { getServiceById, formatDuration } from '../../lib/services'

interface SelectedServiceDisplayProps {
	serviceId: string
	onChange: () => void
}

export default function SelectedServiceDisplay({
	serviceId,
	onChange,
}: SelectedServiceDisplayProps) {
	const service = getServiceById(serviceId)

	if (!service) {
		return null
	}

	return (
		<div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
			<div className='flex justify-between items-start'>
				<div className='flex-1'>
					<h3 className='text-xl font-semibold text-zinc-900 mb-2'>
						{service.name}
					</h3>
					<p className='text-sm text-zinc-600 mb-3'>
						{service.price} • {formatDuration(service.duration)}
					</p>
					<p className='text-sm text-zinc-600 leading-relaxed'>
						{service.description}
					</p>
				</div>
				<button
					onClick={onChange}
					className='text-xs text-amber-600 hover:text-amber-700 ml-4 whitespace-nowrap cursor-pointer'
				>
					Change
				</button>
			</div>
		</div>
	)
}

