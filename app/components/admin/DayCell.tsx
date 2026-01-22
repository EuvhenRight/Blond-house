'use client'

import type { Appointment, Availability } from '../../lib/types'
import { getServiceColor } from '../../lib/services'

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 */
function formatDateLocal(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

interface DayCellProps {
	date: Date
	dayNumberText: string
	availability?: Availability
	appointments: Appointment[]
	isPast: boolean
	isToday: boolean
	onAppointmentClick?: (appointmentId: string) => void
	onMoreClick?: (date: Date) => void
}

/**
 * Get color for appointment bubble based on service (always use service color if available)
 */
function getAppointmentBubbleColor(
	serviceId?: string,
	duration?: number
): { style: React.CSSProperties; className: string } {
	if (serviceId) {
		const colors = getServiceColor(serviceId)
		return {
			style: {
				backgroundColor: colors.backgroundColor,
				borderColor: colors.borderColor,
				color: colors.color,
			},
			className: 'admin-day-appointment-bubble',
		}
	}
	// Fallback to duration-based colors only if no service assigned
	const durationMinutes = duration || 60
	if (durationMinutes < 60) {
		return {
			style: {
				backgroundColor: '#10b981', // green-500
				borderColor: '#059669', // green-600
				color: '#ffffff',
			},
			className: 'admin-day-appointment-bubble',
		}
	} else if (durationMinutes <= 90) {
		return {
			style: {
				backgroundColor: '#3b82f6', // blue-500
				borderColor: '#2563eb', // blue-600
				color: '#ffffff',
			},
			className: 'admin-day-appointment-bubble',
		}
	} else {
		return {
			style: {
				backgroundColor: '#f97316', // orange-500
				borderColor: '#ea580c', // orange-600
				color: '#ffffff',
			},
			className: 'admin-day-appointment-bubble',
		}
	}
}

/**
 * Format time for display (e.g., "10:00 AM")
 */
function formatTime(timeStr: string): string {
	const [hours, minutes] = timeStr.split(':').map(Number)
	const date = new Date()
	date.setHours(hours, minutes, 0, 0)
	return date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	})
}

export default function DayCell({
	date,
	dayNumberText,
	availability,
	appointments,
	isPast,
	isToday,
	onAppointmentClick,
	onMoreClick,
}: DayCellProps) {
	const confirmedAppointments = appointments
		.filter(apt => apt.status === 'confirmed')
		.sort((a, b) => a.time.localeCompare(b.time))

	// Show max 3 appointments, then "X more..."
	const maxVisible = 3
	const visibleAppointments = confirmedAppointments.slice(0, maxVisible)
	const remainingCount = confirmedAppointments.length - maxVisible

	return (
		<div
			className='admin-day-cell'
			role='gridcell'
			aria-label={`${formatDateLocal(date)} - ${availability?.isWorkingDay ? 'Available' : 'Not available'} - ${confirmedAppointments.length} appointment${confirmedAppointments.length !== 1 ? 's' : ''}`}
		>
			{/* Day number with today highlight - Top Right */}
			<div
				className={`admin-day-number ${
					isToday ? 'admin-day-number-today' : ''
				}`}
				aria-label={isToday ? `Today, ${dayNumberText}` : dayNumberText}
				aria-hidden='false'
			>
				{dayNumberText}
			</div>

			{/* Status and working hours - Under day number */}
			<div className='admin-day-status' aria-hidden='false'>
				{availability && availability.isWorkingDay ? (
					availability.workingHours && (
						<div
							className={`admin-day-working-hours ${
								isPast ? 'admin-day-past' : ''
							}`}
							aria-label={`Working hours: ${availability.workingHours.start} to ${availability.workingHours.end}`}
						>
							{availability.workingHours.start}-
							{availability.workingHours.end}
						</div>
					)
				) : (
					<div
						className={`admin-day-closed ${
							isPast ? 'admin-day-past' : ''
						}`}
						aria-label='Not available'
					>
						Not available
					</div>
				)}
			</div>

			{/* Appointment count badge (mobile only) */}
			{confirmedAppointments.length > 0 && (
				<div
					className='admin-day-appointment-count-mobile'
					aria-label={`${confirmedAppointments.length} appointment${confirmedAppointments.length !== 1 ? 's' : ''}`}
				>
					{confirmedAppointments.length}
				</div>
			)}

			{/* Appointments as rectangular labels (desktop only) */}
			<div
				className='admin-day-events'
				role='list'
				aria-label={`${confirmedAppointments.length} appointment${confirmedAppointments.length !== 1 ? 's' : ''}`}
			>
				{availability && availability.isWorkingDay ? (
					<>
						{visibleAppointments.map((appointment, index) => {
							const bubbleStyle = getAppointmentBubbleColor(
								appointment.serviceId,
								appointment.duration
							)
							const displayName =
								appointment.customerName.length > 10
									? `${appointment.customerName.substring(0, 10)}...`
									: appointment.customerName

							return (
								<div
									key={appointment.id || index}
									className={`${bubbleStyle.className} ${
										isPast ? 'admin-day-past' : ''
									}`}
									style={bubbleStyle.style}
									role='listitem'
									aria-label={`Appointment: ${appointment.customerName} at ${formatTime(appointment.time)}`}
									onClick={() => {
										if (appointment.id && onAppointmentClick) {
											onAppointmentClick(appointment.id)
										}
									}}
								>
									<div className='admin-day-appointment-content'>
										<span className='admin-day-appointment-title'>
											{displayName}
										</span>
										<span className='admin-day-appointment-time' aria-hidden='true'>
											{formatTime(appointment.time)}
										</span>
									</div>
								</div>
							)
						})}
						{remainingCount > 0 && (
							<div
								className={`admin-day-more-events ${
									isPast ? 'admin-day-past' : ''
								}`}
								role='listitem'
								aria-label={`See ${remainingCount} more appointment${remainingCount !== 1 ? 's' : ''}`}
								onClick={() => onMoreClick?.(date)}
							>
								See {remainingCount} more
							</div>
						)}
					</>
				) : null}
			</div>
		</div>
	)
}

