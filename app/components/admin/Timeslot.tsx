'use client'

interface TimeslotProps {
	timeRange: string
	name: string
	duration: number
	serviceName?: string
	phone?: string
	email?: string
	variant: 'day' | 'week' | 'list' | 'month'
	/** Used when variant is 'month': colored block background/border/text */
	backgroundColor?: string
	borderColor?: string
	textColor?: string
}

export default function Timeslot({
	timeRange,
	name,
	duration,
	serviceName,
	phone,
	email,
	variant,
	backgroundColor = '#3b82f6',
	borderColor = '#2563eb',
	textColor = '#ffffff',
}: TimeslotProps) {
	const hoverPopover = (
		<div
			className='timeslot-popover pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-xs shadow-lg opacity-0 transition-opacity duration-150'
			role='tooltip'
			aria-hidden='true'
		>
			<div className='space-y-1 font-medium text-zinc-900'>
				<div>Time: {timeRange}</div>
				{serviceName && <div>Service: {serviceName}</div>}
				<div>Name: {name}</div>
				{phone && <div>Phone: {phone}</div>}
				{email && <div>Email: {email}</div>}
			</div>
		</div>
	)

	// Day view: full layout (time | name | duration)
	if (variant === 'day') {
		return (
			<div className='group relative h-full min-h-10 w-full sm:min-h-11'>
				{hoverPopover}
				<div
					className='grid w-full grid-cols-[auto_1fr_auto] items-center gap-1.5 px-2'
					tabIndex={0}
				>
					<span className='tabular-nums text-[10px] sm:text-xs'>
						{timeRange}
					</span>
					<span className='min-w-0 truncate text-center text-xs font-bold sm:text-sm'>
						{name}
					</span>
					<span className='tabular-nums text-[10px] sm:text-xs'>
						{duration} min
					</span>
				</div>
			</div>
		)
	}

	// Month and week: colored block with only the client name; popover has full details
	if (variant === 'month' || variant === 'week') {
		const isMonth = variant === 'month'
		return (
			<div className={`${isMonth ? 'timeslot-month ' : ''}group relative w-full min-w-0`}>
				{hoverPopover}
				<div
					className={`${isMonth ? 'timeslot-month-block ' : ''}box-border min-h-6 w-full min-w-0 truncate rounded px-2 py-1 text-center text-xs font-medium sm:text-sm`}
					style={{
						backgroundColor,
						borderColor,
						color: textColor,
						borderWidth: '1px',
						borderStyle: 'solid',
					}}
					tabIndex={0}
				>
					{name}
				</div>
			</div>
		)
	}

	// List: time | name | duration, compact
	return (
		<div className='group relative min-h-8 w-full'>
			{hoverPopover}
			<div
				className='grid w-full grid-cols-[auto_1fr_auto] items-center gap-1.5 px-2 text-xs sm:text-sm'
				tabIndex={0}
			>
				<span className='tabular-nums'>{timeRange}</span>
				<span className='min-w-0 truncate text-center font-bold'>{name}</span>
				<span className='tabular-nums'>{duration} min</span>
			</div>
		</div>
	)
}
