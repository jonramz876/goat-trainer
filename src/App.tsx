import { useState, useEffect } from 'react'
import type { ChildProfile } from './types/module'
import NamePicker from './components/NamePicker'
import Hub from './components/Hub'
import StatsScreen from './components/StatsScreen'
import { longDivisionModule } from './modules/long-division/moduleConfig'
import styles from './App.module.css'

type Screen = 'picker' | 'hub' | 'stats' | 'module'

const CHILDREN: ChildProfile[] = [
  { id: 'jack', name: 'Jack' },
  { id: 'reese', name: 'Reese' },
  { id: 'kate', name: 'Kate' },
]

const MODULES = [longDivisionModule]

export default function App() {
  const [screen, setScreen] = useState<Screen>('picker')
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const [activeModule, setActiveModule] = useState<string | null>(null)

  useEffect(() => {
    const savedId = localStorage.getItem('goat-trainer-active-child')
    if (savedId) {
      const child = CHILDREN.find(c => c.id === savedId)
      if (child) {
        setActiveChild(child)
        setScreen('hub')
      }
    }
  }, [])

  const handlePickChild = (child: ChildProfile) => {
    setActiveChild(child)
    localStorage.setItem('goat-trainer-active-child', child.id)
    setScreen('hub')
  }

  const handleOpenModule = (moduleId: string) => {
    setActiveModule(moduleId)
    setScreen('module')
  }

  return (
    <>
      <div className={styles.portraitOverlay}>
        <div style={{ fontSize: 64 }}>🐐</div>
        <div>Please rotate your iPad to landscape mode</div>
      </div>

      {screen === 'picker' && (
        <NamePicker profiles={CHILDREN} onPick={handlePickChild} />
      )}

      {screen === 'hub' && activeChild && (
        <Hub
          child={activeChild}
          modules={MODULES}
          onOpenModule={handleOpenModule}
          onOpenStats={() => setScreen('stats')}
          onSwitchChild={() => { setActiveChild(null); setScreen('picker') }}
        />
      )}

      {screen === 'stats' && activeChild && (
        <StatsScreen childId={activeChild.id} childName={activeChild.name} onBack={() => setScreen('hub')} />
      )}

      {screen === 'module' && activeChild && activeModule && (() => {
        const mod = MODULES.find(m => m.id === activeModule)
        if (!mod) return null
        const ModComponent = mod.component
        return <ModComponent childName={activeChild.name} childId={activeChild.id} onExit={() => setScreen('hub')} />
      })()}
    </>
  )
}
