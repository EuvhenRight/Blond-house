'use server'

import {
	sendAdminNotificationEmail,
	sendAppointmentChangeEmail,
	sendBookingConfirmationEmail,
	sendCancellationEmail,
} from '../lib/email/resend'
import {
	cancelAppointment as cancelAppointmentDb,
	createAppointment as createAppointmentDb,
	deleteAppointment as deleteAppointmentDb,
	getAllAppointments,
	getAppointmentsByDateRange as getAppointmentsByDateRangeDb,
	getAvailableTimeSlots,
	removeAvailability as removeAvailabilityDb,
	setAvailability as setAvailabilityDb,
	setWorkingDay as setWorkingDayDb,
	updateAppointment as updateAppointmentDb,
} from '../lib/firebase/appointments'
import { requireAdmin } from '../lib/auth'
import type { Appointment, Availability, BookingFormData } from '../lib/types'

export async function createBooking(data: BookingFormData): Promise<{
	success: boolean
	appointmentId?: string
	error?: string
}> {
	try {
		// Create appointment in database
		const appointmentId = await createAppointmentDb(data)

		// Fetch the created appointment for email
		const allAppointments = await getAllAppointments()
		const appointment = allAppointments.find(apt => apt.id === appointmentId)

		if (!appointment) {
			throw new Error('Failed to retrieve created appointment')
		}

		// Send emails only if customer email is provided
		if (appointment.customerEmail) {
			await Promise.all([
				sendBookingConfirmationEmail(appointment),
				sendAdminNotificationEmail(appointment),
			]).catch(error => {
				// Log email errors but don't fail the booking
				console.error('Error sending emails:', error)
			})
		} else {
			// Still send admin notification even if no customer email
			await sendAdminNotificationEmail(appointment).catch(error => {
				console.error('Error sending admin notification email:', error)
			})
		}

		return { success: true, appointmentId }
	} catch (error) {
		console.error('Error creating booking:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to create booking',
		}
	}
}


export async function getAppointments(): Promise<Appointment[]> {
	try {
		await requireAdmin() // Require admin access
		return await getAllAppointments()
	} catch (error) {
		console.error('Error fetching appointments:', error)
		return []
	}
}

export async function getAppointmentsByDateRange(
	startDate: string,
	endDate: string
): Promise<Appointment[]> {
	try {
		await requireAdmin() // Require admin access
		return await getAppointmentsByDateRangeDb(startDate, endDate)
	} catch (error) {
		console.error('Error fetching appointments by date range:', error)
		return []
	}
}

export async function getAvailableSlots(
	date: string,
	serviceDurationMinutes?: number
): Promise<string[]> {
	try {
		return await getAvailableTimeSlots(date, serviceDurationMinutes)
	} catch (error) {
		console.error('Error fetching available slots:', error)
		return []
	}
}

/**
 * Get availability for a date range (public access - for calendar display)
 */
export async function getAvailabilityAction(
	startDate: string,
	endDate: string
): Promise<Availability[]> {
	try {
		// Public read access - no admin required
		const { getAvailability } = await import('../lib/firebase/appointments')
		return await getAvailability(startDate, endDate)
	} catch (error) {
		console.error('Error fetching availability:', error)
		return []
	}
}

/**
 * Get appointments for a date range (public access - for calendar display)
 */
export async function getAppointmentsByDateRangeAction(
	startDate: string,
	endDate: string
): Promise<Appointment[]> {
	try {
		// Public read access - no admin required (only confirmed appointments, no sensitive data)
		const { getAppointmentsByDateRange } = await import('../lib/firebase/appointments')
		return await getAppointmentsByDateRange(startDate, endDate)
	} catch (error) {
		console.error('Error fetching appointments by date range:', error)
		return []
	}
}

/**
 * Get availability for a date range (admin only - for management)
 */
export async function getAvailabilityAdminAction(
	startDate: string,
	endDate: string
): Promise<Availability[]> {
	try {
		await requireAdmin() // Require admin access for managing availability
		const { getAvailability } = await import('../lib/firebase/appointments')
		return await getAvailability(startDate, endDate)
	} catch (error) {
		console.error('Error fetching availability:', error)
		return []
	}
}

export async function setAvailabilityAction(
	date: string,
	timeSlots: string[]
): Promise<{ success: boolean; error?: string }> {
	try {
		await requireAdmin() // Require admin access
		// Legacy function - convert to new format
		await setAvailabilityDb(date, timeSlots)
		return { success: true }
	} catch (error) {
		console.error('Error setting availability:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to set availability',
		}
	}
}

