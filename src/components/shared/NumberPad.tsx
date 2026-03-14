import styles from './NumberPad.module.css'

interface NumberPadProps {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onConfirm: () => void
  disabled?: boolean
}

export default function NumberPad({ onDigit, onBackspace, onConfirm, disabled }: NumberPadProps) {
  return (
    <div className={styles.pad}>
      {['1','2','3','4','5','6','7','8','9','0'].map(d => (
        <button
          key={d}
          className={styles.key}
          onClick={() => !disabled && onDigit(d)}
          disabled={disabled}
        >
          {d}
        </button>
      ))}
      <button className={`${styles.key} ${styles.wide}`} onClick={() => !disabled && onBackspace()} disabled={disabled}>
        ⌫
      </button>
      <button className={`${styles.key} ${styles.wide} ${styles.confirm}`} onClick={() => !disabled && onConfirm()} disabled={disabled}>
        ✓
      </button>
    </div>
  )
}
