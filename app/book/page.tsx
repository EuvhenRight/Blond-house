'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import BookingForm from '../components/booking/BookingForm'
import BookingProgress from '../components/booking/BookingProgress'
import PublicCalendar from '../components/booking/PublicCalendar'
import SelectedServiceDisplay from '../components/booking/SelectedServiceDisplay'
import ServiceSelector from '../components/booking/ServiceSelector'
import TimeSlotSelector from '../components/booking/TimeSlotSelector'
import { useBooking } from '../hooks/useBooking'
import { getServiceById } from '../lib/services'

function BookPageContent() {
	const searchParams = useSearchParams()
	const serviceParam = searchParams.get('service')
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setIsVisible(true)
	}, [])

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

	// Refs for scroll targets: calendar (available days), timeslots, confirm booking
	const calendarSectionRef = useRef<HTMLDivElement>(null)
	const timeslotsSectionRef = useRef<HTMLDivElement>(null)
	const confirmBookingSectionRef = useRef<HTMLDivElement>(null)

	// Update selected service if service param changes
	useEffect(() => {
		if (serviceParam) {
			const service = getServiceById(serviceParam)
			if (service) {
				setSelectedService(serviceParam)
			}
		}
	}, [serviceParam, setSelectedService])

	// After choosing a service, scroll so calendar (month / agenda) sits at the bottom
	useEffect(() => {
		if (!bookingState.selectedServiceId) return
		const t = setTimeout(() => {
			calendarSectionRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
			})
		}, 150)
		return () => clearTimeout(t)
	}, [bookingState.selectedServiceId])

	// After choosing a date, scroll so "Select time" / timeslots sit at the bottom of the viewport
	useEffect(() => {
		if (!bookingState.selectedDate) return
		const t = setTimeout(() => {
			timeslotsSectionRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
			})
		}, 150)
		return () => clearTimeout(t)
	}, [bookingState.selectedDate])

	// After choosing a time, scroll so confirm booking / BookingForm sits at the bottom
	useEffect(() => {
		if (!isReadyToBook) return
		const t = setTimeout(() => {
			confirmBookingSectionRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
			})
		}, 150)
		return () => clearTimeout(t)
	}, [isReadyToBook])

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

	// Determine current step for progress indicator
	const getCurrentStep = (): 'service' | 'date' | 'time' | 'details' => {
		if (isReadyToBook) return 'details'
		if (bookingState.selectedTime) return 'time'
		if (bookingState.selectedDate) return 'date'
		return 'service'
	}

	return (
		<div className='min-h-screen relative'>
			<main className='w-full py-4 sm:py-4 md:py-6 lg:py-6' role='main'>
				<div className='mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12'>
					{/* Back to Home Link */}
					<Link
						href='/'
						className='inline-block mb-4 sm:mb-6 text-sm sm:text-base text-amber-600 hover:text-amber-700 transition-colors'
					>
						← Back to Home
					</Link>

					{/* Page Header */}
					<header className='text-center mb-5 sm:mb-8 md:mb-12'>
						<h3 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-zinc-900 mb-2 sm:mb-4 md:mb-6'>
							Book an Appointment
						</h3>
						<p className='text-xs sm:text-sm md:text-base text-zinc-600 max-w-2xl mx-auto px-1'>
							Select your service, choose a date and time, and complete your
							booking
						</p>
					</header>

					{/* Main Content in Glass Section - No transforms to allow sticky children */}
					<div 
						className={`backdrop-blur-md border border-zinc-200/80 rounded-2xl bg-white/60 p-3 sm:p-5 md:p-6 lg:p-8 transition-opacity duration-1200 ease-in-out ${
							isVisible ? 'opacity-100' : 'opacity-0'
						}`}
						style={{
							transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
							transitionDelay: '100ms',
						}}
					>
						{/* Progress Indicator */}
						<div className='sticky top-17 z-20 bg-white/95 backdrop-blur supports-backdrop-filter:backdrop-blur-sm rounded-lg shadow-sm px-2 sm:px-2.5 py-2 mb-2 sm:mb-3 transition-all duration-300'>
							<BookingProgress currentStep={getCurrentStep()} />
						</div>

						{/* Grid container for calendar and sidebar - Wrapper to control sticky stop position */}
						<div className='relative min-h-0'>
							<div className='grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3 lg:items-start min-h-0'>
							{/* Calendar Section - 2/3 width on desktop, full on mobile */}
							<section
								className='bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 lg:col-span-2'
								aria-labelledby={
									!bookingState.selectedServiceId
										? 'service-selection-heading'
										: 'date-selection-heading'
								}
							>
							{!bookingState.selectedServiceId && (
								<h2
									id='service-selection-heading'
									className='text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4 md:mb-6'
								>
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
									<h2 id='date-selection-heading' className='sr-only'>
										Select Date and Time
									</h2>
									<div className='-mx-4 sm:-mx-6 md:mx-0 mb-6'>
										<SelectedServiceDisplay
											serviceId={bookingState.selectedServiceId}
											onChange={() => setSelectedService(null)}
										/>
									</div>
									<div
										ref={calendarSectionRef}
										id='booking-calendar'
										className='scroll-mt-24'
									>
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
									</div>
								</>
							)}
						</section>

						{/* Booking Section - 1/3 width on desktop, full on mobile - Sticky on desktop */}
						<aside
							className='bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 lg:col-span-1 flex flex-col lg:sticky lg:top-40 lg:self-start'
							aria-label='Booking details sidebar'
						>
							{(!bookingState.selectedServiceId || isReadyToBook) && (
								<h2 className='text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4 md:mb-6'>
									{!bookingState.selectedServiceId
										? 'Service Selection'
										: 'Booking Details'}
								</h2>
							)}

							{bookingState.selectedDate && (
								<>
									<h2 className='text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4 md:mb-6'>
										Select time
									</h2>
									<div
										ref={timeslotsSectionRef}
										id='booking-timeslots'
										className='scroll-mt-24'
									>
										<TimeSlotSelector
											availableSlots={bookingState.availableSlots}
											selectedTime={bookingState.selectedTime}
											selectedDate={bookingState.selectedDate}
											onTimeSelect={setSelectedTime}
											isLoading={false}
										/>
									</div>
								</>
							)}

							{!bookingState.selectedServiceId && (
								<div className='text-center py-6 sm:py-8 md:py-12 text-sm sm:text-base text-zinc-600'>
									Please select a service to continue with your booking
								</div>
							)}

						{bookingState.selectedServiceId && !bookingState.selectedDate && (
							<div className='sticky top-20 bg-white/95 backdrop-blur-sm border-b border-zinc-200 py-4 text-center text-zinc-600 z-10 mb-4'>
								Please select an available date from the calendar to continue
							</div>
						)}

							{isReadyToBook && (
								<div
									ref={confirmBookingSectionRef}
									id='booking-confirm'
									className='scroll-mt-24'
								>
									<BookingForm
										selectedDate={bookingState.selectedDate!}
										selectedTime={bookingState.selectedTime!}
										selectedServiceId={bookingState.selectedServiceId!}
										onBookingSuccess={handleBookingSuccess}
									/>
								</div>
							)}
						</aside>
							</div>
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
