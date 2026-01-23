'use client'

import Link from 'next/link'

interface BookingSuccessModalProps {
	isOpen: boolean
	onClose: () => void
}

export default function BookingSuccessModal({ isOpen, onClose }: BookingSuccessModalProps) {
	if (!isOpen) return null

	return (
		<div
			className='fixed top-20 inset-x-0 bottom-0 z-50 flex items-center justify-center'
			role='dialog'
			aria-modal='true'
			aria-live='polite'
			aria-atomic='true'
		>
			<div className='text-center px-6 sm:px-8 py-8 sm:py-10 max-w-lg mx-auto rounded-2xl backdrop-blur-md border border-zinc-200/80 shadow-xl bg-white/10 animate-in fade-in zoom-in duration-500'>
				<div
					className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 mb-4 animate-in zoom-in duration-500'
					aria-hidden='true'
				>
					<svg
						className='w-8 h-8 sm:w-10 sm:h-10 text-green-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						aria-hidden='true'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2.5}
							d='M5 13l4 4L19 7'
						/>
					</svg>
				</div>
				<h2 className='font-bold text-zinc-900 mb-3'>
					Booking Confirmed!
				</h2>
				<p className='text-zinc-600 mb-6 max-w-lg mx-auto'>
					Your appointment has been successfully confirmed. A confirmation
					email has been sent to your email address.
				</p>
				<div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
					<Link
						href='/book'
						onClick={onClose}
						className='px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base'
					>
						Book Another Appointment
					</Link>
					<button
						onClick={() => {
							onClose()
							window.scrollTo({ top: 0, behavior: 'smooth' })
						}}
						className='px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base'
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
