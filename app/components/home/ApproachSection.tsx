'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import GlassSection from '../GlassSection'

const portfolioImages = [
	{ src: '/images/IMG_2162.jpg', alt: 'Hair design work - long wavy brown hair with golden highlights' },
	{ src: '/images/IMG_2112.jpeg', alt: 'Hair design work - blonde balayage with natural waves' },
	{ src: '/images/IMG_2117.jpg', alt: 'Hair design work - creative color with purple and blonde' },
	{ src: '/images/IMG_2120.jpg', alt: 'Hair design work - voluminous blonde waves' },
	{ src: '/images/IMG_2122.jpg', alt: 'Hair design work - layered blonde with natural texture' },
	{ src: '/images/IMG_2164.jpg', alt: 'Hair design work - ombré with pink-blonde tones' },
]

export default function ApproachSection() {
	const [isApproachVisible, setIsApproachVisible] = useState(false)
	const [isWhoVisible, setIsWhoVisible] = useState(false)
	const approachSectionRef = useRef<HTMLElement>(null)
	const whoSectionRef = useRef<HTMLDivElement>(null)

	// Intersection Observer for approach section animation
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsApproachVisible(true)
					}
				})
			},
			{
				threshold: 0.1, // Trigger earlier - when only 10% is visible
				rootMargin: '200px 0px 0px 0px', // Start animation 200px before element enters viewport
			}
		)

		const currentRef = approachSectionRef.current
		if (currentRef) {
			observer.observe(currentRef)
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef)
			}
		}
	}, [])

	// Intersection Observer for who section animation
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsWhoVisible(true)
					}
				})
			},
			{
				threshold: 0.4, // Trigger when 60% of the element is visible (later)
				rootMargin: '0px 0px -160px 0px', // Start animation later - element needs to be more in viewport
			}
		)

		const currentRef = whoSectionRef.current
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
			ref={approachSectionRef}
			className='relative py-12 sm:py-16 md:py-20'
		>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
					{/* Portfolio Gallery - Left side */}
					<div className='order-2 lg:order-1'>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-full'>
							{portfolioImages.map((image, index) => (
								<div
									key={index}
									className='group relative aspect-3/4 overflow-hidden rounded-lg bg-zinc-100 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'
								>
									<Image
										src={image.src}
										alt={image.alt}
										fill
										quality={90}
										className='object-cover transition-transform duration-500 group-hover:scale-110'
										sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
									/>
									{/* Overlay on hover */}
									<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300'></div>
								</div>
							))}
						</div>
					</div>

					{/* Glass effect text sections - Right side */}
					<div className='order-1 lg:order-2 relative z-10 space-y-6 lg:space-y-8'>
						{/* Approach and Experience */}
						<GlassSection isVisible={isApproachVisible} position='right'>
							<div className='text-left mb-8 sm:mb-12'>
								<h2 className='font-bold text-zinc-900 mb-6 sm:mb-8'>
									Approach and Experience
								</h2>
							</div>
							<div className='prose prose-lg max-w-none'>
								<p className='text-zinc-700 mb-4 text-left'>
									The studio&apos;s founder is <span className='font-semibold'>Yuriy</span>.
								</p>
								<p className='text-zinc-700 mb-4 text-left'>
									He has many years of experience working with and teaching students,
									and is also the creator of the courses{' '}
									<span className='italic'>&quot;The Art of Shape&quot;</span> and{' '}
									<span className='italic'>&quot;The Art of Color&quot;</span>.
								</p>
								<p className='text-zinc-600 text-left'>
									Our approach combines technique, observation, and a sense of measure.
									The goal is not to change nature, but to gently highlight what is
									already there.
								</p>
							</div>
						</GlassSection>

						{/* Who This Studio Is For - Sticky on desktop */}
						<div ref={whoSectionRef} className='lg:sticky lg:top-24 lg:self-start'>
							<GlassSection isVisible={isWhoVisible} position='right' animationType='right' delay={300}>
								<div className='text-left mb-8 sm:mb-12'>
									<h2 className='font-bold text-zinc-900 mb-6 sm:mb-8'>
										Who This Studio Is For
									</h2>
								</div>
								<div className='prose prose-lg max-w-none'>
									<p className='text-zinc-700 mb-4 text-left'>
										Our clients are our friends.
									</p>
									<p className='text-zinc-700 mb-4 text-left'>
										People who come alone or with loved ones,
										<br />
										to relax, feel cared for, and achieve results without rush or pressure.
									</p>
									<p className='text-zinc-600 text-left'>
										There are no templates or imposed solutions here. Every look is
										created individually —
										<br />
										in accordance with your features, rhythm, and sense of self.
									</p>
								</div>
							</GlassSection>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}