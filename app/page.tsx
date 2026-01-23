'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import AboutSection from './components/home/AboutSection'
import ApproachSection from './components/home/ApproachSection'
import BookingSuccessModal from './components/home/BookingSuccessModal'
import ClosingMessage from './components/home/ClosingMessage'
import Divider from './components/home/Divider'
import HeroSection from './components/home/HeroSection'
import JourneyPrincipleSection from './components/home/JourneyPrincipleSection'
import Services from './components/Services'

function HomeContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [showBookingSuccess, setShowBookingSuccess] = useState(false)

	// Check for booking success parameter
	useEffect(() => {
		const bookingSuccess = searchParams.get('bookingSuccess')
		if (bookingSuccess === 'true') {
			// Use setTimeout to avoid synchronous setState in effect
			setTimeout(() => {
				setShowBookingSuccess(true)
			}, 0)
			// Clean up URL parameter
			router.replace('/', { scroll: false })
		}
	}, [searchParams, router])

	// Handle hash navigation (e.g., when coming from booking page)
	useEffect(() => {
		const hash = window.location.hash
		if (hash) {
			// Wait for page to fully render
			setTimeout(() => {
				const element = document.querySelector(hash)
				if (element) {
					const headerOffset = 80
					const elementPosition = element.getBoundingClientRect().top
					const offsetPosition = elementPosition + window.pageYOffset - headerOffset

					window.scrollTo({
						top: offsetPosition,
						behavior: 'smooth',
					})
				}
			}, 100)
		}
	}, [])

	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50 relative overflow-x-hidden w-full'>
			<BookingSuccessModal 
				isOpen={showBookingSuccess} 
				onClose={() => setShowBookingSuccess(false)} 
			/>

			<main className='w-full max-w-full overflow-x-hidden'>
				<HeroSection />
				<AboutSection />
				<Divider />
				<ApproachSection />
				<Divider />
				<JourneyPrincipleSection />
				<Divider />
				<Services showNotes={true} gridCols='4' showSection={true} />
				<Divider />
				<ClosingMessage />

				{/* <section
					id='features'
					className='mx-auto max-w-6xl px-6 pb-24 pt-16 mt-20 space-y-8'
				>
					<div className='space-y-3'>
						<p className='text-sm font-semibold uppercase tracking-wide text-zinc-500'>
							Why teams choose us
						</p>
						<h2 className='text-3xl font-bold text-zinc-900'>A clear story.</h2>
						<p className='max-w-2xl text-zinc-600'>
							A classic landing highlights value, proof, and a single call to
							action. This layout keeps everything focused on the outcome
							visitors care about most.
						</p>
					</div>
					<div className='grid gap-6 md:grid-cols-3'>
						{features.map(feature => (
							<div
								key={feature.title}
								className='space-y-3 rounded-2xl border border-zinc-200 p-6 shadow-sm'
							>
								<div className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white'>
									•
								</div>
								<h3 className='text-lg font-semibold text-zinc-900'>
									{feature.title}
								</h3>
								<p className='text-sm text-zinc-600'>{feature.desc}</p>
							</div>
						))}
					</div>
				</section>

				<section
					id='how-it-works'
					className='mx-auto max-w-6xl px-6 mt-20 grid gap-10 rounded-3xl py-10 text-zinc-900 md:grid-cols-2'
				>
					<div className='space-y-3'>
						<p className='text-sm font-semibold uppercase tracking-wide text-emerald-200/90'>
							How it works
						</p>
						<h2 className='text-3xl font-bold leading-tight'>
							Guide visitors through a simple, confident story.
						</h2>
						<p className='text-zinc-600'>
							Break the journey into three clear steps so people know exactly
							what happens next.
						</p>
					</div>
					<div className='grid gap-4'>
						{steps.map((step, index) => (
							<div
								key={step.title}
								className='flex gap-4 rounded-2xl border border-zinc-200 p-4'
							>
								<span className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/90 text-base font-semibold text-zinc-900'>
									{index + 1}
								</span>
								<div className='space-y-1'>
									<h3 className='text-lg font-semibold'>{step.title}</h3>
									<p className='text-sm text-zinc-600'>{step.desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section
					id='testimonials'
					className='mx-auto max-w-6xl px-6 mt-20 space-y-6'
				>
					<div className='space-y-2'>
						<p className='text-sm font-semibold uppercase tracking-wide text-zinc-500'>
							Social proof
						</p>
						<h2 className='text-3xl font-bold text-zinc-900'>
							Teams ship with us
						</h2>
					</div>
					<div className='grid gap-6 md:grid-cols-2'>
						{testimonials.map(item => (
							<div
								key={item.name}
								className='space-y-4 rounded-2xl border border-zinc-200 p-6 shadow-sm'
							>
								<p className='text-lg leading-relaxed text-zinc-700'>
									“{item.quote}”
								</p>
								<div className='text-sm font-semibold text-zinc-900'>
									{item.name}
								</div>
								<div className='text-sm text-zinc-500'>{item.role}</div>
							</div>
						))}
					</div>
				</section>

				<section
					id='pricing'
					className='mx-auto max-w-6xl px-6 mt-20 space-y-8'
				>
					<div className='space-y-2 text-center'>
						<p className='text-sm font-semibold uppercase tracking-wide text-zinc-500'>
							Simple pricing
						</p>
						<h2 className='text-3xl font-bold text-zinc-900'>Pick your plan</h2>
						<p className='text-zinc-600'>
							Start free, upgrade when you’re ready. No long-term contracts.
						</p>
					</div>
					<div className='grid gap-6 md:grid-cols-3'>
						{plans.map(plan => (
							<div
								key={plan.name}
								className={`space-y-4 rounded-2xl border p-6 shadow-sm ${
									plan.highlight
										? 'border-zinc-900 bg-zinc-900 text-white'
										: 'border-zinc-200'
								}`}
							>
								<div className='flex items-center justify-between'>
									<h3 className='text-xl font-semibold'>{plan.name}</h3>
									{plan.highlight ? (
										<span className='rounded-full bg-white/10 px-3 py-1 text-xs font-semibold'>
											Popular
										</span>
									) : null}
								</div>
								<div className='text-3xl font-bold'>
									{plan.price}
									{!plan.price.includes('talk') && (
										<span className='text-base font-medium opacity-70'>
											{' '}
											/mo
										</span>
									)}
								</div>
								<ul className='space-y-2 text-sm'>
									{plan.perks.map(perk => (
										<li
											key={perk}
											className='flex items-start gap-2 leading-relaxed'
										>
											<span className='mt-1 h-2 w-2 rounded-full bg-emerald-500' />
											<span
												className={
													plan.highlight ? 'text-white/90' : 'text-zinc-600'
												}
											>
												{perk}
											</span>
										</li>
									))}
								</ul>
								<button
									className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
										plan.highlight
											? 'bg-white text-zinc-900 hover:bg-white/90'
											: 'border border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-100'
									}`}
								>
									Choose plan
								</button>
							</div>
						))}
					</div>
				</section>

				<section className='mx-auto max-w-6xl mt-24 overflow-hidden rounded-3xl px-8 py-12 text-zinc-900 shadow-lg'>
					<div className='grid gap-8 md:grid-cols-2 md:items-center'>
						<div className='space-y-4'>
							<h2 className='text-3xl font-bold leading-tight'>
								Ready to launch your next classic landing?
							</h2>
							<p className='text-zinc-600'>
								Ship a clean, confident page that converts. Start with a solid
								layout, add your story, and go live in minutes.
							</p>
							<div className='flex flex-wrap gap-3'>
								<button className='rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white/90'>
									Start free
								</button>
								<button className='rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10'>
									Talk to sales
								</button>
							</div>
						</div>
						<div className='rounded-2xl border border-zinc-200 p-6'>
							<p className='text-sm font-semibold uppercase tracking-wide text-emerald-200/90'>
								What you get
							</p>
							<ul className='mt-4 space-y-3 text-sm text-zinc-600'>
								<li>• Clean hero with clear CTA</li>
								<li>• Proof-driven feature grid</li>
								<li>• Three-step explainer</li>
								<li>• Testimonials and pricing</li>
								<li>• Conversion-focused final CTA</li>
							</ul>
						</div>
					</div>
				</section> */}
			</main>
		</div>
	)
}

export default function Home() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen flex items-center justify-center'>
					<div className='text-zinc-600'>Loading...</div>
				</div>
			}
		>
			<HomeContent />
		</Suspense>
	)
}
