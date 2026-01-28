'use client'

import type { DayCellContentArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	getAppointmentsByDateRangeAction,
	getAvailabilityAction,
} from '../../actions/appointments'
import type { Availability } from '../../lib/types'

interface PublicCalendarProps {
	onDateSelect: (date: string) => void
	selectedDate?: string | null
	serviceDurationMinutes?: number | null // Optional: service duration to calculate available slots
}

interface DateClickInfo {
	dateStr: string
	date: Date
	allDay: boolean
}

interface DatesSetArg {
	start: Date
	end: Date
	startStr: string
	endStr: string
	timeZone: string
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

export default function PublicCalendar({
	onDateSelect,
	selectedDate: propSelectedDate,
	serviceDurationMinutes,
}: PublicCalendarProps) {
	const [workingDays, setWorkingDays] = useState<Set<string>>(new Set())
	const [datesWithNoSlots, setDatesWithNoSlots] = useState<Set<string>>(
		new Set(),
	)
	const [localSelectedDate, setLocalSelectedDate] = useState<string | null>(
		null,
	)
	const [calendarVersion, setCalendarVersion] = useState(0)
	const [, setIsLoading] = useState(false)
	const [visibleRange, setVisibleRange] = useState<{
		start: Date | null
		end: Date | null
	}>({ start: null, end: null })
	const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date())

	// Memoized props to avoid re-render loops in FullCalendar
	const validRange = useMemo(
		() => ({
			start: new Date().toISOString().split('T')[0],
		}),
		[],
	)

	// Track loaded date ranges to prevent duplicate requests
	const loadedRangesRef = useRef<Set<string>>(new Set())
	const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const lastViewedMonthRef = useRef<string | null>(null)

	// Use propSelectedDate as source of truth, fallback to localSelectedDate
	const effectiveSelectedDate =
		propSelectedDate !== undefined && propSelectedDate !== null
			? propSelectedDate.split('T')[0]
			: localSelectedDate

