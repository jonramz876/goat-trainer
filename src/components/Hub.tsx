import type { ChildProfile, Module } from '../types/module'
import { loadProgress } from '../modules/long-division/state/persistence'
import styles from './Hub.module.css'

interface HubProps {
  child: ChildProfile
  modules: Module[]
  onOpenModule: (moduleId: string) => void
  onOpenStats: () => void
  onSwitchChild: () => void
}

export default function Hub({ child, modules, onOpenModule, onOpenStats, onSwitchChild }: HubProps) {
  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.topBarBtn} onClick={onSwitchChild}>← Switch</button>
        <div className={styles.topBarTitle}>Hi, {child.name}!</div>
        <button className={styles.topBarBtn} onClick={onOpenStats}>📊 Stats</button>
      </div>

      <div className={styles.moduleGrid}>
        {modules.map(mod => {
          const available = mod.availableFor.includes(child.id)
          if (available) {
            const progress = loadProgress(child.id)
            return (
              <div
                key={mod.id}
                className={styles.moduleCard}
                onClick={() => onOpenModule(mod.id)}
              >
                <div className={styles.moduleIcon}>{mod.icon}</div>
                <div className={styles.moduleTitle}>{mod.title}</div>
                <div className={styles.moduleTier}>Tier {progress.tier}</div>
              </div>
            )
          } else {
            return (
              <div key={mod.id} className={styles.moduleCardLocked}>
                <div className={styles.moduleIcon}>🔒</div>
                <div className={styles.moduleTitle}>{mod.title}</div>
                <div className={styles.lockedText}>Coming Soon!</div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}
