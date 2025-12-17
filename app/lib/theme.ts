/**
 * Theme configuration for the application
 * Centralized theme values for consistent styling
 */

export const theme = {
	colors: {
		background: {
			gradient: 'bg-linear-to-r from-amber-50 via-white to-amber-50',
			primary: 'bg-white',
			secondary: 'bg-amber-50',
			dark: 'bg-zinc-900',
		},
		text: {
			primary: 'text-zinc-900',
			secondary: 'text-zinc-600',
			muted: 'text-zinc-500',
			light: 'text-white',
		},
		border: {
			default: 'border-zinc-200',
			light: 'border-zinc-200/80',
			dark: 'border-zinc-900',
		},
	},
	spacing: {
		container: 'mx-auto max-w-6xl px-6',
		section: 'py-16 md:py-24',
	},
	typography: {
		fontFamily: 'var(--font-plus-jakarta-sans)',
	},
	effects: {
		blur: {
			header: 'backdrop-blur-md',
		},
		shadow: {
			sm: 'shadow-sm',
			md: 'shadow-md',
			lg: 'shadow-lg',
		},
	},
} as const

