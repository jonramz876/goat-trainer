import { useState } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'

interface Props {
  state: LDState
  dispatch: Dispatch<LDAction>
}

const STEPS = [
  { id: 'divide', label: 'Divide', color: '#3B82F6', bg: '#EFF6FF', desc: 'How many times does the divisor go into the number?' },
  { id: 'multiply', label: 'Multiply', color: '#10B981', bg: '#ECFDF5', desc: 'Multiply the answer by the divisor' },
  { id: 'subtract', label: 'Subtract', color: '#F59E0B', bg: '#FFFBEB', desc: 'Subtract to find what\'s left over' },
  { id: 'bringdown', label: 'Bring Down', color: '#8B5CF6', bg: '#F5F3FF', desc: 'Bring down the next digit' },
]

const CORRECT_ORDER = ['divide', 'multiply', 'subtract', 'bringdown']

// Scrambled order for pills
const SCRAMBLED = ['subtract', 'bringdown', 'divide', 'multiply']

export default function Screen3_FourSteps({ dispatch }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null, null])
  const [wrongSlots, setWrongSlots] = useState<boolean[]>([false, false, false, false])
  const [checked, setChecked] = useState(false)
  const [wrongCount, setWrongCount] = useState(0)
  const [done, setDone] = useState(false)

  const placedIds = placed.filter(Boolean) as string[]

  const handlePillClick = (id: string) => {
    if (done) return
    if (placedIds.includes(id)) return // already placed
    setSelected(s => s === id ? null : id)
  }

  const handleSlotClick = (slotIdx: number) => {
    if (done) return
    if (placed[slotIdx]) {
      // Un-place it
      const removedId = placed[slotIdx]!
      setPlaced(prev => { const n = [...prev]; n[slotIdx] = null; return n })
      setSelected(removedId)
      return
    }
    if (!selected) return
    setPlaced(prev => { const n = [...prev]; n[slotIdx] = selected; return n })
    setSelected(null)
  }

  const allFilled = placed.every(Boolean)

  const handleCheck = () => {
    if (!allFilled || done) return
    const newWrong = CORRECT_ORDER.map((id, i) => placed[i] !== id)
    setWrongSlots(newWrong)
    setChecked(true)

    const anyWrong = newWrong.some(Boolean)
    if (!anyWrong) {
      setDone(true)
      dispatch({ type: 'LESSON_INPUT_CORRECT' })
    } else {
      const newCount = wrongCount + 1
      setWrongCount(newCount)
      dispatch({ type: 'LESSON_INPUT_WRONG' })
      if (newCount >= 3) {
        // Auto-fill remaining
        setPlaced([...CORRECT_ORDER])
        setWrongSlots([false, false, false, false])
        setDone(true)
        dispatch({ type: 'LESSON_INPUT_CORRECT' })
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 28, color: '#1E293B', margin: 0 }}>
        The Four Steps
      </h2>

      {/* Step cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map(step => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: step.bg,
              borderRadius: 10,
              padding: '12px 16px',
              borderLeft: `5px solid ${step.color}`,
            }}
          >
            <span style={{
              background: step.color,
              color: 'white',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}>
              {step.label[0]}
            </span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: 15 }}>{step.label}</p>
              <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ordering exercise */}
      <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#334155', fontSize: 15 }}>
          Put them in order! Tap a step, then tap the slot.
        </p>

        {/* Available pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {SCRAMBLED.map(id => {
            const step = STEPS.find(s => s.id === id)!
            const isPlaced = placedIds.includes(id)
            const isSelected = selected === id
            return (
              <button
                key={id}
                onClick={() => handlePillClick(id)}
                disabled={isPlaced || done}
                style={{
                  background: isSelected ? step.color : isPlaced ? '#E5E7EB' : step.bg,
                  color: isSelected ? 'white' : isPlaced ? '#9CA3AF' : step.color,
                  border: `2px solid ${isPlaced ? '#E5E7EB' : step.color}`,
                  borderRadius: 20,
                  padding: '6px 18px',
                  fontFamily: 'Quicksand, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isPlaced || done ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {step.label}
              </button>
            )
          })}
        </div>

        {/* Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0, 1, 2, 3].map(i => {
            const placedId = placed[i]
            const step = placedId ? STEPS.find(s => s.id === placedId) : null
            const isWrong = checked && wrongSlots[i]
            const isCorrect = checked && !wrongSlots[i] && placedId === CORRECT_ORDER[i]
            return (
              <div
                key={i}
                onClick={() => handleSlotClick(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: isWrong ? '#FEE2E2' : isCorrect ? '#DCFCE7' : '#F8FAFC',
                  border: `2px dashed ${isWrong ? '#EF4444' : isCorrect ? '#22C55E' : placedId ? '#94A3B8' : '#CBD5E1'}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  cursor: done ? 'default' : 'pointer',
                  minHeight: 44,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontFamily: 'Quicksand, sans-serif',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#94A3B8',
                  width: 20,
                  textAlign: 'center',
                }}>
                  {i + 1}
                </span>
                {step ? (
                  <span style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    color: isWrong ? '#DC2626' : isCorrect ? '#16A34A' : step.color,
                  }}>
                    {step.label}
                  </span>
                ) : (
                  <span style={{ color: '#CBD5E1', fontSize: 14, fontStyle: 'italic' }}>
                    {selected ? 'Tap to place here' : 'Empty'}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {!done && (
          <button
            onClick={handleCheck}
            disabled={!allFilled}
            style={{
              marginTop: 16,
              background: allFilled ? '#F59E0B' : '#E5DDD0',
              color: allFilled ? 'white' : '#94A3B8',
              border: 'none',
              borderRadius: 10,
              padding: '10px 28px',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              cursor: allFilled ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            Check
          </button>
        )}

        {done && (
          <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 16, marginTop: 12, marginBottom: 0 }}>
            That's it! Divide → Multiply → Subtract → Bring Down
          </p>
        )}
      </div>
    </div>
  )
}
