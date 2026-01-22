'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { ZodError } from 'zod'
import { createBooking } from '../../actions/appointments'
import { formatDuration, getServiceById } from '../../lib/services'
import type { BookingFormData } from '../../lib/types'
import { bookingFormSchema, type BookingFormInput } from '../../lib/validation'

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
	const router = useRouter()
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

	// Update form data when service is selected from prop
	useEffect(() => {
		if (selectedServiceId) {
			const service = getServiceById(selectedServiceId)
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
		if (selectedServiceId && fieldErrors.serviceId) {
			setFieldErrors(prev => ({ ...prev, serviceId: undefined }))
		}
	}, [selectedServiceId, fieldErrors.serviceId])

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
				serviceId: selectedServiceId || '',
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
				setFormData({
					customerName: '',
					customerEmail: '',
					customerPhone: '',
					date: '',
					time: '',
				})
				setFieldErrors({})
				// Redirect immediately to main page with success parameter
				onBookingSuccess()
				router.push('/?bookingSuccess=true')
			} else {
				setError(result.error || 'Failed to create booking')
			}
		} catch (err) {
			if (err instanceof ZodError) {
				// Handle Zod validation errors
				const errors: FieldErrors = {}
				err.issues.forEach(issue => {
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
			<div
				className='text-center py-8 sm:py-12'
				role='status'
				aria-live='polite'
				aria-atomic='true'
			>
				<div
					className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 mb-4 animate-in fade-in zoom-in duration-500'
					aria-hidden='true'
				>
					<svg
						className='w-8 h-8 sm:w-10 sm:h-10 text-green-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						aria-hidden='true'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2.5}
							d='M5 13l4 4L19 7'
						/>
					</svg>
				</div>
				<h3 className='text-xl sm:text-2xl font-bold text-zinc-900 mb-2'>
					Booking Confirmed!
				</h3>
				<p className='text-sm sm:text-base text-zinc-600 max-w-md mx-auto'>
					Your appointment has been confirmed. A confirmation email has been
					sent to your email address.
				</p>
			</div>
		)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4 sm:space-y-6'
			noValidate
			aria-label='Booking form'
		>
			{/* Selected Appointment Summary */}
			<div
				className='bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6'
				role='region'
				aria-label='Selected appointment details'
			>
				<h3 className='font-semibold text-base sm:text-lg text-zinc-900 mb-3'>
					Selected Appointment
				</h3>
				<dl className='space-y-2 text-sm sm:text-base'>
					<div>
						<dt className='font-medium text-zinc-700 inline'>Date:</dt>{' '}
						<dd className='text-zinc-800 inline'>
							{new Date(selectedDate).toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</dd>
					</div>
					<div>
						<dt className='font-medium text-zinc-700 inline'>Time:</dt>{' '}
						<dd className='text-zinc-800 inline'>{selectedTime}</dd>
					</div>
					{selectedServiceId && getServiceById(selectedServiceId) && (
						<div className='pt-2 border-t border-amber-200'>
							<div>
								<dt className='font-medium text-zinc-700 inline'>Service:</dt>{' '}
								<dd className='text-zinc-800 inline'>
									{getServiceById(selectedServiceId)?.name}
								</dd>
							</div>
							<div>
								<dt className='font-medium text-zinc-700 inline'>Duration:</dt>{' '}
								<dd className='text-zinc-800 inline'>
									{formatDuration(
										getServiceById(selectedServiceId)?.duration || 0
									)}
								</dd>
							</div>
						</div>
					)}
				</dl>
			</div>

			{error && (
				<div
					className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'
					role='alert'
					aria-live='assertive'
				>
					<div className='flex items-start gap-2'>
						<svg
							className='w-5 h-5 mt-0.5 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						<p className='text-sm sm:text-base'>{error}</p>
					</div>
				</div>
			)}

			{!selectedServiceId && (
				<div
					className='bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg'
					role='alert'
				>
					<p className='text-sm sm:text-base'>
						Please select a service from the calendar section above.
					</p>
				</div>
			)}

			<div>
				<label
					htmlFor='customerName'
					className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
				>
					Full Name{' '}
					<span className='text-red-600' aria-label='required'>
						*
					</span>
				</label>
				<input
					type='text'
					id='customerName'
					name='customerName'
					autoComplete='name'
					value={formData.customerName}
					onChange={e => {
						setFormData({ ...formData, customerName: e.target.value })
						if (fieldErrors.customerName) {
							setFieldErrors(prev => ({ ...prev, customerName: undefined }))
						}
					}}
					aria-required='true'
					aria-invalid={fieldErrors.customerName ? 'true' : 'false'}
					aria-describedby={
						fieldErrors.customerName ? 'customerName-error' : undefined
					}
					className={`w-full px-4 py-3 sm:py-3.5 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
						fieldErrors.customerName
							? 'border-red-500 focus:ring-red-500 focus:border-red-500'
							: 'border-zinc-300'
					}`}
					placeholder='John Doe'
				/>
				{fieldErrors.customerName && (
					<p
						id='customerName-error'
						className='mt-1.5 text-sm text-red-600 flex items-center gap-1.5'
						role='alert'
					>
						<svg
							className='w-4 h-4 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						{fieldErrors.customerName}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor='customerEmail'
					className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
				>
					Email Address{' '}
					<span className='text-red-600' aria-label='required'>
						*
					</span>
				</label>
				<input
					type='email'
					id='customerEmail'
					name='customerEmail'
					autoComplete='email'
					inputMode='email'
					value={formData.customerEmail}
					onChange={e => {
						setFormData({ ...formData, customerEmail: e.target.value })
						if (fieldErrors.customerEmail) {
							setFieldErrors(prev => ({ ...prev, customerEmail: undefined }))
						}
					}}
					aria-required='true'
					aria-invalid={fieldErrors.customerEmail ? 'true' : 'false'}
					aria-describedby={
						fieldErrors.customerEmail ? 'customerEmail-error' : undefined
					}
					className={`w-full px-4 py-3 sm:py-3.5 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
						fieldErrors.customerEmail
							? 'border-red-500 focus:ring-red-500 focus:border-red-500'
							: 'border-zinc-300'
					}`}
					placeholder='john@example.com'
				/>
				{fieldErrors.customerEmail && (
					<p
						id='customerEmail-error'
						className='mt-1.5 text-sm text-red-600 flex items-center gap-1.5'
						role='alert'
					>
						<svg
							className='w-4 h-4 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						{fieldErrors.customerEmail}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor='customerPhone'
					className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
				>
					Phone Number{' '}
					<span className='text-red-600' aria-label='required'>
						*
					</span>
				</label>
				<input
					type='tel'
					id='customerPhone'
					name='customerPhone'
					autoComplete='tel'
					inputMode='tel'
					value={formData.customerPhone}
					onChange={e => {
						setFormData({ ...formData, customerPhone: e.target.value })
						if (fieldErrors.customerPhone) {
							setFieldErrors(prev => ({ ...prev, customerPhone: undefined }))
						}
					}}
					aria-required='true'
					aria-invalid={fieldErrors.customerPhone ? 'true' : 'false'}
					aria-describedby={
						fieldErrors.customerPhone
							? 'customerPhone-error'
							: 'customerPhone-hint'
					}
					className={`w-full px-4 py-3 sm:py-3.5 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
						fieldErrors.customerPhone
							? 'border-red-500 focus:ring-red-500 focus:border-red-500'
							: 'border-zinc-300'
					}`}
					placeholder='+31 6 12345678'
				/>
				{fieldErrors.customerPhone && (
					<p
						id='customerPhone-error'
						className='mt-1.5 text-sm text-red-600 flex items-center gap-1.5'
						role='alert'
					>
						<svg
							className='w-4 h-4 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						{fieldErrors.customerPhone}
					</p>
				)}
				{!fieldErrors.customerPhone && (
					<p id='customerPhone-hint' className='mt-1.5 text-xs text-zinc-500'>
						Format: +31 6 12345678
					</p>
				)}
			</div>

			<button
				type='submit'
				disabled={isSubmitting || !selectedServiceId}
				aria-busy={isSubmitting}
				aria-disabled={isSubmitting || !selectedServiceId}
				className='group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg min-h-[48px] sm:min-h-[52px] flex items-center justify-center'
			>
				{/* Shimmer animation overlay */}
				<span
					className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out'
					aria-hidden='true'
				/>
				{/* Glow effect */}
				<span
					className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10'
					aria-hidden='true'
				/>
				<span className='relative z-10 flex items-center gap-2'>
					{isSubmitting && (
						<svg
							className='animate-spin h-5 w-5 text-white'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							aria-hidden='true'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							></circle>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							></path>
						</svg>
					)}
					{isSubmitting ? 'Booking...' : 'Confirm Booking'}
				</span>
			</button>

			<p className='text-xs sm:text-sm text-zinc-500 text-center mt-4 sm:mt-6 leading-relaxed'>
				* Additional charges may apply for certain services—please consult with
				your stylist.
				<br className='hidden sm:block' />
				<span className='block sm:inline'> </span>* All services include
				shampoo, styling, and blow-dry in the desired direction.
			</p>
		</form>
	)
}
