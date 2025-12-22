'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useState, useCallback } from 'react'
import { getAvailableSlots, getAvailabilityAction } from '../../actions/appointments'
import type { Availability } from '../../lib/types'

interface PublicCalendarProps {
	onDateSelect: (date: string, timeSlots: string[]) => void
}

interface DateClickInfo {
	dateStr: string
	date: Date
	allDay: boolean
}

interface CalendarEvent {
	title: string
	date: string
	backgroundColor: string
	display?: string
}

export default function PublicCalendar({ onDateSelect }: PublicCalendarProps) {
	const [nonWorkingDays, setNonWorkingDays] = useState<Set<string>>(new Set())

	const loadAvailability = useCallback(async () => {
		const today = new Date()
		const endDate = new Date()
		endDate.setMonth(endDate.getMonth() + 3)

		const startDateStr = today.toISOString().split('T')[0]
		const endDateStr = endDate.toISOString().split('T')[0]

		try {
			const availability = await getAvailabilityAction(startDateStr, endDateStr)
			const nonWorking = new Set<string>()
			
			availability.forEach((avail: Availability) => {
				if (!avail.isWorkingDay) {
					nonWorking.add(avail.date)
				}
			})
			
			setNonWorkingDays(nonWorking)
		} catch (error) {
			console.error('Error loading availability:', error)
		}
	}, [])

	useEffect(() => {
		loadAvailability()
	}, [loadAvailability])

	const handleDateClick = async (arg: DateClickInfo) => {
		const clickedDate = arg.dateStr
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const clickedDateObj = new Date(clickedDate)

		// Disable past dates
		if (clickedDateObj < today) {
			return
		}

		// Check if it's a non-working day
		if (nonWorkingDays.has(clickedDate)) {
			alert('This day is not available for booking. Please select another day.')
			return
		}

		try {
			const availableSlots = await getAvailableSlots(clickedDate)
			if (availableSlots.length === 0) {
				alert('No available time slots for this date. Please select another day.')
				return
			}
			onDateSelect(clickedDate, availableSlots)
		} catch (error) {
			console.error('Error fetching available slots:', error)
			onDateSelect(clickedDate, [])
		}
	}

	const isPastDate = (dateStr: string) => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const date = new Date(dateStr)
		return date < today
	}

	const isNonWorkingDay = (dateStr: string) => {
		return nonWorkingDays.has(dateStr)
	}

	// Create events for non-working days to show them visually
	const nonWorkingEvents: CalendarEvent[] = Array.from(nonWorkingDays).map(date => ({
		title: 'Not available',
		date,
		backgroundColor: '#ef4444',
		display: 'background',
	}))

	return (
		<div className='w-full'>
			{/* Legend */}
			<div className='mb-4 flex gap-4 text-sm text-zinc-600'>
				<div className='flex items-center gap-2'>
					<div className='w-4 h-4 bg-red-500 rounded'></div>
					<span>Not available</span>
				</div>
			</div>

			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek',
				}}
				dateClick={handleDateClick}
				events={nonWorkingEvents}
				eventDisplay='background'
				dayCellClassNames={arg => {
					const classes: string[] = []
					if (isPastDate(arg.dateStr)) {
						classes.push('opacity-50 cursor-not-allowed')
					} else if (isNonWorkingDay(arg.dateStr)) {
						classes.push('cursor-not-allowed')
					} else {
						classes.push('cursor-pointer hover:bg-amber-50')
					}
					return classes
				}}
				height='auto'
				locale='en'
				firstDay={1}
				validRange={{
					start: new Date().toISOString().split('T')[0],
				}}
			/>
		</div>
	)
}
