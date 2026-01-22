'use client'

import Image from 'next/image'

export default function AboutPage() {
	const portfolioImages = [
		{ src: '/images/IMG_2106.jpg', alt: 'Hair design work - long wavy brown hair with golden highlights' },
		{ src: '/images/IMG_2112.jpeg', alt: 'Hair design work - blonde balayage with natural waves' },
		{ src: '/images/IMG_2117.jpg', alt: 'Hair design work - creative color with purple and blonde' },
		{ src: '/images/IMG_2120.jpg', alt: 'Hair design work - voluminous blonde waves' },
		{ src: '/images/IMG_2122.jpg', alt: 'Hair design work - layered blonde with natural texture' },
		{ src: '/images/IMG_2164.jpg', alt: 'Hair design work - ombré with pink-blonde tones' },
	]
	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50'>
			<main className='w-full'>
				{/* Hero Section */}
				<section className='relative w-full py-12 sm:py-16 md:py-20 lg:py-24'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<div className='text-center mb-12 sm:mb-16'>
							<h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 leading-tight'>
								A Small Cozy Studio
								<br />
								<span className='text-amber-600'>in the Center of Amsterdam</span>
							</h1>
						</div>

						<div className='prose prose-lg max-w-none'>
							<p className='text-lg sm:text-xl md:text-2xl text-zinc-700 leading-relaxed mb-8 text-center'>
								This is a small, calm studio with a homely atmosphere, right in the
								heart of Amsterdam.
							</p>
							<p className='text-base sm:text-lg md:text-xl text-zinc-600 leading-relaxed mb-12 text-center'>
								A space where you can pause, breathe, and dedicate time to yourself.
							</p>

							<div className='my-12 sm:my-16 text-center'>
								<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
									We work with hair as a living, moving material.
								</p>
								<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4'>
									Shape, for us, is the foundation of proportion and balance.
								</p>
								<p className='text-base sm:text-lg text-zinc-700 leading-relaxed'>
									Color is not just a shade, but a way to enhance the skin, eyes,
									and the overall sense of a person.
								</p>
							</div>

							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center mb-12'>
								We carefully study how color interacts with appearance and inner
								state, and use it so that the result looks natural and harmonious.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Approach and Experience */}
				<section className='py-12 sm:py-16 md:py-20'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							Approach and Experience
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								The studio's founder is <span className='font-semibold'>Yuriy</span>.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								He has many years of experience working with and teaching students,
								and is also the creator of the courses{' '}
								<span className='italic'>"The Art of Shape"</span> and{' '}
								<span className='italic'>"The Art of Color"</span>.
							</p>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center'>
								Our approach combines technique, observation, and a sense of measure.
								The goal is not to change nature, but to gently highlight what is
								already there.
							</p>
						</div>

						{/* Portfolio Gallery */}
						<div className='mt-12 sm:mt-16'>
							<h3 className='text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-900 mb-6 sm:mb-8 text-center'>
								His Works
							</h3>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
								{portfolioImages.map((image, index) => (
									<div
										key={index}
										className='group relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'
									>
										<Image
											src={image.src}
											alt={image.alt}
											fill
											className='object-cover transition-transform duration-500 group-hover:scale-110'
											sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
										/>
										{/* Overlay on hover */}
										<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300'></div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Who This Studio Is For */}
				<section className='py-12 sm:py-16 md:py-20 bg-white/50'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							Who This Studio Is For
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								Our clients are our friends.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								People who come alone or with loved ones, to relax, feel cared for,
								and achieve results without rush or pressure.
							</p>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center'>
								There are no templates or imposed solutions here. Every look is
								created individually — in accordance with your features, rhythm, and
								sense of self.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* A Little About the Journey */}
				<section className='py-12 sm:py-16 md:py-20'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							A Little About the Journey
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								Over the years in this profession, we have gone through commercial,
								technical, and marketing stages.
							</p>
							<p className='text-base sm:text-lg text-zinc-700 leading-relaxed mb-4 text-center'>
								Over time, it became clear:
							</p>
							<div className='my-8 sm:my-12 text-center'>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed mb-4 italic'>
									Mastery is not about complicating things.
								</p>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed italic'>
									And it's not about trying to remake a person.
								</p>
							</div>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center'>
								True work lies in the ability to preserve balance between outer
								appearance and inner state.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Studio Principle */}
				<section className='py-12 sm:py-16 md:py-20 bg-white/50'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-6 sm:mb-8 text-center'>
							Studio Principle
						</h2>
						<div className='prose prose-lg max-w-none'>
							<div className='my-8 sm:my-12 text-center space-y-4'>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed'>
									The goal is not to make things more complicated, but simpler.
								</p>
								<p className='text-lg sm:text-xl md:text-2xl text-zinc-800 leading-relaxed'>
									The goal is not to change appearance, but to enhance natural
									beauty and bring it into harmony.
								</p>
							</div>
							<p className='text-base sm:text-lg text-zinc-600 leading-relaxed text-center italic mt-8'>
								The approach to your hair is careful and attentive, like one's own
								soul.
							</p>
						</div>
					</div>
				</section>

				{/* Divider */}
				<div className='flex items-center justify-center py-8'>
					<div className='w-24 h-px bg-zinc-300'></div>
					<span className='mx-4 text-2xl text-zinc-400'>⸻</span>
					<div className='w-24 h-px bg-zinc-300'></div>
				</div>

				{/* Closing Message */}
				<section className='py-12 sm:py-16 md:py-20'>
					<div className='mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12'>
						<div className='text-center'>
							<p className='text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 mb-4'>
								Everyone is welcome.
							</p>
							<p className='text-xl sm:text-2xl md:text-3xl text-zinc-700 italic'>
								Here, you can just be.
							</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}
