'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
	getAppointments,
	adminCancelBooking,
	adminCreateBooking,
	adminUpdateBooking,
	adminDeleteBooking,
} from '../../actions/appointments'
import AdminCalendar from '../../components/admin/AdminCalendar'
import AppointmentModal from '../../components/admin/AppointmentModal'
import type { Appointment, BookingFormData } from '../../lib/types'

export default function AdminDashboard() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')

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
		setIsLoading(true)
		try {
			const data = await getAppointments()
			setAppointments(data.sort((a, b) => {
				if (a.date !== b.date) {
					return a.date.localeCompare(b.date)
				}
				return a.time.localeCompare(b.time)
			}))
		} catch (error) {
			console.error('Error loading appointments:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCancelAppointment = async (appointmentId: string) => {
		if (!confirm('Are you sure you want to cancel this appointment?')) {
			return
		}

		try {
			const result = await adminCancelBooking(appointmentId)
			if (result.success) {
				await loadAppointments()
				setSelectedAppointment(null)
			} else {
				alert(result.error || 'Failed to cancel appointment')
			}
		} catch (error) {
			console.error('Error cancelling appointment:', error)
			alert('Failed to cancel appointment')
		}
	}

	const handleDeleteAppointment = async (appointmentId: string) => {
		if (
			!confirm(
				'Are you sure you want to permanently delete this appointment? This action cannot be undone.'
			)
		) {
			return
		}

		try {
			const result = await adminDeleteBooking(appointmentId)
			if (result.success) {
				await loadAppointments()
				setSelectedAppointment(null)
				setIsModalOpen(false)
			} else {
				alert(result.error || 'Failed to delete appointment')
			}
		} catch (error) {
			console.error('Error deleting appointment:', error)
			alert('Failed to delete appointment')
		}
	}

	const handleOpenAddModal = () => {
		setSelectedAppointment(null)
		setModalMode('add')
		setIsModalOpen(true)
	}

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
			<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50 flex items-center justify-center'>
				<div className='text-zinc-600'>Loading...</div>
			</div>
		)
	}

	if (status === 'unauthenticated') {
		return null
	}

	const confirmedAppointments = appointments.filter(
		(apt) => apt.status === 'confirmed'
	)
	const cancelledAppointments = appointments.filter(
		(apt) => apt.status === 'cancelled'
	)

	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50'>
			{/* Header */}
			<header className='bg-white border-b border-zinc-200'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-4'>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-2xl font-bold text-zinc-900'>
								Admin Dashboard
							</h1>
							<p className='text-sm text-zinc-600'>
								Logged in as {session?.user?.email}
							</p>
						</div>
						<div className='flex items-center gap-4'>
							<a
								href='/book'
								className='text-sm text-zinc-600 hover:text-zinc-900'
							>
								View Public Booking
							</a>
							<button
								onClick={() => signOut({ callbackUrl: '/admin/login' })}
								className='group relative overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-sm text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium'
							>
								{/* Shimmer animation overlay */}
								<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
								{/* Glow effect */}
								<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
								<span className='relative z-10'>Sign Out</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-8'>
				<div className='grid gap-8 lg:grid-cols-3'>
					{/* Calendar Section */}
					<div className='lg:col-span-2'>
						<div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
							<h2 className='text-2xl font-bold text-zinc-900 mb-6'>
								Manage Availability
							</h2>
							<p className='text-sm text-zinc-600 mb-6'>
								Manage working days and hours. In time grid views: click empty slots to create appointments, drag appointments to move them.
							</p>
							<AdminCalendar
								onAvailabilityChange={loadAppointments}
								onAppointmentCreate={handleCalendarAppointmentCreate}
								onAppointmentMove={handleCalendarAppointmentMove}
							/>
						</div>
					</div>

					{/* Appointments List */}
					<div className='lg:col-span-1'>
						<div className='bg-white rounded-2xl shadow-lg p-6 sticky top-4'>
							<div className='flex items-center justify-between mb-6'>
								<h2 className='text-2xl font-bold text-zinc-900'>
									Appointments
								</h2>
								<button
									onClick={handleOpenAddModal}
									className='group relative overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-sm text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium'
								>
									{/* Shimmer animation overlay */}
									<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
									{/* Glow effect */}
									<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
									<span className='relative z-10'>+ Add</span>
								</button>
							</div>

							{isLoading ? (
								<div className='text-zinc-600'>Loading...</div>
							) : (
								<div className='space-y-4'>
									{confirmedAppointments.length === 0 ? (
										<p className='text-zinc-600 text-sm'>No upcoming appointments</p>
									) : (
										confirmedAppointments.map((appointment) => (
											<div
												key={appointment.id}
												className='border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50'
											>
												<div className='flex items-start justify-between'>
													<div className='flex-1'>
														<p className='font-semibold text-zinc-900'>
															{appointment.customerName}
														</p>
														{appointment.serviceName && (
															<p className='text-sm font-medium text-amber-600 mt-1'>
																{appointment.serviceName}
																{appointment.duration && (
																	<span className='text-zinc-500 ml-2'>
																		({Math.floor(appointment.duration / 60)}h{' '}
																		{appointment.duration % 60 > 0
																			? `${appointment.duration % 60}min`
																			: ''}
																		)
																	</span>
																)}
															</p>
														)}
														<p className='text-sm text-zinc-600'>
															{new Date(appointment.date).toLocaleDateString('en-US', {
																month: 'short',
																day: 'numeric',
															})}{' '}
															at {appointment.time}
														</p>
														{appointment.customerEmail && (
															<p className='text-xs text-zinc-500 mt-1'>
																{appointment.customerEmail}
															</p>
														)}
														{appointment.customerPhone && (
															<p className='text-xs text-zinc-500'>
																{appointment.customerPhone}
															</p>
														)}
														{!appointment.customerEmail && (
															<p className='text-xs text-amber-600 mt-1 italic'>
																Blocked time slot (no customer)
															</p>
														)}
													</div>
													<div className='flex flex-col gap-2 ml-2'>
														<button
															onClick={(e) => {
																e.stopPropagation()
																handleOpenEditModal(appointment)
															}}
															className='group relative overflow-hidden rounded bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-1 text-xs text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium'
														>
															{/* Shimmer animation overlay */}
															<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
															{/* Glow effect */}
															<span className='absolute inset-0 rounded bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
															<span className='relative z-10'>Edit</span>
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation()
																if (appointment.id) {
																	handleDeleteAppointment(appointment.id)
																}
															}}
															className='group relative overflow-hidden rounded bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-1 text-xs text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium'
														>
															{/* Shimmer animation overlay */}
															<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
															{/* Glow effect */}
															<span className='absolute inset-0 rounded bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
															<span className='relative z-10'>Delete</span>
														</button>
														<button
															onClick={(e) => {
																e.stopPropagation()
																if (appointment.id) {
																	handleCancelAppointment(appointment.id)
																}
															}}
															className='group relative overflow-hidden rounded bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-1 text-xs text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 font-medium'
														>
															{/* Shimmer animation overlay */}
															<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
															{/* Glow effect */}
															<span className='absolute inset-0 rounded bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
															<span className='relative z-10'>Cancel</span>
														</button>
													</div>
												</div>
											</div>
										))
									)}

									{cancelledAppointments.length > 0 && (
										<div className='mt-8 pt-8 border-t border-zinc-200'>
											<h3 className='text-sm font-semibold text-zinc-600 mb-4'>
												Cancelled ({cancelledAppointments.length})
											</h3>
											<div className='space-y-2'>
												{cancelledAppointments.map((appointment) => (
													<div
														key={appointment.id}
														className='border border-zinc-200 rounded-lg p-3 opacity-60'
													>
														<p className='text-sm font-medium text-zinc-700'>
															{appointment.customerName}
														</p>
														<p className='text-xs text-zinc-500'>
															{new Date(appointment.date).toLocaleDateString('en-US', {
																month: 'short',
																day: 'numeric',
															})}{' '}
															at {appointment.time}
														</p>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</main>

			{/* Appointment Modal */}
			<AppointmentModal
				isOpen={isModalOpen}
				appointment={selectedAppointment}
				mode={modalMode}
				onClose={handleCloseModal}
				onSave={async (data) => {
					const result = await handleSaveAppointment(data)
					if (result.success) {
						await loadAppointments()
					}
					return result
				}}
			/>
		</div>
	)
}

