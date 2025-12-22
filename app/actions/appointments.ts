'use server'

import {
	sendAdminNotificationEmail,
	sendBookingConfirmationEmail,
	sendCancellationEmail,
} from '../lib/email/resend'
import {
	cancelAppointment as cancelAppointmentDb,
	createAppointment as createAppointmentDb,
	deleteAppointment as deleteAppointmentDb,
	getAllAppointments,
	getAvailability as getAvailabilityDb,
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

		// Send emails
		await Promise.all([
			sendBookingConfirmationEmail(appointment),
			sendAdminNotificationEmail(appointment),
		]).catch(error => {
			// Log email errors but don't fail the booking
			console.error('Error sending emails:', error)
		})

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

export async function getAvailableSlots(date: string): Promise<string[]> {
	try {
		return await getAvailableTimeSlots(date)
	} catch (error) {
		console.error('Error fetching available slots:', error)
		return []
	}
}

export async function getAvailabilityAction(
	startDate: string,
	endDate: string
): Promise<Availability[]> {
	try {
		await requireAdmin() // Require admin access for managing availability
		return await getAvailabilityDb(startDate, endDate)
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

		// Create appointment in database
		const appointmentId = await createAppointmentDb(data)

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
		const appointment = allAppointments.find(apt => apt.id === appointmentId)

		if (!appointment) {
			return { success: false, error: 'Appointment not found' }
		}

		// Update appointment
		await updateAppointmentDb(appointmentId, data)

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
		await Promise.all([
			sendCancellationEmail(appointment, true), // Customer
			sendCancellationEmail(appointment, false), // Admin
		]).catch(error => {
			console.error('Error sending cancellation emails:', error)
		})

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
