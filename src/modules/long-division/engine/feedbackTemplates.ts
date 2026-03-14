interface DivideFeedbackInput {
  student: number
  correct: number
  divisor: number
  number: number // the number being divided into
}

interface MultiplyFeedbackInput {
  a: number
  b: number
  student: number
  correct: number
}

interface SubtractFeedbackInput {
  top: number
  bottom: number
  student: number
  correct: number
}

export function getDivideFeedback(input: DivideFeedbackInput): string {
  const { student, correct, divisor, number: num } = input

  // Nonzero when should be zero
  if (correct === 0 && student > 0) {
    const product = student * divisor
    return `${divisor} × ${student} = ${product}, but we only have ${num}. ${divisor} is too big to fit even once. Write 0.`
  }

  // Zero when shouldn't be
  if (student === 0 && correct > 0) {
    return `${divisor} does fit into ${num}! How many times?`
  }

  // Way off (difference > 2)
  if (Math.abs(student - correct) > 2) {
    return `Think about your ${divisor} times table. What's the biggest ${divisor} × ___ that fits under ${num}?`
  }

  // Too high
  if (student > correct) {
    const product = student * divisor
    return `${student} × ${divisor} = ${product}, which is bigger than ${num}. Try one less.`
  }

  // Too low
  if (student < correct) {
    const nextProduct = (student + 1) * divisor
    return `You could fit more! ${student + 1} × ${divisor} = ${nextProduct}, which still fits under ${num}.`
  }

  return 'Not quite. Try again.'
}

export function getMultiplyFeedback(input: MultiplyFeedbackInput): string {
  const { a, b, student, correct } = input
  return `Let's check: ${a} × ${b} = ${correct}. You wrote ${student}.`
}

export function getSubtractFeedback(input: SubtractFeedbackInput): string {
  const { top, bottom, student, correct } = input

  // Detect flipped direction (student = bottom - top)
  if (student === bottom - top && student !== correct) {
    return `Make sure you subtract the bottom from the top: ${top} − ${bottom}, not ${bottom} − ${top}.`
  }

  return `Let's recount: ${top} − ${bottom} = ${correct}. You wrote ${student}.`
}

// --- Hint tiers for guided/practice mode ---

export function getDivideHint(tier: number, divisor: number, number: number, correct: number): string {
  if (tier === 1) {
    return `Not quite. Think about the ${divisor} times table. ${divisor} × ___ gets close to ${number} without going over.`
  }
  if (tier === 2) {
    const lines: string[] = []
    for (let i = 1; i <= correct; i++) {
      lines.push(`${divisor} × ${i} = ${divisor * i}`)
    }
    return lines.join('\n')
  }
  // Tier 3: give answer
  return `The answer is ${correct}. ${divisor} × ${correct} = ${divisor * correct}. Type ${correct} to continue.`
}

export function getMultiplyHint(tier: number, a: number, b: number, correct: number): string {
  if (tier === 1) {
    return `Let's double-check: ${a} × ${b} = ?`
  }
  if (tier === 2) {
    return `${a} × ${b} = ${correct}`
  }
  return `The answer is ${correct}. Type ${correct} to continue.`
}

export function getSubtractHint(tier: number, top: number, bottom: number, correct: number): string {
  if (tier === 1) {
    return `Try again: ${top} − ${bottom} = ?`
  }
  if (tier === 2) {
    return `${top} − ${bottom} = ${correct}`
  }
  return `The answer is ${correct}. Type ${correct} to continue.`
}
