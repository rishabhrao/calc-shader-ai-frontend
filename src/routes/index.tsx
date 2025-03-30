import { createFileRoute } from '@tanstack/react-router'
import Calculator from '@/components/calculator'

export const Route = createFileRoute('/')({
	component: () => {
		return (
			<div className="px-4 w-full md:min-h-screen grid md:place-content-center">
				<Calculator />
			</div>
		)
	},
})