	const loadAvailability = useCallback(
		async (startDate?: Date, endDate?: Date) => {
			const today = new Date()
			const start = startDate || today
			const end =
				endDate ||
				(() => {
					const futureDate = new Date(today)
					futureDate.setMonth(futureDate.getMonth() + 3)
					return futureDate
				})()

			const startDateStr = start.toISOString().split('T')[0]
			const endDateStr = end.toISOString().split('T')[0]
			const rangeKey = `${startDateStr}_${endDateStr}`

			// Prevent duplicate requests for the same range
			if (loadedRangesRef.current.has(rangeKey)) {
				return
			}

			setIsLoading(true)
			loadedRangesRef.current.add(rangeKey)

			try {
				const [availability, appointments] = await Promise.all([
					getAvailabilityAction(startDateStr, endDateStr),
					getAppointmentsByDateRangeAction(startDateStr, endDateStr),
				])

				// Process availability data: only add dates where isWorkingDay === true
				// Dates with isWorkingDay === false or no record will show as "Not Available"
				setWorkingDays(prev => {
					const merged = new Set(prev)
					availability.forEach((avail: Availability) => {
						const dateStr = avail.date
						if (!dateStr) return

						const normalizedDate = dateStr.split('T')[0]

						// Only add dates where isWorkingDay is explicitly true
						if (avail.isWorkingDay === true) {
							merged.add(normalizedDate)
						} else {
							// Explicitly remove if it was previously marked as working (in case status changed)
							merged.delete(normalizedDate)
						}
					})
					return merged
				})

				// Check which working days have no available slots
				const datesWithNoAvailableSlots = new Set<string>()
				availability.forEach((avail: Availability) => {
					if (!avail.date || !avail.isWorkingDay) return

					const date = avail.date.split('T')[0]
					const hours = avail.workingHours || { start: '10:00', end: '17:00' }
					const workingStartMinutes =
						parseInt(hours.start.split(':')[0]) * 60 +
						parseInt(hours.start.split(':')[1])
					const workingEndMinutes =
						parseInt(hours.end.split(':')[0]) * 60 +
						parseInt(hours.end.split(':')[1])

					// Get booked appointments with their durations
					const bookedAppointments = appointments
						.filter(
							apt =>
								apt.status === 'confirmed' && apt.date.split('T')[0] === date,
						)
						.map(apt => ({
							time: apt.time,
							duration: apt.duration || 60,
						}))

					// Helper function to convert time to minutes
					const timeToMinutes = (time: string): number => {
						const [hours, minutes] = time.split(':').map(Number)
						return hours * 60 + minutes
					}

					// Use customTimeSlots if available, otherwise generate from workingHours
					let timeSlots: string[]
					if (avail.customTimeSlots && avail.customTimeSlots.length > 0) {
						timeSlots = avail.customTimeSlots
					} else {
						// Generate slots from working hours using 30-minute intervals
						timeSlots = []
						let currentMinutes = workingStartMinutes
						while (currentMinutes < workingEndMinutes) {
							const hour = Math.floor(currentMinutes / 60)
							const minute = currentMinutes % 60
							timeSlots.push(
								`${hour.toString().padStart(2, '0')}:${minute
									.toString()
									.padStart(2, '0')}`,
							)
							currentMinutes += 30
						}
					}

					// Buffer time between appointments
					const APPOINTMENT_BUFFER_MINUTES = 30
					const slotDurationForOverlap = serviceDurationMinutes || 60

					// Filter out slots that don't have enough time remaining
					let availableSlots = timeSlots.filter(slot => {
						const slotMinutes = timeToMinutes(slot)
						const requiredDuration = serviceDurationMinutes || 30
						const slotEndMinutes =
							slotMinutes + requiredDuration + APPOINTMENT_BUFFER_MINUTES
						return slotEndMinutes <= workingEndMinutes
					})

					// Filter out slots that overlap with booked appointments
					availableSlots = availableSlots.filter(slot => {
						const slotMinutes = timeToMinutes(slot)
						const slotEndMinutes =
							slotMinutes + slotDurationForOverlap + APPOINTMENT_BUFFER_MINUTES

						for (const appointment of bookedAppointments) {
							const appointmentStartMinutes = timeToMinutes(appointment.time)
							const appointmentEndWithBuffer =
								appointmentStartMinutes +
								appointment.duration +
								APPOINTMENT_BUFFER_MINUTES

							if (
								slotMinutes < appointmentEndWithBuffer &&
								slotEndMinutes > appointmentStartMinutes
							) {
								return false
							}
						}

						return true
					})

					// If no available slots, mark this date as unavailable
					if (availableSlots.length === 0) {
						datesWithNoAvailableSlots.add(date)
					}
				})

				setDatesWithNoSlots(prev => {
					const merged = new Set(prev)
					datesWithNoAvailableSlots.forEach(date => merged.add(date))
					return merged
				})
				setCalendarVersion(v => v + 1) // force FullCalendar remount so colors redraw with latest data
			} catch {
				// Remove range key on error so it can be retried
				loadedRangesRef.current.delete(rangeKey)
			} finally {
				setIsLoading(false)
			}
		},
		[serviceDurationMinutes], // Include serviceDurationMinutes so counts update when service changes
	)

