import styles from './NavBar.module.css'

interface NavBarProps {
  title: string
  onBack?: () => void
  showSoundToggle?: boolean
  muted?: boolean
  onToggleMute?: () => void
}

export default function NavBar({ title, onBack, showSoundToggle, muted, onToggleMute }: NavBarProps) {
  return (
    <div className={styles.navBar}>
      <div>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
        )}
      </div>
      <div className={styles.title}>{title}</div>
      <div>
        {showSoundToggle && (
          <button className={styles.soundBtn} onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
    </div>
  )
}
