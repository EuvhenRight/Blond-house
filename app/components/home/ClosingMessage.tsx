'use client'

import { useEffect, useRef, useState } from 'react'

export default function ClosingMessage() {
	const [isVisible, setIsVisible] = useState(false)
	const sectionRef = useRef<HTMLElement>(null)

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
				threshold: 0.3,
				rootMargin: '0px 0px -100px 0px',
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

	return (
		<section ref={sectionRef} className='pb-12 sm:pb-16 md:pb-20'>
			<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
				<div
					className={`text-center transition-all duration-1000 ease-in-out ${
						isVisible
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-8'
					}`}
				>
					<h3
						className='font-light text-zinc-900 mb-4'
					>
						Everyone is welcome.
					</h3>
					<h4
						className='text-zinc-700 italic font-light'
					>
						Here, you can just be.
					</h4>
				</div>
			</div>
		</section>
	)
}
