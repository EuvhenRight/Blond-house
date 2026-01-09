'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import BookingForm from '../components/booking/BookingForm'
import PublicCalendar from '../components/booking/PublicCalendar'
import SelectedServiceDisplay from '../components/booking/SelectedServiceDisplay'
import ServiceSelector from '../components/booking/ServiceSelector'
import TimeSlotSelector from '../components/booking/TimeSlotSelector'
import { useBooking } from '../hooks/useBooking'
import { getServiceById } from '../lib/services'

function BookPageContent() {
	const searchParams = useSearchParams()
	const serviceParam = searchParams.get('service')

	const {
		bookingState,
		setSelectedService,
		setSelectedDate,
		setSelectedTime,
		setAvailableSlots,
		resetBooking,
		isReadyToBook,
	} = useBooking(serviceParam || null)

	// Track last loaded date to prevent duplicate requests
	const lastLoadedDateRef = useRef<string | null>(null)
	const lastLoadedServiceRef = useRef<string | null>(null)

	// Update selected service if service param changes
	useEffect(() => {
		if (serviceParam) {
			const service = getServiceById(serviceParam)
			if (service) {
				setSelectedService(serviceParam)
			}
		}
	}, [serviceParam, setSelectedService])

	const handleDateSelect = useCallback(
		async (date: string) => {
			// Prevent duplicate requests for the same date and service
			if (
				lastLoadedDateRef.current === date &&
				lastLoadedServiceRef.current === bookingState.selectedServiceId
			) {
				return
			}

			// Get service duration if service is selected
			const service = bookingState.selectedServiceId
				? getServiceById(bookingState.selectedServiceId)
				: null
			const duration = service?.duration

			try {
				const { getAvailableSlots } = await import('../actions/appointments')
				const slots = await getAvailableSlots(date, duration)

				lastLoadedDateRef.current = date
				lastLoadedServiceRef.current = bookingState.selectedServiceId

				console.log(
					'[handleDateSelect] Setting selected date in booking state:',
					date
				)
				setSelectedDate(date)
				setAvailableSlots(slots)
				setSelectedTime(null)
			} catch (error) {
				console.error('Error fetching available slots:', error)
				setSelectedDate(date)
				setAvailableSlots([])
				setSelectedTime(null)
			}
		},
		[
			bookingState.selectedServiceId,
			setSelectedDate,
			setAvailableSlots,
			setSelectedTime,
		]
	)

	// When service changes, reload available slots if date is already selected
	useEffect(() => {
		if (bookingState.selectedServiceId && bookingState.selectedDate) {
			// Reset the cache when service changes so it reloads
			lastLoadedServiceRef.current = null
			void handleDateSelect(bookingState.selectedDate)
		}
	}, [
		bookingState.selectedServiceId,
		bookingState.selectedDate,
		handleDateSelect,
	])

	const handleBookingSuccess = useCallback(() => {
		// Reset cache on successful booking
		lastLoadedDateRef.current = null
		lastLoadedServiceRef.current = null
		resetBooking()
	}, [resetBooking])

	return (
		<div className='min-h-screen'>
			<main className='w-full py-12 sm:py-16 md:py-20'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
					{/* Page Header */}
					<div className='text-center mb-12'>
						<h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 mb-4'>
							Book an Appointment
						</h1>
					</div>

					<div className='grid gap-8 lg:grid-cols-3'>
						{/* Calendar Section - 2/3 width */}
						<div className='bg-white rounded-2xl shadow-lg p-6 lg:col-span-2'>
							{!bookingState.selectedServiceId && (
								<h2 className='text-2xl font-bold text-zinc-900 mb-6'>
									Select Service
								</h2>
							)}

							{!bookingState.selectedServiceId ? (
								<ServiceSelector
									onServiceSelect={setSelectedService}
									selectedServiceId={bookingState.selectedServiceId}
								/>
							) : (
								<>
									<SelectedServiceDisplay
										serviceId={bookingState.selectedServiceId}
										onChange={() => setSelectedService(null)}
									/>
									{/* Legend for mobile - explains color coding */}
									<div className='mb-4 sm:hidden flex items-center justify-center gap-4 text-xs'>
										<div className='flex items-center gap-2'>
											<div className='w-4 h-4 bg-green-100 rounded'></div>
											<span className='text-zinc-700'>Available</span>
										</div>
										<div className='flex items-center gap-2'>
											<div className='w-4 h-4 bg-red-100 rounded'></div>
											<span className='text-zinc-700'>Not available</span>
										</div>
									</div>
									<PublicCalendar
										onDateSelect={handleDateSelect}
										selectedDate={bookingState.selectedDate}
										serviceDurationMinutes={
											bookingState.selectedServiceId
												? getServiceById(bookingState.selectedServiceId)
														?.duration || null
												: null
										}
									/>
								</>
							)}
						</div>

						{/* Booking Section - 1/3 width */}
						<div className='bg-white rounded-2xl shadow-lg p-6 lg:col-span-1 flex flex-col'>
							{(!bookingState.selectedServiceId || isReadyToBook) && (
								<h2 className='text-2xl font-bold text-zinc-900 mb-6'>
									{!bookingState.selectedServiceId
										? 'Service Selection'
										: 'Booking Details'}
								</h2>
							)}

							{bookingState.selectedDate &&
								!bookingState.selectedTime &&
								bookingState.availableSlots.length > 0 && (
									<TimeSlotSelector
										availableSlots={bookingState.availableSlots}
										selectedTime={bookingState.selectedTime}
										selectedDate={bookingState.selectedDate}
										onTimeSelect={setSelectedTime}
									/>
								)}

							{bookingState.selectedDate &&
								bookingState.availableSlots.length === 0 && (
									<div className='text-center py-12 text-zinc-600'>
										<p className='font-medium mb-2'>
											No available time slots for this date.
										</p>
										<p className='text-sm'>
											Please select another date from the calendar.
										</p>
									</div>
								)}

							{!bookingState.selectedServiceId && (
								<div className='text-center py-12 text-zinc-600'>
									Please select a service to continue with your booking
								</div>
							)}

						{bookingState.selectedServiceId && !bookingState.selectedDate && (
							<div className='sticky top-20 bg-white/95 backdrop-blur-sm border-b border-zinc-200 py-4 text-center text-zinc-600 z-10 mb-4'>
								Please select an available date from the calendar to continue
							</div>
						)}

							{isReadyToBook && (
								<BookingForm
									selectedDate={bookingState.selectedDate!}
									selectedTime={bookingState.selectedTime!}
									selectedServiceId={bookingState.selectedServiceId!}
									onBookingSuccess={handleBookingSuccess}
								/>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default function BookPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center'>
					<div className='text-zinc-600'>Loading...</div>
				</div>
			}
		>
			<BookPageContent />
		</Suspense>
	)
}
