export type EvaluateResult =
	| {
			status: 'ok'
			result: string
	  }
	| {
			status: 'error'
			error: string
	  }

export type EvaluateType = (expression: string) => EvaluateResult
