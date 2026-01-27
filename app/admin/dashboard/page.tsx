'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
	getAppointments,
	adminCancelBooking,
	adminCreateBooking,
	adminUpdateBooking,
} from '../../actions/appointments'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import AdminCalendar from '../../components/admin/AdminCalendar'
import AppointmentModal from '../../components/admin/AppointmentModal'
import type { Appointment, BookingFormData } from '../../lib/types'

export default function AdminDashboard() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
	const [calendarRefreshToken, setCalendarRefreshToken] = useState(0)
	const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)
	const [cancelConfirmLoading, setCancelConfirmLoading] = useState(false)
	const [cancelConfirmError, setCancelConfirmError] = useState<string | null>(
		null
	)

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/admin/login')
		}
	}, [status, router])

	useEffect(() => {
		if (status === 'authenticated') {
			loadAppointments()
		}
	}, [status])

	const loadAppointments = async () => {
		try {
			const data = await getAppointments()
			setAppointments(
				data.sort((a, b) =>
					a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
				)
			)
			// Also tell the calendar to reload its own data so changes are visible immediately.
			setCalendarRefreshToken(prev => prev + 1)
		} catch (error) {
			console.error('Error loading appointments:', error)
		}
	}

	const openCancelConfirm = (appointmentId: string) => {
		setCancelConfirmId(appointmentId)
		setCancelConfirmError(null)
	}

	const handleConfirmCancelAppointment = async () => {
		if (!cancelConfirmId) return
		setCancelConfirmLoading(true)
		setCancelConfirmError(null)

		try {
			const result = await adminCancelBooking(cancelConfirmId)
			if (!result.success) {
				setCancelConfirmError(
					result.error || 'Failed to cancel appointment. Please try again.'
				)
				return
			}

				await loadAppointments()
				setSelectedAppointment(null)
				setIsModalOpen(false)
			setCancelConfirmId(null)
		} catch (error) {
			console.error('Error cancelling appointment:', error)
			setCancelConfirmError('Failed to cancel appointment. Please try again.')
		} finally {
			setCancelConfirmLoading(false)
		}
	}

	const handleCloseCancelDialog = () => {
		if (cancelConfirmLoading) return
		setCancelConfirmId(null)
		setCancelConfirmError(null)
	}

	const appointmentToCancel = useMemo(
		() => appointments.find(a => a.id === cancelConfirmId) ?? null,
		[appointments, cancelConfirmId]
	)

	const handleOpenEditModal = (appointment: Appointment) => {
		setSelectedAppointment(appointment)
		setModalMode('edit')
		setIsModalOpen(true)
	}

	const handleSaveAppointment = async (data: BookingFormData) => {
		if (modalMode === 'add') {
			return await adminCreateBooking(data)
		} else {
			if (!selectedAppointment?.id) {
				return { success: false, error: 'Appointment ID is missing' }
			}
			return await adminUpdateBooking(selectedAppointment.id, data)
		}
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedAppointment(null)
	}

	const handleCalendarAppointmentCreate = (date: string, time: string) => {
		// Pre-fill the form with date and time from calendar selection
		setModalMode('add')
		setSelectedAppointment({
			id: undefined,
			customerName: '',
			customerEmail: undefined,
			customerPhone: undefined,
			date,
			time,
			status: 'confirmed',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
		setIsModalOpen(true)
	}

	const handleCalendarAppointmentMove = async (
		appointmentId: string,
		newDate: string,
		newTime: string
	) => {
		try {
			const result = await adminUpdateBooking(appointmentId, {
				date: newDate,
				time: newTime,
			})

			if (result.success) {
				await loadAppointments()
			} else {
				alert(result.error || 'Failed to move appointment')
				// Reload to revert visual change
				await loadAppointments()
			}
		} catch (error) {
			console.error('Error moving appointment:', error)
			alert('Failed to move appointment')
			// Reload to revert visual change
			await loadAppointments()
		}
	}

	if (status === 'loading') {
		return (
			<div
				className='min-h-screen bg-gradient-to-r from-amber-50 via-white to-amber-50 flex items-center justify-center'
				role='status'
				aria-live='polite'
				aria-label='Loading admin dashboard'
			>
				<div className='flex flex-col items-center gap-3'>
					<svg
						className='animate-spin h-8 w-8 text-amber-500'
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
					<p className='text-sm sm:text-base text-zinc-600 font-medium'>Loading...</p>
				</div>
			</div>
		)
	}

	if (status === 'unauthenticated') {
		return null
	}

	return (
		<div className='min-h-screen bg-gradient-to-r from-amber-50 via-white to-amber-50'>
			{/* Header */}
			<header
				className='bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm'
				role='banner'
			>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4'>
					<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
						<div>
							<h1 className='text-xl sm:text-2xl font-bold text-zinc-900'>
								Admin Dashboard
							</h1>
							<p className='text-xs sm:text-sm text-zinc-600 mt-0.5'>
								Logged in as <span className='font-medium'>{session?.user?.email}</span>
							</p>
						</div>
						<div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto'>
							<a
								href='/admin/analytics'
								className='text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-zinc-100 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
								aria-label='View analytics'
							>
								Analytics
							</a>
							<a
								href='/book'
								className='text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-zinc-100 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
								aria-label='View public booking page'
							>
								View Public Booking
							</a>
							<button
								type='button'
								onClick={() => signOut({ callbackUrl: '/admin/login' })}
								aria-label='Sign out of admin account'
								className='group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white shadow-lg transition-all duration-300 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] font-medium min-h-[36px] sm:min-h-[40px] flex items-center justify-center focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
							>
								{/* Shimmer animation overlay */}
								<span
									className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out'
									aria-hidden='true'
								/>
								{/* Glow effect */}
								<span
									className='absolute inset-0 rounded-lg bg-red-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10'
									aria-hidden='true'
								/>
								<span className='relative z-10'>Sign Out</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			<main
				className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8'
				role='main'
			>
				<div className='space-y-6 sm:space-y-8'>
					{/* Calendar Section - Full Width */}
					<section
						className='w-full'
						aria-labelledby='calendar-section-title'
					>
						<div className='bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6'>
							<h2
								id='calendar-section-title'
								className='text-xl sm:text-2xl font-bold text-zinc-900 mb-3 sm:mb-4'
							>
								Manage Availability
							</h2>
							<p className='text-xs sm:text-sm text-zinc-600 mb-4 sm:mb-6 leading-relaxed'>
								Manage working days and hours. In time grid views: click empty slots
								to create appointments, drag appointments to move them.
							</p>
							<AdminCalendar
								refreshToken={calendarRefreshToken}
								onAvailabilityChange={loadAppointments}
								onAppointmentCreate={handleCalendarAppointmentCreate}
								onAppointmentMove={handleCalendarAppointmentMove}
								onAppointmentClick={appointmentId => {
									const found = appointments.find(a => a.id === appointmentId)
									if (found) handleOpenEditModal(found)
								}}
							/>
						</div>
					</section>
				</div>
			</main>

			{/* Appointment Modal */}
			<AppointmentModal
				isOpen={isModalOpen}
				appointment={selectedAppointment}
				mode={modalMode}
				onClose={handleCloseModal}
				onCancelBooking={async id => {
					if (id) openCancelConfirm(id)
				}}
				onSave={async (data) => {
					const result = await handleSaveAppointment(data)
					if (result.success) {
						await loadAppointments()
					}
					return result
				}}
			/>

			{/* Styled cancel confirmation dialog */}
			<ConfirmDialog
				open={!!cancelConfirmId}
				title='Cancel this appointment?'
				description={
					appointmentToCancel
						? `This will cancel the appointment for ${appointmentToCancel.customerName} on ${appointmentToCancel.date} at ${appointmentToCancel.time}.`
						: 'This will cancel the selected appointment.'
				}
				confirmLabel='Cancel appointment'
				cancelLabel='Keep appointment'
				tone='danger'
				isLoading={cancelConfirmLoading}
				errorMessage={cancelConfirmError}
				onConfirm={handleConfirmCancelAppointment}
				onCancel={handleCloseCancelDialog}
			/>
		</div>
	)
}

