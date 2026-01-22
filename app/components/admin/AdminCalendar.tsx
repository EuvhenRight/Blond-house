'use client'

import type { EventContentArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	getAppointmentsByDateRange,
	getAvailabilityAction,
	setWorkingDayAction,
} from '../../actions/appointments'
import { getServiceColor, services } from '../../lib/services'
import type { Appointment, Availability } from '../../lib/types'
import ConfirmDialog from './ConfirmDialog'
import DayCell from './DayCell'

interface AdminCalendarProps {
	onAvailabilityChange: () => void
	onAppointmentCreate?: (date: string, time: string) => void
	onAppointmentMove?: (
		appointmentId: string,
		newDate: string,
		newTime: string
	) => Promise<void>
	onAppointmentClick?: (appointmentId: string) => void
	/**
	 * Optional token that forces the calendar to reload its data when it changes.
	 * Used by the admin dashboard to immediately reflect newly created / updated
	 * appointments without requiring a manual view change.
	 */
	refreshToken?: number
}

interface CalendarEvent {
	id?: string
	title: string
	date?: string
	start?: string
	end?: string
	backgroundColor: string
	borderColor: string
	textColor?: string
	display?: string
	editable?: boolean
	extendedProps?: {
		isAppointment?: boolean
		isAvailability?: boolean
		customerName?: string
		duration?: number
		originalDate?: string
		originalTime?: string
		serviceName?: string
		customerEmail?: string
		customerPhone?: string
	}
}

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 * This prevents timezone issues when clicking on calendar days
 */
