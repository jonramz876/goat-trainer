import styles from './TierDisplay.module.css'

interface TierDisplayProps {
  tier: number
  streak: number
  showAdvance: boolean
}

export default function TierDisplay({ tier, streak, showAdvance }: TierDisplayProps) {
  return (
    <div className={styles.container}>
      <span className={styles.tierBadge}>Tier {tier}</span>
      <div className={styles.streakDots}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < streak ? styles.dotFilled : styles.dotEmpty}`}
          />
        ))}
      </div>
      {showAdvance && (
        <span className={styles.advanceOverlay}>Level Up!</span>
      )}
    </div>
  )
}
