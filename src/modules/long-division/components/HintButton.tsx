import styles from './FeedbackArea.module.css'

interface HintButtonProps {
  level: number
  onClick: () => void
  disabled: boolean
}

const LABELS: Record<number, string> = {
  0: 'Hint',
  1: 'More Help',
  2: 'Show Answer',
}

export default function HintButton({ level, onClick, disabled }: HintButtonProps) {
  if (level >= 3) return null
  const label = LABELS[level] ?? 'Hint'
  return (
    <button className={styles.hintButton} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
