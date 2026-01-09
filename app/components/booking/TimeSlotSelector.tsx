'use client'

interface TimeSlotSelectorProps {
	availableSlots: string[]
	selectedTime: string | null
	selectedDate: string
	onTimeSelect: (time: string) => void
}

export default function TimeSlotSelector({
	availableSlots,
	selectedTime,
	selectedDate,
	onTimeSelect,
}: TimeSlotSelectorProps) {
	if (availableSlots.length === 0) {
		return (
			<div className='text-center py-12 text-zinc-600'>
				<p className='font-medium mb-2'>
					No available time slots for this date.
				</p>
				<p className='text-sm'>Please select another date from the calendar.</p>
			</div>
		)
	}

	const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})

	return (
		<div className='mb-6 sticky top-25 bg-white z-20 flex flex-col max-h-[calc(100vh-12rem)]'>
			<div className='pb-4 border-b border-zinc-200 mb-4'>
				<p className='text-xs sm:text-sm font-semibold text-zinc-900'>
					Available times for {formattedDate}
				</p>
			</div>
			<div className='flex flex-col gap-2 overflow-y-auto flex-1'>
				{availableSlots.map(time => (
					<button
						key={time}
						onClick={() => onTimeSelect(time)}
						className={`group relative w-full overflow-hidden px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm text-left cursor-pointer transition-colors duration-200 ${
							selectedTime === time
								? 'bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg'
								: 'bg-zinc-300 hover:bg-zinc-400 text-zinc-800'
						}`}
					>
						<span className='relative z-10'>{time}</span>
					</button>
				))}
			</div>
		</div>
	)
}