/**
 * Set working day status and hours (new API)
 */
export async function setWorkingDayAction(
	date: string,
	isWorkingDay: boolean,
	workingHours?: { start: string; end: string },
	customTimeSlots?: string[]
): Promise<{ success: boolean; error?: string }> {
	try {
		await requireAdmin() // Require admin access
		await setWorkingDayDb(date, isWorkingDay, workingHours, customTimeSlots)
		return { success: true }
	} catch (error) {
		console.error('Error setting working day:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to set working day',
		}
	}
}

export async function removeAvailabilityAction(
	date: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await requireAdmin() // Require admin access
		await removeAvailabilityDb(date)
		return { success: true }
	} catch (error) {
		console.error('Error removing availability:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to remove availability',
		}
	}
}

// ============================================
// ADMIN-ONLY ACTIONS
// ============================================

/**
 * Admin-only: Create a booking on behalf of a customer
 */
export async function adminCreateBooking(data: BookingFormData): Promise<{
	success: boolean
	appointmentId?: string
	error?: string
}> {
	try {
		await requireAdmin() // Require admin access

		// Prevent admins from creating appointments that overlap existing bookings
		// or do not fit into the working hours for that day.
		const date = data.date
		const time = data.time
		const durationMinutes = data.duration || 60

		if (!date || !time) {
			return {
				success: false,
				error: 'Date and time are required to create an appointment.',
			}
		}

		// Use the same availability logic as the public booking flow:
		// getAvailableTimeSlots returns only slots that fit within working hours
		// and do not conflict with existing confirmed appointments (with buffer).
		const availableSlotsForAdminCheck = await getAvailableTimeSlots(
			date,
			durationMinutes
		)

		if (!availableSlotsForAdminCheck.includes(time)) {
			return {
				success: false,
				error:
					'This time slot is already booked or not available. Please choose another time.',
			}
		}

		// Create appointment in database (admin flag keeps existing behavior)
		const appointmentId = await createAppointmentDb(data, true)

		// Fetch the created appointment for email
		const allAppointments = await getAllAppointments()
		const appointment = allAppointments.find(apt => apt.id === appointmentId)

		if (!appointment) {
			throw new Error('Failed to retrieve created appointment')
		}

		// Send emails
		await Promise.all([
			sendBookingConfirmationEmail(appointment),
			sendAdminNotificationEmail(appointment),
		]).catch(error => {
			console.error('Error sending emails:', error)
		})

		return { success: true, appointmentId }
	} catch (error) {
		console.error('Error creating admin booking:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to create booking',
		}
	}
}

/**
 * Admin-only: Update an existing appointment
 */
