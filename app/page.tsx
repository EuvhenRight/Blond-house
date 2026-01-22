'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import Services from './components/Services'
import { siteConfig } from './lib/constants'

function HomeContent() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const searchParams = useSearchParams()
	const router = useRouter()
	const [showBookingSuccess, setShowBookingSuccess] = useState(false)

	// Check for booking success parameter
	useEffect(() => {
		const bookingSuccess = searchParams.get('bookingSuccess')
		if (bookingSuccess === 'true') {
			setShowBookingSuccess(true)
			// Clean up URL parameter
			router.replace('/', { scroll: false })
		}
	}, [searchParams, router])

	const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20 // Max 20px movement
		const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
		setMousePosition({ x, y })
	}

	const handleMouseLeave = () => {
		setMousePosition({ x: 0, y: 0 })
	}

	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50 relative'>
			{/* Booking success overlay - below header */}
			{showBookingSuccess && (
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
						<h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 mb-3'>
							Booking Confirmed!
						</h2>
						<p className='text-sm sm:text-base md:text-lg text-zinc-600 mb-6 max-w-lg mx-auto'>
							Your appointment has been successfully confirmed. A confirmation
							email has been sent to your email address.
						</p>
						<div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
							<Link
								href='/book'
								onClick={() => setShowBookingSuccess(false)}
								className='px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base'
							>
								Book Another Appointment
							</Link>
							<button
								onClick={() => {
									setShowBookingSuccess(false)
									window.scrollTo({ top: 0, behavior: 'smooth' })
								}}
								className='px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base'
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			<main className='w-full'>
				{/* Hero Section */}
				<section
					className='relative w-full h-screen min-h-[500px] sm:min-h-[600px] md:min-h-[700px] overflow-hidden'
					aria-label='Hero section with hair design services'
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
				>
					{/* Background Image */}
					<div className='absolute inset-0 z-0 w-full h-full mask-b-from-95%'>
						<Image
							src='/images/GoldGirl6.png'
							alt='Hair design studio in Amsterdam'
							fill
							priority
							className='object-cover w-full h-full transition-transform duration-300 ease-out scale-x-[-1]'
							style={{
								transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
							}}
							sizes='100vw'
						/>
						{/* Overlay for better text readability - gradient from right to left */}
						<div className='absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/20' />
					</div>

					{/* Content Container */}
					<div className='relative z-10 h-full flex flex-col p-4 sm:p-6 md:p-8 lg:p-12'>
						{/* Left Side Content */}
						<div className='flex flex-col justify-between max-w-full sm:max-w-xl md:max-w-2xl mt-4 mb-4 sm:mt-8 md:mt-20'>
							{/* Main Title - Middle Left */}
							<div className='mb-auto'>
								<h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-black drop-shadow-lg mb-4 sm:mb-6'>
									{siteConfig.tagline}
									<br />
									{siteConfig.description}
									<br />
									{siteConfig.description_2}
									<br />
									{siteConfig.description_3}
								</h1>
							</div>
							{/* Bottom Icons - Location and WhatsApp */}
							<div className='mt-4 sm:mt-6 md:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6'>
								{/* Address/Location */}
								<Link
									href={siteConfig.googleMaps}
									target='_blank'
									rel='noopener noreferrer'
									className='group relative flex items-center justify-center p-3 sm:p-4'
									aria-label={`View location in ${siteConfig.location} on Google Maps`}
								>
									<FiMapPin
										className='h-5 w-5 sm:h-6 sm:w-6 md:h-10 md:w-10 shrink-0 text-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:scale-y-110 group-hover:text-amber-800'
										style={{
											filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
										}}
										aria-hidden='true'
									/>
								</Link>

								{/* WhatsApp */}
								<Link
									href={siteConfig.whatsapp}
									target='_blank'
									rel='noopener noreferrer'
									className='group relative flex items-center justify-center p-3 sm:p-4'
									aria-label='Contact via WhatsApp'
								>
									<ImWhatsapp
										className='h-5 w-5 sm:h-6 sm:w-6 md:h-10 md:w-10 shrink-0 text-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:scale-y-110 group-hover:text-amber-800'
										style={{
											filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
										}}
										aria-hidden='true'
									/>
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* About Section */}
				<section id='about' className='relative w-full py-12 sm:py-16 md:py-20 lg:py-24'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<div className='text-center mb-12 sm:mb-16'>
							<h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 leading-tight'>
								A Small Cozy Studio
								<br />
								<span className='text-amber-600'>in the Center of Amsterdam</span>
							</h2>
						</div>

						<div className='prose prose-lg max-w-none'>
							<p className='text-lg sm:text-xl md:text-2xl text-zinc-700 leading-relaxed mb-8 text-center'>
								This is a small, calm studio with a homely atmosphere, right in the
								heart of Amsterdam.
							</p>
							<p className='text-base sm:text-lg md:text-xl text-zinc-600 leading-relaxed mb-12 text-center'>
								A space where you can pause, breathe, and dedicate time to yourself.
							</p>

							<div className='my-12 sm:my-16 text-center'>
								<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
									We work with hair as a living, moving material.
								</p>
								<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
									Shape, for us, is the foundation of proportion and balance.
								</p>
								<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
									Color is not just a shade, but a way to enhance the skin, eyes,
									and the overall sense of a person.
								</p>
							</div>

							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center mb-12'>
								We carefully study how color interacts with appearance and inner
								state, and use it so that the result looks natural and harmonious.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Approach and Experience */}
				<section className='py-12 sm:py-16 md:py-20'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							Approach and Experience
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								The studio's founder is <span className='font-semibold'>Yuriy</span>.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								He has many years of experience working with and teaching students,
								and is also the creator of the courses{' '}
								<span className='italic'>"The Art of Shape"</span> and{' '}
								<span className='italic'>"The Art of Color"</span>.
							</p>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center'>
								Our approach combines technique, observation, and a sense of measure.
								The goal is not to change nature, but to gently highlight what is
								already there.
							</p>
						</div>

						{/* Portfolio Gallery */}
						<div className='mt-12 sm:mt-16'>
							<h3 className='text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-900 mb-6 sm:mb-8 text-center'>
								His Works
							</h3>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
								{[
									{ src: '/images/IMG_2106.jpg', alt: 'Hair design work - long wavy brown hair with golden highlights' },
									{ src: '/images/IMG_2112.jpeg', alt: 'Hair design work - blonde balayage with natural waves' },
									{ src: '/images/IMG_2117.jpg', alt: 'Hair design work - creative color with purple and blonde' },
									{ src: '/images/IMG_2120.jpg', alt: 'Hair design work - voluminous blonde waves' },
									{ src: '/images/IMG_2122.jpg', alt: 'Hair design work - layered blonde with natural texture' },
									{ src: '/images/IMG_2164.jpg', alt: 'Hair design work - ombré with pink-blonde tones' },
								].map((image, index) => (
									<div
										key={index}
										className='group relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'
									>
										<Image
											src={image.src}
											alt={image.alt}
											fill
											className='object-cover transition-transform duration-500 group-hover:scale-110'
											sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
										/>
										{/* Overlay on hover */}
										<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300'></div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Who This Studio Is For */}
				<section className='py-12 sm:py-16 md:py-20 bg-white/50'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							Who This Studio Is For
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								Our clients are our friends.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								People who come alone or with loved ones, to relax, feel cared for,
								and achieve results without rush or pressure.
							</p>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center'>
								There are no templates or imposed solutions here. Every look is
								created individually — in accordance with your features, rhythm, and
								sense of self.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* A Little About the Journey */}
				<section className='py-12 sm:py-16 md:py-20'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							A Little About the Journey
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								Over the years in this profession, we have gone through commercial,
								technical, and marketing stages.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								Over time, it became clear:
							</p>
							<div className='my-8 sm:my-12 text-center'>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed mb-4 italic'>
									Mastery is not about complicating things.
								</p>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed italic'>
									And it's not about trying to remake a person.
								</p>
							</div>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center'>
								True work lies in the ability to preserve balance between outer
								appearance and inner state.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Studio Principle */}
				<section className='py-12 sm:py-16 md:py-20 bg-white/50'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							Studio Principle
						</h2>
						<div className='prose prose-lg max-w-none'>
							<div className='my-8 sm:my-12 text-center space-y-4'>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed'>
									The goal is not to make things more complicated, but simpler.
								</p>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed'>
									The goal is not to change appearance, but to enhance natural
									beauty and bring it into harmony.
								</p>
							</div>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center italic mt-8'>
								The approach to your hair is careful and attentive, like one's own
								soul.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Closing Message */}
				<section className='py-12 sm:py-16 md:py-20'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<div className='text-center'>
							<p className='text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 mb-4'>
								Everyone is welcome.
							</p>
							<p className='text-xl sm:text-2xl md:text-3xl text-zinc-700 italic'>
								Here, you can just be.
							</p>
						</div>
					</div>
				</section>

				{/* Services Section */}
				<section
					id='services'
					className='relative w-full py-16 sm:py-20 md:py-24 lg:py-32'
				>
					{/* Content Container */}
					<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
						{/* Section Header */}
						<div className='text-center mb-12 sm:mb-16 md:mb-20'>
							<h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 mb-4'>
								Our Services
							</h2>
							<p className='text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto'>
								Professional hair design services tailored to your unique style
							</p>
						</div>

						{/* Services Grid */}
						<Services showNotes={true} gridCols='4' />
					</div>
				</section>

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
