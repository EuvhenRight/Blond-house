'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createBooking } from '../../actions/appointments'
import type { BookingFormData } from '../../lib/types'
import { services, getServiceById, formatDuration } from '../../lib/services'
import { bookingFormSchema, type BookingFormInput } from '../../lib/validation'
import { ZodError } from 'zod'

interface BookingFormProps {
	selectedDate: string | null
	selectedTime: string | null
	selectedServiceId?: string | null
	onBookingSuccess: () => void
}

interface FieldErrors {
	customerName?: string
	customerEmail?: string
	customerPhone?: string
	serviceId?: string
	date?: string
	time?: string
}

export default function BookingForm({
	selectedDate,
	selectedTime,
	selectedServiceId,
	onBookingSuccess,
}: BookingFormProps) {
	const [selectedService, setSelectedService] = useState<string>(
		selectedServiceId || ''
	)
	const [formData, setFormData] = useState<BookingFormData>({
		customerName: '',
		customerEmail: '',
		customerPhone: '',
		date: selectedDate || '',
		time: selectedTime || '',
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

	// Update form data when service is selected
	useEffect(() => {
		if (selectedService) {
			const service = getServiceById(selectedService)
			if (service) {
				setFormData(prev => ({
					...prev,
					serviceId: service.id,
					serviceName: service.name,
					duration: service.duration,
				}))
			}
		}
		// Clear service error when service is selected
		if (selectedService && fieldErrors.serviceId) {
			setFieldErrors(prev => ({ ...prev, serviceId: undefined }))
		}
	}, [selectedService])

	useEffect(() => {
		if (selectedDate) {
			setFormData(prev => ({ ...prev, date: selectedDate }))
			if (fieldErrors.date) {
				setFieldErrors(prev => ({ ...prev, date: undefined }))
			}
		}
		if (selectedTime) {
			setFormData(prev => ({ ...prev, time: selectedTime }))
			if (fieldErrors.time) {
				setFieldErrors(prev => ({ ...prev, time: undefined }))
			}
		}
	}, [selectedDate, selectedTime])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setFieldErrors({})
		setIsSubmitting(true)

		try {
			// Validate with Zod
			const validationData: BookingFormInput = {
				customerName: formData.customerName || '',
				customerEmail: formData.customerEmail || '',
				customerPhone: formData.customerPhone || '',
				serviceId: selectedService || '',
				date: formData.date || '',
				time: formData.time || '',
				serviceName: formData.serviceName,
				duration: formData.duration,
			}
			
			const validatedData = bookingFormSchema.parse(validationData)

			// Prepare form data with validated values
			const submitData: BookingFormData = {
				customerName: validatedData.customerName,
				customerEmail: validatedData.customerEmail,
				customerPhone: validatedData.customerPhone,
				serviceId: validatedData.serviceId,
				serviceName: validatedData.serviceName,
				duration: validatedData.duration,
				date: validatedData.date,
				time: validatedData.time,
			}

			const result = await createBooking(submitData)

			if (result.success) {
				setSuccess(true)
				setSelectedService('')
				setFormData({
					customerName: '',
					customerEmail: '',
					customerPhone: '',
					date: '',
					time: '',
				})
				setFieldErrors({})
				setTimeout(() => {
					setSuccess(false)
					onBookingSuccess()
				}, 3000)
			} else {
				setError(result.error || 'Failed to create booking')
			}
		} catch (err) {
			if (err instanceof ZodError) {
				// Handle Zod validation errors
				const errors: FieldErrors = {}
				err.issues.forEach((issue) => {
					if (issue.path[0]) {
						const field = issue.path[0] as keyof FieldErrors
						errors[field] = issue.message
					}
				})
				setFieldErrors(errors)
			} else {
				setError(err instanceof Error ? err.message : 'An error occurred')
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!selectedDate || !selectedTime) {
		return (
			<div className='text-center py-12 text-zinc-600'>
				Please select a date and time from the calendar above
			</div>
		)
	}

	if (success) {
		return (
			<div className='text-center py-12'>
				<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4'>
					<svg
						className='w-8 h-8 text-green-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M5 13l4 4L19 7'
						/>
					</svg>
				</div>
				<h3 className='text-2xl font-bold text-zinc-900 mb-2'>
					Booking Confirmed!
				</h3>
				<p className='text-zinc-600'>
					Your appointment has been confirmed. A confirmation email has been
					sent to your email address.
				</p>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6' noValidate>
			<div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
				<h3 className='font-semibold text-zinc-900 mb-2'>
					Selected Appointment
				</h3>
				<p className='text-sm text-zinc-700'>
					<strong>Date:</strong>{' '}
					{new Date(selectedDate).toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					})}
				</p>
				<p className='text-sm text-zinc-700'>
					<strong>Time:</strong> {selectedTime}
				</p>
				{selectedService && getServiceById(selectedService) && (
					<p className='text-sm text-zinc-700 mt-2'>
						<strong>Service:</strong> {getServiceById(selectedService)?.name}
						<br />
						<strong>Duration:</strong>{' '}
						{formatDuration(getServiceById(selectedService)?.duration || 0)}
					</p>
				)}
			</div>

			{error && (
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor='service'
					className='block text-sm font-medium text-zinc-700 mb-2'
				>
					Service *
				</label>
				<select
					id='service'
					value={selectedService}
					onChange={e => {
						setSelectedService(e.target.value)
						if (fieldErrors.serviceId) {
							setFieldErrors(prev => ({ ...prev, serviceId: undefined }))
						}
					}}
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
						fieldErrors.serviceId
							? 'border-red-500 focus:ring-red-500'
							: 'border-zinc-300'
					}`}
				>
					<option value=''>Select a service</option>
					{services.map(service => (
						<option key={service.id} value={service.id}>
							{service.name} - {service.price} ({formatDuration(service.duration)})
						</option>
					))}
				</select>
				{fieldErrors.serviceId && (
					<p className='mt-1 text-sm text-red-600'>{fieldErrors.serviceId}</p>
				)}
				{selectedService && !fieldErrors.serviceId && (
					<p className='mt-2 text-sm text-zinc-600'>
						{getServiceById(selectedService)?.description}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor='customerName'
					className='block text-sm font-medium text-zinc-700 mb-2'
				>
					Full Name *
				</label>
				<input
					type='text'
					id='customerName'
					value={formData.customerName}
					onChange={e => {
						setFormData({ ...formData, customerName: e.target.value })
						if (fieldErrors.customerName) {
							setFieldErrors(prev => ({ ...prev, customerName: undefined }))
						}
					}}
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
						fieldErrors.customerName
							? 'border-red-500 focus:ring-red-500'
							: 'border-zinc-300'
					}`}
					placeholder='John Doe'
				/>
				{fieldErrors.customerName && (
					<p className='mt-1 text-sm text-red-600'>{fieldErrors.customerName}</p>
				)}
			</div>

			<div>
				<label
					htmlFor='customerEmail'
					className='block text-sm font-medium text-zinc-700 mb-2'
				>
					Email Address *
				</label>
				<input
					type='email'
					id='customerEmail'
					value={formData.customerEmail}
					onChange={e => {
						setFormData({ ...formData, customerEmail: e.target.value })
						if (fieldErrors.customerEmail) {
							setFieldErrors(prev => ({ ...prev, customerEmail: undefined }))
						}
					}}
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
						fieldErrors.customerEmail
							? 'border-red-500 focus:ring-red-500'
							: 'border-zinc-300'
					}`}
					placeholder='john@example.com'
				/>
				{fieldErrors.customerEmail && (
					<p className='mt-1 text-sm text-red-600'>{fieldErrors.customerEmail}</p>
				)}
			</div>

			<div>
				<label
					htmlFor='customerPhone'
					className='block text-sm font-medium text-zinc-700 mb-2'
				>
					Phone Number *
				</label>
				<input
					type='tel'
					id='customerPhone'
					value={formData.customerPhone}
					onChange={e => {
						setFormData({ ...formData, customerPhone: e.target.value })
						if (fieldErrors.customerPhone) {
							setFieldErrors(prev => ({ ...prev, customerPhone: undefined }))
						}
					}}
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
						fieldErrors.customerPhone
							? 'border-red-500 focus:ring-red-500'
							: 'border-zinc-300'
					}`}
					placeholder='+31 6 12345678'
				/>
				{fieldErrors.customerPhone && (
					<p className='mt-1 text-sm text-red-600'>{fieldErrors.customerPhone}</p>
				)}
			</div>

			<button
				type='submit'
				disabled={isSubmitting || !selectedService}
				className='group relative w-full overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg'
			>
				{/* Shimmer animation overlay */}
				<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
				{/* Glow effect */}
				<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
				<span className='relative z-10'>
					{isSubmitting ? 'Booking...' : 'Confirm Booking'}
				</span>
			</button>
			
			<p className='text-xs text-zinc-500 text-center mt-4'>
				* Additional charges may apply for certain services—please consult with your stylist.
				<br />
				* All services include shampoo, styling, and blow-dry in the desired direction.
			</p>
		</form>
	)
}
