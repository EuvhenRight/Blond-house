'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useCallback, useEffect, useRef, useState } from 'react'
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

interface DayCellDidMountArg {
	date: Date
	el: HTMLElement
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
	const [appointmentCounts, setAppointmentCounts] = useState<
		Map<string, number>
	>(new Map())
	const [datesWithNoSlots, setDatesWithNoSlots] = useState<Set<string>>(
		new Set()
	)
	const [localSelectedDate, setLocalSelectedDate] = useState<string | null>(
		null
	)
	const [, setIsLoading] = useState(false)

	// Track loaded date ranges to prevent duplicate requests
	const loadedRangesRef = useRef<Set<string>>(new Set())
	const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

				// Count appointments per date
				const counts = new Map<string, number>()

				appointments
					.filter(apt => apt.status === 'confirmed')
					.forEach(apt => {
						const date = apt.date.split('T')[0]
						counts.set(date, (counts.get(date) || 0) + 1)
					})

				setAppointmentCounts(prev => {
					const merged = new Map(prev)
					counts.forEach((count, date) => merged.set(date, count))
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
								apt.status === 'confirmed' && apt.date.split('T')[0] === date
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
									.padStart(2, '0')}`
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
			} catch {
				// Remove range key on error so it can be retried
				loadedRangesRef.current.delete(rangeKey)
			} finally {
				setIsLoading(false)
			}
		},
		[serviceDurationMinutes] // Include serviceDurationMinutes so counts update when service changes
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
			// Debounce datesSet to prevent excessive requests during rapid navigation
			if (loadTimeoutRef.current) {
				clearTimeout(loadTimeoutRef.current)
			}

			loadTimeoutRef.current = setTimeout(() => {
				const start = dateInfo.start
				const end = dateInfo.end
				// Load availability for visible range + buffer
				const bufferStart = new Date(start)
				bufferStart.setDate(bufferStart.getDate() - 7)
				const bufferEnd = new Date(end)
				bufferEnd.setDate(bufferEnd.getDate() + 7)
				void loadAvailability(bufferStart, bufferEnd)

				// After dates are set, manually update styling for selected date if it's in the visible range
				if (effectiveSelectedDate) {
					setTimeout(() => {
						// Find the selected day cell and apply styling
						const calendarContainer = document.querySelector('.fc')
						if (calendarContainer) {
							const dayCells =
								calendarContainer.querySelectorAll('.fc-daygrid-day')
							// First, remove selected class and border from ALL cells
							dayCells.forEach(cell => {
								const cellFrame = cell.querySelector(
									'.fc-daygrid-day-frame'
								) as HTMLElement
								if (cellFrame) {
									cellFrame.classList.remove('fc-day-selected')
									const dateAttr = cell.getAttribute('data-date')
									if (dateAttr) {
										const normalizedAttr = dateAttr.split('T')[0]
										// Only reset border if this is NOT the selected date
										if (normalizedAttr !== effectiveSelectedDate) {
											cellFrame.style.border = '2px solid transparent'
										}
									}
								}
							})
							// Then, apply selected styling only to the selected day
							dayCells.forEach(dayCell => {
								const dateAttr = dayCell.getAttribute('data-date')
								if (dateAttr) {
									const normalizedAttr = dateAttr.split('T')[0]
									const frame = dayCell.querySelector(
										'.fc-daygrid-day-frame'
									) as HTMLElement
									if (frame && normalizedAttr === effectiveSelectedDate) {
										// Apply selected styling
										frame.classList.add('fc-day-selected', 'cursor-pointer')
										frame.style.border = '2px solid #3b82f6'
										frame.style.borderRadius = '0'
										const isWorking = workingDays.has(effectiveSelectedDate)
										frame.style.backgroundColor = isWorking
											? '#dcfce7'
											: 'transparent'
										frame.style.boxSizing = 'border-box'
									}
								}
							})
						}
					}, 100)
				}
			}, 300) // 300ms debounce
		},
		[loadAvailability, effectiveSelectedDate, workingDays]
	)

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
		[workingDays, onDateSelect]
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
		[workingDays]
	)

	const isToday = useCallback((dateStr: string) => {
		if (!dateStr) return false

		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const normalizedDate = dateStr.split('T')[0]
		const date = new Date(normalizedDate)
		date.setHours(0, 0, 0, 0)
		return date.getTime() === today.getTime()
	}, [])

	const dayCellClassNames = useCallback(
		(arg: DayCellClassNamesArg) => {
			const classes: string[] = []
			if (!arg.dateStr) {
				return classes
			}

			// Normalize date string to YYYY-MM-DD format for comparison
			const normalizedDate = arg.dateStr.split('T')[0]
			const isPast = isPastDate(normalizedDate)
			const isWorking = isWorkingDay(normalizedDate)

			// Use effective selected date for comparison (already normalized)
			const isSelected = effectiveSelectedDate === normalizedDate
			const isTodayDate = isToday(normalizedDate)

			if (isPast) {
				classes.push('fc-day-past')
				classes.push('cursor-not-allowed')
			} else if (isSelected) {
				// Selected days get selected class
				classes.push('fc-day-selected')
				classes.push('cursor-pointer')
				// If it's also a working day, add available class for CSS specificity
				if (isWorking) {
					classes.push('fc-day-available')
				}
			} else if (isWorking) {
				classes.push('fc-day-available')
				classes.push('cursor-pointer')
			} else {
				// For unavailable days, allow today to be clickable even if not working
				if (isTodayDate) {
					classes.push('fc-day-unavailable')
					classes.push('cursor-pointer') // Make today clickable even if unavailable
				} else {
					classes.push('fc-day-unavailable')
					classes.push('cursor-not-allowed')
				}
			}

			return classes
		},
		[isPastDate, isWorkingDay, isToday, effectiveSelectedDate]
	)

	// Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
	const formatDateLocal = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	// Use dayCellDidMount to apply styling classes (same approach as selected day)
	const dayCellDidMount = useCallback(
		(arg: DayCellDidMountArg) => {
			if (!arg.date) return

			const frame = arg.el.querySelector('.fc-daygrid-day-frame') as HTMLElement
			if (!frame) return

			// Check if this day is from another month (other-month class)
			// arg.el is the .fc-daygrid-day element
			const dayCell = arg.el as HTMLElement
			const isOtherMonth = dayCell.classList.contains('fc-day-other-month')

			// For days from other months, apply the same styling as past days
			if (isOtherMonth) {
				// Remove all classes
				frame.classList.remove(
					'fc-day-selected',
					'fc-day-available',
					'fc-day-unavailable',
					'fc-day-past',
					'cursor-pointer'
				)

				// Remove any existing content elements
				const contentWrapper = frame.querySelector('.fc-day-content-wrapper')
				if (contentWrapper) {
					const countElement = contentWrapper.querySelector(
						'.fc-day-appointment-count'
					)
					const notAvailableElement = contentWrapper.querySelector(
						'.fc-day-not-available-text'
					)
					const statusElement = contentWrapper.querySelector(
						'.fc-day-status-text'
					)
					if (countElement) countElement.remove()
					if (notAvailableElement) notAvailableElement.remove()
					if (statusElement) statusElement.remove()
				}

				// Apply same styling as past days
				frame.style.backgroundColor = 'transparent'
				frame.style.border = '2px solid transparent'
				frame.style.opacity = '0.6'
				frame.style.boxSizing = 'border-box'
				frame.classList.add('cursor-not-allowed')
				return // Early return - don't apply any other styling or data
			}

			// Normalize date to YYYY-MM-DD format using LOCAL time (not UTC)
			const normalizedDate = formatDateLocal(arg.date)
			const isSelected = effectiveSelectedDate === normalizedDate
			const isPast = isPastDate(normalizedDate)
			const isWorking = isWorkingDay(normalizedDate)
			const hasNoSlots = datesWithNoSlots.has(normalizedDate)
			// A day is truly available only if it's working AND has available slots
			const isAvailable = isWorking && !hasNoSlots

			// Remove all existing classes first
			frame.classList.remove(
				'fc-day-selected',
				'fc-day-available',
				'fc-day-unavailable',
				'fc-day-past',
				'bg-green-100',
				'bg-red-100',
				'border-2',
				'border-blue-500',
				'cursor-pointer',
				'cursor-not-allowed'
			)

			// Ensure frame has flex layout for centering
			frame.style.display = 'flex'
			frame.style.flexDirection = 'column'
			frame.style.alignItems = 'flex-end'
			frame.style.justifyContent = 'center'
			frame.style.minHeight = '4.5rem'
			frame.style.boxSizing = 'border-box' // Prevent layout shift from borders

			// Get or create content wrapper - centered layout
			let contentWrapper = frame.querySelector(
				'.fc-day-content-wrapper'
			) as HTMLElement
			if (!contentWrapper) {
				// Remove any existing text elements
				const existingCount = frame.querySelector('.fc-day-appointment-count')
				const existingNotAvailable = frame.querySelector(
					'.fc-day-not-available-text'
				)
				if (existingCount) existingCount.remove()
				if (existingNotAvailable) existingNotAvailable.remove()

				contentWrapper = document.createElement('div')
				contentWrapper.className = 'fc-day-content-wrapper'
				contentWrapper.style.position = 'absolute'
				contentWrapper.style.top = '50%'
				contentWrapper.style.left = '50%'
				contentWrapper.style.transform = 'translate(-50%, -50%)'
				contentWrapper.style.width = '100%'
				contentWrapper.style.maxWidth = '100%'
				contentWrapper.style.padding = '0.25rem'
				contentWrapper.style.textAlign = 'center'
				contentWrapper.style.display = 'flex'
				contentWrapper.style.flexDirection = 'column'
				contentWrapper.style.alignItems = 'center'
				contentWrapper.style.justifyContent = 'center'

				// Move day number into wrapper if it exists
				const dayNumber = frame.querySelector('.fc-daygrid-day-number')
				if (dayNumber && dayNumber.parentNode === frame) {
					frame.removeChild(dayNumber)
					contentWrapper.appendChild(dayNumber)
				} else if (!dayNumber) {
					// Create day number if it doesn't exist
					const newDayNumber = document.createElement('span')
					newDayNumber.className = 'fc-daygrid-day-number text-base font-bold'
					newDayNumber.textContent = String(arg.date.getDate())
					contentWrapper.appendChild(newDayNumber)
				}

				frame.style.position = 'relative' // Required for absolute positioning
				frame.appendChild(contentWrapper)
			}

			const dayNumber = contentWrapper.querySelector(
				'.fc-daygrid-day-number'
			) as HTMLElement
			if (dayNumber) {
				dayNumber.style.fontSize = 'clamp(0.75rem, 2.5vw, 1rem)' // Responsive: smaller on mobile
				dayNumber.style.fontWeight = 'bold'
				dayNumber.style.display = 'block'
				dayNumber.style.marginBottom = '0.125rem' // Spacing between day and count
			}

			// Apply styling based on state
			if (isPast) {
				frame.classList.remove('fc-day-selected')
				frame.classList.add('fc-day-past', 'cursor-not-allowed')
				frame.style.backgroundColor = 'transparent'
				frame.style.opacity = '0.6'
				frame.style.border = '2px solid transparent' // Use transparent border to prevent layout shift
				frame.style.boxSizing = 'border-box'

				// Remove any status text
				const countElement = contentWrapper.querySelector(
					'.fc-day-appointment-count'
				)
				const notAvailableElement = contentWrapper.querySelector(
					'.fc-day-not-available-text'
				)
				const statusElement = contentWrapper.querySelector(
					'.fc-day-status-text'
				)
				if (countElement) countElement.remove()
				if (notAvailableElement) notAvailableElement.remove()
				if (statusElement) statusElement.remove()
			} else if (isSelected) {
				// Only this day should be selected
				frame.classList.add('fc-day-selected', 'cursor-pointer')
				frame.style.border = '2px solid #3b82f6' // blue-500
				frame.style.borderRadius = '0'
				frame.style.backgroundColor = isAvailable ? '#dcfce7' : 'transparent' // green-100 if available
				frame.style.boxSizing = 'border-box' // Prevent layout shift

				// Remove available slots count element if it exists
				if (isAvailable) {
					const countElement = contentWrapper.querySelector(
						'.fc-day-appointment-count'
					)
					if (countElement) {
						countElement.remove()
					}

					// Remove not available text if exists
					const notAvailableElement = contentWrapper.querySelector(
						'.fc-day-not-available-text'
					)
					if (notAvailableElement) notAvailableElement.remove()

					// Add status text "Available" at the bottom
					let statusElement = contentWrapper.querySelector(
						'.fc-day-status-text'
					) as HTMLElement
					if (!statusElement) {
						statusElement = document.createElement('span')
						statusElement.className =
							'fc-day-status-text text-xs font-medium text-green-700'
						statusElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
						statusElement.style.marginTop = '0.125rem'
						statusElement.style.textOverflow = 'ellipsis'
						statusElement.style.overflow = 'hidden'
						statusElement.style.whiteSpace = 'nowrap'
						contentWrapper.appendChild(statusElement)
					} else {
						statusElement.style.marginTop = '0.125rem'
						statusElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
						statusElement.style.textOverflow = 'ellipsis'
						statusElement.style.overflow = 'hidden'
						statusElement.style.whiteSpace = 'nowrap'
						// Move to bottom if it already exists
						contentWrapper.appendChild(statusElement)
					}
					statusElement.textContent = 'Available'
				}
			} else if (isAvailable) {
				frame.classList.remove('fc-day-selected')
				frame.classList.add('fc-day-available', 'cursor-pointer')
				frame.style.backgroundColor = '#dcfce7' // green-100
				frame.style.borderRadius = '0'
				frame.style.border = '2px solid transparent' // Use transparent border to prevent layout shift
				frame.style.boxSizing = 'border-box'

				// Remove available slots count element if it exists
				const countElement = contentWrapper.querySelector(
					'.fc-day-appointment-count'
				)
				if (countElement) {
					countElement.remove()
				}

				// Remove not available text if exists
				const notAvailableElement = contentWrapper.querySelector(
					'.fc-day-not-available-text'
				)
				if (notAvailableElement) notAvailableElement.remove()

				// Add status text "Available" at the bottom
				let statusElement = contentWrapper.querySelector(
					'.fc-day-status-text'
				) as HTMLElement
				if (!statusElement) {
					statusElement = document.createElement('span')
					statusElement.className =
						'fc-day-status-text text-xs font-medium text-green-700'
					statusElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
					statusElement.style.marginTop = '0.125rem'
					statusElement.style.textOverflow = 'ellipsis'
					statusElement.style.overflow = 'hidden'
					statusElement.style.whiteSpace = 'nowrap'
					contentWrapper.appendChild(statusElement)
				} else {
					statusElement.style.marginTop = '0.125rem'
					statusElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
					statusElement.style.textOverflow = 'ellipsis'
					statusElement.style.overflow = 'hidden'
					statusElement.style.whiteSpace = 'nowrap'
					// Move to bottom if it already exists
					contentWrapper.appendChild(statusElement)
				}
				statusElement.textContent = 'Available'
			} else if (isWorking && hasNoSlots) {
				// Working day but no available slots
				frame.classList.remove('fc-day-selected')
				frame.classList.add('fc-day-unavailable', 'cursor-not-allowed')
				frame.style.backgroundColor = '#fee2e2' // red-100
				frame.style.borderRadius = '0'
				frame.style.border = '2px solid transparent' // Use transparent border to prevent layout shift
				frame.style.boxSizing = 'border-box'

				// Remove available slots count element if it exists
				const countElement = contentWrapper.querySelector(
					'.fc-day-appointment-count'
				)
				if (countElement) {
					countElement.remove()
				}

				// Remove status text if exists
				const statusElement = contentWrapper.querySelector(
					'.fc-day-status-text'
				)
				if (statusElement) statusElement.remove()

				// Add "Not available" text
				let notAvailableElement = contentWrapper.querySelector(
					'.fc-day-not-available-text'
				) as HTMLElement
				if (!notAvailableElement) {
					notAvailableElement = document.createElement('span')
					notAvailableElement.className =
						'fc-day-not-available-text text-xs font-medium text-red-700'
					notAvailableElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
					notAvailableElement.style.marginTop = '0.125rem'
					notAvailableElement.style.textOverflow = 'ellipsis'
					notAvailableElement.style.overflow = 'hidden'
					notAvailableElement.style.whiteSpace = 'nowrap'
					contentWrapper.appendChild(notAvailableElement)
				}
				notAvailableElement.textContent = 'Not available'
			} else {
				frame.classList.remove('fc-day-selected')
				frame.classList.add('fc-day-unavailable', 'cursor-not-allowed')
				frame.style.backgroundColor = '#fee2e2' // red-100
				frame.style.borderRadius = '0'
				frame.style.border = '2px solid transparent' // Use transparent border to prevent layout shift
				frame.style.boxSizing = 'border-box'

				// Remove appointment count if exists
				const countElement = contentWrapper.querySelector(
					'.fc-day-appointment-count'
				)
				if (countElement) {
					countElement.remove()
				}

				// Remove status text if exists
				const statusElement = contentWrapper.querySelector(
					'.fc-day-status-text'
				)
				if (statusElement) {
					statusElement.remove()
				}

				// Add "Not available" status text
				let notAvailableElement = contentWrapper.querySelector(
					'.fc-day-not-available-text'
				) as HTMLElement
				if (!notAvailableElement) {
					notAvailableElement = document.createElement('span')
					notAvailableElement.className =
						'fc-day-not-available-text text-xs font-medium text-red-700'
					notAvailableElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
					notAvailableElement.style.marginTop = '0.25rem'
					notAvailableElement.style.textOverflow = 'ellipsis'
					notAvailableElement.style.overflow = 'hidden'
					notAvailableElement.style.whiteSpace = 'nowrap'
					contentWrapper.appendChild(notAvailableElement)
				} else {
					notAvailableElement.style.fontSize = 'clamp(0.625rem, 2vw, 0.75rem)' // Responsive: smaller on mobile
					notAvailableElement.style.textOverflow = 'ellipsis'
					notAvailableElement.style.overflow = 'hidden'
					notAvailableElement.style.whiteSpace = 'nowrap'
				}
				notAvailableElement.textContent = 'Not available'
			}
		},
		[effectiveSelectedDate, isPastDate, isWorkingDay, datesWithNoSlots]
	)

	// Calendar ref to access API
	const calendarRef = useRef<FullCalendar>(null)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const calendarApiRef = useRef<any>(null)
	const lastNavigatedDateRef = useRef<string | null>(null)

	// Use key prop to force calendar re-render when workingDays or appointmentCounts change
	// This ensures dayCellDidMount callback is called with the updated data
	// Note: We don't include effectiveSelectedDate in the key to avoid remounting on date selection
	const calendarKey = `${workingDays.size}-${appointmentCounts.size}`

	// Store calendar API when component mounts or calendar ref changes
	useEffect(() => {
		if (calendarRef.current) {
			calendarApiRef.current = calendarRef.current.getApi()
		}
	}, [calendarKey])

	// Navigate to selected date's month when selectedDate changes
	// The dayCellDidMount callback will handle styling when cells are rendered after navigation
	useEffect(() => {
		if (effectiveSelectedDate && calendarApiRef.current) {
			// Only navigate if this is a different date than the last one we navigated to
			if (lastNavigatedDateRef.current !== effectiveSelectedDate) {
				try {
					const selectedDateObj = new Date(effectiveSelectedDate + 'T00:00:00')
					// Only navigate if the date is valid
					if (!isNaN(selectedDateObj.getTime())) {
						// Use setTimeout to ensure the calendar is fully rendered
						setTimeout(() => {
							if (calendarApiRef.current) {
								calendarApiRef.current.gotoDate(selectedDateObj)
								lastNavigatedDateRef.current = effectiveSelectedDate
							}
						}, 50)
					}
				} catch {
					// Silently handle errors
				}
			}
		}
	}, [effectiveSelectedDate])

	return (
		<div className='w-full'>
			<FullCalendar
				key={calendarKey}
				ref={calendarRef}
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView='dayGridMonth'
				headerToolbar={{
					left: 'prev,next',
					center: 'title',
					right: 'today',
				}}
				datesSet={handleDatesSet}
				dateClick={handleDateClick}
				dayCellClassNames={dayCellClassNames}
				dayCellDidMount={dayCellDidMount}
				height='auto'
				locale='en'
				firstDay={1}
				validRange={{
					start: new Date().toISOString().split('T')[0],
				}}
				views={{
					dayGridMonth: {
						fixedWeekCount: true,
						weekNumbers: false,
						showNonCurrentDates: true,
					},
				}}
			/>
		</div>
	)
}
