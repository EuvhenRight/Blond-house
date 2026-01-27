'use client'

import Link from 'next/link'
import { FiMapPin } from 'react-icons/fi'
import { ImWhatsapp } from 'react-icons/im'
import { siteConfig } from '../lib/constants'

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
			<div className='h-6 w-6 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 shrink-0 text-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-800'>
				{icon}
			</div>
		</Link>
	)
}

export default function StickyButtons() {
	return (
		<div className='fixed right-4 bottom-4 sm:right-6 sm:bottom-6 md:left-8 md:bottom-8 lg:left-8 lg:bottom-8 xl:left-8 xl:bottom-8 z-20 flex flex-row items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6'>
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
	)
}
