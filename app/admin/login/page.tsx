'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function AdminLoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				setError('Invalid email or password')
			} else {
				router.push('/admin/dashboard')
				router.refresh()
			}
		} catch {
			setError('An error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-linear-to-r from-amber-50 via-white to-amber-50 flex items-center justify-center px-4'>
			<div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-zinc-900 mb-2'>Admin Login</h1>
					<p className='text-zinc-600'>Blond House Appointment System</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
							{error}
						</div>
					)}

					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-zinc-700 mb-2'
						>
							Email Address
						</label>
						<input
							type='email'
							id='email'
							required
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
							placeholder='admin@blondhouse.com'
						/>
					</div>

					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-zinc-700 mb-2'
						>
							Password
						</label>
						<input
							type='password'
							id='password'
							required
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent'
							placeholder='••••••••'
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='w-full rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			</div>
		</div>
	)
}
