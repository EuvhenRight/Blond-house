import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'gray'
	size?: 'sm' | 'md' | 'lg'
}

const badgeVariants = {
	default: 'bg-zinc-900 text-white hover:bg-zinc-800',
	green: 'bg-green-500 text-white hover:bg-green-600',
	red: 'bg-red-500 text-white hover:bg-red-600',
	amber: 'bg-amber-500 text-white hover:bg-amber-600',
	blue: 'bg-blue-500 text-white hover:bg-blue-600',
	gray: 'bg-zinc-500 text-white hover:bg-zinc-600',
}

const badgeSizes = {
	sm: 'h-4 min-w-4 px-1.5 text-[0.625rem]',
	md: 'h-5 min-w-fit px-2 text-xs whitespace-nowrap',
	lg: 'h-6 min-w-6 px-2 text-sm',
}

export function Badge({
	className,
	variant = 'default',
	size = 'md',
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center justify-center rounded-full font-mono tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2',
				badgeVariants[variant],
				badgeSizes[size],
				className
			)}
			{...props}
		/>
	)
}

