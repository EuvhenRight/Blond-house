'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import GlassSection from '../components/GlassSection'
import { siteConfig } from '../lib/constants'

export default function PrivacyPage() {
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
						Privacy Policy
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
							This Privacy Policy describes how {siteConfig.name} (&quot;we&quot;,
							&quot;our&quot;, or &quot;us&quot;) collects, uses, and protects your
							personal information when you use our website and services. We are
							committed to protecting your privacy and ensuring compliance with the
							General Data Protection Regulation (GDPR) and applicable Dutch data
							protection laws.
						</p>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
							By using our website and booking services, you agree to the collection
							and use of information in accordance with this policy.
						</p>
					</section>

					{/* Data Controller */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							2. Data Controller
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							The data controller responsible for processing your personal data is:
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

					{/* Information We Collect */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							3. Information We Collect
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							We collect the following types of personal information:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>
								<strong>Contact Information:</strong> Name, email address, and phone
								number when you book an appointment
							</li>
							<li>
								<strong>Booking Information:</strong> Selected service, date, and time
								of your appointment
							</li>
							<li>
								<strong>Technical Information:</strong> IP address, browser type,
								device information, and usage data collected through cookies and
								similar technologies
							</li>
							<li>
								<strong>Communication Data:</strong> Any correspondence you send to us
								via email or contact forms
							</li>
						</ul>
					</section>

					{/* How We Use Your Information */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							4. How We Use Your Information
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							We use your personal information for the following purposes:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>To process and manage your appointment bookings</li>
							<li>To communicate with you about your appointments and services</li>
							<li>To send appointment confirmations and reminders</li>
							<li>To respond to your inquiries and provide customer support</li>
							<li>To improve our website and services</li>
							<li>To comply with legal obligations</li>
							<li>To protect our rights and prevent fraud</li>
						</ul>
					</section>

					{/* Legal Basis for Processing */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							5. Legal Basis for Processing
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							Under GDPR, we process your personal data based on the following legal
							bases:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>
								<strong>Contractual Necessity:</strong> Processing is necessary to
								fulfill our contract with you (booking and providing services)
							</li>
							<li>
								<strong>Legitimate Interests:</strong> Processing is necessary for
								our legitimate business interests (improving services, website
								analytics)
							</li>
							<li>
								<strong>Consent:</strong> Where you have given explicit consent for
								specific processing activities
							</li>
							<li>
								<strong>Legal Obligation:</strong> Processing is necessary to comply
								with legal requirements
							</li>
						</ul>
					</section>

					{/* Data Retention */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							6. Data Retention
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							We retain your personal information only for as long as necessary to
							fulfill the purposes outlined in this Privacy Policy, unless a longer
							retention period is required or permitted by law. Specifically:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>
								Booking records are retained for a minimum of 7 years as required by
								Dutch tax and accounting laws
							</li>
							<li>
								Marketing communications data is retained until you withdraw consent or
								opt-out
							</li>
							<li>
								Technical and analytics data is retained for up to 2 years
							</li>
						</ul>
					</section>

					{/* Data Sharing and Disclosure */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							7. Data Sharing and Disclosure
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							We do not sell, trade, or rent your personal information to third
							parties. We may share your information only in the following
							circumstances:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>
								<strong>Service Providers:</strong> With trusted third-party service
								providers who assist us in operating our website and conducting our
								business (e.g., hosting providers, email services)
							</li>
							<li>
								<strong>Legal Requirements:</strong> When required by law or to respond
								to legal process
							</li>
							<li>
								<strong>Business Transfers:</strong> In connection with a merger,
								acquisition, or sale of assets
							</li>
							<li>
								<strong>With Your Consent:</strong> When you have given explicit
								consent for sharing
							</li>
						</ul>
					</section>

					{/* Your Rights Under GDPR */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							8. Your Rights Under GDPR
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							As a data subject under GDPR, you have the following rights:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>
								<strong>Right of Access:</strong> You can request a copy of your
								personal data we hold
							</li>
							<li>
								<strong>Right to Rectification:</strong> You can request correction of
								inaccurate or incomplete data
							</li>
							<li>
								<strong>Right to Erasure:</strong> You can request deletion of your
								personal data (&quot;right to be forgotten&quot;)
							</li>
							<li>
								<strong>Right to Restrict Processing:</strong> You can request
								limitation of how we process your data
							</li>
							<li>
								<strong>Right to Data Portability:</strong> You can request your data in
								a structured, machine-readable format
							</li>
							<li>
								<strong>Right to Object:</strong> You can object to processing based
								on legitimate interests
							</li>
							<li>
								<strong>Right to Withdraw Consent:</strong> Where processing is based
								on consent, you can withdraw it at any time
							</li>
						</ul>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mt-4'>
							To exercise any of these rights, please contact us at{' '}
							<a
								href={`mailto:${siteConfig.email}`}
								className='text-amber-600 hover:text-amber-700 underline'
							>
								{siteConfig.email}
							</a>
							. We will respond to your request within one month.
						</p>
					</section>

					{/* Cookies */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							9. Cookies and Tracking Technologies
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							Our website uses cookies and similar tracking technologies to enhance
							your experience. Cookies are small text files stored on your device.
						</p>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							We use cookies for:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>Essential website functionality</li>
							<li>Analytics and performance monitoring</li>
							<li>Remembering your preferences</li>
						</ul>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mt-4'>
							You can control cookies through your browser settings. However, disabling
							cookies may affect website functionality.
						</p>
					</section>

					{/* Data Security */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							10. Data Security
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							We implement appropriate technical and organizational measures to protect
							your personal data against unauthorized access, alteration, disclosure,
							or destruction. These measures include:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>Encryption of data in transit (SSL/TLS)</li>
							<li>Secure server infrastructure</li>
							<li>Regular security assessments</li>
							<li>Access controls and authentication</li>
						</ul>
					</section>

					{/* International Data Transfers */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							11. International Data Transfers
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							Your personal data is primarily processed within the European Economic
							Area (EEA). If we transfer data outside the EEA, we ensure appropriate
							safeguards are in place, such as:
						</p>
						<ul className='list-disc pl-6 space-y-2 text-base sm:text-lg text-zinc-700'>
							<li>Standard Contractual Clauses approved by the European Commission</li>
							<li>Adequacy decisions by the European Commission</li>
							<li>Other legally recognized transfer mechanisms</li>
						</ul>
					</section>

					{/* Children&apos;s Privacy */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							12. Children&apos;s Privacy
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
							Our services are not directed to individuals under the age of 16. We do
							not knowingly collect personal information from children. If you believe
							we have collected information from a child, please contact us
							immediately.
						</p>
					</section>

					{/* Changes to This Policy */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							13. Changes to This Privacy Policy
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
							We may update this Privacy Policy from time to time. We will notify you
							of any material changes by posting the new policy on this page and
							updating the &quot;Last updated&quot; date. We encourage you to review
							this policy periodically.
						</p>
					</section>

					{/* Complaints */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							14. Complaints
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							If you have concerns about how we handle your personal data, you have the
							right to lodge a complaint with the Dutch Data Protection Authority
							(Autoriteit Persoonsgegevens):
						</p>
						<div className='bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6'>
							<p className='text-base sm:text-lg text-zinc-900 font-medium mb-2'>
								Autoriteit Persoonsgegevens
							</p>
							<p className='text-sm sm:text-base text-zinc-700'>
								Website:{' '}
								<a
									href='https://autoriteitpersoonsgegevens.nl'
									target='_blank'
									rel='noopener noreferrer'
									className='text-amber-600 hover:text-amber-700 underline'
								>
									autoriteitpersoonsgegevens.nl
								</a>
							</p>
							<p className='text-sm sm:text-base text-zinc-700'>
								Phone: +31 (0)70 888 85 00
							</p>
						</div>
					</section>

					{/* Contact */}
					<section>
						<h2 className='text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4'>
							15. Contact Us
						</h2>
						<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
							If you have any questions about this Privacy Policy or wish to exercise
							your rights, please contact us:
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
