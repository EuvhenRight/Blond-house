'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import { siteConfig } from '../../lib/constants'

// Animation constants
const ANIMATION_DURATION = {
	image: 1200,
	overlay: 1200,
	text: 800,
	icons: 1000,
} as const

const ANIMATION_DELAY = {
	overlay: 200,
	textStart: 600,
	textStep: 100,
	icons: 1000,
} as const

interface AnimatedTextProps {
	children: React.ReactNode
	delay: number
	isVisible: boolean
}

function AnimatedText({ children, delay, isVisible }: AnimatedTextProps) {
	return (
		<span
			className={`inline-block transition-all ease-out ${
				isVisible
					? 'opacity-100 translate-x-0 translate-y-0 md:translate-y-0'
					: 'opacity-0 -translate-x-16 translate-y-8 md:translate-y-0 md:-translate-x-16'
			}`}
			style={{
				transitionDuration: `${ANIMATION_DURATION.text}ms`,
				transitionDelay: `${delay}ms`,
			}}
		>
			{children}
		</span>
	)
}

interface SocialIconProps {
	href: string
	icon: React.ReactNode
	ariaLabel: string
}

function SocialIcon({ href, icon, ariaLabel }: SocialIconProps) {
	return (
		<Link
			href={href}
			target='_blank'
			rel='noopener noreferrer'
			className='group relative flex items-center justify-center p-2 sm:p-2 md:p-3 lg:p-4'
			aria-label={ariaLabel}
		>
			<div className='h-10 w-10 sm:h-12 sm:w-12 md:h-12 md:w-12 lg:h-12 lg:w-12 xl:h-12 xl:w-12 shrink-0 text-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-800'>
				{icon}
			</div>
		</Link>
	)
}

