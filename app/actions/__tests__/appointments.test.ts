import {
	createBooking,
	cancelBooking,
	getAppointments,
	getAvailableSlots,
	getAvailabilityAction,
	setAvailabilityAction,
	removeAvailabilityAction,
} from '../appointments'
import * as firebaseAppointments from '../../lib/firebase/appointments'
import * as emailResend from '../../lib/email/resend'
import type { Appointment, BookingFormData, Availability } from '../../lib/types'

// Mock dependencies
jest.mock('../../lib/firebase/appointments')
jest.mock('../../lib/email/resend')

const mockFirebase = firebaseAppointments as jest.Mocked<typeof firebaseAppointments>
const mockEmail = emailResend as jest.Mocked<typeof emailResend>

describe('Appointments Actions', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('createBooking', () => {
		const mockBookingData: BookingFormData = {
			customerName: 'John Doe',
			customerEmail: 'john@example.com',
			customerPhone: '+31 6 12345678',
			date: '2024-12-25',
			time: '10:00',
		}

		const mockAppointment: Appointment = {
			id: 'appointment-123',
			customerName: 'John Doe',
			customerEmail: 'john@example.com',
			customerPhone: '+31 6 12345678',
			date: '2024-12-25',
			time: '10:00',
			status: 'confirmed',
			createdAt: '2024-12-20T10:00:00Z',
			updatedAt: '2024-12-20T10:00:00Z',
		}

		it('should create a booking successfully', async () => {
			mockFirebase.createAppointment.mockResolvedValue('appointment-123')
			mockFirebase.getAllAppointments.mockResolvedValue([mockAppointment])
			mockEmail.sendBookingConfirmationEmail.mockResolvedValue({ id: 'email-1' })
			mockEmail.sendAdminNotificationEmail.mockResolvedValue({ id: 'email-2' })

			const result = await createBooking(mockBookingData)

			expect(result.success).toBe(true)
			expect(result.appointmentId).toBe('appointment-123')
			expect(mockFirebase.createAppointment).toHaveBeenCalledWith(mockBookingData)
			expect(mockEmail.sendBookingConfirmationEmail).toHaveBeenCalledWith(
				mockAppointment
			)
			expect(mockEmail.sendAdminNotificationEmail).toHaveBeenCalledWith(
				mockAppointment
			)
		})

		it('should handle database errors', async () => {
			mockFirebase.createAppointment.mockRejectedValue(
				new Error('Database error')
			)

			const result = await createBooking(mockBookingData)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Database error')
		})

		it('should handle email errors gracefully', async () => {
			mockFirebase.createAppointment.mockResolvedValue('appointment-123')
			mockFirebase.getAllAppointments.mockResolvedValue([mockAppointment])
			mockEmail.sendBookingConfirmationEmail.mockRejectedValue(
				new Error('Email error')
			)

			const result = await createBooking(mockBookingData)

			// Booking should still succeed even if email fails
			expect(result.success).toBe(true)
			expect(result.appointmentId).toBe('appointment-123')
		})

		it('should handle missing appointment after creation', async () => {
			mockFirebase.createAppointment.mockResolvedValue('appointment-123')
			mockFirebase.getAllAppointments.mockResolvedValue([])

			const result = await createBooking(mockBookingData)

			expect(result.success).toBe(false)
			expect(result.error).toContain('Failed to retrieve created appointment')
		})
	})

	describe('cancelBooking', () => {
		const mockAppointment: Appointment = {
			id: 'appointment-123',
			customerName: 'John Doe',
			customerEmail: 'john@example.com',
			customerPhone: '+31 6 12345678',
			date: '2024-12-25',
			time: '10:00',
			status: 'confirmed',
			createdAt: '2024-12-20T10:00:00Z',
			updatedAt: '2024-12-20T10:00:00Z',
		}

		it('should cancel a booking successfully', async () => {
			mockFirebase.getAllAppointments.mockResolvedValue([mockAppointment])
			mockFirebase.cancelAppointment.mockResolvedValue()
			mockEmail.sendCancellationEmail.mockResolvedValue({ id: 'email-1' })

			const result = await cancelBooking('appointment-123')

			expect(result.success).toBe(true)
			expect(mockFirebase.cancelAppointment).toHaveBeenCalledWith('appointment-123')
			expect(mockEmail.sendCancellationEmail).toHaveBeenCalledTimes(2)
		})

		it('should return error if appointment not found', async () => {
			mockFirebase.getAllAppointments.mockResolvedValue([])

			const result = await cancelBooking('non-existent')

			expect(result.success).toBe(false)
			expect(result.error).toBe('Appointment not found')
			expect(mockFirebase.cancelAppointment).not.toHaveBeenCalled()
		})

		it('should handle cancellation errors', async () => {
			mockFirebase.getAllAppointments.mockResolvedValue([mockAppointment])
			mockFirebase.cancelAppointment.mockRejectedValue(
				new Error('Cancellation failed')
			)

			const result = await cancelBooking('appointment-123')

			expect(result.success).toBe(false)
			expect(result.error).toBe('Cancellation failed')
		})
	})

	describe('getAppointments', () => {
		it('should return all appointments', async () => {
			const mockAppointments: Appointment[] = [
				{
					id: '1',
					customerName: 'John Doe',
					customerEmail: 'john@example.com',
					customerPhone: '+31 6 12345678',
					date: '2024-12-25',
					time: '10:00',
					status: 'confirmed',
					createdAt: '2024-12-20T10:00:00Z',
					updatedAt: '2024-12-20T10:00:00Z',
				},
			]

			mockFirebase.getAllAppointments.mockResolvedValue(mockAppointments)

			const result = await getAppointments()

			expect(result).toEqual(mockAppointments)
			expect(mockFirebase.getAllAppointments).toHaveBeenCalled()
		})

		it('should return empty array on error', async () => {
			mockFirebase.getAllAppointments.mockRejectedValue(
				new Error('Database error')
			)

			const result = await getAppointments()

			expect(result).toEqual([])
		})
	})

	describe('getAvailableSlots', () => {
		it('should return available time slots', async () => {
			const mockSlots = ['09:00', '10:00', '11:00']
			mockFirebase.getAvailableTimeSlots.mockResolvedValue(mockSlots)

			const result = await getAvailableSlots('2024-12-25')

			expect(result).toEqual(mockSlots)
			expect(mockFirebase.getAvailableTimeSlots).toHaveBeenCalledWith('2024-12-25')
		})

		it('should return empty array on error', async () => {
			mockFirebase.getAvailableTimeSlots.mockRejectedValue(
				new Error('Database error')
			)

			const result = await getAvailableSlots('2024-12-25')

			expect(result).toEqual([])
		})
	})

	describe('getAvailabilityAction', () => {
		it('should return availability for date range', async () => {
			const mockAvailability: Availability[] = [
				{
					id: '1',
					date: '2024-12-25',
					timeSlots: ['09:00', '10:00', '11:00'],
					createdAt: '2024-12-20T10:00:00Z',
					updatedAt: '2024-12-20T10:00:00Z',
				},
			]

			mockFirebase.getAvailability.mockResolvedValue(mockAvailability)

			const result = await getAvailabilityAction('2024-12-25', '2024-12-31')

			expect(result).toEqual(mockAvailability)
			expect(mockFirebase.getAvailability).toHaveBeenCalledWith(
				'2024-12-25',
				'2024-12-31'
			)
		})

		it('should return empty array on error', async () => {
			mockFirebase.getAvailability.mockRejectedValue(
				new Error('Database error')
			)

			const result = await getAvailabilityAction('2024-12-25', '2024-12-31')

			expect(result).toEqual([])
		})
	})

	describe('setAvailabilityAction', () => {
		it('should set availability successfully', async () => {
			mockFirebase.setAvailability.mockResolvedValue()

			const result = await setAvailabilityAction('2024-12-25', [
				'09:00',
				'10:00',
				'11:00',
			])

			expect(result.success).toBe(true)
			expect(mockFirebase.setAvailability).toHaveBeenCalledWith('2024-12-25', [
				'09:00',
				'10:00',
				'11:00',
			])
		})

		it('should handle errors', async () => {
			mockFirebase.setAvailability.mockRejectedValue(
				new Error('Database error')
			)

			const result = await setAvailabilityAction('2024-12-25', ['09:00'])

			expect(result.success).toBe(false)
			expect(result.error).toBe('Database error')
		})
	})

	describe('removeAvailabilityAction', () => {
		it('should remove availability successfully', async () => {
			mockFirebase.removeAvailability.mockResolvedValue()

			const result = await removeAvailabilityAction('2024-12-25')

			expect(result.success).toBe(true)
			expect(mockFirebase.removeAvailability).toHaveBeenCalledWith('2024-12-25')
		})

		it('should handle errors', async () => {
			mockFirebase.removeAvailability.mockRejectedValue(
				new Error('Database error')
			)

			const result = await removeAvailabilityAction('2024-12-25')

			expect(result.success).toBe(false)
			expect(result.error).toBe('Database error')
		})
	})
})

