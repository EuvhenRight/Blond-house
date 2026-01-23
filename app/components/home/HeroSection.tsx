'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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
	children: string
	delay: number
	isVisible: boolean
}

function AnimatedText({ children, delay, isVisible }: AnimatedTextProps) {
	return (
		<span
			className={`inline-block transition-all ease-out ${
				isVisible
					? 'opacity-100 translate-x-0'
					: 'opacity-0 -translate-x-16'
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
			className='group relative flex items-center justify-center p-2 sm:p-3 md:p-4'
			aria-label={ariaLabel}
		>
			<div className='h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 shrink-0 text-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-800'>
				{icon}
			</div>
		</Link>
	)
}

export default function HeroSection() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isVisible, setIsVisible] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		// Use setTimeout to make setState asynchronous and avoid cascading renders
		setTimeout(() => {
			setIsVisible(true)
		}, 0)

		// Check if mobile on mount and resize
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
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
		siteConfig.description_3,
	]

	return (
		<section
			className='relative w-full h-screen min-h-[500px] sm:min-h-[600px] md:min-h-[700px] overflow-hidden'
			aria-label='Hero section with hair design services'
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{/* Background Image */}
			<div className={`absolute inset-0 z-0 w-full ${isMobile ? 'h-full' : 'h-full'} mask-b-from-95% overflow-hidden`}>
				<div
					className={`absolute inset-0 transition-all ease-out ${
						isVisible
							? 'opacity-100 translate-x-0'
							: 'opacity-0 translate-x-full'
					}`}
					style={{
						transitionDuration: `${ANIMATION_DURATION.image}ms`,
					}}
				>
					<Image
						src={isMobile ? '/images/GoldGirl7.png' : '/images/GoldGirl6.png'}
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
			</div>

			{/* Content Container */}
			<div className='relative z-10 h-full flex flex-col p-4 sm:p-6 md:p-8 lg:p-12'>
				<div className='flex flex-col justify-between max-w-full sm:max-w-xl md:max-w-2xl mt-4 mb-4 sm:mt-8 md:mt-20'>
					{/* Main Title */}
					<div className='mb-auto'>
						<h1 className='hero-title text-black drop-shadow-lg mb-4 sm:mb-6'>
							{textLines.map((line, index) => (
								<span key={index}>
									{index > 0 && <br />}
									<AnimatedText
										delay={
											ANIMATION_DELAY.textStart +
											index * ANIMATION_DELAY.textStep
										}
										isVisible={isVisible}
									>
										{line}
									</AnimatedText>
								</span>
							))}
						</h1>
					</div>
				</div>

				{/* Social Icons - Mobile: bottom-left corner, Tablet/Desktop: left side, higher up */}
				<div
					className={`absolute left-4 bottom-4 sm:left-6 sm:bottom-6 md:left-8 md:top-1/3 lg:left-4 lg:top-1/4 xl:left-8 xl:top-1/4 flex flex-row items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 transition-all ease-out ${
						isVisible
							? 'opacity-100 translate-x-0'
							: 'opacity-0 -translate-x-8'
					}`}
					style={{
						transitionDuration: `${ANIMATION_DURATION.icons}ms`,
						transitionDelay: `${ANIMATION_DELAY.icons}ms`,
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
