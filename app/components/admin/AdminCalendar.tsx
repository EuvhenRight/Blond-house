'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	getAppointmentsByDateRange,
	getAvailabilityAction,
	setWorkingDayAction,
} from '../../actions/appointments'
import type { Appointment, Availability } from '../../lib/types'

interface AdminCalendarProps {
	onAvailabilityChange: () => void
	onAppointmentCreate?: (date: string, time: string) => void
	onAppointmentMove?: (
		appointmentId: string,
		newDate: string,
		newTime: string
	) => Promise<void>
}

interface CalendarEvent {
	id?: string
	title: string
	date?: string
	start?: string
	end?: string
	backgroundColor: string
	borderColor: string
	display?: string
	editable?: boolean
	extendedProps?: {
		isAppointment?: boolean
		isAvailability?: boolean
		customerName?: string
	}
}

interface DateSelectInfo {
	start: Date
	end: Date
	startStr: string
	endStr: string
	allDay: boolean
	view: {
		type: string
	}
}

interface DayCellClassNamesArg {
	date: Date
	dateStr?: string
	dayNumberText?: string
	view: {
		type: string
	}
}

export default function AdminCalendar({
	onAvailabilityChange,
	onAppointmentCreate,
	onAppointmentMove,
}: AdminCalendarProps) {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
		date: string
		start: string
		end: string
	} | null>(null)
	const [showHoursModal, setShowHoursModal] = useState(false)
	const [workingHours, setWorkingHours] = useState({
		start: '10:00',
		end: '17:00',
	})
	const [currentView, setCurrentView] = useState<string>('dayGridMonth')
	const hasLoadedRef = useRef(false)

	const loadData = useCallback(
		async (viewType?: string) => {
			const view = viewType || currentView
			const today = new Date()
			const endDate = new Date()
			endDate.setMonth(endDate.getMonth() + 3)

			const startDateStr = today.toISOString().split('T')[0]
			const endDateStr = endDate.toISOString().split('T')[0]

			// Load availability and appointments in parallel
			const [availability, appointments] = await Promise.all([
				getAvailabilityAction(startDateStr, endDateStr),
				getAppointmentsByDateRange(startDateStr, endDateStr),
			])

			// Convert availability to background events for month view
			const availabilityEvents: CalendarEvent[] = availability.map(
				(avail: Availability) => {
					const hours = avail.workingHours || { start: '10:00', end: '17:00' }
					const title = avail.isWorkingDay
						? `Working: ${hours.start}-${hours.end}`
						: 'Not working'

					return {
						title,
						date: avail.date,
						backgroundColor: avail.isWorkingDay ? '#10b981' : '#ef4444',
						borderColor: avail.isWorkingDay ? '#059669' : '#dc2626',
						display: 'background',
						extendedProps: {
							isAvailability: true,
						},
					}
				}
			)

			// Convert appointments to time grid events
			const appointmentEvents: CalendarEvent[] = appointments.map(
				(appointment: Appointment) => {
					const dateStr = appointment.date
					const timeStr = appointment.time
					const [hours, minutes] = timeStr.split(':').map(Number)
					const startDate = new Date(dateStr)
					startDate.setHours(hours, minutes, 0, 0)

					// Default appointment duration: 1 hour
					const endDate = new Date(startDate)
					endDate.setHours(hours + 1, minutes, 0, 0)

					return {
						id: appointment.id,
						title: `${appointment.time} - ${appointment.customerName}`,
						start: startDate.toISOString(),
						end: endDate.toISOString(),
						backgroundColor: '#3b82f6', // Blue for appointments
						borderColor: '#2563eb',
						editable: true, // Allow dragging appointments
						extendedProps: {
							isAppointment: true,
							customerName: appointment.customerName,
						},
					}
				}
			)

			// For time grid views, also show working hours as background events
			const workingHoursEvents: CalendarEvent[] = availability
				.filter((avail: Availability) => avail.isWorkingDay)
				.map((avail: Availability) => {
					const hours = avail.workingHours || { start: '10:00', end: '17:00' }
					const [startHour, startMin] = hours.start.split(':').map(Number)
					const [endHour, endMin] = hours.end.split(':').map(Number)

					const date = new Date(avail.date)
					const start = new Date(date)
					start.setHours(startHour, startMin, 0, 0)
					const end = new Date(date)
					end.setHours(endHour, endMin, 0, 0)

					return {
						title: `Working hours: ${hours.start}-${hours.end}`,
						start: start.toISOString(),
						end: end.toISOString(),
						backgroundColor: '#d1fae5', // Light green background
						borderColor: '#10b981',
						display: 'background',
						extendedProps: {
							isAvailability: true,
						},
					}
				})

			// Combine events based on view
			if (view === 'dayGridMonth' || view === 'dayGridWeek') {
				// Month/Week day grid views: show availability as background, appointments as day events
				setEvents([...availabilityEvents, ...appointmentEvents])
			} else {
				// Time grid views: show working hours as background, appointments as time events
				setEvents([...workingHoursEvents, ...appointmentEvents])
			}
		},
		[currentView]
	)

	useEffect(() => {
		// Only load data on initial mount to avoid cascading renders
		if (!hasLoadedRef.current) {
			hasLoadedRef.current = true
			void loadData()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Empty dependency array - only run on mount

	// Handle date clicks (month/week day grid views)
	const handleDateClick = async (clickInfo: {
		dateStr: string
		date: Date
	}) => {
		if (currentView !== 'dayGridMonth' && currentView !== 'dayGridWeek') return

		const dateStr = clickInfo.dateStr

		// Normalize date string to ensure consistent format for comparison
		const normalizedDate = dateStr.split('T')[0]

		// Set selected date immediately for visual feedback
		setSelectedDate(normalizedDate)

		// Get current availability for this date
		const availability = await getAvailabilityAction(dateStr, dateStr)
		const currentAvail = availability.find(
			(av: Availability) => av.date === dateStr
		)

		const isCurrentlyWorking = currentAvail?.isWorkingDay ?? false
		const currentHours = currentAvail?.workingHours || {
			start: '10:00',
			end: '17:00',
		}

		if (isCurrentlyWorking) {
			// If working, try to toggle it off (validation happens in setWorkingDay)
			try {
				const confirmToggle = confirm(
					`This day is currently working (${currentHours.start}-${currentHours.end}).\n\nDo you want to set it as non-working?\n\nNote: You can only close days with no appointments.`
				)
				if (confirmToggle) {
					await setWorkingDayAction(dateStr, false)
					setSelectedDate(null) // Clear selection after toggle
					await loadData()
					onAvailabilityChange()
				} else {
					setSelectedDate(null) // Clear selection if user cancels
				}
			} catch (error) {
				setSelectedDate(null) // Clear selection on error
				alert(
					error instanceof Error
						? error.message
						: 'Cannot close this day. Please cancel or reschedule appointments first.'
				)
			}
		} else {
			// If not working, ask to set working hours
			// selectedDate is already set above
			setWorkingHours(currentHours)
			setShowHoursModal(true)
		}
	}

	// Handle time slot selection (time grid views)
	const handleDateSelect = async (selectInfo: DateSelectInfo) => {
		if (currentView === 'dayGridMonth' || currentView === 'dayGridWeek') return

		const startDate = new Date(selectInfo.start)
		const endDate = new Date(selectInfo.end)

		// Extract date and time
		const dateStr = startDate.toISOString().split('T')[0]
		const startTime = `${startDate
			.getHours()
			.toString()
			.padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`

		// Check if this is for creating an appointment or setting working hours
		// If onAppointmentCreate callback exists, offer to create appointment
		if (onAppointmentCreate) {
			// Quick create appointment at selected time
			onAppointmentCreate(dateStr, startTime)
		} else {
			// Fallback to working hours modal
			const endTime = `${endDate
				.getHours()
				.toString()
				.padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
			const availability = await getAvailabilityAction(dateStr, dateStr)
			const currentAvail = availability.find(
				(av: Availability) => av.date === dateStr
			)

			setSelectedTimeSlot({ date: dateStr, start: startTime, end: endTime })
			setWorkingHours({
				start: startTime,
				end: endTime,
			})
			setShowHoursModal(true)
		}
	}

	// Handle event drop (moving appointments)
	const handleEventDrop = async (dropInfo: {
		event: {
			id?: string
			start: Date | null
			end?: Date | null
			extendedProps?: { isAppointment?: boolean }
			setProp: (prop: string, value: unknown) => void
		}
	}) => {
		const { event } = dropInfo

		// Only handle appointment events
		if (!event.extendedProps?.isAppointment || !event.id) {
			// Revert the event if it's not an appointment
			if (event.start) {
				dropInfo.event.setProp('start', event.start)
			}
			return
		}

		if (!onAppointmentMove) {
			// Revert if no callback provided
			if (event.start) {
				dropInfo.event.setProp('start', event.start)
			}
			return
		}

		if (!event.start) {
			return
		}

		// Extract new date and time
		const newDate = event.start.toISOString().split('T')[0]
		const newTime = `${event.start
			.getHours()
			.toString()
			.padStart(2, '0')}:${event.start
			.getMinutes()
			.toString()
			.padStart(2, '0')}`

		// Call the move handler and reload data
		try {
			await onAppointmentMove(event.id, newDate, newTime)
			// Reload calendar data after move
			await loadData()
		} catch (error) {
			// On error, revert the visual change
			if (event.start) {
				dropInfo.event.setProp('start', event.start)
			}
		}
	}

	// Handle view change - track current view type and reload events
	const handleDatesSet = (dateInfo: { view: { type: string } }) => {
		const newView = dateInfo.view.type
		if (newView !== currentView) {
			setCurrentView(newView)
			// Reload data when view changes with new view type
			void loadData(newView)
		}
	}

	const handleSaveWorkingHours = async () => {
		const dateToUpdate = selectedDate || selectedTimeSlot?.date
		if (!dateToUpdate) return

		await setWorkingDayAction(dateToUpdate, true, workingHours)
		setShowHoursModal(false)
		setSelectedDate(null)
		setSelectedTimeSlot(null)
		await loadData()
		onAvailabilityChange()
	}

	const handleCancelModal = () => {
		setShowHoursModal(false)
		setSelectedDate(null)
		setSelectedTimeSlot(null)
	}

	const dayCellClassNames = useCallback(
		(arg: DayCellClassNamesArg) => {
			const classes: string[] = []
			if (!arg.dateStr || !selectedDate) {
				return classes
			}

			// Normalize date strings for comparison
			const normalizedDate = arg.dateStr.split('T')[0]
			const normalizedSelected = selectedDate.split('T')[0]

			if (normalizedDate === normalizedSelected) {
				classes.push('fc-admin-day-selected')
			}

			return classes
		},
		[selectedDate]
	)

	return (
		<div className='admin-calendar w-full relative'>
			{/* Legend */}
			<div className='mb-4 space-y-2'>
				<div className='flex flex-wrap gap-4 text-sm'>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-green-500 rounded'></div>
						<span>Available (Working day)</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-red-500 rounded'></div>
						<span>Not available (Closed or not configured)</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4 bg-blue-500 rounded'></div>
						<span>Booked appointment</span>
					</div>
				</div>
				{currentView === 'timeGridWeek' || currentView === 'timeGridDay' ? (
					<p className='text-xs text-zinc-600'>
						💡 <strong>Quick actions:</strong> Click empty time slot to create
						appointment • Drag appointment to move it
					</p>
				) : null}
			</div>

			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,dayGridWeek,timeGridWeek,timeGridDay',
				}}
				dateClick={handleDateClick}
				select={handleDateSelect}
				selectable={
					currentView !== 'dayGridMonth' && currentView !== 'dayGridWeek'
				}
				selectMirror={true}
				dayCellClassNames={dayCellClassNames}
				events={events}
				height='auto'
				locale='en'
				firstDay={1}
				validRange={{
					start: new Date().toISOString().split('T')[0],
				}}
				views={{
					timeGridWeek: {
						slotDuration: '00:30:00', // 30-minute slots
						slotLabelInterval: '01:00:00', // Show label every hour
					},
					timeGridDay: {
						slotDuration: '00:30:00', // 30-minute slots
						slotLabelInterval: '01:00:00', // Show label every hour
					},
				}}
				allDaySlot={false}
				slotMinTime='08:00:00'
				slotMaxTime='20:00:00'
				datesSet={handleDatesSet}
				eventDrop={handleEventDrop}
				eventStartEditable={true}
				eventClick={clickInfo => {
					// Prevent navigation if it's an appointment
					if (clickInfo.event.extendedProps?.isAppointment) {
						clickInfo.jsEvent.preventDefault()
						// Clicking an appointment could open edit modal (handled by parent)
					}
				}}
			/>

			{/* Working Hours Modal */}
			{showHoursModal && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
					<div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
						<h3 className='text-xl font-bold mb-4'>
							{selectedTimeSlot
								? `Set Working Hours for ${new Date(
										selectedTimeSlot.date
								  ).toLocaleDateString()}`
								: `Set Working Hours for ${
										selectedDate && new Date(selectedDate).toLocaleDateString()
								  }`}
						</h3>
						<p className='text-sm text-zinc-600 mb-4'>
							{selectedTimeSlot
								? `Selected time: ${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
								: 'Set the working hours for this day'}
						</p>
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-zinc-700 mb-1'>
									Start Time
								</label>
								<input
									type='time'
									value={workingHours.start}
									onChange={e =>
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
									onChange={e =>
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
