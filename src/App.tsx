import { useState } from 'react'
import { computeDivisionHouse } from './modules/long-division/engine/computeDivisionHouse'
import DivisionHouse from './modules/long-division/components/DivisionHouse'
import StepPanel from './modules/long-division/components/StepPanel'

export default function App() {
  const house = computeDivisionHouse(84, 4)
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')

  const currentStep = house.steps[stepIndex]
  const done = stepIndex >= house.steps.length

  const handleSubmit = () => {
    if (done) return
    if (currentStep?.auto) {
      setStepIndex(s => s + 1)
      return
    }
    if (input === currentStep?.correctAnswer) {
      setStepIndex(s => s + 1)
      setInput('')
    }
  }

  return (
    <div style={{ padding: 40, background: '#FDF6EC', minHeight: '100dvh', display: 'flex', gap: 24 }}>
      <StepPanel activeStep={done ? null : (currentStep?.action ?? null)} />
      <div>
        <h2 style={{ fontFamily: 'Quicksand' }}>84 ÷ 4 (Step {stepIndex + 1}/{house.steps.length})</h2>
        <DivisionHouse
          houseData={house}
          currentStepIndex={stepIndex}
          inputValue={input}
          onInput={setInput}
        />
        {!done && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontFamily: 'Nunito' }}>{currentStep?.promptText}</p>
            {currentStep?.auto ? (
              <button onClick={handleSubmit}>Auto (Bring Down)</button>
            ) : (
              <button onClick={handleSubmit}>Submit</button>
            )}
          </div>
        )}
        {done && <p style={{ fontFamily: 'Quicksand', color: '#22C55E' }}>Complete! 84 ÷ 4 = 21</p>}
      </div>
    </div>
  )
}
