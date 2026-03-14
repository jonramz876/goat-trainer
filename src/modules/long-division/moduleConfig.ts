import type { Module } from '../../types/module'
import LongDivisionModule from './index'

export const longDivisionModule: Module = {
  id: 'long-division',
  title: 'Long Division',
  description: 'Learn to divide big numbers step by step',
  icon: '➗',
  gradeRange: [3, 5],
  availableFor: ['jack', 'reese'],
  component: LongDivisionModule,
}
