import { EvaluateType } from '../types'
import Mexp from 'math-expression-evaluator'

export const evaluateTs: EvaluateType = (expression) => {
	if (!expression) {
		return {
			status: 'ok',
			result: '0',
		}
	}

	try {
		const mexp = new Mexp()

		const lexed = mexp.lex(expression)

		const postfixed = mexp.toPostfix(lexed)

		const result = mexp.postfixEval(postfixed)

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
