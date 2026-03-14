import type { ChildProfile } from '../types/module'
import styles from './NamePicker.module.css'

interface NamePickerProps {
  profiles: ChildProfile[]
  onPick: (child: ChildProfile) => void
}

export default function NamePicker({ profiles, onPick }: NamePickerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>🐐 GOAT Trainer</div>
      <div className={styles.subtitle}>Who's training today?</div>
      <div className={styles.buttons}>
        {profiles.map(profile => (
          <button
            key={profile.id}
            className={styles.nameBtn}
            onClick={() => onPick(profile)}
          >
            {profile.name}
          </button>
        ))}
      </div>
    </div>
  )
}
