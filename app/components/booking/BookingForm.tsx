'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createBooking } from '../../actions/appointments'
import type { BookingFormData } from '../../lib/types'

interface BookingFormProps {
	selectedDate: string | null
	selectedTime: string | null
	onBookingSuccess: () => void
}

export default function BookingForm({
	selectedDate,
	selectedTime,
	onBookingSuccess,
}: BookingFormProps) {
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

	useEffect(() => {
		if (selectedDate) setFormData(prev => ({ ...prev, date: selectedDate }))
		if (selectedTime) setFormData(prev => ({ ...prev, time: selectedTime }))
	}, [selectedDate, selectedTime])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsSubmitting(true)

		try {
			const result = await createBooking(formData)

			if (result.success) {
				setSuccess(true)
				setFormData({
					customerName: '',
					customerEmail: '',
					customerPhone: '',
					date: '',
					time: '',
				})
				setTimeout(() => {
					setSuccess(false)
					onBookingSuccess()
				}, 3000)
			} else {
				setError(result.error || 'Failed to create booking')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
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
		<form onSubmit={handleSubmit} className='space-y-6'>
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
			</div>

			{error && (
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
					{error}
				</div>
			)}

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
					required
					value={formData.customerName}
					onChange={e =>
						setFormData({ ...formData, customerName: e.target.value })
					}
					className='w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
					placeholder='John Doe'
				/>
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
					required
					value={formData.customerEmail}
					onChange={e =>
						setFormData({ ...formData, customerEmail: e.target.value })
					}
					className='w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
					placeholder='john@example.com'
				/>
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
					required
					value={formData.customerPhone}
					onChange={e =>
						setFormData({ ...formData, customerPhone: e.target.value })
					}
					className='w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
					placeholder='+31 6 12345678'
				/>
			</div>

			<button
				type='submit'
				disabled={isSubmitting}
				className='w-full rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
			>
				{isSubmitting ? 'Booking...' : 'Confirm Booking'}
			</button>
		</form>
	)
}
