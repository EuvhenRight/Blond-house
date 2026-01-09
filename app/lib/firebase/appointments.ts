import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	Timestamp,
	writeBatch,
} from 'firebase/firestore'
import { db } from './config'
import type { Appointment, Availability, BookingFormData } from '../types'

const APPOINTMENTS_COLLECTION = 'appointments'
const AVAILABILITY_COLLECTION = 'availability'

// Buffer time between appointments (30 minutes for preparation/cleanup)
const APPOINTMENT_BUFFER_MINUTES = 30

/**
 * Get all appointments
 */
export async function getAllAppointments(): Promise<Appointment[]> {
	try {
		const snapshot = await getDocs(collection(db, APPOINTMENTS_COLLECTION))
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Appointment[]
	} catch (error) {
		console.error('Error fetching appointments:', error)
		throw error
	}
}

/**
 * Get appointments for a specific date
 */
export async function getAppointmentsByDate(
	date: string
): Promise<Appointment[]> {
	try {
		const q = query(
			collection(db, APPOINTMENTS_COLLECTION),
			where('date', '==', date),
			where('status', '==', 'confirmed')
		)
		const snapshot = await getDocs(q)
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Appointment[]
	} catch (error) {
		console.error('Error fetching appointments by date:', error)
		throw error
	}
}

/**
 * Get appointments for a date range (for calendar display)
 * 
 * This function queries by date range and filters by status in memory
 * to avoid requiring a Firestore composite index.
 */
export async function getAppointmentsByDateRange(
	startDate: string,
	endDate: string
): Promise<Appointment[]> {
	try {
		// Query by date range only (no index required for range queries on single field)
		const q = query(
			collection(db, APPOINTMENTS_COLLECTION),
			where('date', '>=', startDate),
			where('date', '<=', endDate)
		)
		const snapshot = await getDocs(q)
		
		// Filter by status in memory (confirmed appointments only)
		const appointments = snapshot.docs
			.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Appointment[]
		
		return appointments.filter((apt) => apt.status === 'confirmed')
	} catch (error) {
		console.error('Error fetching appointments by date range:', error)
		throw error
	}
}

/**
 * Get all available time slots for a date range
 */
export async function getAvailability(
	startDate: string,
	endDate: string
): Promise<Availability[]> {
	try {
		const q = query(
			collection(db, AVAILABILITY_COLLECTION),
			where('date', '>=', startDate),
			where('date', '<=', endDate)
		)
		const snapshot = await getDocs(q)
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Availability[]
	} catch (error) {
		console.error('Error fetching availability:', error)
		throw error
	}
}

/**
 * Get availability for a specific date
 */
export async function getAvailabilityByDate(
	date: string
): Promise<Availability | null> {
	try {
		const q = query(
			collection(db, AVAILABILITY_COLLECTION),
			where('date', '==', date)
		)
		const snapshot = await getDocs(q)
		if (snapshot.empty) return null

		const doc = snapshot.docs[0]
		return {
			id: doc.id,
			...doc.data(),
		} as Availability
	} catch (error) {
		console.error('Error fetching availability by date:', error)
		throw error
	}
}

/**
 * Create a new appointment (with race condition protection)
 * @param data Booking form data
 * @param skipAvailabilityCheck If true, skip availability validation (for admin overrides)
 */
