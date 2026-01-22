'use client'

import { useEffect, useState } from 'react'
import type { Appointment, BookingFormData } from '../../lib/types'
import { adminAppointmentSchema } from '../../lib/validation'
import { ZodError } from 'zod'
import { services, formatDuration, getServiceColor } from '../../lib/services'

interface AppointmentModalProps {
	isOpen: boolean
	appointment: Appointment | null
	mode: 'add' | 'edit'
	onClose: () => void
	onSave: (data: BookingFormData) => Promise<{ success: boolean; error?: string }>
	onCancelBooking?: (appointmentId: string) => Promise<void>
	onDeleteBooking?: (appointmentId: string) => Promise<void>
}

interface FieldErrors {
	customerName?: string
	customerEmail?: string
	customerPhone?: string
	date?: string
	time?: string
	serviceId?: string
}

export default function AppointmentModal({
	isOpen,
	appointment,
	mode,
	onClose,
	onSave,
	onCancelBooking,
	onDeleteBooking,
}: AppointmentModalProps) {
	const [formData, setFormData] = useState<BookingFormData>({
		customerName: '',
		customerEmail: '',
		customerPhone: '',
		date: '',
		time: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

	useEffect(() => {
		if (isOpen) {
			if (mode === 'edit' && appointment) {
				setFormData({
					customerName: appointment.customerName,
					customerEmail: appointment.customerEmail || '',
					customerPhone: appointment.customerPhone || '',
					date: appointment.date,
					time: appointment.time,
					serviceId: appointment.serviceId || undefined,
					serviceName: appointment.serviceName || undefined,
					duration: appointment.duration || undefined,
				})
			} else {
				// Reset form for add mode
				// Use pre-filled date/time if available (from calendar click), otherwise defaults
				const defaultDate = appointment?.date || new Date().toISOString().split('T')[0]
				const defaultTime = appointment?.time || '10:00'
				
				setFormData({
					customerName: appointment?.customerName || '',
					customerEmail: appointment?.customerEmail || '',
					customerPhone: appointment?.customerPhone || '',
					date: defaultDate,
					time: defaultTime,
					serviceId: appointment?.serviceId || undefined,
					serviceName: appointment?.serviceName || undefined,
					duration: appointment?.duration || undefined,
				})
			}
			setError(null)
			setFieldErrors({})
		}
	}, [isOpen, mode, appointment])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setFieldErrors({})
		setIsLoading(true)

		try {
			// Validate with Zod
			const validatedData = adminAppointmentSchema.parse(formData)

			// Prepare form data with validated values (convert empty strings to undefined)
			const submitData: BookingFormData = {
				customerName: validatedData.customerName,
				customerEmail: validatedData.customerEmail || undefined,
				customerPhone: validatedData.customerPhone || undefined,
				serviceId: formData.serviceId,
				serviceName: formData.serviceName,
				duration: formData.duration,
				date: validatedData.date,
				time: validatedData.time,
			}

			const result = await onSave(submitData)
			if (result.success) {
				onClose()
			} else {
				setError(result.error || 'Failed to save appointment')
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
			setIsLoading(false)
		}
	}

	if (!isOpen) return null

	return (
		<div
			className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
			role='dialog'
			aria-modal='true'
			aria-labelledby='appointment-modal-title'
			aria-describedby='appointment-modal-description'
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose()
				}
			}}
			onKeyDown={(e) => {
				if (e.key === 'Escape' && !isLoading) {
					onClose()
				}
			}}
		>
			<div className='bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl'>
				<h2
					id='appointment-modal-title'
					className='text-xl sm:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4'
				>
					{mode === 'add' ? 'Add New Appointment' : 'Edit Appointment'}
				</h2>
				<p
					id='appointment-modal-description'
					className='sr-only'
				>
					{mode === 'add'
						? 'Form to add a new appointment with customer details and service selection'
						: 'Form to edit existing appointment details'}
				</p>

				<form
					onSubmit={handleSubmit}
					className='space-y-4 sm:space-y-5'
					noValidate
					aria-label={`${mode === 'add' ? 'Add' : 'Edit'} appointment form`}
				>
					<div>
						<label
							htmlFor='modal-customer-name'
							className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
						>
							Customer Name{' '}
							<span className='text-red-600' aria-label='required'>*</span>
						</label>
						<input
							id='modal-customer-name'
							type='text'
							name='customerName'
							autoComplete='name'
							value={formData.customerName}
							onChange={(e) => {
								setFormData({ ...formData, customerName: e.target.value })
								if (fieldErrors.customerName) {
									setFieldErrors(prev => ({ ...prev, customerName: undefined }))
								}
							}}
							aria-required='true'
							aria-invalid={fieldErrors.customerName ? 'true' : 'false'}
							aria-describedby={
								fieldErrors.customerName
									? 'modal-customer-name-error'
									: undefined
							}
							className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
								fieldErrors.customerName
									? 'border-red-500 focus:ring-red-500 focus:border-red-500'
									: 'border-zinc-300'
							}`}
							placeholder='John Doe'
						/>
						{fieldErrors.customerName && (
							<p
								id='modal-customer-name-error'
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
							htmlFor='modal-customer-email'
							className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
						>
							Email <span className='text-zinc-400 text-xs font-normal'>(optional)</span>
						</label>
						<input
							id='modal-customer-email'
							type='email'
							name='customerEmail'
							autoComplete='email'
							inputMode='email'
							value={formData.customerEmail || ''}
							onChange={(e) => {
								setFormData({ ...formData, customerEmail: e.target.value || undefined })
								if (fieldErrors.customerEmail) {
									setFieldErrors(prev => ({ ...prev, customerEmail: undefined }))
								}
							}}
							aria-invalid={fieldErrors.customerEmail ? 'true' : 'false'}
							aria-describedby={
								fieldErrors.customerEmail
									? 'modal-customer-email-error'
									: 'modal-customer-email-hint'
							}
							className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
								fieldErrors.customerEmail
									? 'border-red-500 focus:ring-red-500 focus:border-red-500'
									: 'border-zinc-300'
							}`}
							placeholder='customer@example.com'
						/>
						{fieldErrors.customerEmail ? (
							<p
								id='modal-customer-email-error'
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
						) : (
							<p
								id='modal-customer-email-hint'
								className='text-xs sm:text-sm text-zinc-500 mt-1.5'
							>
								Leave empty to block time slot for your schedule
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='modal-customer-phone'
							className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
						>
							Phone <span className='text-zinc-400 text-xs font-normal'>(optional)</span>
						</label>
						<input
							id='modal-customer-phone'
							type='tel'
							name='customerPhone'
							autoComplete='tel'
							inputMode='tel'
							value={formData.customerPhone || ''}
							onChange={(e) => {
								setFormData({ ...formData, customerPhone: e.target.value || undefined })
								if (fieldErrors.customerPhone) {
									setFieldErrors(prev => ({ ...prev, customerPhone: undefined }))
								}
							}}
							aria-invalid={fieldErrors.customerPhone ? 'true' : 'false'}
							aria-describedby={
								fieldErrors.customerPhone
									? 'modal-customer-phone-error'
									: 'modal-customer-phone-hint'
							}
							className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
								fieldErrors.customerPhone
									? 'border-red-500 focus:ring-red-500 focus:border-red-500'
									: 'border-zinc-300'
							}`}
							placeholder='+31 6 12345678'
						/>
						{fieldErrors.customerPhone ? (
							<p
								id='modal-customer-phone-error'
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
						) : (
							<p
								id='modal-customer-phone-hint'
								className='text-xs sm:text-sm text-zinc-500 mt-1.5'
							>
								Format: +31 6 12345678
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='modal-appointment-date'
							className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
						>
							Date <span className='text-red-600' aria-label='required'>*</span>
						</label>
						<input
							id='modal-appointment-date'
							type='date'
							name='date'
							value={formData.date}
							min={new Date().toISOString().split('T')[0]}
							onChange={(e) => {
								setFormData({ ...formData, date: e.target.value })
								if (fieldErrors.date) {
									setFieldErrors(prev => ({ ...prev, date: undefined }))
								}
							}}
							aria-required='true'
							aria-invalid={fieldErrors.date ? 'true' : 'false'}
							aria-describedby={
								fieldErrors.date ? 'modal-appointment-date-error' : undefined
							}
							className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
								fieldErrors.date
									? 'border-red-500 focus:ring-red-500 focus:border-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.date && (
							<p
								id='modal-appointment-date-error'
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
								{fieldErrors.date}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='modal-appointment-time'
							className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
						>
							Time <span className='text-red-600' aria-label='required'>*</span>
						</label>
						<input
							id='modal-appointment-time'
							type='time'
							name='time'
							value={formData.time}
							onChange={(e) => {
								setFormData({ ...formData, time: e.target.value })
								if (fieldErrors.time) {
									setFieldErrors(prev => ({ ...prev, time: undefined }))
								}
							}}
							aria-required='true'
							aria-invalid={fieldErrors.time ? 'true' : 'false'}
							aria-describedby={
								fieldErrors.time ? 'modal-appointment-time-error' : undefined
							}
							className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors min-h-[48px] ${
								fieldErrors.time
									? 'border-red-500 focus:ring-red-500 focus:border-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.time && (
							<p
								id='modal-appointment-time-error'
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
								{fieldErrors.time}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='modal-service-select'
							className='block text-sm sm:text-base font-medium text-zinc-700 mb-2'
						>
							Service{' '}
							<span className='text-red-600' aria-label='required'>
								*
							</span>
						</label>
						<select
							id='modal-service-select'
							name='serviceId'
							value={formData.serviceId || ''}
							onChange={(e) => {
								const selectedServiceId = e.target.value
								const selectedService = services.find(s => s.id === selectedServiceId)
								
								setFormData({
									...formData,
									serviceId: selectedServiceId || undefined,
									serviceName: selectedService?.name || undefined,
									duration: selectedService?.duration || undefined,
								})
								if (fieldErrors.serviceId) {
									setFieldErrors(prev => ({ ...prev, serviceId: undefined }))
								}
							}}
							aria-describedby={
								fieldErrors.serviceId
									? 'modal-service-select-error'
									: formData.serviceId
										? 'modal-service-description'
										: 'modal-service-hint'
							}
							aria-invalid={fieldErrors.serviceId ? 'true' : 'false'}
							className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-base focus:ring-2 bg-white transition-colors min-h-[48px] ${
								fieldErrors.serviceId
									? 'border-red-500 focus:ring-red-500 focus:border-red-500'
									: 'border-zinc-300 focus:ring-amber-500 focus:border-amber-500'
							}`}
						>
							<option value=''>Select a service</option>
							{services.map((service) => (
								<option key={service.id} value={service.id}>
									{service.name} ({formatDuration(service.duration)}) - {service.price}
								</option>
							))}
						</select>
						{fieldErrors.serviceId && (
							<p
								id='modal-service-select-error'
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
								{fieldErrors.serviceId}
							</p>
						)}
						{!fieldErrors.serviceId && !formData.serviceId && (
							<p
								id='modal-service-hint'
								className='text-xs sm:text-sm text-zinc-500 mt-1.5'
							>
								Select a service to assign to this appointment.
							</p>
						)}
						{formData.serviceId && (
							<div
								id='modal-service-description'
								className='mt-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg'
								role='region'
								aria-label='Selected service details'
							>
								<div className='flex items-start gap-2 sm:gap-3'>
									<div
										className='w-4 h-4 sm:w-5 sm:h-5 rounded shrink-0 mt-0.5 border'
										style={{
											backgroundColor: getServiceColor(formData.serviceId).backgroundColor,
											borderColor: getServiceColor(formData.serviceId).borderColor,
										}}
										aria-hidden='true'
									/>
									<div className='flex-1 min-w-0'>
										<p className='text-sm sm:text-base font-semibold text-zinc-900'>
											{formData.serviceName}
										</p>
										<p className='text-xs sm:text-sm text-zinc-600 mt-1'>
											Duration: {formData.duration ? formatDuration(formData.duration) : 'N/A'}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					{error && (
						<div
							className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base'
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
								<p>{error}</p>
							</div>
						</div>
					)}

							<div className='flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6'>
								<button
									type='submit'
									disabled={isLoading}
									aria-busy={isLoading}
									aria-disabled={isLoading}
									className='group relative flex-1 overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 sm:px-6 py-2.5 sm:py-3 text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg min-h-[48px] sm:min-h-[52px] flex items-center justify-center'
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
										{isLoading && (
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
										{isLoading ? 'Saving...' : mode === 'add' ? 'Add Appointment' : 'Save Changes'}
									</span>
								</button>
								<button
									type='button'
									onClick={onClose}
									disabled={isLoading}
									aria-label='Cancel appointment form'
									className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 active:bg-zinc-400 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[52px] focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2'
								>
									Cancel
								</button>
							</div>
							{mode === 'edit' && appointment?.id && (onCancelBooking || onDeleteBooking) && (
								<div className='flex flex-col sm:flex-row gap-2 pt-2'>
									{onCancelBooking && (
										<button
											type='button'
											onClick={() => void onCancelBooking(appointment.id!)}
											className='flex-1 text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 underline underline-offset-2'
										>
											Cancel appointment
										</button>
									)}
									{onDeleteBooking && (
										<button
											type='button'
											onClick={() => void onDeleteBooking(appointment.id!)}
											className='flex-1 text-xs sm:text-sm text-red-600 hover:text-red-700 underline underline-offset-2 text-left sm:text-right'
										>
											Delete appointment
										</button>
									)}
								</div>
							)}
				</form>
			</div>
		</div>
	)
}

