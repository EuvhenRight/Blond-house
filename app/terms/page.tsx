'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassSection from '../components/GlassSection'
import { siteConfig } from '../lib/constants'

export default function TermsPage() {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		// Use setTimeout to make setState asynchronous and avoid cascading renders
		setTimeout(() => {
			setIsVisible(true)
		}, 0)
	}, [])

	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50'>
			<main className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20'>
				{/* Header */}
				<div className='mb-8 sm:mb-12'>
					<Link
						href='/'
						className='inline-block mb-6 text-amber-600 hover:text-amber-700 transition-colors'
					>
						← Back to Home
					</Link>
					<h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 mb-4'>
						Terms of Service
					</h1>
					<p className='text-sm sm:text-base text-zinc-600'>
						Last updated: {new Date().toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</p>
				</div>

				{/* Content in Glass Component */}
				<GlassSection
					isVisible={isVisible}
					position='center'
					animationType='bottom'
					delay={100}
					padding='lg'
					blur='md'
					className='bg-white/60'
				>
					<div className='prose prose-zinc max-w-none space-y-8'>
						{/* Introduction */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								1. Introduction
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								Welcome to {siteConfig.name}. These Terms of Service (&quot;Terms&quot;)
								govern your use of our website and booking services. By accessing or using
								our services, you agree to be bound by these Terms.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								If you do not agree to these Terms, please do not use our services.
							</p>
						</section>

						{/* Service Provider */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								2. Service Provider
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								These services are provided by:
							</p>
							<div className='bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6 mb-4'>
								<p className='text-base sm:text-lg text-zinc-900 font-medium mb-2'>
									{siteConfig.name}
								</p>
								<p className='text-sm sm:text-base text-zinc-700'>
									{siteConfig.address}
								</p>
								<p className='text-sm sm:text-base text-zinc-700'>
									Email: {siteConfig.email}
								</p>
								<p className='text-sm sm:text-base text-zinc-700'>
									Phone: {siteConfig.phone}
								</p>
							</div>
						</section>

						{/* Booking Services */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								3. Booking Services
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								Our booking system allows you to:
							</p>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>View available appointment times</li>
								<li>Select services and book appointments</li>
								<li>Receive appointment confirmations</li>
							</ul>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mt-4'>
								All bookings are subject to availability and confirmation. We reserve the
								right to refuse or cancel any booking at our discretion.
							</p>
						</section>

						{/* Appointment Policies */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								4. Appointment Policies
							</h2>
							<h3 className='text-xl sm:text-2xl font-semibold text-zinc-900 mb-3 mt-6'>
								4.1 Booking Requirements
							</h3>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>You must provide accurate and complete information when booking</li>
								<li>You must be at least 16 years old to book an appointment</li>
								<li>All required fields must be completed</li>
								<li>You must agree to our Privacy Policy</li>
							</ul>

							<h3 className='text-xl sm:text-2xl font-semibold text-zinc-900 mb-3 mt-6'>
								4.2 Cancellation and Rescheduling
							</h3>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								If you need to cancel or reschedule your appointment, please contact us as
								soon as possible:
							</p>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>
									<strong>24 hours or more in advance:</strong> Free cancellation or
									rescheduling
								</li>
								<li>
									<strong>Less than 24 hours:</strong> May be subject to a cancellation
									fee
								</li>
								<li>
									<strong>No-show:</strong> May result in a fee or require a deposit for
									future bookings
								</li>
							</ul>

							<h3 className='text-xl sm:text-2xl font-semibold text-zinc-900 mb-3 mt-6'>
								4.3 Late Arrivals
							</h3>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								If you arrive late, we will do our best to accommodate you, but your service
								may be shortened to avoid delaying other appointments. Full service fees
								still apply.
							</p>
						</section>

						{/* Payment Terms */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								5. Payment Terms
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								Payment is due at the time of service unless otherwise agreed. We accept:
							</p>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>Cash</li>
								<li>Credit and debit cards</li>
								<li>Other payment methods as agreed</li>
							</ul>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mt-4'>
								Additional charges may apply for certain services. Please consult with your
								stylist for details.
							</p>
						</section>

						{/* Service Guarantees */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								6. Service Guarantees
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								We strive to provide the highest quality service. If you are not satisfied
								with your service, please contact us within 48 hours. We will work with you
								to address any concerns.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								All services include shampoo, styling, and blow-dry in the desired
								direction unless otherwise specified.
							</p>
						</section>

						{/* User Responsibilities */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								7. User Responsibilities
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								You agree to:
							</p>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>Provide accurate and truthful information</li>
								<li>Arrive on time for your appointments</li>
								<li>Respect our staff and other clients</li>
								<li>Follow our salon policies and guidelines</li>
								<li>Notify us of any allergies or medical conditions that may affect
									service</li>
							</ul>
						</section>

						{/* Limitation of Liability */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								8. Limitation of Liability
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								To the maximum extent permitted by Dutch law:
							</p>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>We are not liable for any indirect, incidental, or consequential
									damages</li>
								<li>Our total liability is limited to the amount you paid for the service</li>
								<li>We are not responsible for any allergic reactions or adverse effects
									from products used, unless caused by our negligence</li>
							</ul>
						</section>

						{/* Intellectual Property */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								9. Intellectual Property
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								All content on this website, including text, graphics, logos, and images, is
								the property of {siteConfig.name} and is protected by copyright and other
								intellectual property laws. You may not reproduce, distribute, or use any
								content without our written permission.
							</p>
						</section>

						{/* Prohibited Uses */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								10. Prohibited Uses
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								You may not:
							</p>
							<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
								<li>Use our services for any illegal or unauthorized purpose</li>
								<li>Attempt to gain unauthorized access to our systems</li>
								<li>Interfere with or disrupt our services</li>
								<li>Use automated systems to book appointments (bots, scrapers, etc.)</li>
								<li>Book appointments under false pretenses</li>
							</ul>
						</section>

						{/* Changes to Terms */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								11. Changes to Terms
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								We reserve the right to modify these Terms at any time. We will notify you
								of any material changes by posting the updated Terms on this page and
								updating the &quot;Last updated&quot; date. Your continued use of our
								services after changes constitutes acceptance of the new Terms.
							</p>
						</section>

						{/* Governing Law */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								12. Governing Law
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								These Terms are governed by and construed in accordance with the laws of
								the Netherlands. Any disputes arising from these Terms or our services
								shall be subject to the exclusive jurisdiction of the courts of Amsterdam,
								Netherlands.
							</p>
						</section>

						{/* Severability */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								13. Severability
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
								If any provision of these Terms is found to be invalid or unenforceable,
								the remaining provisions shall continue in full force and effect.
							</p>
						</section>

						{/* Contact */}
						<section>
							<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
								14. Contact Us
							</h2>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
								If you have any questions about these Terms, please contact us:
							</p>
							<div className='bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6'>
								<p className='text-base sm:text-lg text-zinc-900 font-medium mb-2'>
									{siteConfig.name}
								</p>
								<p className='text-sm sm:text-base text-zinc-700 mb-1'>
									{siteConfig.address}
								</p>
								<p className='text-sm sm:text-base text-zinc-700 mb-1'>
									Email:{' '}
									<a
										href={`mailto:${siteConfig.email}`}
										className='text-amber-600 hover:text-amber-700 underline'
									>
										{siteConfig.email}
									</a>
								</p>
								<p className='text-sm sm:text-base text-zinc-700'>
									Phone:{' '}
									<a
										href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
										className='text-amber-600 hover:text-amber-700 underline'
									>
										{siteConfig.phone}
									</a>
								</p>
							</div>
						</section>
					</div>
				</GlassSection>

				{/* Footer Navigation */}
				<div className='mt-12 sm:mt-16 pt-8 border-t border-zinc-200'>
					<Link
						href='/'
						className='inline-block text-amber-600 hover:text-amber-700 transition-colors'
					>
						← Back to Home
					</Link>
				</div>
			</main>
		</div>
	)
}
