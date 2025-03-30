import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { evaluateRs } from '@/lib/evaluate/rs'
import { evaluateTs } from '@/lib/evaluate/ts'
import { EvaluateType } from '@/lib/evaluate/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Menu } from 'lucide-react'
import { Switch } from './ui/switch'
import { Label } from './ui/label'

const Calculator: React.FC = () => {
	const [evaluate, setEvaluate] = useState<{
		type: 'rs' | 'ts'
		evaluate: EvaluateType
	}>({
		type: 'rs',
		evaluate: evaluateRs,
	})

	const [debugDetails, setDebugDetails] = useState<string[] | null>(null)

	const [display, setDisplay] = useState<string>('')
	const [result, setResult] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [calculated, setCalculated] = useState<boolean>(false)

	const handleButtonClick = (value: string): void => {
		setError('')

		if (calculated) {
			// After calculation, if an operator is pressed, use result as starting point
			if ('+-*/'.includes(value)) {
				setDisplay(result + value)
				setResult('')
				setCalculated(false)
			}
			// After calculation, if a number is pressed, start fresh
			else if ('0123456789'.includes(value)) {
				setDisplay(value)
				setResult('')
				setCalculated(false)
			}
			// For other cases like brackets, append to result
			else {
				setDisplay(result + value)
				setResult('')
				setCalculated(false)
			}
		}
		// Normal input mode - just append
		else {
			setDisplay(display + value)
		}
	}

	const handleClear = (): void => {
		setDisplay('')
		setResult('')
		setError('')
		setCalculated(false)
	}

	const handleBackspace = (): void => {
		setDisplay(display.slice(0, -1))
		setError('')
		if (calculated) {
			setCalculated(false)
		}
	}

	const handleCalculate = (): void => {
		if (!display) return

		try {
			const timeStart = performance.now() + performance.timeOrigin
			const response = evaluate.evaluate(display)
			const timeEnd = performance.now() + performance.timeOrigin

			if (debugDetails != null) {
				setDebugDetails([
					`Input expression: ${display}`,
					`Evaluator: ${evaluate.type === 'ts' ? 'Javascript' : 'Rust Wasm'}`,
					`Result: ${response.status === 'ok' ? response.result : response.error}`,
					`Computation time: ${timeEnd - timeStart}ms`,
				])
			}

			if (response.status === 'ok') {
				setResult(response.result)
				setCalculated(true)
			} else {
				setError(response.error)
				setCalculated(false)
			}
		} catch (err) {
			setError('Calculation error')
			setCalculated(false)
		}
	}

	// Define button groups for the calculator layout
	const buttons: {
		label: string
		action: () => void
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
		className?: string
		span?: number
	}[][] = [
		[
			{
				label: 'AC',
				action: handleClear,
				variant: 'destructive',
				className: 'text-white',
			},
			{ label: '(', action: () => handleButtonClick('('), variant: 'secondary' },
			{ label: ')', action: () => handleButtonClick(')'), variant: 'secondary' },
			{
				label: '÷',
				action: () => handleButtonClick('/'),
				className:
					'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium',
			},
		],

		[
			{ label: '7', action: () => handleButtonClick('7'), variant: 'outline' },
			{ label: '8', action: () => handleButtonClick('8'), variant: 'outline' },
			{ label: '9', action: () => handleButtonClick('9'), variant: 'outline' },
			{
				label: '×',
				action: () => handleButtonClick('*'),
				className:
					'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium',
			},
		],

		[
			{ label: '4', action: () => handleButtonClick('4'), variant: 'outline' },
			{ label: '5', action: () => handleButtonClick('5'), variant: 'outline' },
			{ label: '6', action: () => handleButtonClick('6'), variant: 'outline' },
			{
				label: '-',
				action: () => handleButtonClick('-'),
				className:
					'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium',
			},
		],

		[
			{ label: '1', action: () => handleButtonClick('1'), variant: 'outline' },
			{ label: '2', action: () => handleButtonClick('2'), variant: 'outline' },
			{ label: '3', action: () => handleButtonClick('3'), variant: 'outline' },
			{
				label: '+',
				action: () => handleButtonClick('+'),
				className:
					'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium',
			},
		],

		[
			{ label: '0', action: () => handleButtonClick('0'), variant: 'outline', span: 2 },
			{ label: '⌫', action: handleBackspace, variant: 'secondary' },
			{
				label: '=',
				action: handleCalculate,
				className:
					'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-medium',
			},
		],
	]

	return (
		<Card className="w-full md:w-md shadow-lg dark:shadow-indigo-900/20 border-0 dark:border dark:border-indigo-900/20">
			<CardHeader className="p-6 pb-2 flex justify-between items-center">
				<CardTitle className="text-xl font-semibold">Calculator</CardTitle>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							<Menu />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent className="w-56">
						<div className="flex items-center space-x-3 p-2">
							<Switch
								id="rust-wasm-toggle"
								checked={evaluate.type === 'rs'}
								onCheckedChange={(checked) =>
									setEvaluate(
										checked
											? {
													type: 'rs',
													evaluate: evaluateRs,
												}
											: {
													type: 'ts',
													evaluate: evaluateTs,
												},
									)
								}
							/>

							<Label htmlFor="rust-wasm-toggle">Use Rust Wasm</Label>
						</div>

						<div className="mt-2 flex items-center space-x-3 p-2">
							<Switch
								id="debug-mode-toggle"
								checked={debugDetails != null}
								onCheckedChange={(checked) => setDebugDetails(checked ? [] : null)}
							/>

							<Label htmlFor="debug-mode-toggle">Show debug details</Label>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			<CardContent className="p-6">
				<div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-t-xl flex flex-col items-end justify-end overflow-hidden">
					{/* Display area - Android style with expression on top, result on bottom */}

					<form
						onSubmit={(e) => {
							e.preventDefault()
							handleCalculate()
						}}
					>
						<input
							className={`w-full text-right transition-all duration-200 font-mono ${calculated ? 'text-gray-500 dark:text-gray-400 text-xl' : 'text-3xl font-semibold'}`}
							value={display || '0'}
							onChange={(e) => setDisplay(e.target.value)}
						/>
					</form>

					{error ? (
						<div className="cursor-default text-red-500 dark:text-red-400 text-xl mt-2 font-mono">
							{error}
						</div>
					) : calculated && result ? (
						<div className="cursor-default text-4xl font-semibold mt-2 font-mono w-full text-right text-indigo-600 dark:text-indigo-400">
							{result}
						</div>
					) : null}
				</div>

				{/* Button grid with padding */}
				<div className="p-4 grid grid-cols-4 gap-2">
					{buttons.map((row, rowIndex) => (
						<React.Fragment key={`row-${rowIndex}`}>
							{row.map((button, buttonIndex) => (
								<Button
									key={`button-${rowIndex}-${buttonIndex}`}
									onClick={button.action}
									variant={button.variant}
									className={`h-16 font-medium text-lg transition-all ${button.className || ''}`}
									style={{
										gridColumn: button.span ? `span ${button.span}` : 'span 1',
									}}
								>
									{button.label}
								</Button>
							))}
						</React.Fragment>
					))}
				</div>

				{debugDetails == null ? null : (
					<div className={'mt-4 px-2'}>
						<p className="font-semibold text-muted-foreground text-sm">Debug details</p>

						<div className="text-muted-foreground/75 text-xs">
							{debugDetails.length === 0
								? 'N/A'
								: debugDetails.map((line) => <p key={line}>{line}</p>)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default Calculator