	// Initial load - only once on mount
	useEffect(() => {
		const today = new Date()
		const endDate = new Date()
		endDate.setMonth(endDate.getMonth() + 3)
		void loadAvailability(today, endDate)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount

	const handleDatesSet = useCallback(
		(dateInfo: DatesSetArg) => {
			// Track visible range for header display
			const start = dateInfo.start
			const endExclusive = dateInfo.end
			const end = new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000)
			setVisibleRange({ start, end })
			// Capture the current view date so remounts preserve it
			setCurrentViewDate(start)

			// Check if the visible month has changed
			const currentMonthKey = `${start.getFullYear()}-${start.getMonth()}`
			const monthChanged = lastViewedMonthRef.current !== currentMonthKey

			// If month changed, clear cache for ranges that overlap with current month to force refresh
			if (monthChanged && lastViewedMonthRef.current !== null) {
				// Clear cached ranges that might include dates from the current month
				// We'll clear all ranges to ensure fresh data when navigating between months
				loadedRangesRef.current.clear()
				// Also clear the working days and dates with no slots for the current month
				// This will force a fresh calculation
				setWorkingDays(prev => {
					const filtered = new Set<string>()
					prev.forEach(date => {
						const dateObj = new Date(date + 'T00:00:00')
						const dateMonth = `${dateObj.getFullYear()}-${dateObj.getMonth()}`
						// Keep dates from other months, only clear current month
						if (dateMonth !== currentMonthKey) {
							filtered.add(date)
						}
					})
					return filtered
				})
				setDatesWithNoSlots(prev => {
					const filtered = new Set<string>()
					prev.forEach(date => {
						const dateObj = new Date(date + 'T00:00:00')
						const dateMonth = `${dateObj.getFullYear()}-${dateObj.getMonth()}`
						// Keep dates from other months, only clear current month
						if (dateMonth !== currentMonthKey) {
							filtered.add(date)
						}
					})
					return filtered
				})
			}
			lastViewedMonthRef.current = currentMonthKey

			// Debounce datesSet to prevent excessive requests during rapid navigation
			if (loadTimeoutRef.current) {
				clearTimeout(loadTimeoutRef.current)
			}

			loadTimeoutRef.current = setTimeout(() => {
				const start = dateInfo.start
				const end = dateInfo.end
				// Load availability for visible range + buffer around the visible dates
				const bufferStart = new Date(start)
				bufferStart.setDate(bufferStart.getDate() - 7)
				const bufferEnd = new Date(end)
				bufferEnd.setDate(bufferEnd.getDate() + 7)
				void loadAvailability(bufferStart, bufferEnd)
			}, 300) // 300ms debounce
		},
		[loadAvailability],
	)

	// Formatting helpers for header display
	const formatDateRangeLabel = useMemo(() => {
		if (!visibleRange.start || !visibleRange.end) return ''
		const fmt = new Intl.DateTimeFormat('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
		return `${fmt.format(visibleRange.start)} – ${fmt.format(visibleRange.end)}`
	}, [visibleRange])

	const monthYearLabel = useMemo(() => {
		if (!visibleRange.start) return ''
		return new Intl.DateTimeFormat('en', {
			month: 'long',
			year: 'numeric',
		})
			.format(visibleRange.start)
			.toUpperCase()
	}, [visibleRange])

	const monthLabel = useMemo(() => {
		if (!visibleRange.start) return ''
		return new Intl.DateTimeFormat('en', {
			month: 'long',
		})
			.format(visibleRange.start)
			.toUpperCase()
	}, [visibleRange])

	const yearLabel = useMemo(() => {
		if (!visibleRange.start) return ''
		return new Intl.DateTimeFormat('en', {
			year: 'numeric',
		}).format(visibleRange.start)
	}, [visibleRange])

	const isoWeekNumber = useMemo(() => {
		if (!visibleRange.start) return null
		const d = new Date(
			Date.UTC(
				visibleRange.start.getFullYear(),
				visibleRange.start.getMonth(),
				visibleRange.start.getDate(),
			),
		)
		const dayNum = d.getUTCDay() || 7
		d.setUTCDate(d.getUTCDate() + 4 - dayNum)
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
		return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
	}, [visibleRange])

	const startMonthAbbr = useMemo(() => {
		if (!visibleRange.start) return ''
		return new Intl.DateTimeFormat('en', { month: 'short' })
			.format(visibleRange.start)
			.toUpperCase()
	}, [visibleRange])

	const startDay = useMemo(() => {
		if (!visibleRange.start) return ''
		return visibleRange.start.getDate().toString()
	}, [visibleRange])

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (loadTimeoutRef.current) {
				clearTimeout(loadTimeoutRef.current)
			}
		}
	}, [])

	const handleDateClick = useCallback(
		async (arg: DateClickInfo) => {
			if (!arg.dateStr) {
				return
			}

			const clickedDate = arg.dateStr
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const clickedDateObj = new Date(clickedDate)
			clickedDateObj.setHours(0, 0, 0, 0)

			// Disable past dates (but allow today)
			if (clickedDateObj < today) {
				return
			}

			// Normalize date string to YYYY-MM-DD format for comparison
			const normalizedDate = clickedDate.split('T')[0]

			// Only allow selection of working days (available days)
			if (!workingDays.has(normalizedDate)) {
				return // Don't allow clicking on unavailable days
			}

			// Disable fully booked dates - do not allow selection
			if (datesWithNoSlots.has(normalizedDate)) {
				return
			}

			// Set selected date for styling (use the normalized date from clickedDate)
			const dateToSelect = normalizedDate

			try {
				// Navigate to the selected date's month immediately
				if (calendarApiRef.current) {
					try {
						const dateForNavigation = new Date(clickedDate + 'T00:00:00')
						if (!isNaN(dateForNavigation.getTime())) {
							calendarApiRef.current.gotoDate(dateForNavigation)
							lastNavigatedDateRef.current = dateToSelect
						}
					} catch {
						// Silently handle navigation errors
					}
				}

				// Set local selected date state for immediate UI feedback
				setLocalSelectedDate(dateToSelect)
				// Then call the parent handler (which will update propSelectedDate)
				onDateSelect(dateToSelect)
			} catch {
				// Error handled silently
			}
		},
		[workingDays, datesWithNoSlots, onDateSelect],
	)

	const isPastDate = useCallback((dateStr: string) => {
		if (!dateStr) return false

		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const normalizedDate = dateStr.split('T')[0]
		const date = new Date(normalizedDate)
		date.setHours(0, 0, 0, 0)
		return date < today
	}, [])

	const isWorkingDay = useCallback(
		(dateStr: string) => {
			if (!dateStr) return false

			// Normalize date string to YYYY-MM-DD format for comparison
			const normalizedDate = dateStr.split('T')[0]
			return workingDays.has(normalizedDate)
		},
		[workingDays],
	)

	const getDayStatus = useCallback(
		(date: Date) => {
			const normalizedDate = formatDateLocal(date)
			const isPast = isPastDate(normalizedDate)
			const isWorking = isWorkingDay(normalizedDate)
			const hasNoSlots = datesWithNoSlots.has(normalizedDate)
			const isAvailable = isWorking && !hasNoSlots && !isPast
			const isFullyBooked = isWorking && hasNoSlots && !isPast

			let status: 'available' | 'fully-booked' | 'unavailable' | 'past'
			if (isPast) status = 'past'
			else if (isAvailable) status = 'available'
			else if (isFullyBooked) status = 'fully-booked'
			else status = 'unavailable'

			return { status, normalizedDate }
		},
		[datesWithNoSlots, isPastDate, isWorkingDay],
	)

	const dayCellClassNames = useCallback(
		(arg: DayCellClassNamesArg) => {
			const classes: string[] = []
			if (!arg.dateStr) return classes

			const { status, normalizedDate } = getDayStatus(arg.date)
			const isSelected = effectiveSelectedDate === normalizedDate

			if (status === 'past') {
				classes.push('fc-day-past', 'cursor-not-allowed')
			} else if (isSelected) {
				classes.push('fc-day-selected')
			}

			if (status === 'available') {
				classes.push('fc-day-available', 'cursor-pointer')
			} else if (status === 'fully-booked') {
				classes.push('fc-day-fully-booked', 'cursor-not-allowed')
			} else if (status === 'unavailable') {
				classes.push('fc-day-unavailable', 'cursor-not-allowed')
			}

			return classes
		},
		[getDayStatus, effectiveSelectedDate],
	)

	// Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
	const formatDateLocal = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const dayCellContent = useCallback(
		(arg: DayCellContentArg) => {
			const { status } = getDayStatus(arg.date)
			let statusLabel: string | null = null
			if (status === 'available') statusLabel = 'Available'
			else if (status === 'fully-booked') statusLabel = 'Fully booked'
			else if (status === 'unavailable') statusLabel = 'Not available'

			return (
				<div className='flex h-full flex-col items-center justify-center py-1'>
					<span className='text-sm font-semibold text-zinc-900'>
						{arg.dayNumberText}
					</span>
					{statusLabel && (
						<span className='mt-0.5 text-[11px] font-medium text-zinc-500 hidden md:block'>
							{statusLabel}
						</span>
					)}
				</div>
			)
		},
		[getDayStatus],
	)

	const dayCellDidMount = useCallback(
		(arg: { date: Date; el: HTMLElement }) => {
			// Only apply availability styles to dates in the current visible month
			// Check if this date's month matches the visible range's month
			if (visibleRange.start) {
				const dateMonth = arg.date.getMonth()
				const dateYear = arg.date.getFullYear()
				const visibleMonth = visibleRange.start.getMonth()
				const visibleYear = visibleRange.start.getFullYear()

				// If date is from a different month, don't apply availability styling
				if (dateMonth !== visibleMonth || dateYear !== visibleYear) {
					// Still apply basic styling but not availability status
					const frame = arg.el.querySelector<HTMLElement>(
						'.fc-daygrid-day-frame',
					)
					if (frame) {
						frame.style.backgroundColor = '#ffffff'
						frame.style.borderColor = '#e5e7eb'
						frame.style.color = '#9ca3af'
						frame.style.opacity = '0.6'
						frame.style.boxShadow = 'none'
					}
					return
				}
			}

			const { status, normalizedDate } = getDayStatus(arg.date)
			const isSelected = effectiveSelectedDate === normalizedDate
			const isToday = arg.el.classList.contains('fc-day-today')
			const frame = arg.el.querySelector<HTMLElement>('.fc-daygrid-day-frame')
			if (!frame) return

			frame.dataset.status = status

			const numberEl = frame.querySelector<HTMLElement>(
				'.fc-daygrid-day-number',
			)
			const statusEl = frame.querySelector<HTMLElement>('span:nth-child(2)')

			// Get border-radius from CSS variable
			const calendarContainer = arg.el.closest('.public-calendar')
			const borderRadius = calendarContainer
				? getComputedStyle(calendarContainer)
						.getPropertyValue('--pc-day-radius')
						.trim() || '0.375rem'
				: '0.375rem'

			const applySelected = () => {
				const green = '#10b981'
				frame.style.backgroundColor = '#ecfdf3'
				frame.style.borderColor = green
				frame.style.color = '#065f46'
				frame.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.25)'
				frame.style.borderRadius = borderRadius
				if (numberEl) numberEl.style.color = '#065f46'
				if (statusEl) statusEl.style.color = '#047857'
			}

			const apply = (bg: string, border: string, color: string) => {
				frame.style.backgroundColor = bg
				frame.style.borderColor = border
				frame.style.color = color
				frame.style.borderRadius = borderRadius
				if (numberEl) numberEl.style.color = color
				if (statusEl) statusEl.style.color = color
			}

			// If this cell is currently selected, prioritize the selected styling (green border)
			if (isSelected || arg.el.classList.contains('fc-day-selected')) {
				applySelected()
				return
			}

			// If this is today but not selected, apply orange/amber border
			if (isToday) {
				if (status === 'available') {
					apply('#fffbeb', '#f59e0b', '#b45309') // amber colors for today
					frame.style.boxShadow = '0 4px 12px rgba(245,158,11,0.2)'
				} else if (status === 'fully-booked') {
					apply('#fee2e2', '#f59e0b', '#991b1b') // red background, orange border for today
					frame.style.boxShadow = '0 4px 12px rgba(239,68,68,0.2)'
				} else if (status === 'unavailable') {
					apply('#fef3c7', '#f59e0b', '#92400e')
					frame.style.boxShadow = 'none'
				}
				return
			}

			// Regular status styling for non-today, non-selected dates
			if (status === 'available') {
				apply('#ecfdf3', '#a7f3d0', '#047857')
				frame.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)'
			} else if (status === 'fully-booked') {
				apply('#fee2e2', '#ef4444', '#991b1b') // red background and border
				frame.style.boxShadow = '0 4px 12px rgba(239,68,68,0.15)'
			} else if (status === 'unavailable') {
				apply('#f4f4f5', '#e4e4e7', '#6b7280')
				frame.style.boxShadow = 'none'
			} else {
				// past
				apply('#ffffff', '#e5e7eb', '#9ca3af')
				frame.style.opacity = '0.6'
				frame.style.boxShadow = 'none'
			}
		},
		[getDayStatus, effectiveSelectedDate, visibleRange],
	)

	// Calendar ref to access API
	const calendarRef = useRef<FullCalendar>(null)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const calendarApiRef = useRef<any>(null)
	const lastNavigatedDateRef = useRef<string | null>(null)

	// Store calendar API once the component has mounted
	useEffect(() => {
		if (calendarRef.current) {
			calendarApiRef.current = calendarRef.current.getApi()
		}
	}, [calendarVersion])

	// Update day cell styling when selected date changes (without full remount)
	const previousSelectedRef = useRef<string | null>(null)
	const calendarContainerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const updateDayCellStyling = () => {
			const calendarEl = calendarContainerRef.current
			if (!calendarEl) return

			// Get border-radius from CSS variable
			const borderRadius =
				getComputedStyle(calendarEl)
					.getPropertyValue('--pc-day-radius')
					.trim() || '0.375rem'

			// Helper to apply styles
			const applyStyles = (
				dateStr: string,
				bg: string,
				border: string,
				color: string,
				shadow: string,
			) => {
				const cell = calendarEl.querySelector(`[data-date="${dateStr}"]`)
				if (!cell) return
				const frame = cell.querySelector('.fc-daygrid-day-frame') as HTMLElement
				if (!frame) return
				const numberEl = frame.querySelector(
					'.fc-daygrid-day-number',
				) as HTMLElement
				const statusEl = frame.querySelector('span:nth-child(2)') as HTMLElement

				frame.style.backgroundColor = bg
				frame.style.borderColor = border
				frame.style.color = color
				frame.style.boxShadow = shadow
				frame.style.borderRadius = borderRadius
				if (numberEl) numberEl.style.color = color
				if (statusEl) statusEl.style.color = color
			}

			// Reset previous selection to its base status styling
			if (previousSelectedRef.current) {
				const prevDate = previousSelectedRef.current
				const prevDateObj = new Date(prevDate + 'T00:00:00')
				const { status } = getDayStatus(prevDateObj)

				// Check if previous date is today
				const prevCell = calendarEl.querySelector(`[data-date="${prevDate}"]`)
				const isPrevToday = prevCell?.classList.contains('fc-day-today')

				// If previous date is today, restore orange/amber border
				if (isPrevToday) {
					if (status === 'available') {
						applyStyles(
							prevDate,
							'#fffbeb',
							'#f59e0b',
							'#b45309',
							'0 4px 12px rgba(245,158,11,0.2)',
						)
					} else if (status === 'fully-booked') {
						applyStyles(
							prevDate,
							'#fee2e2',
							'#f59e0b',
							'#991b1b',
							'0 4px 12px rgba(239,68,68,0.2)',
						)
					} else if (status === 'unavailable') {
						applyStyles(prevDate, '#fef3c7', '#f59e0b', '#92400e', 'none')
					}
				} else {
					// Regular status styling for non-today dates
					if (status === 'available') {
						applyStyles(
							prevDate,
							'#ecfdf3',
							'#a7f3d0',
							'#047857',
							'0 4px 12px rgba(16,185,129,0.15)',
						)
					} else if (status === 'fully-booked') {
						applyStyles(
							prevDate,
							'#fee2e2',
							'#ef4444',
							'#991b1b',
							'0 4px 12px rgba(239,68,68,0.15)',
						)
					}
				}
			}

			// Apply selected styling to new selection
			if (effectiveSelectedDate) {
				applyStyles(
					effectiveSelectedDate,
					'#ecfdf3',
					'#10b981',
					'#065f46',
					'0 0 0 3px rgba(16, 185, 129, 0.25)',
				)
				previousSelectedRef.current = effectiveSelectedDate
			}
		}

		updateDayCellStyling()
	}, [effectiveSelectedDate, getDayStatus])

	// Navigation handlers
	const handlePrevMonth = useCallback(() => {
		const api = calendarRef.current?.getApi()
		if (api) api.prev()
	}, [])

	const handleNextMonth = useCallback(() => {
		const api = calendarRef.current?.getApi()
		if (api) api.next()
	}, [])

	const handleToday = useCallback(() => {
		const api = calendarRef.current?.getApi()
		if (api) api.today()
	}, [])

	return (
		<div
			ref={calendarContainerRef}
			className='public-calendar w-full'
			role='application'
			aria-label='Booking calendar - Select an available date for your appointment'
		>
			{visibleRange.start && visibleRange.end && (
				<div className='mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-4 md:gap-6'>
					<div className='flex items-center gap-2 sm:gap-4 md:gap-5 flex-1 min-w-0'>
						{/* Date Pill */}
						<div className='bg-neutral-900 text-white rounded-xl sm:rounded-2xl px-2.5 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 flex flex-col items-center justify-center min-w-[56px] sm:min-w-[72px] md:min-w-[80px] shadow-lg border border-neutral-800 shrink-0'>
							<span className='text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-amber-200 uppercase leading-none mb-0.5 sm:mb-1'>
								{startMonthAbbr}
							</span>
							<span className='text-2xl sm:text-3xl md:text-4xl font-bold leading-none'>
								{startDay}
							</span>
						</div>
						{/* Month, Year, Week Info */}
						<div
							className='flex flex-col gap-0.5 min-w-0 flex-1'
							style={{ fontFamily: 'title, serif' }}
						>
							<div className='text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 leading-tight truncate'>
								{monthLabel}
							</div>
							<div className='text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-tight truncate'>
								{yearLabel}
								{isoWeekNumber ? ` • WEEK ${isoWeekNumber}` : ''}
							</div>
						</div>
					</div>
					{/* Navigation Controls */}
					<div className='flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1 sm:px-1.5 py-0.5 sm:py-1 shadow-sm shrink-0'>
						<button
							onClick={handlePrevMonth}
							className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-full transition-all duration-200 text-lg sm:text-xl md:text-2xl font-light leading-none hover:text-gray-900 active:scale-95'
							aria-label='Previous month'
						>
							‹
						</button>
						<button
							onClick={handleToday}
							className='px-2 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10 flex items-center justify-center text-gray-900 font-medium hover:bg-gray-50 rounded-full transition-all duration-200 text-[10px] sm:text-xs md:text-sm active:scale-95'
							style={{ fontFamily: 'title, serif' }}
						>
							Today
						</button>
						<button
							onClick={handleNextMonth}
							className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-full transition-all duration-200 text-lg sm:text-xl md:text-2xl font-light leading-none hover:text-gray-900 active:scale-95'
							aria-label='Next month'
						>
							›
						</button>
					</div>
				</div>
			)}
			<FullCalendar
				key={calendarVersion}
				ref={calendarRef}
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				initialDate={currentViewDate}
				headerToolbar={false}
				datesSet={handleDatesSet}
				dateClick={handleDateClick}
				dayCellClassNames={dayCellClassNames}
				dayCellContent={dayCellContent}
				dayCellDidMount={dayCellDidMount}
				height='auto'
				locale='en'
				firstDay={1}
				validRange={validRange}
				views={{
					dayGridMonth: {
						fixedWeekCount: false,
						weekNumbers: false,
						showNonCurrentDates: false,
					},
				}}
			/>
			{/* Mobile Legend - Three states of days */}
			<div className='md:hidden mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-200'>
				<div className='flex flex-col gap-1.5 sm:gap-2'>
					<div className='flex items-center gap-1.5 sm:gap-2'>
						<div className='w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#ecfdf3] border border-[#a7f3d0] shrink-0'></div>
						<span className='text-[10px] sm:text-xs text-zinc-700'>
							Available
						</span>
					</div>
					<div className='flex items-center gap-1.5 sm:gap-2'>
						<div className='w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#fee2e2] border border-[#ef4444] shrink-0'></div>
						<span className='text-[10px] sm:text-xs text-zinc-700'>
							Fully booked
						</span>
					</div>
					<div className='flex items-center gap-1.5 sm:gap-2'>
						<div className='w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#f4f4f5] border border-[#e4e4e7] shrink-0'></div>
						<span className='text-[10px] sm:text-xs text-zinc-700'>
							Not available
						</span>
					</div>
				</div>
			</div>
			<p className='sr-only'>
				Use arrow keys to navigate dates, Enter or Space to select. Available
				dates are highlighted in green. Dates with no available slots are shown
				in red.
			</p>
		</div>
	)
}
