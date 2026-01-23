'use client'

import { useEffect, useRef, useState } from 'react'
import GlassSection from '../GlassSection'

export default function JourneyPrincipleSection() {
	const [isJourneyVisible, setIsJourneyVisible] = useState(false)
	const [isPrincipleVisible, setIsPrincipleVisible] = useState(false)
	const journeySectionRef = useRef<HTMLElement>(null)

	// Intersection Observer for journey section animation
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsJourneyVisible(true)
					}
				})
			},
			{
				threshold: 0.3,
				rootMargin: '0px 0px -100px 0px',
			}
		)

		const currentRef = journeySectionRef.current
		if (currentRef) {
			observer.observe(currentRef)
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef)
			}
		}
	}, [])

	// Intersection Observer for principle section animation (same section as journey)
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsPrincipleVisible(true)
					}
				})
			},
			{
				threshold: 0.3,
				rootMargin: '0px 0px -100px 0px',
			}
		)

		// Use the same ref as journey section since they're in the same section now
		const currentRef = journeySectionRef.current
		if (currentRef) {
			observer.observe(currentRef)
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef)
			}
		}
	}, [])

	return (
		<section 
			ref={journeySectionRef}
			className='py-12 sm:py-16 md:py-20 bg-linear-to-br from-amber-50/50 via-white to-amber-50/50'
		>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch'>
					{/* Left Glass Section - A Little About the Journey */}
					<div className='flex justify-start h-full'>
						<GlassSection isVisible={isJourneyVisible} position='left' animationType='left' className='h-full flex flex-col'>
							<div className='text-left flex-1 flex flex-col'>
								<h2 className='font-bold text-zinc-900 mb-6 sm:mb-8'>
									A Little About the Journey
								</h2>
								<div className='prose prose-lg max-w-none flex-1'>
									<p className='text-zinc-700 mb-4'>
										Over the years in this profession, we have gone through commercial,
										technical, and marketing stages.
									</p>
									<p className='text-zinc-700 mb-4'>
										Over time, it became clear:
									</p>
									<div className='my-8 sm:my-12 space-y-4'>
										<p className='text-zinc-800 mb-4 italic'>
											Mastery is not about complicating things.
										</p>
										<p className='text-zinc-800 italic'>
											And it&apos;s not about trying to remake a person.
										</p>
									</div>
									<p className='text-zinc-600'>
										True work lies in the ability to preserve balance between outer
										appearance and inner state.
									</p>
								</div>
							</div>
						</GlassSection>
					</div>

					{/* Right Glass Section - Studio Principle */}
					<div className='flex justify-end h-full'>
						<GlassSection isVisible={isPrincipleVisible} position='right' animationType='right' className='h-full flex flex-col'>
							<div className='text-right flex-1 flex flex-col'>
								<h2 className='font-bold text-zinc-900 mb-6 sm:mb-8'>
									Studio Principle
								</h2>
								<div className='prose prose-lg max-w-none flex-1'>
									<div className='my-8 sm:my-12 space-y-4'>
										<p className='text-zinc-800'>
											The goal is not to make things more complicated, but simpler.
										</p>
										<p className='text-zinc-800'>
											The goal is not to change appearance, but to enhance natural
											beauty and bring it into harmony.
										</p>
									</div>
									<p className='text-zinc-600 italic mt-8'>
										The approach to your hair is
										careful and attentive,
										like one&apos;s own soul.
									</p>
								</div>
							</div>
						</GlassSection>
					</div>
				</div>
			</div>
		</section>
	)
}
