import { z } from 'zod'

export const ShaderResponseSchema = z
	.object({
		status: z.literal('ok'),
		vertexShader: z.string(),
		fragmentShader: z.string(),
	})
	.or(
		z.object({
			status: z.literal('error'),
			error: z.string(),
		}),
	)

export type ShaderResponseType = z.output<typeof ShaderResponseSchema>

export async function fetchShaderFromBackend(prompt: string): Promise<ShaderResponseType> {
	try {
		const IS_PROD = true
		const BACKEND_URL = IS_PROD
			? 'https://calc-shader-ai-backend.rao.dev'
			: 'http://localhost:4000'

		const response = await fetch(`${BACKEND_URL}/api/shaders`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt }),
		})

		if (!response.ok) {
			throw new Error(`API error: ${response.statusText}`)
		}

		const dataUnsafe = await response.json()

		const data = ShaderResponseSchema.parse(dataUnsafe)

		return data
	} catch (error) {
		return {
			status: 'error',
			error: error instanceof Error ? error.message : 'Unknown error generating shader',
		}
	}
}
