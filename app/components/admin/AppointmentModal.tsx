'use client'

import { useEffect, useState } from 'react'
import type { Appointment, BookingFormData } from '../../lib/types'
import { adminAppointmentSchema } from '../../lib/validation'
import { ZodError } from 'zod'

interface AppointmentModalProps {
	isOpen: boolean
	appointment: Appointment | null
	mode: 'add' | 'edit'
	onClose: () => void
	onSave: (data: BookingFormData) => Promise<{ success: boolean; error?: string }>
}

interface FieldErrors {
	customerName?: string
	customerEmail?: string
	customerPhone?: string
	date?: string
	time?: string
}

export default function AppointmentModal({
	isOpen,
	appointment,
	mode,
	onClose,
	onSave,
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
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
				<h2 className='text-2xl font-bold text-zinc-900 mb-4'>
					{mode === 'add' ? 'Add New Appointment' : 'Edit Appointment'}
				</h2>

				<form onSubmit={handleSubmit} className='space-y-4' noValidate>
					<div>
						<label className='block text-sm font-medium text-zinc-700 mb-1'>
							Customer Name *
						</label>
						<input
							type='text'
							value={formData.customerName}
							onChange={(e) => {
								setFormData({ ...formData, customerName: e.target.value })
								if (fieldErrors.customerName) {
									setFieldErrors(prev => ({ ...prev, customerName: undefined }))
								}
							}}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
								fieldErrors.customerName
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.customerName && (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.customerName}</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-zinc-700 mb-1'>
							Email <span className='text-zinc-400 text-xs'>(optional)</span>
						</label>
						<input
							type='email'
							value={formData.customerEmail || ''}
							onChange={(e) => {
								setFormData({ ...formData, customerEmail: e.target.value || undefined })
								if (fieldErrors.customerEmail) {
									setFieldErrors(prev => ({ ...prev, customerEmail: undefined }))
								}
							}}
							placeholder='Leave empty to block time slot without customer'
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
								fieldErrors.customerEmail
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.customerEmail ? (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.customerEmail}</p>
						) : (
							<p className='text-xs text-zinc-500 mt-1'>
								Leave empty to block time slot for your schedule
							</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-zinc-700 mb-1'>
							Phone <span className='text-zinc-400 text-xs'>(optional)</span>
						</label>
						<input
							type='tel'
							value={formData.customerPhone || ''}
							onChange={(e) => {
								setFormData({ ...formData, customerPhone: e.target.value || undefined })
								if (fieldErrors.customerPhone) {
									setFieldErrors(prev => ({ ...prev, customerPhone: undefined }))
								}
							}}
							placeholder='Optional phone number'
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
								fieldErrors.customerPhone
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.customerPhone && (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.customerPhone}</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-zinc-700 mb-1'>
							Date *
						</label>
						<input
							type='date'
							value={formData.date}
							min={new Date().toISOString().split('T')[0]}
							onChange={(e) => {
								setFormData({ ...formData, date: e.target.value })
								if (fieldErrors.date) {
									setFieldErrors(prev => ({ ...prev, date: undefined }))
								}
							}}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
								fieldErrors.date
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.date && (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.date}</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-zinc-700 mb-1'>
							Time *
						</label>
						<input
							type='time'
							value={formData.time}
							onChange={(e) => {
								setFormData({ ...formData, time: e.target.value })
								if (fieldErrors.time) {
									setFieldErrors(prev => ({ ...prev, time: undefined }))
								}
							}}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
								fieldErrors.time
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
						/>
						{fieldErrors.time && (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.time}</p>
						)}
					</div>

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
							{error}
						</div>
					)}

							<div className='flex gap-3 pt-4'>
								<button
									type='submit'
									disabled={isLoading}
									className='group relative flex-1 overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg'
								>
									{/* Shimmer animation overlay */}
									<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
									{/* Glow effect */}
									<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
									<span className='relative z-10'>
										{isLoading ? 'Saving...' : mode === 'add' ? 'Add Appointment' : 'Save Changes'}
									</span>
								</button>
								<button
									type='button'
									onClick={onClose}
									disabled={isLoading}
									className='group relative flex-1 overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg'
								>
									{/* Shimmer animation overlay */}
									<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
									{/* Glow effect */}
									<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
									<span className='relative z-10'>Cancel</span>
								</button>
							</div>
				</form>
			</div>
		</div>
	)
}

