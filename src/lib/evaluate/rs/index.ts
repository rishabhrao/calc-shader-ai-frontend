import { EvaluateType } from '../types'
import { evaluate_rs } from '@/../wasm/pkg'

export const evaluateRs: EvaluateType = (expression) => {
	if (!expression) {
		return {
			status: 'ok',
			result: '0',
		}
	}

	try {
		const result = evaluate_rs(expression)

		return {
			status: 'ok',
			result: result.toString(),
		}
	} catch (error) {
		return {
			status: 'error',
			error: error instanceof Error ? error.message : 'Invalid expression',
		}
	}
}
