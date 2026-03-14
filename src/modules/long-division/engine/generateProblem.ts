import type { Problem } from './types'

export const FALLBACK_PROBLEMS: Record<number, Problem> = {
  1: { dividend: 84, divisor: 4, quotient: 21, remainder: 0 },
  2: { dividend: 83, divisor: 5, quotient: 16, remainder: 3 },
  3: { dividend: 432, divisor: 8, quotient: 54, remainder: 0 },
  4: { dividend: 519, divisor: 4, quotient: 129, remainder: 3 },
  5: { dividend: 2418, divisor: 6, quotient: 403, remainder: 0 },
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function hasZeroInQuotient(quotient: number): boolean {
  return String(quotient).includes('0')
}

function isDuplicate(
  p: Problem,
  recent: Array<{ dividend: number; divisor: number }>,
): boolean {
  return recent.some(r => r.dividend === p.dividend && r.divisor === p.divisor)
}

function generateTier1(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(2, Math.floor(99 / divisor))
  const dividend = quotient * divisor
  if (dividend < 10 || dividend > 99) return generateTier1()
  if (hasZeroInQuotient(quotient)) return generateTier1()
  return { dividend, divisor, quotient, remainder: 0 }
}

function generateTier2(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(2, Math.floor(99 / divisor))
  const remainder = randomInt(1, divisor - 1)
  const dividend = quotient * divisor + remainder
  if (dividend < 10 || dividend > 99) return generateTier2()
  if (hasZeroInQuotient(quotient)) return generateTier2()
  return { dividend, divisor, quotient, remainder }
}

function generateTier3(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(11, Math.floor(999 / divisor))
  const dividend = quotient * divisor
  if (dividend < 100 || dividend > 999) return generateTier3()
  if (hasZeroInQuotient(quotient)) return generateTier3()
  return { dividend, divisor, quotient, remainder: 0 }
}

function generateTier4(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(11, Math.floor(999 / divisor))
  const remainder = randomInt(1, divisor - 1)
  const dividend = quotient * divisor + remainder
  if (dividend < 100 || dividend > 999) return generateTier4()
  if (hasZeroInQuotient(quotient)) return generateTier4()
  return { dividend, divisor, quotient, remainder }
}

function generateTier5(): Problem {
  const divisor = randomInt(2, 9)
  const usesFourDigits = Math.random() > 0.5
  const maxDividend = usesFourDigits ? 9999 : 999
  const minQuotient = usesFourDigits ? 100 : 11
  const maxQuotient = Math.floor(maxDividend / divisor)
  const quotient = randomInt(minQuotient, maxQuotient)
  const maxRemainder = divisor - 1
  const remainder = randomInt(0, maxRemainder)
  const dividend = quotient * divisor + remainder
  if (dividend < 100 || dividend > 9999) return generateTier5()
  return { dividend, divisor, quotient, remainder }
}

const generators: Record<number, () => Problem> = {
  1: generateTier1,
  2: generateTier2,
  3: generateTier3,
  4: generateTier4,
  5: generateTier5,
}

export function generateProblem(
  tier: number,
  recentProblems: Array<{ dividend: number; divisor: number }>,
): Problem {
  const generate = generators[tier]
  if (!generate) return FALLBACK_PROBLEMS[tier] ?? FALLBACK_PROBLEMS[1]

  for (let attempt = 0; attempt < 100; attempt++) {
    const problem = generate()
    if (!isDuplicate(problem, recentProblems)) {
      return problem
    }
  }

  // Fallback after 100 attempts
  return FALLBACK_PROBLEMS[tier]
}
