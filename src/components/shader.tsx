import { useEffect, useRef, useState } from 'react'
import { mat4, vec3 } from 'gl-matrix'

const ShaderCanvas = ({
	vertexShader,
	fragmentShader,
}: {
	vertexShader: string
	fragmentShader: string
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const [error, setError] = useState<string | null>(null)
	const animationRef = useRef<number | null>(null)
	const mouseDownRef = useRef(false)
	const lastMousePosRef = useRef({ x: 0, y: 0 })
	const cameraDistanceRef = useRef(5)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		// WebGL setup
		const gl = canvas.getContext('webgl')
		if (!gl) {
			setError('WebGL not supported')
			return
		}

		// Shader compilation
		let program: WebGLProgram
		try {
			const vs = gl.createShader(gl.VERTEX_SHADER)!
			gl.shaderSource(vs, vertexShader)
			gl.compileShader(vs)
			if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
				throw new Error(`Vertex shader error: ${gl.getShaderInfoLog(vs)}`)
			}

			const fs = gl.createShader(gl.FRAGMENT_SHADER)!
			gl.shaderSource(fs, fragmentShader)
			gl.compileShader(fs)
			if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
				throw new Error(`Fragment shader error: ${gl.getShaderInfoLog(fs)}`)
			}

			program = gl.createProgram()!
			gl.attachShader(program, vs)
			gl.attachShader(program, fs)
			gl.linkProgram(program)
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				throw new Error(`Program linking error: ${gl.getProgramInfoLog(program)}`)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong!')
			return
		}

		// Geometry data (cube with normals)
		const vertexData = new Float32Array([
			// Positions (3) + Normals (3)
			// Front face
			-1, -1, 1, 0, 0, 1, 1, -1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, -1, 1, 1, 0, 0, 1,
			// Back face
			-1, -1, -1, 0, 0, -1, -1, 1, -1, 0, 0, -1, 1, 1, -1, 0, 0, -1, 1, -1, -1, 0, 0, -1,
			// Top face
			-1, 1, -1, 0, 1, 0, -1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, -1, 0, 1, 0,
			// Bottom face
			-1, -1, -1, 0, -1, 0, 1, -1, -1, 0, -1, 0, 1, -1, 1, 0, -1, 0, -1, -1, 1, 0, -1, 0,
			// Right face
			1, -1, -1, 1, 0, 0, 1, 1, -1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, -1, 1, 1, 0, 0,
			// Left face
			-1, -1, -1, -1, 0, 0, -1, -1, 1, -1, 0, 0, -1, 1, 1, -1, 0, 0, -1, 1, -1, -1, 0, 0,
		])

		const indices = new Uint16Array([
			0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17,
			18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
		])

		// Buffers
		const vbo = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)

		const ibo = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

		// Matrix setup
		const projection = mat4.create()
		const view = mat4.create()
		const model = mat4.create()
		const mvp = mat4.create()
		const cameraPosition = vec3.fromValues(0, 0, cameraDistanceRef.current)

		// Attribute locations
		const positionLoc = gl.getAttribLocation(program, 'a_position')
		const normalLoc = gl.getAttribLocation(program, 'a_normal')

		// Mouse handlers
		const handleMouseDown = (e: MouseEvent | TouchEvent) => {
			mouseDownRef.current = true
			const pos = getEventPosition(e)
			lastMousePosRef.current = pos
		}

		const handleMouseUp = () => {
			mouseDownRef.current = false
		}

		const handleMouseMove = (e: MouseEvent | TouchEvent) => {
			if (!mouseDownRef.current) return
			const pos = getEventPosition(e)
			const delta = {
				x: pos.x - lastMousePosRef.current.x,
				y: pos.y - lastMousePosRef.current.y,
			}

			vec3.rotateY(cameraPosition, cameraPosition, [0, 0, 0], delta.x * 0.01)
			vec3.rotateX(cameraPosition, cameraPosition, [0, 0, 0], delta.y * 0.01)
			lastMousePosRef.current = pos
		}

		const handleWheel = (e: WheelEvent) => {
			cameraDistanceRef.current = Math.max(1, cameraDistanceRef.current + e.deltaY * 0.01)
		}

		// Render loop
		const render = (time: number) => {
			if (!gl) return

			gl.clearColor(0.1, 0.1, 0.1, 1)
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			gl.enable(gl.DEPTH_TEST)

			gl.useProgram(program)

			// Update matrices
			mat4.perspective(projection, Math.PI / 4, canvas.width / canvas.height, 0.1, 100)
			mat4.lookAt(view, cameraPosition, [0, 0, 0], [0, 1, 0])
			mat4.identity(model)

			mat4.multiply(mvp, projection, view)
			mat4.multiply(mvp, mvp, model)

			// Set uniforms
			const uniforms = {
				u_time: { type: '1f', value: time * 0.001 },
				u_mvp: { type: 'matrix4fv', value: mvp },
				u_model: { type: 'matrix4fv', value: model },
				u_cameraPosition: { type: '3fv', value: cameraPosition },
			}

			Object.entries(uniforms).forEach(([name, def]) => {
				const loc = gl.getUniformLocation(program, name)
				if (!loc) return

				switch (def.type) {
					case '1f':
						if (typeof def.value !== 'number') {
							console.error(
								`Uniform ${name} expected number, got ${typeof def.value}`,
							)
							return
						}
						gl.uniform1f(loc, def.value)
						break

					case '3fv':
						if (!(def.value instanceof Float32Array) && !Array.isArray(def.value)) {
							console.error(`Uniform ${name} expected vec3 array`)
							return
						}
						gl.uniform3fv(loc, def.value)
						break

					case 'matrix4fv':
						if (!(def.value instanceof Float32Array)) {
							console.error(`Uniform ${name} expected matrix array`)
							return
						}
						gl.uniformMatrix4fv(loc, false, def.value)
						break

					default:
						console.warn(`Unhandled uniform type: ${def.type}`)
				}
			})

			// Set attributes
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
			if (positionLoc >= 0) {
				gl.enableVertexAttribArray(positionLoc)
				gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 24, 0)
			}
			if (normalLoc >= 0) {
				gl.enableVertexAttribArray(normalLoc)
				gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 24, 12)
			}

			// Draw
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
			gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

			animationRef.current = requestAnimationFrame(render)
		}

		// Event listeners
		canvas.addEventListener('mousedown', handleMouseDown)
		canvas.addEventListener('mouseup', handleMouseUp)
		canvas.addEventListener('mousemove', handleMouseMove)
		canvas.addEventListener('wheel', handleWheel)
		canvas.addEventListener('touchstart', handleMouseDown)
		canvas.addEventListener('touchend', handleMouseUp)
		canvas.addEventListener('touchmove', handleMouseMove)

		animationRef.current = requestAnimationFrame(render)

		// Cleanup
		return () => {
			canvas.removeEventListener('mousedown', handleMouseDown)
			canvas.removeEventListener('mouseup', handleMouseUp)
			canvas.removeEventListener('mousemove', handleMouseMove)
			canvas.removeEventListener('wheel', handleWheel)
			canvas.removeEventListener('touchstart', handleMouseDown)
			canvas.removeEventListener('touchend', handleMouseUp)
			canvas.removeEventListener('touchmove', handleMouseMove)

			if (animationRef.current) cancelAnimationFrame(animationRef.current)
			gl.deleteProgram(program)
			gl.deleteBuffer(vbo)
			gl.deleteBuffer(ibo)
		}
	}, [vertexShader, fragmentShader])

	const getEventPosition = (e: MouseEvent | TouchEvent) => {
		if ('touches' in e) {
			return {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY,
			}
		}
		return {
			x: (e as MouseEvent).clientX,
			y: (e as MouseEvent).clientY,
		}
	}

	return (
		<div className="relative h-full w-full">
			<canvas
				ref={canvasRef}
				className="w-full h-64 bg-black"
				onContextMenu={(e) => e.preventDefault()}
			/>
			{error && (
				<div className="absolute top-2 left-2 right-2 p-4 bg-red-800 text-white rounded">
					Error: {error}
				</div>
			)}
		</div>
	)
}

export default ShaderCanvas
