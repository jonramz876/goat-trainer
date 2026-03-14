import { useState } from 'react'
import { loadProgress, clearProgress } from '../modules/long-division/state/persistence'
import styles from './StatsScreen.module.css'

interface StatsScreenProps {
  childId: string
  childName: string
  onBack: () => void
}

export default function StatsScreen({ childId, childName, onBack }: StatsScreenProps) {
  const [cleared, setCleared] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const progress = cleared ? loadProgress('__nonexistent__') : loadProgress(childId)

  const accuracy = progress.totalAttempted > 0
    ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
    : 0

  const stepAccuracy = (step: { correct: number; total: number }) =>
    step.total > 0 ? Math.round((step.correct / step.total) * 100) + '%' : '—'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>📊 {childName}'s Stats</div>

        <div className={styles.sectionTitle}>Overall</div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Current Tier</span>
          <span className={styles.statValue}>{progress.tier}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Highest Tier</span>
          <span className={styles.statValue}>{progress.highestTier}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Total Problems</span>
          <span className={styles.statValue}>{progress.totalAttempted}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Accuracy</span>
          <span className={styles.statValue}>{accuracy}%</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Streak</span>
          <span className={styles.statValue}>{progress.streak} 🔥</span>
        </div>

        <div className={styles.sectionTitle}>Step Breakdown</div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Divide</span>
          <span className={styles.statValue}>{stepAccuracy(progress.stepAccuracy.divide)}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Multiply</span>
          <span className={styles.statValue}>{stepAccuracy(progress.stepAccuracy.multiply)}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Subtract</span>
          <span className={styles.statValue}>{stepAccuracy(progress.stepAccuracy.subtract)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button className={styles.backBtn} onClick={onBack}>← Back to Hub</button>

        {!confirming ? (
          <button
            className={styles.backBtn}
            style={{ color: '#EF4444' }}
            onClick={() => setConfirming(true)}
          >
            Clear Stats
          </button>
        ) : (
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#64748B' }}>
            Are you sure?
            <button
              className={styles.backBtn}
              style={{ color: '#EF4444', fontWeight: 700 }}
              onClick={() => {
                clearProgress(childId)
                setCleared(true)
                setConfirming(false)
              }}
            >
              Yes, clear
            </button>
            <button
              className={styles.backBtn}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  )
}
