'use client'

interface ConfirmDialogProps {
	open: boolean
	title: string
	description?: string
	confirmLabel?: string
	cancelLabel?: string
	tone?: 'default' | 'danger'
	isLoading?: boolean
	errorMessage?: string | null
	onConfirm: () => void
	onCancel: () => void
}

export default function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	tone = 'default',
	isLoading = false,
	errorMessage,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	if (!open) return null

	const isDanger = tone === 'danger'

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
			role='dialog'
			aria-modal='true'
			aria-labelledby='confirm-dialog-title'
			aria-describedby='confirm-dialog-description'
			onClick={e => {
				if (e.target === e.currentTarget && !isLoading) {
					onCancel()
				}
			}}
			onKeyDown={e => {
				if (e.key === 'Escape' && !isLoading) {
					onCancel()
				}
			}}
		>
			<div className='w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-6'>
				<h2
					id='confirm-dialog-title'
					className='mb-2 text-lg font-semibold text-zinc-900 sm:text-xl'
				>
					{title}
				</h2>
				{description && (
					<p
						id='confirm-dialog-description'
						className='mb-3 text-sm text-zinc-600 sm:mb-4'
					>
						{description}
					</p>
				)}

				{errorMessage && (
					<div
						className='mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'
						role='alert'
					>
						{errorMessage}
					</div>
				)}

				<div className='flex flex-col gap-2 pt-3 sm:flex-row sm:gap-3'>
					<button
						type='button'
						onClick={() => {
							if (!isLoading) {
								onConfirm()
							}
						}}
						disabled={isLoading}
						className={`flex-1 min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${
							isDanger
								? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-500'
								: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500'
						} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
						aria-busy={isLoading}
						aria-disabled={isLoading}
					>
						{isLoading ? 'Please wait...' : confirmLabel}
					</button>
					<button
						type='button'
						onClick={() => {
							if (!isLoading) {
								onCancel()
							}
						}}
						disabled={isLoading}
						className='flex-1 min-h-[44px] rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base'
					>
						{cancelLabel}
					</button>
				</div>
			</div>
		</div>
	)
}