export async function adminUpdateBooking(
	appointmentId: string,
	data: Partial<BookingFormData & { status?: 'confirmed' | 'cancelled' }>
): Promise<{ success: boolean; error?: string }> {
	try {
		await requireAdmin() // Require admin access

		// Get appointment before updating for email
		const allAppointments = await getAllAppointments()
		const oldAppointment = allAppointments.find(apt => apt.id === appointmentId)

		if (!oldAppointment) {
			return { success: false, error: 'Appointment not found' }
		}

		// Check if date, time, or duration (e.g. via service change) changed
		const dateChanged = data.date && data.date !== oldAppointment.date
		const timeChanged = data.time && data.time !== oldAppointment.time
		const durationChanged =
			typeof data.duration === 'number' &&
			data.duration !== (oldAppointment.duration || 60)
		const timeOrDateChanged = dateChanged || timeChanged

		// If date, time, or duration is being changed, validate the new slot
		// doesn't conflict with existing appointments and still fits in working hours.
		if ((timeOrDateChanged || durationChanged) && data.status !== 'cancelled') {
			const newDate = data.date || oldAppointment.date
			const newTime = data.time || oldAppointment.time
			const newDuration = data.duration || oldAppointment.duration || 60

			// Get all appointments for the new date (excluding the current appointment)
			const { getAppointmentsByDate } = await import('../lib/firebase/appointments')
			const appointmentsOnDate = await getAppointmentsByDate(newDate)
			const otherAppointments = appointmentsOnDate.filter(apt => apt.id !== appointmentId)

			// Check for overlaps using the same logic as getAvailableTimeSlots
			const { timeToMinutes, getAvailabilityByDate } = await import('../lib/firebase/appointments')

			const APPOINTMENT_BUFFER_MINUTES = 30
			const newStartMinutes = timeToMinutes(newTime)
			const newEndMinutes = newStartMinutes + newDuration + APPOINTMENT_BUFFER_MINUTES

			// Check if new appointment overlaps with any existing appointment
			for (const appointment of otherAppointments) {
				if (appointment.status !== 'confirmed') continue

				const appointmentStartMinutes = timeToMinutes(appointment.time)
				const appointmentDuration = appointment.duration || 60
				const appointmentEndWithBuffer = appointmentStartMinutes + appointmentDuration + APPOINTMENT_BUFFER_MINUTES

				// Check for overlap: new appointment starts before existing ends AND new appointment ends after existing starts
				if (newStartMinutes < appointmentEndWithBuffer && newEndMinutes > appointmentStartMinutes) {
					return {
						success: false,
						error: `The selected time slot conflicts with an existing appointment at ${appointment.time}`,
					}
				}
			}

			// Also check if the appointment fits within working hours
			const availability = await getAvailabilityByDate(newDate)
			if (!availability || !availability.isWorkingDay) {
				return {
					success: false,
					error: 'The selected date is not available for booking',
				}
			}

			const hours = availability.workingHours || { start: '10:00', end: '17:00' }
			const workingEndMinutes = timeToMinutes(hours.end)
			if (newEndMinutes > workingEndMinutes) {
				return {
					success: false,
					error: 'The appointment cannot be completed within working hours for this time slot',
				}
			}
		}

		// Update appointment
		await updateAppointmentDb(appointmentId, data)

		// If time or date changed and appointment is still confirmed, send notification email
		// Only send if customer email is provided
		if (
			timeOrDateChanged &&
			oldAppointment.status === 'confirmed' &&
			oldAppointment.customerEmail
		) {
			// Get updated appointment for email
			const updatedAppointments = await getAllAppointments()
			const updatedAppointment = updatedAppointments.find(
				apt => apt.id === appointmentId
			)

			if (
				updatedAppointment &&
				updatedAppointment.status === 'confirmed' &&
				updatedAppointment.customerEmail
			) {
				await sendAppointmentChangeEmail(
					updatedAppointment,
					oldAppointment.date,
					oldAppointment.time
				).catch(error => {
					// Log email errors but don't fail the update
					console.error('Error sending appointment change email:', error)
				})
			}
		}

		return { success: true }
	} catch (error) {
		console.error('Error updating appointment:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to update appointment',
		}
	}
}

/**
 * Admin-only: Delete an appointment permanently
 */
export async function adminDeleteBooking(appointmentId: string): Promise<{
	success: boolean
	error?: string
}> {
	try {
		await requireAdmin() // Require admin access

		// Get appointment before deleting for logging
		const allAppointments = await getAllAppointments()
		const appointment = allAppointments.find(apt => apt.id === appointmentId)

		if (!appointment) {
			return { success: false, error: 'Appointment not found' }
		}

		// Delete appointment
		await deleteAppointmentDb(appointmentId)

		return { success: true }
	} catch (error) {
		console.error('Error deleting appointment:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to delete appointment',
		}
	}
}

/**
 * Admin-only: Cancel a booking (marks as cancelled, doesn't delete)
 */
export async function adminCancelBooking(appointmentId: string): Promise<{
	success: boolean
	error?: string
}> {
	try {
		await requireAdmin() // Require admin access

		// Get appointment before cancelling
		const allAppointments = await getAllAppointments()
		const appointment = allAppointments.find(apt => apt.id === appointmentId)

		if (!appointment) {
			return { success: false, error: 'Appointment not found' }
		}

		// Cancel in database
		await cancelAppointmentDb(appointmentId)

		// Send cancellation emails
		const cancellationEmails = []
		if (appointment.customerEmail) {
			cancellationEmails.push(sendCancellationEmail(appointment, true)) // Customer
		}
		cancellationEmails.push(sendCancellationEmail(appointment, false)) // Admin
		
		if (cancellationEmails.length > 0) {
			await Promise.all(cancellationEmails).catch(error => {
				console.error('Error sending cancellation emails:', error)
			})
		}

		return { success: true }
	} catch (error) {
		console.error('Error cancelling booking:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to cancel booking',
		}
	}
}

/**
 * @deprecated Use adminCancelBooking() instead
 * This function is kept for backward compatibility but redirects to admin function.
 * Customers cannot cancel bookings - only admins can.
 */
export async function cancelBooking(appointmentId: string): Promise<{
	success: boolean
	error?: string
}> {
	// Redirect to admin function - customers cannot cancel bookings
	return adminCancelBooking(appointmentId)
}
