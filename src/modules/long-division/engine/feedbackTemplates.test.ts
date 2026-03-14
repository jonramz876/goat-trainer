import { describe, it, expect } from 'vitest'
import { getDivideFeedback, getMultiplyFeedback, getSubtractFeedback } from './feedbackTemplates'

describe('getDivideFeedback', () => {
  it('returns "too high" feedback', () => {
    const fb = getDivideFeedback({ student: 5, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('bigger than')
    expect(fb).toContain('Try one less')
  })

  it('returns "too low" feedback', () => {
    const fb = getDivideFeedback({ student: 2, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('fit more')
  })

  it('returns "way off" feedback', () => {
    const fb = getDivideFeedback({ student: 9, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('times table')
  })

  it('returns "zero when shouldnt" feedback', () => {
    const fb = getDivideFeedback({ student: 0, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('does fit')
  })

  it('returns "nonzero when should be zero" feedback', () => {
    const fb = getDivideFeedback({ student: 1, correct: 0, divisor: 6, number: 4 })
    expect(fb).toContain('too big to fit')
  })
})

describe('getMultiplyFeedback', () => {
  it('returns correction with correct answer', () => {
    const fb = getMultiplyFeedback({ a: 3, b: 4, student: 10, correct: 12 })
    expect(fb).toContain('3 × 4 = 12')
  })
})

describe('getSubtractFeedback', () => {
  it('returns correction for wrong difference', () => {
    const fb = getSubtractFeedback({ top: 15, bottom: 12, student: 2, correct: 3 })
    expect(fb).toContain('15 − 12 = 3')
  })

  it('detects flipped subtraction', () => {
    const fb = getSubtractFeedback({ top: 12, bottom: 9, student: -3, correct: 3 })
    expect(fb).toContain('bottom from the top')
  })
})
