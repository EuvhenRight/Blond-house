'use client'

import { useState, useCallback } from 'react'
import type { Service } from '../lib/services'

export interface BookingState {
	selectedServiceId: string | null
	selectedDate: string | null
	selectedTime: string | null
	availableSlots: string[]
}

export interface UseBookingReturn {
	bookingState: BookingState
	setSelectedService: (serviceId: string | null) => void
	setSelectedDate: (date: string | null) => void
	setSelectedTime: (time: string | null) => void
	setAvailableSlots: (slots: string[]) => void
	resetBooking: () => void
	isReadyToBook: boolean
}

const initialState: BookingState = {
	selectedServiceId: null,
	selectedDate: null,
	selectedTime: null,
	availableSlots: [],
}

export function useBooking(initialServiceId?: string | null): UseBookingReturn {
	const [bookingState, setBookingState] = useState<BookingState>({
		...initialState,
		selectedServiceId: initialServiceId || null,
	})

	const setSelectedService = useCallback((serviceId: string | null) => {
		setBookingState(prev => ({
			...prev,
			selectedServiceId: serviceId,
			// Reset date/time when service changes
			selectedDate: null,
			selectedTime: null,
			availableSlots: [],
		}))
	}, [])

	const setSelectedDate = useCallback((date: string | null) => {
		setBookingState(prev => ({
			...prev,
			selectedDate: date,
			// Reset time when date changes
			selectedTime: null,
		}))
	}, [])

	const setSelectedTime = useCallback((time: string | null) => {
		setBookingState(prev => ({
			...prev,
			selectedTime: time,
		}))
	}, [])

	const setAvailableSlots = useCallback((slots: string[]) => {
		setBookingState(prev => ({
			...prev,
			availableSlots: slots,
		}))
	}, [])

	const resetBooking = useCallback(() => {
		setBookingState(initialState)
	}, [])

	const isReadyToBook =
		bookingState.selectedServiceId !== null &&
		bookingState.selectedDate !== null &&
		bookingState.selectedTime !== null

	return {
		bookingState,
		setSelectedService,
		setSelectedDate,
		setSelectedTime,
		setAvailableSlots,
		resetBooking,
		isReadyToBook,
	}
}

