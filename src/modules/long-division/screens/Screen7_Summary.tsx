import type { Dispatch } from 'react'
import type { LDAction } from '../state/actions'

interface Props {
  dispatch: Dispatch<LDAction>
}

const VOCAB = [
  { term: 'Dividend', color: '#10B981', bg: '#ECFDF5', desc: 'The number being divided' },
  { term: 'Divisor', color: '#3B82F6', bg: '#EFF6FF', desc: 'The number you divide by' },
  { term: 'Quotient', color: '#F59E0B', bg: '#FFFBEB', desc: 'The answer' },
  { term: 'Remainder', color: '#8B5CF6', bg: '#F5F3FF', desc: 'What\'s left over' },
]

const STEPS_MINI = [
  { letter: 'D', label: 'Divide', color: '#3B82F6', bg: '#EFF6FF' },
  { letter: 'M', label: 'Multiply', color: '#10B981', bg: '#ECFDF5' },
  { letter: 'S', label: 'Subtract', color: '#F59E0B', bg: '#FFFBEB' },
  { letter: 'B', label: 'Bring Down', color: '#8B5CF6', bg: '#F5F3FF' },
]

export default function Screen7_Summary({ dispatch }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 28, color: '#1E293B', margin: 0 }}>
        You've Got This!
      </h2>

      {/* Cheat sheet card */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Vocabulary */}
        <div>
          <h3 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 16, color: '#64748B', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Vocabulary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {VOCAB.map(v => (
              <div key={v.term} style={{ background: v.bg, borderRadius: 8, padding: '8px 12px', borderLeft: `4px solid ${v.color}` }}>
                <p style={{ margin: 0, fontWeight: 800, color: v.color, fontSize: 15, fontFamily: 'Quicksand, sans-serif' }}>{v.term}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Four steps */}
        <div>
          <h3 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 16, color: '#64748B', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
            The Four Steps
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {STEPS_MINI.map(s => (
              <div key={s.letter} style={{
                flex: 1,
                background: s.bg,
                borderRadius: 8,
                padding: '10px 6px',
                textAlign: 'center',
                border: `2px solid ${s.color}`,
              }}>
                <p style={{ margin: 0, fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 22, color: s.color }}>{s.letter}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#64748B', fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Remember */}
        <div style={{ background: '#FEF9C3', borderRadius: 10, padding: '12px 14px', border: '2px solid #F59E0B' }}>
          <p style={{ margin: 0, fontWeight: 800, color: '#92400E', fontSize: 14, fontFamily: 'Quicksand, sans-serif' }}>
            Remember
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#78350F' }}>
            Repeat until no more digits to bring down!
          </p>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={() => dispatch({ type: 'COMPLETE_LESSON' })}
        style={{
          alignSelf: 'center',
          background: '#F59E0B',
          color: 'white',
          border: 'none',
          borderRadius: 14,
          padding: '16px 48px',
          fontFamily: 'Quicksand, sans-serif',
          fontWeight: 800,
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
          animation: 'subtlePulse 2s ease-in-out infinite',
        }}
      >
        Let's Try It Together
      </button>

      <style>{`
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  )
}
