'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { services } from '../lib/services'
import ServiceCard from './ServiceCard'

interface ServicesProps {
	showNotes?: boolean
	gridCols?: '2' | '3' | '4'
	noteTextColor?: 'white' | 'zinc'
	showSection?: boolean
}

export default function Services({
	showNotes = true,
	gridCols = '4',
	noteTextColor = 'white',
	showSection = false,
}: ServicesProps) {
	const [isVisible, setIsVisible] = useState(false)
	const sectionRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true)
					}
				})
			},
			{
				threshold: 0.1,
				rootMargin: '0px 0px -50px 0px',
			}
		)

		const currentRef = sectionRef.current
		if (currentRef) {
			observer.observe(currentRef)
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef)
			}
		}
	}, [])

	const gridClass =
		gridCols === '2'
			? 'md:grid-cols-2'
			: gridCols === '3'
				? 'md:grid-cols-3'
				: 'md:grid-cols-2 lg:grid-cols-4'

	const content = (
		<>
			<div ref={sectionRef} className={`grid gap-6 sm:gap-8 ${gridClass} items-stretch`}>
				{services.map((service, index) => (
					<ServiceCard
						key={service.id}
						service={service}
						isVisible={isVisible}
						animationDelay={index * 200} // Staggered animation: 100ms delay per card
					/>
				))}
			</div>

			{/* Service Footer Notes */}
			{showNotes && (
				<div className='mt-12 text-center pb-8 sm:pb-12 md:pb-16'>
					<p className='small text-black'>
						* Additional charges may apply for certain services—please consult with your stylist.
					</p>
					<p className='small text-black mt-2'>
						* All services include shampoo, styling, and blow-dry in the desired direction.
					</p>
				</div>
			)}
		</>
	)

	if (showSection) {
		return (
			<section
				id='services'
				className='relative w-full py-12 sm:py-16 md:py-20 overflow-hidden'
			>
				{/* Background Image - respects padding */}
				<div className='absolute top-12 sm:top-16 md:top-20 bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 z-0'>
					<Image
						src='/images/Salon.png'
						alt='Studio background'
						fill
						quality={85}
						className='object-cover opacity-40'
						priority={false}
						sizes='100vw'
					/>
				</div>
				
				{/* Content */}
				<div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 w-full'>
					<div className='text-center mb-12 sm:mb-16 md:mb-20'>
						<h2 className='font-bold text-zinc-900 mb-4'>
							Our Services
						</h2>
						<p className='text-zinc-600 max-w-2xl mx-auto'>
							Professional hair design services tailored to your unique style
						</p>
					</div>
					{content}
				</div>
			</section>
		)
	}

	return content
}