function formatDateLocal(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Check if a given Date is in the past (date-only comparison)
 */
function isPastDate(date: Date): boolean {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const d = new Date(date)
	d.setHours(0, 0, 0, 0)
	return d < today
}

/**
 * Get ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
	const d = new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
	)
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Get color scheme for appointments based on duration (fallback)
 * Short: Green, Medium: Blue, Longest: Orange
 */
function getAppointmentColorByDuration(durationMinutes: number): {
	backgroundColor: string
	borderColor: string
	color?: string
} {
	if (durationMinutes < 60) {
		// Short appointments - Green
		return {
			backgroundColor: '#10b981', // green-500
			borderColor: '#059669', // green-600
			color: '#ffffff', // white for text
		}
	} else if (durationMinutes <= 90) {
		// Medium appointments - Blue
		return {
			backgroundColor: '#3b82f6', // blue-500
			borderColor: '#2563eb', // blue-600
			color: '#ffffff', // white for text
		}
	} else {
		// Longest appointments - Orange
		return {
			backgroundColor: '#f97316', // orange-500
			borderColor: '#ea580c', // orange-600
			color: '#ffffff', // white for text
		}
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
	onAppointmentClick,
	refreshToken,
}: AdminCalendarProps) {
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [availabilityData, setAvailabilityData] = useState<
		Map<string, Availability>
	>(new Map())
	const [appointmentsByDate, setAppointmentsByDate] = useState<
		Map<string, Appointment[]>
	>(new Map())
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
	const [currentView, setCurrentView] = useState<string>('timeGridWeek')
	const [currentRangeLabel, setCurrentRangeLabel] = useState<string>('')
	const [currentDayLabel, setCurrentDayLabel] = useState<string>('')
	const [currentMonthChip, setCurrentMonthChip] = useState<string>('')
	const [currentMonthYearLabel, setCurrentMonthYearLabel] = useState<string>('')
	const [currentWeekLabel, setCurrentWeekLabel] = useState<string>('')
	const [isLoading, setIsLoading] = useState(true)

	type AvailabilityConfirmState = {
		type: 'toggleWorkingOff'
		date: string
		hours: {
			start: string
			end: string
		}
	}

	const [availabilityConfirm, setAvailabilityConfirm] =
		useState<AvailabilityConfirmState | null>(null)
	const [availabilityConfirmError, setAvailabilityConfirmError] = useState<
		string | null
	>(null)
	const [isAvailabilityConfirmLoading, setIsAvailabilityConfirmLoading] =
		useState(false)
	const hasLoadedRef = useRef(false)
	const calendarRef = useRef<FullCalendar | null>(null)

	const loadData = useCallback(
		async (viewType?: string) => {
			setIsLoading(true)
			const view = viewType || currentView
			const today = new Date()
			const endDate = new Date()
			endDate.setMonth(endDate.getMonth() + 3)

			const startDateStr = today.toISOString().split('T')[0]
			const endDateStr = endDate.toISOString().split('T')[0]

			try {
				// Load availability and appointments in parallel
				const [availability, appointments] = await Promise.all([
					getAvailabilityAction(startDateStr, endDateStr),
					getAppointmentsByDateRange(startDateStr, endDateStr),
				])

				// Store availability data in a Map for easy lookup
				const availabilityMap = new Map<string, Availability>()
				availability.forEach((avail: Availability) => {
					availabilityMap.set(avail.date, avail)
				})
				setAvailabilityData(availabilityMap)

				// Store appointments by date for easy lookup
				const appointmentsMap = new Map<string, Appointment[]>()
				appointments.forEach((appointment: Appointment) => {
					const date = appointment.date
					if (!appointmentsMap.has(date)) {
						appointmentsMap.set(date, [])
					}
					appointmentsMap.get(date)!.push(appointment)
				})
				setAppointmentsByDate(appointmentsMap)

				// Convert availability to background events for month view
				const availabilityEvents: CalendarEvent[] = availability.map(
					(avail: Availability) => {
						return {
							title: '', // No title text for background events
							date: avail.date,
							backgroundColor: '#f3f4f6', // Light gray background
							borderColor: avail.isWorkingDay ? '#e5e7eb' : '#fca5a5',
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

						// Use actual duration from appointment, default to 60 minutes
						const durationMinutes = appointment.duration || 60
						const endDate = new Date(startDate)
						endDate.setMinutes(endDate.getMinutes() + durationMinutes)

						// Get color based on service, fallback to duration if no service
						const colors = appointment.serviceId
							? getServiceColor(appointment.serviceId)
							: getAppointmentColorByDuration(durationMinutes)

						return {
							id: appointment.id,
							title: `${appointment.time} - ${appointment.customerName}`,
							start: startDate.toISOString(),
							end: endDate.toISOString(),
							backgroundColor: colors.backgroundColor,
							borderColor: colors.borderColor,
							textColor: colors.color,
							extendedProps: {
								isAppointment: true,
								customerName: appointment.customerName,
								duration: durationMinutes,
								originalDate: appointment.date,
								originalTime: appointment.time,
								serviceName: appointment.serviceName,
								customerEmail: appointment.customerEmail || undefined,
								customerPhone: appointment.customerPhone || undefined,
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
							title: '', // No title text for background events
							start: start.toISOString(),
							end: end.toISOString(),
							backgroundColor: '#f3f4f6', // Light gray background
							borderColor: '#e5e7eb',
							display: 'background',
							extendedProps: {
								isAvailability: true,
							},
						}
					})

				// Combine events based on view
				if (view === 'dayGridMonth') {
					// Month view: show availability as background, appointments as day events
					setEvents([...availabilityEvents, ...appointmentEvents])
				} else {
					// Time grid views (day/week): show working hours as background, appointments as time events
					setEvents([...workingHoursEvents, ...appointmentEvents])
				}
			} catch (error) {
				console.error('Error loading calendar data:', error)
				setEvents([])
			} finally {
				setIsLoading(false)
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

	// When the parent passes a new refreshToken, reload calendar data so that
	// newly created / updated / cancelled appointments are reflected immediately.
	useEffect(() => {
		if (!hasLoadedRef.current) return
		if (refreshToken === undefined) return
		void loadData()
	}, [refreshToken, loadData])

	// Handle date clicks in month view: always navigate to the day view
	// so you can see the full schedule and manage appointments there.
	const handleDateClick = (clickInfo: { dateStr: string; date: Date }) => {
		if (currentView !== 'dayGridMonth') return

		const clickedDate = new Date(clickInfo.date)
		const dateStr = formatDateLocal(clickedDate)

		const api = calendarRef.current?.getApi()
		if (api) {
			api.changeView('timeGridDay', dateStr)
		}
	}

	// Handle time slot selection (time grid views)
	const handleDateSelect = async (selectInfo: DateSelectInfo) => {
		if (currentView !== 'timeGridDay' && currentView !== 'timeGridWeek') return

		const startDate = new Date(selectInfo.start)
		const endDate = new Date(selectInfo.end)

		// Do not allow creating or editing past days
		if (isPastDate(startDate)) {
			return
		}

		// Extract date and time (future or today only)
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
			extendedProps?: {
				isAppointment?: boolean
				customerName?: string
				duration?: number
				originalDate?: string
				originalTime?: string
				serviceName?: string
				customerEmail?: string
				customerPhone?: string
			}
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

		// Get original appointment data
		const originalDate = event.extendedProps.originalDate
		const originalTime = event.extendedProps.originalTime
		const customerName = event.extendedProps.customerName || 'Unknown'
		const duration = event.extendedProps.duration || 60
		const serviceName = event.extendedProps.serviceName
		const customerEmail = event.extendedProps.customerEmail
		const customerPhone = event.extendedProps.customerPhone

		// Extract new date and time
		const newDate = event.start.toISOString().split('T')[0]
		const newTime = `${event.start
			.getHours()
			.toString()
			.padStart(2, '0')}:${event.start
			.getMinutes()
			.toString()
			.padStart(2, '0')}`

		// Format dates for display (simple format)
		const formatDate = (dateStr: string) => {
			const date = new Date(dateStr)
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		}

		const formatTime = (timeStr: string) => {
			const [hours, minutes] = timeStr.split(':').map(Number)
			const date = new Date()
			date.setHours(hours, minutes, 0, 0)
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			})
		}

		// Prevent moving appointments into the past (read-only days)
		if (isPastDate(event.start)) {
			if (originalDate && originalTime) {
				const [hours, minutes] = originalTime.split(':').map(Number)
				const originalStartDate = new Date(originalDate)
				originalStartDate.setHours(hours, minutes, 0, 0)
				dropInfo.event.setProp('start', originalStartDate)
			}
			alert(
				'Past days are read-only. You can only move appointments to today or future days.'
			)
			return
		}

		// Build simple and readable confirmation message
		let confirmationMessage = `Change Appointment Time?\n\n`

		confirmationMessage += `Customer: ${customerName}\n`

		if (serviceName) {
			confirmationMessage += `Service: ${serviceName}\n`
		}

		confirmationMessage += `Duration: ${duration} min\n`

		if (customerEmail) {
			confirmationMessage += `Email: ${customerEmail}\n`
		}

		if (customerPhone) {
			confirmationMessage += `Phone: ${customerPhone}\n`
		}

		confirmationMessage += `\n`

		if (originalDate && originalTime) {
			confirmationMessage += `From: ${formatDate(originalDate)} ${formatTime(
				originalTime
			)}\n`
		}

		confirmationMessage += `To: ${formatDate(newDate)} ${formatTime(newTime)}\n`

		// Show confirmation dialog
		const confirmed = window.confirm(confirmationMessage)

		if (!confirmed) {
			// Revert the event if user cancels
			// We need to restore the original start time
			if (originalDate && originalTime) {
				const [hours, minutes] = originalTime.split(':').map(Number)
				const originalStartDate = new Date(originalDate)
				originalStartDate.setHours(hours, minutes, 0, 0)
				dropInfo.event.setProp('start', originalStartDate)
			}
			return
		}

		// Call the move handler and reload data
		try {
			await onAppointmentMove(event.id, newDate, newTime)
			// Reload calendar data after move
			await loadData()
		} catch (error) {
			// On error, revert the visual change
			if (originalDate && originalTime) {
				const [hours, minutes] = originalTime.split(':').map(Number)
				const originalStartDate = new Date(originalDate)
				originalStartDate.setHours(hours, minutes, 0, 0)
				dropInfo.event.setProp('start', originalStartDate)
			}
			alert(
				error instanceof Error
					? error.message
					: 'Failed to move appointment. Please try again.'
			)
		}
	}

	// Keep a friendly title + date meta in sync with the visible range
	const handleDatesSet = (dateInfo: {
		start: Date
		end: Date
		view: {
			type: string
			title?: string
			currentStart?: Date
			currentEnd?: Date
		}
	}) => {
		const { view } = dateInfo

		// Keep currentView in sync with the FullCalendar view, even when the view
		// is changed programmatically (e.g. clicking a day in month view).
		if (view.type !== currentView) {
			setCurrentView(view.type)
			void loadData(view.type)
		}

		// FullCalendar's view may expose currentStart/currentEnd; fall back to start/end
		const viewStart = view.currentStart ?? dateInfo.start
		const viewEndRaw = view.currentEnd ?? dateInfo.end
		const rangeEnd = new Date(viewEndRaw)
		rangeEnd.setDate(rangeEnd.getDate() - 1) // end is exclusive

		const monthShortFormatter = new Intl.DateTimeFormat('en-US', {
			month: 'short',
		})
		const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
			month: 'long',
			year: 'numeric',
		})
		const dayFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric' })
		const rangeFormatter = new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
		const dayFullFormatter = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})

		setCurrentMonthChip(monthShortFormatter.format(viewStart).toUpperCase())
		setCurrentDayLabel(dayFormatter.format(viewStart))
		setCurrentMonthYearLabel(monthYearFormatter.format(viewStart))

		if (view.type === 'timeGridWeek' || view.type === 'week') {
			const weekNumber = getWeekNumber(viewStart)
			setCurrentWeekLabel(`Week ${weekNumber}`)
			setCurrentRangeLabel(
				`${rangeFormatter.format(viewStart)} – ${rangeFormatter.format(
					rangeEnd
				)}`
			)
		} else if (view.type === 'timeGridDay') {
			setCurrentWeekLabel('')
			setCurrentRangeLabel(dayFullFormatter.format(viewStart))
		} else if (view.type === 'dayGridMonth') {
			setCurrentWeekLabel('')
			setCurrentRangeLabel(monthYearFormatter.format(viewStart))
		} else {
			// Fallback to FullCalendar's built-in title
			if (view.title) {
				setCurrentRangeLabel(view.title)
			}
		}
	}

	const handleViewChange = (viewType: string) => {
		if (viewType === currentView) return

		setCurrentView(viewType)

		const api = calendarRef.current?.getApi()
		if (api) {
			api.changeView(viewType)
		}

		void loadData(viewType)
	}

	const handlePrev = () => {
		const api = calendarRef.current?.getApi()
		api?.prev()
	}

	const handleNext = () => {
		const api = calendarRef.current?.getApi()
		api?.next()
	}

	const handleToday = () => {
		const api = calendarRef.current?.getApi()
		api?.today()
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

	const handleConfirmToggleWorkingDay = async () => {
		if (!availabilityConfirm) return

		setIsAvailabilityConfirmLoading(true)
		setAvailabilityConfirmError(null)

		try {
			await setWorkingDayAction(availabilityConfirm.date, false)
			setSelectedDate(null)
			setAvailabilityConfirm(null)
			await loadData()
			onAvailabilityChange()
		} catch (error) {
			setAvailabilityConfirmError(
				error instanceof Error
					? error.message
					: 'Cannot close this day. Please cancel or reschedule appointments first.'
			)
		} finally {
			setIsAvailabilityConfirmLoading(false)
		}
	}

	const handleCancelAvailabilityConfirm = () => {
		setAvailabilityConfirm(null)
		setAvailabilityConfirmError(null)
		setSelectedDate(null)
	}

	const dayCellClassNames = useCallback(
		(arg: DayCellClassNamesArg) => {
			const classes: string[] = []
			if (!selectedDate) {
				return classes
			}

			// Use local timezone formatting to match the day the user sees
			const cellDateStr = formatDateLocal(arg.date)

			if (cellDateStr === selectedDate) {
				classes.push('fc-admin-day-selected')
			}

			return classes
		},
		[selectedDate]
	)

	// Custom day cell content for month view - using DayCell component
	const dayCellContent = useCallback(
		(arg: { date: Date; dayNumberText: string; view: { type: string } }) => {
			// Only show custom content in month view
			if (arg.view.type !== 'dayGridMonth') {
				return <>{arg.dayNumberText}</>
			}

			// Use local timezone formatting to avoid date shifting
			const dateStr = formatDateLocal(arg.date)
			const availability = availabilityData.get(dateStr)
			const appointments = appointmentsByDate.get(dateStr) || []

			// Check if date is in the past
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const cellDate = new Date(arg.date)
			cellDate.setHours(0, 0, 0, 0)
			const isPast = cellDate < today
			const isToday = cellDate.getTime() === today.getTime()

			return (
				<DayCell
					date={arg.date}
					dayNumberText={arg.dayNumberText}
					availability={availability}
					appointments={appointments}
					isPast={isPast}
					isToday={isToday}
				/>
			)
		},
		[availabilityData, appointmentsByDate]
	)

	// Custom appointment rendering for clearer hierarchy in all views
	const renderEventContent = useCallback((arg: EventContentArg) => {
		const { event, timeText, view } = arg
		const extended = event.extendedProps as {
			isAppointment?: boolean
			customerName?: string
			serviceName?: string
			duration?: number
			customerEmail?: string
			customerPhone?: string
		}

		// Keep default rendering for non-appointment/background events
		if (!extended.isAppointment) {
			return undefined
		}

		const name = extended.customerName || event.title || 'Appointment'
		const serviceName = extended.serviceName
		const duration = extended.duration
		const email = extended.customerEmail
		const phone = extended.customerPhone

		const isTimeGrid =
			view.type === 'timeGridDay' || view.type === 'timeGridWeek'

		// Build full text for native browser tooltip (hover to see full info)
		const tooltipParts: string[] = []
		tooltipParts.push(name)
		if (serviceName) tooltipParts.push(`Service: ${serviceName}`)
		tooltipParts.push(`Time: ${timeText}`)
		if (duration) tooltipParts.push(`Duration: ${duration} min`)
		if (phone) tooltipParts.push(`Phone: ${phone}`)
		if (email) tooltipParts.push(`Email: ${email}`)
		const tooltipText = tooltipParts.join(' • ')

		// For time-grid views, use a stacked layout only:
		// 1) time + duration
		// 2) customer name
		// 3) service name
		// 4) phone (truncated)
		// 5) email (truncated)
		if (isTimeGrid) {
			return (
				<div
					className='flex flex-col gap-0.5 text-[11px] leading-tight'
					title={tooltipText}
				>
					<div className='flex items-center justify-between gap-1 text-[10px]'>
						<span className='font-medium'>{timeText}</span>
						{duration ? (
							<span className='text-[10px] font-medium opacity-90'>
								{duration} min
							</span>
						) : null}
					</div>
					<div className='font-semibold truncate'>{name}</div>
					{serviceName && (
						<div className='truncate text-[10px] opacity-90'>{serviceName}</div>
					)}
					{phone && (
						<div className='truncate text-[10px] opacity-90'>{phone}</div>
					)}
					{email && (
						<div className='truncate text-[10px] opacity-90'>{email}</div>
					)}
				</div>
			)
		}

		// Fallback for other views (e.g. list view) – keep compact layout
		return (
			<div
				className='flex flex-col gap-0.5 text-[11px] leading-tight'
				title={tooltipText}
			>
				<span className='font-semibold truncate'>{name}</span>
				<span className='text-[10px] font-medium'>{timeText}</span>
				{serviceName && (
					<span className='truncate text-[10px] opacity-90'>{serviceName}</span>
				)}
			</div>
		)
	}, [])

	// Extra classes for events to refine interaction states & layout
	// Note: FullCalendar v6 doesn't export EventClassNamesArg, so we use EventContentArg
	// which has the same structure (event, view properties)
	const getEventClassNames = useCallback((arg: EventContentArg) => {
		const extended = arg.event.extendedProps as {
			isAppointment?: boolean
		}

		const classes: string[] = ['admin-calendar-event']

		if (extended.isAppointment) {
			classes.push(
				'admin-calendar-event-appointment',
				// Accessible focus / hover states
				'outline-none',
				'focus-visible:outline-none',
				'focus-visible:ring-2',
				'focus-visible:ring-amber-400/70',
				'focus-visible:ring-offset-1',
				'focus-visible:ring-offset-white',
				'hover:opacity-95'
			)

			if (arg.view.type === 'dayGridMonth') {
				classes.push('admin-calendar-event--month')
			} else {
				classes.push('admin-calendar-event--time')
			}
		} else {
			classes.push('admin-calendar-event--background')
		}

		return classes
	}, [])

	return (
		<div
			className='admin-calendar w-full relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'
			role='region'
			aria-label='Admin calendar - Manage appointments and working hours'
			aria-busy={isLoading}
		>
			{isLoading && (
				<div
					className='absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center'
					role='status'
					aria-live='polite'
					aria-label='Loading calendar data'
				>
					<div className='flex flex-col items-center gap-3'>
						<svg
							className='animate-spin h-8 w-8 text-amber-500'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							></circle>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							></path>
						</svg>
						<p className='text-sm text-zinc-600 font-medium'>
							Loading calendar...
						</p>
					</div>
				</div>
			)}

			{/* Toolbar: Untitled UI–style header + navigation + view switcher */}
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-100 bg-white'>
				<div className='flex items-center gap-3 sm:gap-4'>
					<div className='hidden sm:flex flex-col items-center justify-center rounded-xl bg-zinc-900 px-3 py-2 text-white shadow-sm'>
						<span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200'>
							{currentMonthChip || '—'}
						</span>
						<span className='text-xl font-semibold sm:text-2xl'>
							{currentDayLabel || ''}
						</span>
					</div>
					<div className='space-y-1'>
						<p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400'>
							{currentWeekLabel
								? `${currentMonthYearLabel || 'Schedule'} • ${currentWeekLabel}`
								: currentMonthYearLabel || 'Schedule'}
						</p>
						<p className='text-sm sm:text-base lg:text-lg font-semibold text-zinc-900'>
							{currentRangeLabel || 'Upcoming schedule'}
						</p>
						<p className='hidden text-xs text-zinc-500 sm:block sm:text-[13px] lg:text-sm'>
							Manage working days, hours, and client appointments in one view.
						</p>
					</div>
				</div>
				<div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3'>
					<div className='inline-flex items-center justify-between rounded-full border border-zinc-200 bg-white px-1.5 py-1 shadow-sm'>
						<button
							type='button'
							onClick={handlePrev}
							className='inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] sm:text-xs lg:text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
							aria-label='Previous period'
						>
							<span aria-hidden='true'>‹</span>
						</button>
						<button
							type='button'
							onClick={handleToday}
							className='px-2.5 py-1 rounded-full text-[11px] sm:text-xs lg:text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
						>
							Today
						</button>
						<button
							type='button'
							onClick={handleNext}
							className='inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] sm:text-xs lg:text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
							aria-label='Next period'
						>
							<span aria-hidden='true'>›</span>
						</button>
					</div>
					<div
						className='inline-flex items-center gap-0.5 rounded-full bg-zinc-100 p-0.5 text-[11px] sm:text-xs lg:text-sm'
						role='tablist'
						aria-label='Change calendar view'
					>
						{[
							{ id: 'dayGridMonth', label: 'Month' },
							{ id: 'timeGridWeek', label: 'Week' },
							{ id: 'timeGridDay', label: 'Day' },
							{ id: 'listWeek', label: 'Agenda' },
						].map(view => (
							<button
								key={view.id}
								type='button'
								role='tab'
								aria-selected={currentView === view.id}
								onClick={() => handleViewChange(view.id)}
								className={clsx(
									'px-2.5 py-1 rounded-full font-medium transition-colors',
									currentView === view.id
										? 'bg-white text-zinc-900 shadow-sm'
										: 'text-zinc-600 hover:text-zinc-900'
								)}
							>
								{view.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Legend - availability + services */}
			<div
				className='px-4 sm:px-6 pt-3 sm:pt-4 pb-4 border-b border-gray-100 bg-white/80'
				role='region'
				aria-label='Calendar legend'
			>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div className='flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-gray-600 lg:hidden'>
						<div className='flex items-center gap-1.5'>
							<div
								className='h-2.5 w-2.5 rounded-full bg-emerald-500'
								aria-hidden='true'
							/>
							<span className='font-medium'>Available</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<div
								className='h-2.5 w-2.5 rounded-full bg-red-500'
								aria-hidden='true'
							/>
							<span className='font-medium'>Closed</span>
						</div>
					</div>
					<div className='admin-calendar-legend-services flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs'>
						<span className='mr-1.5 font-semibold text-gray-700'>Services</span>
						{services.map(service => {
							const colors = getServiceColor(service.id)
							return (
								<div
									key={service.id}
									className='inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/70 px-1.5 py-0.5'
									role='listitem'
								>
									<span
										className='h-2 w-2 rounded-full'
										style={{
											backgroundColor: colors.backgroundColor,
											border: `1px solid ${colors.borderColor}`,
										}}
										aria-hidden='true'
									/>
									<span className='max-w-[10rem] truncate font-medium text-gray-600'>
										{service.name}
									</span>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			<div
				role='application'
				aria-label='FullCalendar - Admin calendar view'
				aria-hidden={isLoading}
			>
				<FullCalendar
					ref={calendarRef}
					plugins={[
						dayGridPlugin,
						timeGridPlugin,
						interactionPlugin,
						listPlugin,
					]}
					initialView='timeGridWeek'
					headerToolbar={false}
					buttonText={{
						today: 'Today',
						dayGridMonth: 'Month',
						timeGridWeek: 'Week',
						timeGridDay: 'Day',
						listWeek: 'Agenda',
					}}
					dateClick={handleDateClick}
					select={handleDateSelect}
					selectable={
						currentView === 'timeGridDay' || currentView === 'timeGridWeek'
					}
					selectMirror={true}
					dayCellClassNames={dayCellClassNames}
					dayCellContent={dayCellContent}
					events={events}
					eventContent={renderEventContent}
					eventClassNames={getEventClassNames}
					nowIndicator={true}
					height='auto'
					locale='en'
					firstDay={1}
					validRange={{
						start: '2016-01-01',
					}}
					views={{
						timeGridWeek: {
							slotDuration: '00:30:00', // 30-minute slots
							slotLabelInterval: '01:00:00', // Show label every hour
							slotLabelFormat: {
								hour: '2-digit',
								minute: '2-digit',
								omitZeroMinute: false,
								meridiem: 'short',
							},
						},
						timeGridDay: {
							slotDuration: '00:30:00', // 30-minute slots
							slotLabelInterval: '01:00:00', // Show label every hour
							slotLabelFormat: {
								hour: '2-digit',
								minute: '2-digit',
								omitZeroMinute: false,
								meridiem: 'short',
							},
						},
						dayGridMonth: {
							// Keep month view for overview
						},
						listWeek: {
							duration: { weeks: 1 },
							listDayFormat: {
								weekday: 'short',
								day: 'numeric',
								month: 'short',
							},
							listDaySideFormat: false,
						},
					}}
					allDaySlot={false}
					slotMinTime='08:00:00'
					slotMaxTime='20:00:00'
					eventDurationEditable={false}
					datesSet={handleDatesSet}
					eventDrop={handleEventDrop}
					eventStartEditable={true}
					eventClick={clickInfo => {
						if (!clickInfo.event.extendedProps?.isAppointment) return
						clickInfo.jsEvent.preventDefault()
						if (onAppointmentClick && clickInfo.event.id) {
							onAppointmentClick(clickInfo.event.id)
						}
					}}
				/>
			</div>

			{/* Working Hours Modal */}
			{showHoursModal && (
				<div
					className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
					role='dialog'
					aria-modal='true'
					aria-labelledby='working-hours-modal-title'
					aria-describedby='working-hours-modal-description'
					onClick={e => {
						if (e.target === e.currentTarget) {
							handleCancelModal()
						}
					}}
				>
					<div className='bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl'>
						<h3
							id='working-hours-modal-title'
							className='text-lg sm:text-xl font-bold text-zinc-900 mb-3 sm:mb-4'
						>
							{selectedTimeSlot
								? `Set Working Hours for ${new Date(
										selectedTimeSlot.date
								  ).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
								  })}`
								: `Set Working Hours for ${
										selectedDate &&
										new Date(selectedDate).toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'long',
											day: 'numeric',
										})
								  }`}
						</h3>
						<p
							id='working-hours-modal-description'
							className='text-sm text-zinc-600 mb-4 sm:mb-6'
						>
							{selectedTimeSlot
								? `Selected time: ${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
								: 'Set the working hours for this day'}
						</p>
						<div className='space-y-4'>
							<div>
								<label
									htmlFor='start-time-input'
									className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
								>
									Start Time{' '}
									<span className='text-red-600' aria-label='required'>
										*
									</span>
								</label>
								<input
									id='start-time-input'
									type='time'
									value={workingHours.start}
									onChange={e =>
										setWorkingHours({ ...workingHours, start: e.target.value })
									}
									aria-required='true'
									className='w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px]'
								/>
							</div>
							<div>
								<label
									htmlFor='end-time-input'
									className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
								>
									End Time{' '}
									<span className='text-red-600' aria-label='required'>
										*
									</span>
								</label>
								<input
									id='end-time-input'
									type='time'
									value={workingHours.end}
									onChange={e =>
										setWorkingHours({ ...workingHours, end: e.target.value })
									}
									aria-required='true'
									className='w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-300 rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px]'
								/>
							</div>
							<div className='flex flex-col sm:flex-row gap-3 pt-4'>
								<button
									type='button'
									onClick={handleSaveWorkingHours}
									className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-colors font-medium text-base min-h-[48px] focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
								>
									Save
								</button>
								<button
									type='button'
									onClick={handleCancelModal}
									className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 active:bg-zinc-400 transition-colors font-medium text-base min-h-[48px] focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2'
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Confirm toggle working day modal (same visual language as other modals) */}
			{availabilityConfirm && (
				<ConfirmDialog
					open={true}
					title='Set this day as not working?'
					description={`This day is currently working (${availabilityConfirm.hours.start}-${availabilityConfirm.hours.end}). You can only close days with no appointments.`}
					confirmLabel='Set as not working'
					cancelLabel='Keep as working'
					tone='danger'
					isLoading={isAvailabilityConfirmLoading}
					errorMessage={availabilityConfirmError}
					onConfirm={handleConfirmToggleWorkingDay}
					onCancel={handleCancelAvailabilityConfirm}
				/>
			)}
		</div>
	)
}
