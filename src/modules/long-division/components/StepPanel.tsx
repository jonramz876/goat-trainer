import styles from './StepPanel.module.css'

type StepType = 'divide' | 'multiply' | 'subtract' | 'bringdown'

interface StepPanelProps {
  activeStep: StepType | null
}

const STEPS: { type: StepType; label: string }[] = [
  { type: 'divide', label: 'DIV' },
  { type: 'multiply', label: 'MUL' },
  { type: 'subtract', label: 'SUB' },
  { type: 'bringdown', label: 'BD' },
]

export default function StepPanel({ activeStep }: StepPanelProps) {
  return (
    <div className={styles.panel}>
      {STEPS.map(({ type, label }) => (
        <div
          key={type}
          className={`${styles.step} ${styles[type]} ${activeStep === type ? styles.active : ''}`}
        >
          <div className={styles.dot} />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
