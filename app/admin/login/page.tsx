'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { loginSchema } from '../../lib/validation'
import { ZodError } from 'zod'

interface FieldErrors {
	email?: string
	password?: string
}

export default function AdminLoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setFieldErrors({})
		setIsLoading(true)

		try {
			// Validate with Zod
			loginSchema.parse({ email, password })

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
		} catch (err) {
			if (err instanceof ZodError) {
				// Handle Zod validation errors
				const errors: FieldErrors = {}
				err.issues.forEach((issue) => {
					if (issue.path[0]) {
						const field = issue.path[0] as keyof FieldErrors
						errors[field] = issue.message
					}
				})
				setFieldErrors(errors)
			} else {
				setError('An error occurred. Please try again.')
			}
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
							onChange={e => {
								setEmail(e.target.value)
								if (fieldErrors.email) {
									setFieldErrors(prev => ({ ...prev, email: undefined }))
								}
							}}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
								fieldErrors.email
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
							placeholder='admin@blondhouse.com'
						/>
						{fieldErrors.email && (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.email}</p>
						)}
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
							onChange={e => {
								setPassword(e.target.value)
								if (fieldErrors.password) {
									setFieldErrors(prev => ({ ...prev, password: undefined }))
								}
							}}
							className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
								fieldErrors.password
									? 'border-red-500 focus:ring-red-500'
									: 'border-zinc-300'
							}`}
							placeholder='••••••••'
						/>
						{fieldErrors.password && (
							<p className='mt-1 text-sm text-red-600'>{fieldErrors.password}</p>
						)}
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='group relative w-full overflow-hidden rounded-lg bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg'
					>
						{/* Shimmer animation overlay */}
						<span className='absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
						{/* Glow effect */}
						<span className='absolute inset-0 rounded-lg bg-amber-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
						<span className='relative z-10'>
							{isLoading ? 'Signing in...' : 'Sign In'}
						</span>
					</button>
				</form>
			</div>
		</div>
	)
}
