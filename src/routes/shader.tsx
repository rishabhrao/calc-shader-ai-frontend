import { createFileRoute } from '@tanstack/react-router'
import TextToShader from '@/components/text-to-shader'

export const Route = createFileRoute('/shader')({
	component: () => {
		return (
			<div className="px-4 w-full md:min-h-screen grid md:place-content-center">
				<TextToShader />
			</div>
		)
	},
})
