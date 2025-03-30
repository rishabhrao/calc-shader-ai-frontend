import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { fetchShaderFromBackend, ShaderResponseType } from '@/lib/backend/fetch-shader'
import ShaderCanvas from './shader'

const defaultVertexShader = `
precision mediump float;
attribute vec3 a_position;
attribute vec3 a_normal;
uniform mat4 u_mvp;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    gl_Position = u_mvp * vec4(a_position, 1.0);
    v_normal = a_normal;
    v_position = a_position;
}
`

const defaultFragmentShader = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_position;
uniform vec3 u_cameraPosition;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(vec3(1, 2, 3));
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 color = vec3(0.2) + diff * vec3(0.8);
    gl_FragColor = vec4(color, 1.0);
}
`

const TextToShaderComponent: React.FC = () => {
	const [prompt, setPrompt] = useState<string>('')

	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [shaderResponse, setShaderResponse] = useState<ShaderResponseType>({
		status: 'ok',
		vertexShader: defaultVertexShader,
		fragmentShader: defaultFragmentShader,
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!prompt.trim() || isLoading) {
			return
		}

		setIsLoading(true)

		try {
			const response = await fetchShaderFromBackend(prompt)

			setShaderResponse(response)
		} catch (error) {
			console.error('Error generating shader:', error)

			setShaderResponse({
				status: 'error',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}

		setIsLoading(false)
	}

	return (
		<Card className="max-w-4xl w-full shadow-lg dark:shadow-indigo-900/20 border-0 dark:border dark:border-indigo-900/20">
			<CardHeader className="p-6 pb-2">
				<CardTitle className="text-xl font-semibold">Text to Shader Generator</CardTitle>
				<CardDescription className="text-muted-foreground">
					Describe the kind of shader you want, and we'll generate it
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				<form onSubmit={handleSubmit} className="flex space-x-2">
					<Input
						placeholder="A rotating cube with a gradient background"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						className="flex-grow border-input"
						disabled={isLoading}
					/>
					<Button
						type="submit"
						disabled={isLoading || !prompt.trim()}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Generating...
							</>
						) : (
							'Generate'
						)}
					</Button>
				</form>

				{shaderResponse.status === 'ok' ? (
					<div className="rounded-md overflow-hidden border border-border">
						<ShaderCanvas
							fragmentShader={shaderResponse.fragmentShader}
							vertexShader={shaderResponse.vertexShader}
						/>
					</div>
				) : (
					<Alert variant="destructive" className="bg-destructive/10 text-destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Shader Error</AlertTitle>
						<AlertDescription>{shaderResponse.error}</AlertDescription>
					</Alert>
				)}

				<Tabs defaultValue="fragment" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="fragment">Fragment Shader</TabsTrigger>

						<TabsTrigger value="vertex">Vertex Shader</TabsTrigger>
					</TabsList>

					<TabsContent value="fragment">
						<div className="bg-muted/50 rounded-md p-4 overflow-auto max-h-80">
							<pre className="text-primary whitespace-pre-wrap font-mono text-sm">
								{shaderResponse.status === 'ok'
									? shaderResponse.fragmentShader.trim()
									: shaderResponse.error}
							</pre>
						</div>
					</TabsContent>

					<TabsContent value="vertex">
						<div className="bg-muted/50 rounded-md p-4 overflow-auto max-h-80">
							<pre className="text-primary whitespace-pre-wrap font-mono text-sm">
								{shaderResponse.status === 'ok'
									? shaderResponse.vertexShader.trim()
									: shaderResponse.error}
							</pre>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}

export default TextToShaderComponent
