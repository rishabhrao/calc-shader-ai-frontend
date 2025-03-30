import { describe, it, expect } from 'vitest'
import { evaluateTs } from './index'

describe.concurrent('evaluate function', () => {
	// Basic operations
	it('handles simple addition', () => {
		expect(evaluateTs('3+4')).toEqual({ status: 'ok', result: '7' })
	})

	it('handles simple subtraction', () => {
		expect(evaluateTs('8-3')).toEqual({ status: 'ok', result: '5' })
	})

	it('handles simple multiplication', () => {
		expect(evaluateTs('6*7')).toEqual({ status: 'ok', result: '42' })
	})

	it('handles simple division', () => {
		expect(evaluateTs('10/2')).toEqual({ status: 'ok', result: '5' })
	})

	// Operator precedence
	it('respects operator precedence - multiplication before addition', () => {
		expect(evaluateTs('3+4*2')).toEqual({ status: 'ok', result: '11' })
	})

	it('respects operator precedence - division before subtraction', () => {
		expect(evaluateTs('10-6/2')).toEqual({ status: 'ok', result: '7' })
	})

	// Parentheses
	it('handles basic parentheses', () => {
		expect(evaluateTs('(3+4)*2')).toEqual({ status: 'ok', result: '14' })
	})

	it('handles nested parentheses', () => {
		expect(evaluateTs('(2*(3+4))')).toEqual({ status: 'ok', result: '14' })
	})

	it('handles complex parentheses expressions', () => {
		expect(evaluateTs('((2+3)*(4-1))/3')).toEqual({ status: 'ok', result: '5' })
	})

	// Unary operators
	it('handles unary plus', () => {
		expect(evaluateTs('+5')).toEqual({ status: 'ok', result: '5' })
	})

	it('handles unary minus', () => {
		expect(evaluateTs('-5')).toEqual({ status: 'ok', result: '-5' })
	})

	it('handles unary minus in expressions', () => {
		expect(evaluateTs('5*-2')).toEqual({ status: 'ok', result: '-10' })
	})

	// Whitespace handling
	it('handles expressions with whitespace', () => {
		expect(evaluateTs(' 3 + 4 ')).toEqual({ status: 'ok', result: '7' })
	})

	// Decimal numbers
	it('handles decimal numbers', () => {
		expect(evaluateTs('3.5+2.1')).toEqual({ status: 'ok', result: '5.6' })
	})

	// Edge cases
	it('handles empty expression', () => {
		expect(evaluateTs('')).toEqual({
			status: 'ok',
			result: '0',
		})
	})

	it('handles single number', () => {
		expect(evaluateTs('42')).toEqual({ status: 'ok', result: '42' })
	})

	// Error cases
	it('detects division by zero', () => {
		expect(evaluateTs('5/0')).toEqual({
			status: 'ok',
			result: 'Infinity',
		})
	})

	it('detects unbalanced parentheses - missing closing', () => {
		expect(evaluateTs('(3+4')).toEqual({
			status: 'ok',
			result: '7',
		})
	})

	it('detects unbalanced parentheses - missing opening', () => {
		expect(evaluateTs('3+4)')).toEqual({
			status: 'error',
			error: 'Closing parenthesis are more than opening one, wait What!!!',
		})
	})

	it('detects invalid characters', () => {
		expect(evaluateTs('3$2')).toEqual({
			status: 'error',
			error: "Can't understand after 3$2",
		})
	})

	it('detects invalid expression', () => {
		expect(evaluateTs('3+')).toEqual({
			status: 'error',
			error: 'complete the expression',
		})
	})

	it('detects invalid expression with double operators', () => {
		expect(evaluateTs('3++4')).toEqual({
			status: 'ok',
			result: '7',
		})
	})

	// Complex expressions
	it('handles complex expressions', () => {
		expect(evaluateTs('3+4*2/(1-5)')).toEqual({ status: 'ok', result: '1' })
	})

	it('handles expressions with multiple operations of same precedence', () => {
		expect(evaluateTs('3+4-2+1')).toEqual({ status: 'ok', result: '6' })
		expect(evaluateTs('8/4*2')).toEqual({ status: 'ok', result: '4' })
	})

	// Boundary cases
	it('handles very large numbers', () => {
		expect(evaluateTs('999999*999999')).toEqual({
			status: 'ok',
			result: '999998000001',
		})
	})

	it('handles very small decimal results', () => {
		expect(evaluateTs('1/1000')).toEqual({ status: 'ok', result: '0.001' })
	})
})
