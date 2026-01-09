'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import { siteConfig } from './lib/constants'
import Services from './components/Services'

export default function Home() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

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
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50'>
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
								<h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-black drop-shadow-lg mb-4 sm:mb-6'>
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

				{/* Services Section */}
				<section
					id='services'
					className='relative w-full py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden'
				>
					{/* Background Image */}
					<div className='absolute inset-0 z-0'>
						<Image
							src='/images/BH-BG.PNG'
							alt='Blond House Salon Interior'
							fill
							className='object-cover w-full h-full'
							sizes='100vw'
							priority={false}
						/>
						{/* Overlay for better text readability */}
						<div className='absolute inset-0 bg-black/20' />
					</div>

					{/* Content Container */}
					<div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
						{/* Section Header */}
						<div className='text-center mb-12 sm:mb-16 md:mb-20'>
							<h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg'>
								Our Services
							</h2>
							<p className='text-lg sm:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md'>
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
