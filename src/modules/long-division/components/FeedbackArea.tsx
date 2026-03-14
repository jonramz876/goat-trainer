import styles from './FeedbackArea.module.css'
import HintButton from './HintButton'

interface FeedbackAreaProps {
  promptText: string
  feedbackText: string | null
  hintLevel: number
  onHint: () => void
  maxHints?: number
}

export default function FeedbackArea({
  promptText,
  feedbackText,
  hintLevel,
  onHint,
  maxHints = 3,
}: FeedbackAreaProps) {
  return (
    <div className={styles.card}>
      <p className={styles.prompt}>{promptText}</p>
      {feedbackText !== null && (
        <p key={feedbackText} className={styles.feedback}>{feedbackText}</p>
      )}
      {hintLevel < maxHints && (
        <HintButton level={hintLevel} onClick={onHint} disabled={false} />
      )}
    </div>
  )
}
