/**
 * TypeScript types for the booking system
 */

export interface Appointment {
	id?: string
	customerName: string
	customerEmail: string
	customerPhone: string
	date: string // ISO date string (YYYY-MM-DD)
	time: string // Time string (HH:MM)
	status: 'confirmed' | 'cancelled'
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
}

export interface Availability {
	id?: string
	date: string // ISO date string (YYYY-MM-DD)
	isWorkingDay: boolean // Whether this day is available for bookings
	workingHours?: {
		start: string // Start time (HH:MM), defaults to '10:00'
		end: string // End time (HH:MM), defaults to '17:00'
	}
	customTimeSlots?: string[] // Optional: custom time slots if different from workingHours
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
}

export interface TimeSlot {
	date: string
	time: string
	available: boolean
}

export interface BookingFormData {
	customerName: string
	customerEmail: string
	customerPhone: string
	date: string
	time: string
}