export default function HeroSection() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isVisible, setIsVisible] = useState(false)
	const [isMobile, setIsMobile] = useState(false)
	const [showButtons, setShowButtons] = useState(true) // Visible by default (in hero section)
	const [buttonsVisible, setButtonsVisible] = useState(false) // Animation visibility
	const heroSectionRef = useRef<HTMLElement>(null)

	useEffect(() => {
		// Check if mobile on mount and resize
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)

		// Start animation after a small delay to ensure smooth start
		const animationTimeout = setTimeout(() => {
			setIsVisible(true)
		}, 50)

		// Show buttons last - after all text animations complete
		// Last text appears at: textStart + (textLines.length - 1) * textStep
		// Then add additional delay for buttons
		const textLinesCount = 3 // tagline, description, description_2
		const lastTextDelay =
			ANIMATION_DELAY.textStart +
			(textLinesCount - 1) * ANIMATION_DELAY.textStep
		const buttonsDelay = lastTextDelay + ANIMATION_DURATION.text + 200 // After text animation + extra delay

		const buttonsTimeout = setTimeout(() => {
			setButtonsVisible(true)
		}, buttonsDelay)

		return () => {
			window.removeEventListener('resize', checkMobile)
			clearTimeout(animationTimeout)
			clearTimeout(buttonsTimeout)
		}
	}, [])

	// Hide buttons when scrolling down to the next component (AboutSection)
	useEffect(() => {
		const handleScroll = () => {
			const heroSection = heroSectionRef.current
			if (!heroSection) return

			// Find the next section (AboutSection) after hero section
			const nextSection = heroSection.nextElementSibling as HTMLElement
			if (!nextSection) {
				// If no next section, keep buttons visible
				setShowButtons(true)
				return
			}

			const nextSectionRect = nextSection.getBoundingClientRect()
			const viewportHeight = window.innerHeight

			// Hide buttons when next section starts entering the viewport
			// Show buttons when next section is below viewport (still in hero section)
			if (nextSectionRect.top < viewportHeight) {
				setShowButtons(false)
			} else {
				setShowButtons(true)
			}
		}

		// Check initial position
		handleScroll()

		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleScroll, { passive: true })

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleScroll)
		}
	}, [])

	const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const maxMovement = 20
		const x = ((e.clientX - rect.left) / rect.width - 0.5) * maxMovement
		const y = ((e.clientY - rect.top) / rect.height - 0.5) * maxMovement
		setMousePosition({ x, y })
	}

	const handleMouseLeave = () => {
		setMousePosition({ x: 0, y: 0 })
	}

	const textLines = [
		siteConfig.tagline,
		siteConfig.description,
		siteConfig.description_2,
	]

	return (
		<section
			ref={heroSectionRef}
			className='relative w-full h-screen min-h-[500px] sm:min-h-[600px] md:min-h-[700px] overflow-hidden'
			aria-label='Hero section with hair design services'
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{/* Background Image */}
			<div
				className={`absolute inset-0 z-0 w-full ${isMobile ? 'h-full' : 'h-full'} mask-b-from-95% overflow-hidden`}
			>
				<div
					className={`absolute inset-0 transition-all ease-out ${
						isVisible
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-full'
					}`}
					style={{
						transitionDuration: `${ANIMATION_DURATION.image}ms`,
					}}
				>
					<Image
						src={isMobile ? '/images/GirlMobile.png' : '/images/GoldGirl18.png'}
						alt='Hair design studio in Amsterdam'
						fill
						priority
						quality={90}
						className='object-cover w-full h-full scale-x-[-1]'
						style={{
							transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
							objectFit: 'cover',
							height: '100%',
						}}
						sizes='100vw'
					/>
				</div>
				{/* Overlay for better text readability */}
				<div
					className={`absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/20 transition-opacity ${
						isVisible ? 'opacity-100' : 'opacity-0'
					}`}
					style={{
						transitionDuration: `${ANIMATION_DURATION.overlay}ms`,
						transitionDelay: `${ANIMATION_DELAY.overlay}ms`,
					}}
				/>
				{/* Glass blur effect on right 50% of image - Hidden on mobile */}
				{!isMobile && (
					<div
						className={`absolute inset-y-0 left-0 w-1/3 bg-white/10 backdrop-blur-md transition-opacity ${
							isVisible ? 'opacity-100' : 'opacity-0'
						}`}
						style={{
							transitionDuration: `${ANIMATION_DURATION.overlay}ms`,
							transitionDelay: `${ANIMATION_DELAY.overlay}ms`,
							backdropFilter: 'blur(12px)',
							WebkitBackdropFilter: 'blur(12px)',
						}}
					/>
				)}
			</div>

			{/* Content Container */}
			<div className='relative z-10 h-full flex flex-col p-4 sm:p-6 md:p-8 lg:p-12'>
				<div className='flex flex-col justify-between max-w-full sm:max-w-xl md:max-w-2xl mt-4 mb-4 sm:mt-8 md:mt-20'>
					{/* Main Title - Customize with Tailwind classes below */}
					<div className='mb-auto mt-[30px] sm:mt-0'>
						<h1 className='font-[title]! font-light! leading-[140%]! mb-4 sm:mb-6'>
							{textLines.map((line, index) => (
								<React.Fragment key={index}>
									{index > 0 && <br />}
									<AnimatedText
										delay={
											ANIMATION_DELAY.textStart +
											index * ANIMATION_DELAY.textStep
										}
										isVisible={isVisible}
									>
										<span
											className={`inline-block ${
												index === 0
													? 'text-[52px] md:text-[52px] lg:text-[72px] xl:text-[90px] font-light text-transparent bg-clip-text bg-linear-to-r from-amber-900 via-amber-800 to-amber-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] [text-shadow:0_2px_8px_rgba(0,0,0,0.2)] tracking-tight'
													: index === 1
														? 'text-[36px] sm:text-[42px] md:text-[42px] lg:text-[64px] xl:text-[72px] font-light text-black drop-shadow-[0_3px_10px_rgba(0,0,0,0.25)] [text-shadow:0_2px_6px_rgba(0,0,0,0.15)] tracking-wide'
														: 'text-[36px] sm:text-[42px] md:text-[42px] lg:text-[64px] xl:text-[72px] font-light text-black drop-shadow-[0_3px_10px_rgba(0,0,0,0.25)] [text-shadow:0_2px_6px_rgba(0,0,0,0.15)] tracking-wide'
											}`}
										>
											{line}
										</span>
									</AnimatedText>
								</React.Fragment>
							))}
						</h1>
					</div>
				</div>

				{/* Book button - realistic glass effect, bottom-right, mobile/tablet only; focusable */}
				<Link
					href='/book'
					aria-label='Book an appointment'
					tabIndex={showButtons && buttonsVisible ? 0 : -1}
					className={`group lg:hidden absolute right-16 bottom-64 z-30 flex items-center justify-center w-24 h-24 rounded-full overflow-hidden bg-white/10 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:scale-105 hover:bg-white/15 active:scale-95 ${
						showButtons && buttonsVisible
							? 'opacity-100 translate-y-0 pointer-events-auto'
							: 'opacity-0 translate-y-full pointer-events-none'
					}`}
					style={{
						backdropFilter: 'blur(20px) saturate(180%)',
						WebkitBackdropFilter: 'blur(20px) saturate(180%)',
					}}
				>
					{/* Inner highlight for depth */}
					<span
						className='absolute inset-0 rounded-full bg-linear-to-b from-white/20 via-transparent to-transparent pointer-events-none'
						aria-hidden='true'
					/>
					{/* Shimmer overlay - continuous animation on mobile/tablet (iOS-friendly class) */}
					<span
						className='hero-book-button-shimmer absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent'
						aria-hidden='true'
					/>
					{/* Book text */}
					<span className='text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] relative z-10 font-semibold text-md'>
						BOOK NOW
					</span>
				</Link>

				{/* Social Icons - Visible only in HeroSection, hidden when next component appears */}
				<div
					className={`text-gray-700 absolute left-4 sm:left-6 md:left-8 lg:left-8 xl:left-12 bottom-48 z-20 flex flex-row items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 transition-all ease-out ${
						showButtons && buttonsVisible
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-full pointer-events-none'
					}`}
					style={{
						transitionDuration: '400ms',
					}}
				>
					<SocialIcon
						href={siteConfig.googleMaps}
						ariaLabel={`View location in ${siteConfig.location} on Google Maps`}
						icon={
							<FiMapPin
								className='w-full h-full'
								style={{
									filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
								}}
								aria-hidden='true'
							/>
						}
					/>
					<SocialIcon
						href={siteConfig.whatsapp}
						ariaLabel='Contact via WhatsApp'
						icon={
							<ImWhatsapp
								className='w-full h-full'
								style={{
									filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
								}}
								aria-hidden='true'
							/>
						}
					/>
				</div>
			</div>
		</section>
	)
}
