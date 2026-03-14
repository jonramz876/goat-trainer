import { useState, useCallback } from 'react'
import NumberPad from '../../../components/shared/NumberPad'
import styles from './MultiplicationDrill.module.css'

interface MultiplicationDrillProps {
  divisor: number
  childName?: string
  onComplete: () => void
}

function randomFactor(): number {
  return Math.floor(Math.random() * 8) + 2 // 2–9
}

function buildCards(divisor: number): { a: number; b: number; answer: number }[] {
  return Array.from({ length: 5 }, () => {
    const b = randomFactor()
    return { a: divisor, b, answer: divisor * b }
  })
}

type FeedbackState = 'none' | 'correct' | 'wrong'

export default function MultiplicationDrill({ divisor, onComplete }: MultiplicationDrillProps) {
  const [cards] = useState(() => buildCards(divisor))
  const [cardIndex, setCardIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('none')
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const currentCard = cards[cardIndex]

  const advance = useCallback(() => {
    const next = cardIndex + 1
    if (next >= cards.length) {
      setDone(true)
      // Give the student a moment to read "Nice!" before calling onComplete
      setTimeout(() => {
        onComplete()
      }, 1200)
    } else {
      setCardIndex(next)
      setInputValue('')
      setFeedback('none')
      setWrongAnswer(null)
    }
  }, [cardIndex, cards.length, onComplete])

  const handleConfirm = useCallback(() => {
    if (feedback !== 'none') return // waiting for auto-advance
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const student = parseInt(trimmed, 10)
    if (student === currentCard.answer) {
      setFeedback('correct')
      setTimeout(() => {
        advance()
      }, 500)
    } else {
      setWrongAnswer(currentCard.answer)
      setFeedback('wrong')
      setTimeout(() => {
        advance()
      }, 1500)
    }
  }, [feedback, inputValue, currentCard, advance])

  if (done) {
    return (
      <div className={styles.overlay}>
        <div className={styles.card}>
          <p className={styles.completeMessage}>Nice! Let's get back to dividing.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.title}>Multiplication Check-in</p>
        <p className={styles.progress}>{cardIndex + 1} / {cards.length}</p>

        <p className={styles.question}>
          {currentCard.a} × {currentCard.b} = ?
        </p>

        <p className={styles.inputDisplay}>{inputValue || '\u00A0'}</p>

        {feedback === 'correct' && (
          <p className={`${styles.feedback} ${styles.feedbackCorrect}`}>✓ Correct!</p>
        )}
        {feedback === 'wrong' && (
          <p className={`${styles.feedback} ${styles.feedbackWrong}`}>
            {currentCard.a} × {currentCard.b} = {wrongAnswer}
          </p>
        )}
        {feedback === 'none' && (
          <p className={styles.feedback}>&nbsp;</p>
        )}

        <NumberPad
          onDigit={(d) => {
            if (feedback === 'none' && inputValue.length < 4) {
              setInputValue(prev => prev + d)
            }
          }}
          onBackspace={() => {
            if (feedback === 'none') {
              setInputValue(prev => prev.slice(0, -1))
            }
          }}
          onConfirm={handleConfirm}
          disabled={feedback !== 'none'}
        />
      </div>
    </div>
  )
}
