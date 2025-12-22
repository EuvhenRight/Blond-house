'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
	getAppointments,
	adminCancelBooking,
} from '../../actions/appointments'
import AdminCalendar from '../../components/admin/AdminCalendar'
import type { Appointment } from '../../lib/types'

export default function AdminDashboard() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null)

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
								className='px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors'
							>
								Sign Out
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
								Click on a date to add time slots. Click on an existing time
								slot to remove it.
							</p>
							<AdminCalendar onAvailabilityChange={loadAppointments} />
						</div>
					</div>

					{/* Appointments List */}
					<div className='lg:col-span-1'>
						<div className='bg-white rounded-2xl shadow-lg p-6 sticky top-4'>
							<h2 className='text-2xl font-bold text-zinc-900 mb-6'>
								Appointments
							</h2>

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
												className='border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 cursor-pointer'
												onClick={() => setSelectedAppointment(appointment)}
											>
												<div className='flex items-start justify-between'>
													<div className='flex-1'>
														<p className='font-semibold text-zinc-900'>
															{appointment.customerName}
														</p>
														<p className='text-sm text-zinc-600'>
															{new Date(appointment.date).toLocaleDateString('en-US', {
																month: 'short',
																day: 'numeric',
															})}{' '}
															at {appointment.time}
														</p>
														<p className='text-xs text-zinc-500 mt-1'>
															{appointment.customerEmail}
														</p>
														<p className='text-xs text-zinc-500'>
															{appointment.customerPhone}
														</p>
													</div>
													<button
														onClick={(e) => {
															e.stopPropagation()
															if (appointment.id) {
																handleCancelAppointment(appointment.id)
															}
														}}
														className='ml-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors'
													>
														Cancel
													</button>
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
		</div>
	)
}

