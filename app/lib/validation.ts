import { z } from 'zod'
import { services } from './services'

// Booking form validation schema (customer booking)
export const bookingFormSchema = z.object({
	customerName: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters')
		.regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
	customerEmail: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
		.max(255, 'Email must be less than 255 characters'),
	customerPhone: z
		.string()
		.min(1, 'Phone number is required')
		.regex(/^[\d\s+\-()]+$/, 'Please enter a valid phone number')
		.min(10, 'Phone number must be at least 10 digits')
		.max(20, 'Phone number must be less than 20 characters'),
	serviceId: z
		.string()
		.min(1, 'Please select a service')
		.refine(
			(val) => services.some((service) => service.id === val),
			'Please select a valid service'
		),
	serviceName: z.string().optional(),
	duration: z.number().optional(),
	date: z
		.string()
		.min(1, 'Date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
		.refine(
			(val) => {
				const date = new Date(val)
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				return date >= today
			},
			'Date cannot be in the past'
		),
	time: z
		.string()
		.min(1, 'Time is required')
		.regex(/^\d{2}:\d{2}$/, 'Invalid time format (use HH:MM)'),
	dataConsent: z
		.boolean()
		.refine((val) => val === true, {
			message: 'You must agree to the privacy policy to continue',
		}),
})

// Admin appointment form validation schema (email and phone optional)
export const adminAppointmentSchema = z.object({
	customerName: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be less than 100 characters')
		.regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
	customerEmail: z
		.string()
		.email('Please enter a valid email address')
		.max(255, 'Email must be less than 255 characters')
		.optional()
		.or(z.literal('')),
	customerPhone: z
		.string()
		.regex(/^$|^[\d\s+\-()]+$/, 'Please enter a valid phone number')
		.refine(
			(val) => val === '' || (val.length >= 10 && val.length <= 20),
			'Phone number must be between 10 and 20 characters'
		)
		.optional()
		.or(z.literal('')),
	serviceId: z
		.string()
		.min(1, 'Please select a service')
		.refine(
			val => services.some(service => service.id === val),
			'Please select a valid service'
		),
	serviceName: z.string().optional(),
	duration: z.number().optional(),
	date: z
		.string()
		.min(1, 'Date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
		.refine(
			(val) => {
				const date = new Date(val)
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				return date >= today
			},
			'Date cannot be in the past'
		),
	time: z
		.string()
		.min(1, 'Time is required')
		.regex(/^\d{2}:\d{2}$/, 'Invalid time format (use HH:MM)'),
})

// Login form validation schema
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters'),
})

// Export types inferred from schemas
export type BookingFormInput = z.infer<typeof bookingFormSchema>
export type AdminAppointmentInput = z.infer<typeof adminAppointmentSchema>
export type LoginInput = z.infer<typeof loginSchema>

