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
 */
export async function createAppointment(
	data: BookingFormData
): Promise<string> {
	try {
		// Use a batch to ensure atomicity
		const batch = writeBatch(db)

		// Check if day is a working day and slot is available
		const availability = await getAvailabilityByDate(data.date)
		if (!availability || !availability.isWorkingDay) {
			throw new Error('This date is not available for booking')
		}

		// Get available time slots for validation
		const availableSlots = await getAvailableTimeSlots(data.date)
		if (!availableSlots.includes(data.time)) {
			throw new Error('Time slot is no longer available')
		}

		// Create appointment
		const appointmentRef = doc(collection(db, APPOINTMENTS_COLLECTION))
		const now = new Date().toISOString()
		const appointment: Omit<Appointment, 'id'> = {
			customerName: data.customerName,
			customerEmail: data.customerEmail,
			customerPhone: data.customerPhone,
			date: data.date,
			time: data.time,
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

		if (data.customerName) updateData.customerName = data.customerName
		if (data.customerEmail) updateData.customerEmail = data.customerEmail
		if (data.customerPhone) updateData.customerPhone = data.customerPhone
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
 * Generate time slots from working hours (default 1-hour intervals)
 */
export function generateTimeSlots(
	startTime: string,
	endTime: string,
	intervalMinutes: number = 60
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
 * Set working day status and hours for a date
 */
export async function setWorkingDay(
	date: string,
	isWorkingDay: boolean,
	workingHours?: { start: string; end: string },
	customTimeSlots?: string[]
): Promise<void> {
	try {
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
 */
export async function removeAvailability(date: string): Promise<void> {
	try {
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
export async function getAvailableTimeSlots(date: string): Promise<string[]> {
	try {
		const availability = await getAvailabilityByDate(date)
		
		// If no availability record or not a working day, return empty array
		if (!availability || !availability.isWorkingDay) {
			return []
		}

		// Get booked appointments
		const appointments = await getAppointmentsByDate(date)
		const bookedTimes = appointments
			.filter((apt) => apt.status === 'confirmed')
			.map((apt) => apt.time)

		// Use customTimeSlots if available, otherwise generate from workingHours
		let timeSlots: string[]
		if (availability.customTimeSlots && availability.customTimeSlots.length > 0) {
			timeSlots = availability.customTimeSlots
		} else {
			// Generate slots from working hours (default: 10:00-17:00)
			const hours = availability.workingHours || { start: '10:00', end: '17:00' }
			timeSlots = generateTimeSlots(hours.start, hours.end)
		}

		// Filter out booked slots
		return timeSlots.filter((slot) => !bookedTimes.includes(slot))
	} catch (error) {
		console.error('Error getting available time slots:', error)
		throw error
	}
}

