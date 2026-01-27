'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import AboutSection from './components/home/AboutSection'
import ApproachSection from './components/home/ApproachSection'
import BookingSuccessModal from './components/home/BookingSuccessModal'
import ClosingMessage from './components/home/ClosingMessage'
import Divider from './components/home/Divider'
import HeroSection from './components/home/HeroSection'
import JourneyPrincipleSection from './components/home/JourneyPrincipleSection'
import Services from './components/Services'

function HomeContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [showBookingSuccess, setShowBookingSuccess] = useState(false)

	// Enable browser scroll restoration to remember scroll position on refresh
	useEffect(() => {
		// Enable browser scroll restoration
		if ('scrollRestoration' in window.history) {
			window.history.scrollRestoration = 'auto'
		}
	}, [])

	// Check for booking success parameter
	useEffect(() => {
		const bookingSuccess = searchParams.get('bookingSuccess')
		if (bookingSuccess === 'true') {
			// Use setTimeout to avoid synchronous setState in effect
			setTimeout(() => {
				setShowBookingSuccess(true)
			}, 0)
			// Clean up URL parameter
			router.replace('/', { scroll: false })
		}
	}, [searchParams, router])

	// Handle hash navigation only when there's a valid hash
	// This runs after scroll restoration, so it can override if needed
	useEffect(() => {
		const handleHashNavigation = () => {
			const hash = window.location.hash
			
			// Only scroll to hash if there's a valid hash (not just '#')
			if (hash && hash.length > 1) {
				// Wait for page to be fully rendered and scroll restoration to complete
				const timeoutId = setTimeout(() => {
					const element = document.querySelector(hash)
					if (element) {
						const headerOffset = 80
						const elementPosition = element.getBoundingClientRect().top
						const offsetPosition = elementPosition + window.pageYOffset - headerOffset

						window.scrollTo({
							top: offsetPosition,
							behavior: 'smooth',
						})
					}
				}, 300) // Increased delay to ensure page is fully loaded

				return () => clearTimeout(timeoutId)
			}
		}

		// Handle initial hash
		handleHashNavigation()

		// Listen for hash changes (when navigating from other pages)
		window.addEventListener('hashchange', handleHashNavigation)

		return () => {
			window.removeEventListener('hashchange', handleHashNavigation)
		}
	}, [])

	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50 relative overflow-x-hidden w-full'>
			<BookingSuccessModal 
				isOpen={showBookingSuccess} 
				onClose={() => setShowBookingSuccess(false)} 
			/>

			<main className='w-full max-w-full overflow-x-hidden'>
				<HeroSection />
				<AboutSection />
				<Divider />
				<ApproachSection />
				<Divider />
				<JourneyPrincipleSection />
				<Divider />
				<Services showNotes={true} gridCols='4' showSection={true} />
				<Divider />
				<ClosingMessage />
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