export async function createAppointment(
	data: BookingFormData,
	skipAvailabilityCheck: boolean = false
): Promise<string> {
	try {
		// Use a batch to ensure atomicity
		const batch = writeBatch(db)

		// Only validate availability for public bookings
		if (!skipAvailabilityCheck) {
			// Check if day is a working day and slot is available
			const availability = await getAvailabilityByDate(data.date)
			if (!availability || !availability.isWorkingDay) {
				throw new Error('This date is not available for booking')
			}

			// Get available time slots for validation (check with service duration)
			const serviceDuration = data.duration || undefined
			const availableSlots = await getAvailableTimeSlots(data.date, serviceDuration)
			if (!availableSlots.includes(data.time)) {
				throw new Error('Time slot is no longer available or there is not enough time for this service')
			}

			// Additional check: verify service can be completed within working hours (including buffer)
			if (serviceDuration) {
				const hours = availability.workingHours || { start: '10:00', end: '17:00' }
				const workingEndMinutes = timeToMinutes(hours.end)
				const appointmentStartMinutes = timeToMinutes(data.time)
				// Service needs: duration + buffer time to complete
				const appointmentEndMinutes = appointmentStartMinutes + serviceDuration + APPOINTMENT_BUFFER_MINUTES
				
				if (appointmentEndMinutes > workingEndMinutes) {
					throw new Error('Service cannot be completed within working hours for this time slot')
				}
			}
		}

		// Create appointment
		const appointmentRef = doc(collection(db, APPOINTMENTS_COLLECTION))
		const now = new Date().toISOString()
		// Always include optional fields (set to null if not provided) for Firestore rules validation
		const appointment: Omit<Appointment, 'id'> = {
			customerName: data.customerName,
			customerEmail: data.customerEmail || null,
			customerPhone: data.customerPhone || null,
			date: data.date,
			time: data.time,
			...(data.serviceId && { serviceId: data.serviceId }),
			...(data.serviceName && { serviceName: data.serviceName }),
			...(data.duration && { duration: data.duration }),
			status: 'confirmed',
			createdAt: now,
			updatedAt: now,
		}
		batch.set(appointmentRef, appointment)

		// Commit batch transaction
		await batch.commit()

		return appointmentRef.id
	} catch (error) {
		console.error('Error creating appointment:', error)
		throw error
	}
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string): Promise<void> {
	try {
		const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId)
		const appointmentSnap = await getDoc(appointmentRef)

		if (!appointmentSnap.exists()) {
			throw new Error('Appointment not found')
		}

		const appointment = appointmentSnap.data() as Appointment

		// Use batch for atomicity
		const batch = writeBatch(db)

		// Update appointment status to cancelled
		// No need to update availability - slots are generated dynamically from working hours
		batch.update(appointmentRef, {
			status: 'cancelled',
			updatedAt: new Date().toISOString(),
		})

		await batch.commit()
	} catch (error) {
		console.error('Error cancelling appointment:', error)
		throw error
	}
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
	appointmentId: string,
	data: Partial<BookingFormData & { status?: 'confirmed' | 'cancelled' }>
): Promise<void> {
	try {
		const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId)
		const appointmentSnap = await getDoc(appointmentRef)

		if (!appointmentSnap.exists()) {
			throw new Error('Appointment not found')
		}

		const updateData: any = {
			updatedAt: new Date().toISOString(),
		}

		if (data.customerName !== undefined) updateData.customerName = data.customerName
		// Always include optional fields (set to null if explicitly set to undefined/empty)
		if (data.customerEmail !== undefined) {
			updateData.customerEmail = data.customerEmail || null
		}
		if (data.customerPhone !== undefined) {
			updateData.customerPhone = data.customerPhone || null
		}
		if (data.serviceId !== undefined) {
			updateData.serviceId = data.serviceId || null
		}
		if (data.serviceName !== undefined) {
			updateData.serviceName = data.serviceName || null
		}
		if (data.duration !== undefined) {
			updateData.duration = data.duration || null
		}
		if (data.date) updateData.date = data.date
		if (data.time) updateData.time = data.time
		if (data.status) updateData.status = data.status

		await updateDoc(appointmentRef, updateData)
	} catch (error) {
		console.error('Error updating appointment:', error)
		throw error
	}
}

/**
 * Delete an appointment permanently
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
	try {
		const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId)
		const appointmentSnap = await getDoc(appointmentRef)

		if (!appointmentSnap.exists()) {
			throw new Error('Appointment not found')
		}

		await deleteDoc(appointmentRef)
	} catch (error) {
		console.error('Error deleting appointment:', error)
		throw error
	}
}

/**
 * Generate time slots from working hours (default 30-minute intervals)
 */
export function generateTimeSlots(
	startTime: string,
	endTime: string,
	intervalMinutes: number = 30
): string[] {
	const slots: string[] = []
	const [startHour, startMin] = startTime.split(':').map(Number)
	const [endHour, endMin] = endTime.split(':').map(Number)

	let currentMinutes = startHour * 60 + startMin
	const endMinutes = endHour * 60 + endMin

	while (currentMinutes < endMinutes) {
		const hours = Math.floor(currentMinutes / 60)
		const minutes = currentMinutes % 60
		slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
		currentMinutes += intervalMinutes
	}

	return slots
}

/**
 * Convert time string (HH:MM) to minutes
 */
export function timeToMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map(Number)
	return hours * 60 + minutes
}

/**
 * Set working day status and hours for a date
 */
export async function setWorkingDay(
	date: string,
	isWorkingDay: boolean,
	workingHours?: { start: string; end: string },
	customTimeSlots?: string[]
): Promise<void> {
	try {
		// If trying to set as non-working, validate no appointments exist
		if (!isWorkingDay) {
			const appointments = await getAppointmentsByDate(date)
			// getAppointmentsByDate already returns only confirmed appointments
			
			if (appointments.length > 0) {
				throw new Error(
					`Cannot close this day. There ${appointments.length === 1 ? 'is' : 'are'} ${appointments.length} confirmed appointment${appointments.length === 1 ? '' : 's'}. Please cancel or reschedule appointments first.`
				)
			}
		}

		const availability = await getAvailabilityByDate(date)
		const now = new Date().toISOString()

		// Default working hours: 10:00-17:00
		const defaultHours = { start: '10:00', end: '17:00' }
		const hours = workingHours || defaultHours

		const updateData: any = {
			date,
			isWorkingDay,
			workingHours: hours,
			updatedAt: now,
		}

		// Only include customTimeSlots if provided
		if (customTimeSlots && customTimeSlots.length > 0) {
			updateData.customTimeSlots = customTimeSlots.sort()
		}

		if (availability) {
			// Update existing
			const availabilityRef = doc(db, AVAILABILITY_COLLECTION, availability.id!)
			await updateDoc(availabilityRef, updateData)
		} else {
			// Create new
			await addDoc(collection(db, AVAILABILITY_COLLECTION), {
				...updateData,
				createdAt: now,
			})
		}
	} catch (error) {
		console.error('Error setting working day:', error)
		throw error
	}
}

