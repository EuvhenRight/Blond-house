'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import GlassSection from '../GlassSection'

export default function AboutSection() {
	const [isVisible, setIsVisible] = useState(false)
	const sectionRef = useRef<HTMLElement>(null)

	// Intersection Observer for animation
	useEffect(() => {
		let observer: IntersectionObserver | null = null
		const currentRef = sectionRef.current
		
		// Small delay to ensure animation triggers on scroll, not on initial load
		const timer = setTimeout(() => {
			// Check if mobile viewport
			const isMobile = window.innerWidth < 768
			
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							setIsVisible(true)
						}
					})
				},
				{
					threshold: isMobile ? 0.2 : 0.3, // Lower threshold for mobile, higher for desktop
					rootMargin: isMobile ? '0px 0px -100px 0px' : '0px 0px -100px 0px', // Adjusted margin for mobile
				}
			)

			if (currentRef) {
				observer.observe(currentRef)
			}
		}, 100) // Small delay to prevent immediate trigger

		return () => {
			clearTimeout(timer)
			if (observer && currentRef) {
				observer.unobserve(currentRef)
			}
		}
	}, [])

	return (
		<section
			id='about'
			ref={sectionRef}
			className='relative w-full py-12 sm:py-16 md:py-20 overflow-hidden'
		>
			{/* Amsterdam Image - Static, only in this section, behind text */}
			<div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
				<div className='relative w-full h-full opacity-40'>
					<Image
						src='/images/amsterdam_2.png'
						alt='Amsterdam canal houses illustration - A Small Cozy Studio in the Center of Amsterdam'
						width={4800}
						height={2400}
						quality={85}
						className='w-full h-full object-cover'
						priority={false}
						sizes='100vw'
					/>
				</div>
			</div>

			<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12 relative z-10'>
				{/* Glass effect text section with animation from bottom, moved 25% left */}
				<GlassSection isVisible={isVisible} position='left'>
					<div className='text-right mb-8 sm:mb-12'>
						<h2 className='font-bold text-zinc-900 mb-6'>
							A Small Cozy Studio
							<br />
						</h2>
						<h4 className='text-amber-600 italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl'>in the Center of Amsterdam</h4>
					</div>
					<p className='text-zinc-700 mb-8 text-right'>
						This is a small, calm studio with a homely atmosphere, right in the
						heart of Amsterdam.
					</p>
					<p className='text-zinc-600 mb-12 text-right'>
						A space where you can pause, breathe, and dedicate time to yourself.
					</p>

					<div className='my-12 sm:my-16 text-right'>
						<p className='text-zinc-700 mb-4'>
							We work with hair as a living, moving material.
						</p>
						<p className='text-zinc-700 mb-4'>
							Shape, for us, is the foundation of proportion and balance.
						</p>
						<p className='text-zinc-700'>
							Color is not just a shade, but a way to enhance the skin, eyes,
							and the overall sense of a person.
						</p>
					</div>

					<p className='text-zinc-600 text-right mb-12'>
						We carefully study how color interacts with appearance and inner
						state, and use it so that the result looks natural and harmonious.
					</p>
				</GlassSection>
			</div>
		</section>
	)
}
