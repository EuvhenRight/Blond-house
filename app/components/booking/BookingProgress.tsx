'use client'

import { useEffect, useState } from 'react'

interface BookingProgressProps {
	currentStep: 'service' | 'date' | 'time' | 'details'
}

const steps = [
	{ id: 'service', label: 'Service', number: 1 },
	{ id: 'date', label: 'Date', number: 2 },
	{ id: 'time', label: 'Time', number: 3 },
	{ id: 'details', label: 'Details', number: 4 },
] as const

export default function BookingProgress({ currentStep }: BookingProgressProps) {
	const currentStepIndex = steps.findIndex(step => step.id === currentStep)
	const [isScrolled, setIsScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY
			setIsScrolled(scrollY > 50)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<nav
			aria-label='Booking progress'
			className={`transition-all duration-300 ease-out ${
				isScrolled ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
			}`}
		>
			<ol className='flex items-center justify-between relative' role='list'>
				{/* Background connector line */}
				<div
					className={`absolute left-0 right-0 h-0.5 bg-zinc-200 -z-10 transition-all duration-300 ${
						isScrolled ? 'top-3' : 'top-3.5'
					}`}
					aria-hidden='true'
				/>
				{/* Active connector line */}
				{currentStepIndex > 0 && (
					<div
						className={`absolute h-0.5 bg-amber-500 transition-all duration-500 -z-10 ${
							isScrolled ? 'top-3' : 'top-3.5'
						}`}
						style={{
							left: '12.5%',
							width: `${(currentStepIndex / (steps.length - 1)) * 75}%`,
						}}
						aria-hidden='true'
					/>
				)}
				{steps.map((step, index) => {
					const isCompleted = index < currentStepIndex
					const isCurrent = index === currentStepIndex
					const isUpcoming = index > currentStepIndex

					return (
						<li
							key={step.id}
							className='flex flex-col items-center flex-1 relative z-10'
							aria-current={isCurrent ? 'step' : undefined}
						>
							{/* Step Circle */}
							<div
								className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
									isScrolled
										? 'w-7 h-7'
										: 'w-8 h-8'
								} ${
									isCompleted
										? 'bg-amber-500 border-amber-500 text-white shadow-md'
										: isCurrent
										? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
										: 'bg-white border-zinc-300 text-zinc-400'
								}`}
								aria-hidden='true'
							>
								{isCompleted ? (
									<svg
										className={`transition-all duration-300 ${
											isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
										}`}
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
								) : (
									<span
										className={`font-semibold transition-all duration-300 ${
											isScrolled
												? 'text-sm'
												: 'text-base'
										} ${
											isCurrent ? 'text-amber-700' : 'text-zinc-400'
										}`}
									>
										{step.number}
									</span>
								)}
							</div>

							{/* Step Label */}
							<span
								className={`font-medium transition-all duration-300 text-center px-0.5 ${
									isScrolled
										? 'mt-1 text-xs'
										: 'mt-1.5 text-sm'
								} ${
									isCurrent
										? 'text-amber-700 font-semibold'
										: isCompleted
										? 'text-zinc-700'
										: 'text-zinc-400'
								}`}
							>
								{step.label}
							</span>

							{/* Screen reader text */}
							<span className='sr-only'>
								{isCompleted && `Step ${step.number}: ${step.label} completed`}
								{isCurrent && `Step ${step.number}: ${step.label} current`}
								{isUpcoming && `Step ${step.number}: ${step.label} upcoming`}
							</span>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
