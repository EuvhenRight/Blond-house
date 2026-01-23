'use client'

import { FiMinus } from 'react-icons/fi'

export default function Divider() {
	return (
		<div className='flex items-center justify-center'>
			<div className='w-24 h-px bg-amber-400'></div>
			<FiMinus className='mx-4 text-amber-500' size={24} />
			<div className='w-24 h-px bg-amber-400'></div>
		</div>
	)
}
