'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAppointments } from '../../actions/appointments'
import type { Appointment } from '../../lib/types'
import { services } from '../../lib/services'

function formatDate(dateStr: string): string {
	const d = new Date(dateStr + 'T12:00:00')
	return d.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

export default function AdminAnalyticsPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [filterDateFrom, setFilterDateFrom] = useState('')
	const [filterDateTo, setFilterDateTo] = useState('')
	const [filterServiceId, setFilterServiceId] = useState<string>('')

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
		setLoading(true)
		try {
			const data = await getAppointments()
			setAppointments(
				data.sort((a, b) =>
					a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)
				)
			)
		} catch (error) {
			console.error('Error loading appointments:', error)
		} finally {
			setLoading(false)
		}
	}

	const filtered = useMemo(() => {
		let list = [...appointments]
		const q = search.trim().toLowerCase()
		if (q) {
			list = list.filter(
				apt =>
					(apt.customerName?.toLowerCase().includes(q) ?? false) ||
					(apt.customerPhone?.toLowerCase().includes(q) ?? false) ||
					(apt.customerPhone?.replace(/\s/g, '').includes(q) ?? false)
			)
		}
		if (filterDateFrom) {
			list = list.filter(apt => apt.date >= filterDateFrom)
		}
		if (filterDateTo) {
			list = list.filter(apt => apt.date <= filterDateTo)
		}
		if (filterServiceId) {
			list = list.filter(apt => apt.serviceId === filterServiceId)
		}
		return list
	}, [appointments, search, filterDateFrom, filterDateTo, filterServiceId])

	if (status === 'loading' || (status === 'authenticated' && loading && appointments.length === 0)) {
		return (
			<div
				className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50 flex items-center justify-center'
				role='status'
				aria-live='polite'
				aria-label='Loading analytics'
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
						/>
						<path
							className='opacity-75'
							fill='currentColor'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
						/>
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
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50'>
			<header
				className='bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm'
				role='banner'
			>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4'>
					<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
						<div>
							<h1 className='text-xl sm:text-2xl font-bold text-zinc-900'>
								Analytics
							</h1>
							<p className='text-xs sm:text-sm text-zinc-600 mt-0.5'>
								Logged in as <span className='font-medium'>{session?.user?.email}</span>
							</p>
						</div>
						<div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto flex-wrap'>
							<Link
								href='/admin/dashboard'
								className='text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-zinc-100 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
								aria-label='Back to dashboard'
							>
								Dashboard
							</Link>
							<Link
								href='/book'
								className='text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-zinc-100 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
								aria-label='View public booking page'
							>
								View Public Booking
							</Link>
							<button
								type='button'
								onClick={() => signOut({ callbackUrl: '/admin/login' })}
								aria-label='Sign out of admin account'
								className='rounded-lg bg-red-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
							>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			</header>

			<main
				className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8'
				role='main'
			>
				<section
					className='bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden'
					aria-labelledby='analytics-title'
				>
					<div className='p-4 sm:p-6 border-b border-zinc-200'>
						<h2
							id='analytics-title'
							className='text-lg sm:text-xl font-bold text-zinc-900 mb-4'
						>
							All appointments
						</h2>

						{/* Search */}
						<div className='mb-4'>
							<label htmlFor='analytics-search' className='sr-only'>
								Search by name or phone
							</label>
							<input
								id='analytics-search'
								type='search'
								placeholder='Search by name or phone...'
								value={search}
								onChange={e => setSearch(e.target.value)}
								className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'
								aria-label='Search by name or phone'
							/>
						</div>

						{/* Filters */}
						<div className='flex flex-wrap items-center gap-3 sm:gap-4'>
							<div className='flex items-center gap-2'>
								<label htmlFor='filter-date-from' className='text-xs sm:text-sm text-zinc-600 whitespace-nowrap'>
									From
								</label>
								<input
									id='filter-date-from'
									type='date'
									value={filterDateFrom}
									onChange={e => setFilterDateFrom(e.target.value)}
									className='rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'
									aria-label='Filter from date'
								/>
							</div>
							<div className='flex items-center gap-2'>
								<label htmlFor='filter-date-to' className='text-xs sm:text-sm text-zinc-600 whitespace-nowrap'>
									To
								</label>
								<input
									id='filter-date-to'
									type='date'
									value={filterDateTo}
									onChange={e => setFilterDateTo(e.target.value)}
									className='rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'
									aria-label='Filter to date'
								/>
							</div>
							<div className='flex items-center gap-2'>
								<label htmlFor='filter-service' className='text-xs sm:text-sm text-zinc-600 whitespace-nowrap'>
									Service
								</label>
								<select
									id='filter-service'
									value={filterServiceId}
									onChange={e => setFilterServiceId(e.target.value)}
									className='rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-[140px]'
									aria-label='Filter by service'
								>
									<option value=''>All services</option>
									{services.map(svc => (
										<option key={svc.id} value={svc.id}>
											{svc.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Table */}
					<div className='overflow-x-auto'>
						<table className='w-full text-left' role='grid' aria-label='Appointments table'>
							<thead>
								<tr className='border-b border-zinc-200 bg-zinc-50'>
									<th scope='col' className='px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap'>
										Date
									</th>
									<th scope='col' className='px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap'>
										Services
									</th>
									<th scope='col' className='px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap'>
										Name
									</th>
									<th scope='col' className='px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap'>
										E‑mail
									</th>
									<th scope='col' className='px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 whitespace-nowrap'>
										Phone
									</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td colSpan={5} className='px-4 py-8 text-center text-sm text-zinc-500'>
											{appointments.length === 0
												? 'No appointments yet.'
												: 'No appointments match the current filters.'}
										</td>
									</tr>
								) : (
									filtered.map(apt => (
										<tr
											key={apt.id ?? `${apt.date}-${apt.time}-${apt.customerName}`}
											className='border-b border-zinc-100 hover:bg-amber-50/50'
										>
											<td className='px-4 py-3 text-sm text-zinc-900 whitespace-nowrap'>
												{formatDate(apt.date)}
											</td>
											<td className='px-4 py-3 text-sm text-zinc-700'>
												{apt.serviceName ?? '—'}
											</td>
											<td className='px-4 py-3 text-sm font-medium text-zinc-900'>
												{apt.customerName || '—'}
											</td>
											<td className='px-4 py-3 text-sm text-zinc-700'>
												{apt.customerEmail || '—'}
											</td>
											<td className='px-4 py-3 text-sm text-zinc-700'>
												{apt.customerPhone || '—'}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</section>
			</main>
		</div>
	)
}