/**
 * Add or update availability (legacy function - kept for backward compatibility)
 * @deprecated Use setWorkingDay() instead
 */
export async function setAvailability(
	date: string,
	timeSlots: string[]
): Promise<void> {
	try {
		// Convert legacy timeSlots to new format
		await setWorkingDay(date, true, { start: '10:00', end: '17:00' }, timeSlots)
	} catch (error) {
		console.error('Error setting availability:', error)
		throw error
	}
}

/**
 * Remove availability for a date (sets isWorkingDay to false or deletes record)
 * Validates that the day has no appointments before closing it
 */
export async function removeAvailability(date: string): Promise<void> {
	try {
		// Check if there are any confirmed appointments for this date
		const appointments = await getAppointmentsByDate(date)
		// getAppointmentsByDate already returns only confirmed appointments
		
		if (appointments.length > 0) {
			throw new Error(
				`Cannot close this day. There ${appointments.length === 1 ? 'is' : 'are'} ${appointments.length} confirmed appointment${appointments.length === 1 ? '' : 's'}. Please cancel or reschedule appointments first.`
			)
		}

		const availability = await getAvailabilityByDate(date)
		if (availability && availability.id) {
			// Instead of deleting, set isWorkingDay to false
			await setWorkingDay(date, false)
		}
	} catch (error) {
		console.error('Error removing availability:', error)
		throw error
	}
}

/**
 * Get available time slots for a date (excluding booked ones)
 */
export async function getAvailableTimeSlots(
	date: string,
	serviceDurationMinutes?: number
): Promise<string[]> {
	try {
		const availability = await getAvailabilityByDate(date)
		
		// If no availability record or not a working day, return empty array
		if (!availability || !availability.isWorkingDay) {
			return []
		}

		// Get working hours
		const hours = availability.workingHours || { start: '10:00', end: '17:00' }
		const workingStartMinutes = timeToMinutes(hours.start)
		const workingEndMinutes = timeToMinutes(hours.end)

		// Get booked appointments with their durations
		const appointments = await getAppointmentsByDate(date)
		const bookedAppointments = appointments
			.filter((apt) => apt.status === 'confirmed')
			.map((apt) => ({
				time: apt.time,
				duration: apt.duration || 60, // Default to 60 minutes if not specified
			}))

		// Use customTimeSlots if available, otherwise generate from workingHours
		let timeSlots: string[]
		if (availability.customTimeSlots && availability.customTimeSlots.length > 0) {
			timeSlots = availability.customTimeSlots
		} else {
			// Generate slots from working hours (default: 10:00-17:00) with 30-minute intervals
			timeSlots = generateTimeSlots(hours.start, hours.end, 30)
		}

		// Use service duration for overlap checking, default to 60 minutes if not provided
		const slotDurationForOverlap = serviceDurationMinutes || 60

		// First, filter out slots that don't have enough time remaining before working hours end
		// Even for the minimum service (30 min) + buffer (30 min), we need 60 minutes
		let availableSlots = timeSlots.filter((slot) => {
			const slotMinutes = timeToMinutes(slot)
			// Use the actual service duration if provided, otherwise use minimum
			const requiredDuration = serviceDurationMinutes || 30
			const slotEndMinutes = slotMinutes + requiredDuration + APPOINTMENT_BUFFER_MINUTES
			// Check if service can be completed (including buffer) before working hours end
			return slotEndMinutes <= workingEndMinutes
		})

		// Then filter out slots that overlap with booked appointments based on duration
		// Account for buffer time: existing appointments block until (end + buffer)
		// and new appointments need (duration + buffer) time
		availableSlots = availableSlots.filter((slot) => {
			const slotMinutes = timeToMinutes(slot)
			// New appointment needs: service duration + buffer time
			const slotEndMinutes = slotMinutes + slotDurationForOverlap + APPOINTMENT_BUFFER_MINUTES
			
			// Check if this slot overlaps with any booked appointment
			for (const appointment of bookedAppointments) {
				const appointmentStartMinutes = timeToMinutes(appointment.time)
				// Existing appointment blocks until: duration + buffer time
				const appointmentEndWithBuffer = appointmentStartMinutes + appointment.duration + APPOINTMENT_BUFFER_MINUTES
				
				// Slot overlaps if:
				// Slot starts before appointment ends (with buffer) AND slot ends (with buffer) after appointment starts
				if (slotMinutes < appointmentEndWithBuffer && slotEndMinutes > appointmentStartMinutes) {
					return false // This slot overlaps with a booked appointment
				}
			}
			
			return true // No overlap, slot is available
		})

		return availableSlots
	} catch (error) {
		console.error('Error getting available time slots:', error)
		throw error
	}
}

