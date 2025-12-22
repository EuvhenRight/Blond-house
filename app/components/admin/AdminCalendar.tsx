'use client'

// DateClickArg type is not exported, using inline type
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useCallback, useEffect, useState } from 'react'
import {
	getAvailabilityAction,
	setWorkingDayAction,
} from '../../actions/appointments'
import type { Availability } from '../../lib/types'

interface AdminCalendarProps {
	onAvailabilityChange: () => void
}

interface CalendarEvent {
	title: string
	date: string
	backgroundColor: string
	borderColor: string
	display?: string
}

export default function AdminCalendar({
	onAvailabilityChange,
}: AdminCalendarProps) {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [showHoursModal, setShowHoursModal] = useState(false)
	const [workingHours, setWorkingHours] = useState({ start: '10:00', end: '17:00' })

	const loadAvailability = useCallback(async () => {
		const today = new Date()
		const endDate = new Date()
		endDate.setMonth(endDate.getMonth() + 3)

		const startDateStr = today.toISOString().split('T')[0]
		const endDateStr = endDate.toISOString().split('T')[0]

		const availability = await getAvailabilityAction(startDateStr, endDateStr)

		// Convert availability to FullCalendar events
		const calendarEvents: CalendarEvent[] = availability.map((avail: Availability) => {
			const hours = avail.workingHours || { start: '10:00', end: '17:00' }
			const title = avail.isWorkingDay
				? `Working: ${hours.start}-${hours.end}`
				: 'Not working'

			return {
				title,
				date: avail.date,
				backgroundColor: avail.isWorkingDay ? '#10b981' : '#ef4444', // Green for working, red for not working
				borderColor: avail.isWorkingDay ? '#059669' : '#dc2626',
				display: 'background', // Show as background color
			}
		})

		setEvents(calendarEvents)
	}, [])

	useEffect(() => {
		// Load availability on mount
		const loadData = async () => {
			await loadAvailability()
		}
		loadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleDateClick = async (clickInfo: { dateStr: string; date: Date }) => {
		const dateStr = clickInfo.dateStr

		// Get current availability for this date
		const availability = await getAvailabilityAction(dateStr, dateStr)
		const currentAvail = availability.find((av: Availability) => av.date === dateStr)

		const isCurrentlyWorking = currentAvail?.isWorkingDay ?? false
		const currentHours = currentAvail?.workingHours || { start: '10:00', end: '17:00' }

		if (isCurrentlyWorking) {
			// If working, toggle it off
			const confirmToggle = confirm(
				`This day is currently working (${currentHours.start}-${currentHours.end}).\n\nDo you want to set it as non-working?`
			)
			if (confirmToggle) {
				await setWorkingDayAction(dateStr, false)
				await loadAvailability()
				onAvailabilityChange()
			}
		} else {
			// If not working, ask to set working hours
			setSelectedDate(dateStr)
			setWorkingHours(currentHours)
			setShowHoursModal(true)
		}
	}

	const handleSaveWorkingHours = async () => {
		if (!selectedDate) return

		await setWorkingDayAction(selectedDate, true, workingHours)
		setShowHoursModal(false)
		setSelectedDate(null)
		await loadAvailability()
		onAvailabilityChange()
	}

	const handleCancelModal = () => {
		setShowHoursModal(false)
		setSelectedDate(null)
	}

	return (
		<div className='w-full relative'>
			{/* Legend */}
			<div className='mb-4 flex gap-4 text-sm'>
				<div className='flex items-center gap-2'>
					<div className='w-4 h-4 bg-green-500 rounded'></div>
					<span>Working day</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='w-4 h-4 bg-red-500 rounded'></div>
					<span>Not working</span>
				</div>
			</div>

			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay',
				}}
				dateClick={handleDateClick}
				events={events}
				height='auto'
				locale='en'
				firstDay={1}
				validRange={{
					start: new Date().toISOString().split('T')[0],
				}}
			/>

			{/* Working Hours Modal */}
			{showHoursModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
						<h3 className='text-xl font-bold mb-4'>
							Set Working Hours for {selectedDate && new Date(selectedDate).toLocaleDateString()}
						</h3>
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-zinc-700 mb-1'>
									Start Time
								</label>
								<input
									type='time'
									value={workingHours.start}
									onChange={(e) =>
										setWorkingHours({ ...workingHours, start: e.target.value })
									}
									className='w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-zinc-700 mb-1'>
									End Time
								</label>
								<input
									type='time'
									value={workingHours.end}
									onChange={(e) =>
										setWorkingHours({ ...workingHours, end: e.target.value })
									}
									className='w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
								/>
							</div>
							<div className='flex gap-3 pt-4'>
								<button
									onClick={handleSaveWorkingHours}
									className='flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium'
								>
									Save
								</button>
								<button
									onClick={handleCancelModal}
									className='flex-1 px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors font-medium'
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
