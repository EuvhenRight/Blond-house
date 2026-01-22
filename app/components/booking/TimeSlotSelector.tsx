'use client'

interface TimeSlotSelectorProps {
	availableSlots: string[]
	selectedTime: string | null
	selectedDate: string
	onTimeSelect: (time: string) => void
	isLoading?: boolean
}

export default function TimeSlotSelector({
	availableSlots,
	selectedTime,
	selectedDate,
	onTimeSelect,
	isLoading = false,
}: TimeSlotSelectorProps) {
	const dateObj = new Date(selectedDate)
	const weekday = dateObj.toLocaleDateString('en-US', {
		weekday: 'long',
	})
	const monthDay = dateObj.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
	})

	if (isLoading) {
		return (
			<div
				className='mb-6 bg-white rounded-lg p-4 sm:p-6'
				role='status'
				aria-live='polite'
				aria-label='Loading available time slots'
			>
				<div className='animate-pulse space-y-3'>
					<div className='h-4 bg-zinc-200 rounded w-3/4 mb-4'></div>
					{[...Array(5)].map((_, i) => (
						<div key={i} className='h-12 bg-zinc-200 rounded'></div>
					))}
				</div>
			</div>
		)
	}

	if (availableSlots.length === 0) {
		return (
			<div
				className='text-center py-8 sm:py-12 text-zinc-600'
				role='alert'
				aria-live='polite'
			>
				<svg
					className='w-12 h-12 mx-auto mb-3 text-zinc-400'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
					aria-hidden='true'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={1.5}
						d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
				<p className='font-medium text-sm sm:text-base mb-2'>
					No available time slots for this date.
				</p>
				<p className='text-xs sm:text-sm'>
					Please select another date from the calendar.
				</p>
			</div>
		)
	}

	// Group slots by period (morning, afternoon, evening)
	const groupSlotsByPeriod = (slots: string[]) => {
		const groups: { period: string; slots: string[] }[] = [
			{ period: 'Morning', slots: [] },
			{ period: 'Afternoon', slots: [] },
			{ period: 'Evening', slots: [] },
		]

		slots.forEach(slot => {
			const [hours] = slot.split(':').map(Number)
			if (hours < 12) {
				groups[0].slots.push(slot)
			} else if (hours < 17) {
				groups[1].slots.push(slot)
			} else {
				groups[2].slots.push(slot)
			}
		})

		return groups.filter(group => group.slots.length > 0)
	}

	const groupedSlots = groupSlotsByPeriod(availableSlots)

	return (
		<div
			className='mb-6 bg-white rounded-lg p-4 sm:p-6'
			role='region'
			aria-label={`Available time slots for ${weekday}, ${monthDay}`}
		>
			<h3 className='text-sm sm:text-base font-semibold text-zinc-900 mb-4 pb-3 border-b border-zinc-200'>
				Available times for
				<br />
				<span className='text-amber-600'>
					{weekday}, {monthDay}
				</span>
			</h3>
			<div className='space-y-4 md:max-h-[calc(100vh-20rem)] md:overflow-y-auto'>
				{groupedSlots.map(group => (
					<div key={group.period} className='space-y-2'>
						<h4 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide'>
							{group.period}
						</h4>
						<div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
							{group.slots.map(time => (
								<button
									key={time}
									type='button'
									onClick={() => onTimeSelect(time)}
									aria-label={`Select time: ${time}`}
									aria-pressed={selectedTime === time}
									className={`group relative w-full overflow-hidden px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base text-center cursor-pointer transition-all duration-200 min-h-[44px] sm:min-h-[48px] flex items-center justify-center ${
										selectedTime === time
											? 'bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg ring-2 ring-amber-500 ring-offset-2'
											: 'bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 border border-zinc-200 hover:border-zinc-300'
									}`}
								>
									<span className='relative z-10'>{time}</span>
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
