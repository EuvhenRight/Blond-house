'use client'

import { ReactNode } from 'react'

interface GlassSectionProps {
	children: ReactNode
	isVisible: boolean
	position?: 'left' | 'right' | 'center'
	animationType?: 'bottom' | 'left' | 'right' | 'none'
	delay?: number // Delay in milliseconds
	className?: string
	showProse?: boolean // Whether to apply prose styling
	padding?: 'sm' | 'md' | 'lg' | 'xl'
	blur?: 'sm' | 'md' | 'lg'
}

export default function GlassSection({
	children,
	isVisible,
	position = 'left',
	animationType = 'bottom',
	delay = 0,
	className = '',
	showProse = true,
	padding = 'lg',
	blur = 'md',
}: GlassSectionProps) {
	// Position translation
	const getPositionClasses = () => {
		switch (position) {
			case 'left':
				return '-translate-x-[25%]'
			case 'right':
				return ''
			case 'center':
			default:
				return ''
		}
	}

	// Padding classes
	const getPaddingClasses = () => {
		switch (padding) {
			case 'sm':
				return 'p-4 sm:p-6'
			case 'md':
				return 'p-5 sm:p-7 md:p-8'
			case 'lg':
				return 'p-6 sm:p-8 md:p-10 lg:p-12'
			case 'xl':
				return 'p-8 sm:p-10 md:p-12 lg:p-16'
			default:
				return 'p-6 sm:p-8 md:p-10 lg:p-12'
		}
	}

	// Blur classes
	const getBlurClasses = () => {
		switch (blur) {
			case 'sm':
				return 'backdrop-blur-sm'
			case 'md':
				return 'backdrop-blur-md'
			case 'lg':
				return 'backdrop-blur-lg'
			default:
				return 'backdrop-blur-md'
		}
	}

	// Different animation directions
	const getAnimationClasses = () => {
		if (animationType === 'none' || isVisible) {
			return 'translate-x-0 translate-y-0 opacity-100'
		}

		switch (animationType) {
			case 'left':
				return 'translate-x-[-100%] opacity-0'
			case 'right':
				return 'translate-x-[100%] opacity-0'
			case 'bottom':
			default:
				return 'translate-y-full opacity-0'
		}
	}

	const proseClasses = showProse ? 'prose prose-lg max-w-none' : ''

	return (
		<div
			className={`${proseClasses} ${getBlurClasses()} border border-zinc-200/80 rounded-2xl ${getPaddingClasses()} transition-all duration-1200 ease-in-out ${getPositionClasses()} ${className} ${getAnimationClasses()}`}
			style={{
				transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
				transitionDelay: `${delay}ms`,
			}}
		>
			{children}
		</div>
	)
}
