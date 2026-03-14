import { ComponentType } from 'react'

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  gradeRange: [number, number]
  availableFor: string[]
  component: ComponentType<ModuleProps>
}

export interface ModuleProps {
  childName: string
  childId: string
  onExit: () => void
}

export interface ChildProfile {
  id: string
  name: string
}
