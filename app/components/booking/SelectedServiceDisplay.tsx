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
		<div className='w-full p-4 sm:p-4 md:p-4 bg-amber-50 border-y border-amber-200 md:border md:rounded-lg'>
			<div className='flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4'>
				<div className='flex-1 w-full sm:w-auto'>
					<h3 className='text-lg sm:text-xl font-semibold text-zinc-900 mb-2'>
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
					className='group relative text-xs sm:text-sm text-amber-600 hover:text-amber-700 sm:ml-4 whitespace-nowrap cursor-pointer self-start sm:self-auto font-medium transition-all duration-300 hover:scale-105 active:scale-95'
				>
					<span className='relative z-10 inline-flex items-center gap-1.5'>
						<svg
							className='w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M10 19l-7-7m0 0l7-7m-7 7h18'
							/>
						</svg>
						Change
					</span>
					{/* Underline animation */}
					<span className='absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full'></span>
				</button>
			</div>
		</div>
	)
}

