'use client'

import { useState } from 'react'
import PublicCalendar from '../components/booking/PublicCalendar'
import BookingForm from '../components/booking/BookingForm'

export default function BookPage() {
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedTime, setSelectedTime] = useState<string | null>(null)
	const [availableSlots, setAvailableSlots] = useState<string[]>([])

	const handleDateSelect = (date: string, slots: string[]) => {
		setSelectedDate(date)
		setAvailableSlots(slots)
		setSelectedTime(null)
	}

	const handleTimeSelect = (time: string) => {
		setSelectedTime(time)
	}

	const handleBookingSuccess = () => {
		setSelectedDate(null)
		setSelectedTime(null)
		setAvailableSlots([])
	}

	return (
		<div className='min-h-screen'>
			<main className='w-full py-12 sm:py-16 md:py-20'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
					{/* Page Header */}
					<div className='text-center mb-12'>
						<h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 mb-4'>
							Book an Appointment
						</h1>
						<p className='text-lg text-zinc-600 max-w-2xl mx-auto'>
							Select your preferred date and time for your appointment
						</p>
					</div>

					<div className='grid gap-8 lg:grid-cols-2'>
						{/* Calendar Section */}
						<div className='bg-white rounded-2xl shadow-lg p-6'>
							<h2 className='text-2xl font-bold text-zinc-900 mb-6'>
								Select Date
							</h2>
							<PublicCalendar onDateSelect={handleDateSelect} />
						</div>

						{/* Booking Section */}
						<div className='bg-white rounded-2xl shadow-lg p-6'>
							<h2 className='text-2xl font-bold text-zinc-900 mb-6'>
								{selectedDate && !selectedTime ? 'Select Time' : 'Booking Details'}
							</h2>

							{selectedDate && !selectedTime && availableSlots.length > 0 && (
								<div className='mb-6'>
									<p className='text-sm text-zinc-600 mb-4'>
										Available times for{' '}
										{new Date(selectedDate).toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'long',
											day: 'numeric',
										})}
									</p>
									<div className='grid grid-cols-3 gap-3'>
										{availableSlots.map((time) => (
											<button
												key={time}
												onClick={() => handleTimeSelect(time)}
												className='px-4 py-2 border-2 border-amber-300 rounded-lg text-zinc-700 font-medium hover:bg-amber-50 hover:border-amber-500 transition-colors'
											>
												{time}
											</button>
										))}
									</div>
								</div>
							)}

							{selectedDate && availableSlots.length === 0 && (
								<div className='text-center py-12 text-zinc-600'>
									No available time slots for this date. Please select another
									date.
								</div>
							)}

							{selectedDate && selectedTime && (
								<BookingForm
									selectedDate={selectedDate}
									selectedTime={selectedTime}
									onBookingSuccess={handleBookingSuccess}
								/>
							)}

							{!selectedDate && (
								<div className='text-center py-12 text-zinc-600'>
									Please select a date from the calendar to continue
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

