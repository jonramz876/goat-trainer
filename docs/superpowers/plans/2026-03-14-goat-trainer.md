# GOAT Trainer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build GOAT Trainer — a PWA learning platform for the Ramsey kids' iPads, starting with the Long Division module as the first subject.

**Architecture:** Vite + React 18 + TypeScript PWA deployed to GitHub Pages. The app is a three-tier navigation (name picker → hub → module), with the long division module containing three phases: lesson (interactive textbook), guided examples, and practice mode. All state persists to localStorage per child.

**Tech Stack:** Vite, React 18, TypeScript, CSS Modules, Web Audio API, GitHub Pages, `gh-pages` npm package

**Spec:** `docs/specs/2026-03-14-goat-trainer-design.md`

---

## File Structure

Every file that will be created, with its single responsibility:

### Root Config

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies, scripts (`dev`, `build`, `preview`, `deploy`) |
| `vite.config.ts` | Vite config with `base: '/goat-trainer/'` for GitHub Pages |
| `tsconfig.json` | TypeScript strict mode config |
| `index.html` | Single HTML entry point with viewport meta, font links, PWA meta |

### Public Assets

| File | Responsibility |
|------|---------------|
| `public/manifest.json` | PWA manifest (landscape orientation, standalone display) |
| `public/service-worker.js` | Cache-first offline support with versioned cache |
| `public/goat-icon-192.png` | PWA icon (192×192) |
| `public/goat-icon-512.png` | PWA icon (512×512) |

### Source — App Shell

| File | Responsibility |
|------|---------------|
| `src/main.tsx` | React DOM entry point |
| `src/App.tsx` | Top-level router: name picker → hub → module dispatch |
| `src/App.module.css` | App-level styles (background, full-viewport layout) |
| `src/types/module.ts` | `Module` and `ModuleProps` interfaces shared across all modules |

### Source — Shell Components

| File | Responsibility |
|------|---------------|
| `src/components/NamePicker.tsx` | Three-button child selector (Jack/Reese/Kate) |
| `src/components/NamePicker.module.css` | Name picker styles |
| `src/components/Hub.tsx` | Per-child module grid with progress display |
| `src/components/Hub.module.css` | Hub styles |
| `src/components/StatsScreen.tsx` | Per-child stats (tier, accuracy, step breakdown) |
| `src/components/StatsScreen.module.css` | Stats styles |

### Source — Shared Components

| File | Responsibility |
|------|---------------|
| `src/components/shared/NumberPad.tsx` | 12-button number pad (0-9, backspace, confirm) |
| `src/components/shared/NumberPad.module.css` | Number pad styles |
| `src/components/shared/NavBar.tsx` | Top bar with back button, title, sound toggle |
| `src/components/shared/NavBar.module.css` | NavBar styles |

### Source — Hooks

| File | Responsibility |
|------|---------------|
| `src/hooks/useSound.ts` | Web Audio API sound effect functions + mute state |
| `src/hooks/useLocalStorage.ts` | Generic typed localStorage read/write hook |

### Source — Long Division Module: Engine (pure logic, no React)

| File | Responsibility |
|------|---------------|
| `src/modules/long-division/engine/types.ts` | All TypeScript interfaces: CellData, StepData, ComputedHouse, Problem, LDState, ChildProgress, etc. |
| `src/modules/long-division/engine/computeDivisionHouse.ts` | Core algorithm: takes dividend + divisor, returns grid cells, rules, steps |
| `src/modules/long-division/engine/computeDivisionHouse.test.ts` | Tests against all 6 verified worked examples from spec |
| `src/modules/long-division/engine/generateProblem.ts` | Tier-based problem generator with zero-in-quotient filtering |
| `src/modules/long-division/engine/generateProblem.test.ts` | Tests: tier constraints, dedup, zero filtering, fallbacks |
| `src/modules/long-division/engine/feedbackTemplates.ts` | All error-specific feedback strings (divide, multiply, subtract) |
| `src/modules/long-division/engine/feedbackTemplates.test.ts` | Tests: correct template selection per error type |
| `src/modules/long-division/engine/deriveCellStates.ts` | Computes visible/hidden/dimmed/input states from house data + step index |
| `src/modules/long-division/engine/deriveCellStates.test.ts` | Tests: cell visibility at various step indices |

### Source — Long Division Module: State

| File | Responsibility |
|------|---------------|
| `src/modules/long-division/state/reducer.ts` | useReducer with ~20 action types for all three phases |
| `src/modules/long-division/state/reducer.test.ts` | Tests: state transitions, tier logic, demotion, streak |
| `src/modules/long-division/state/persistence.ts` | Serialize LDState → ChildProgress → localStorage; hydrate back |
| `src/modules/long-division/state/persistence.test.ts` | Tests: round-trip serialization, inProgress resume, defaults |
| `src/modules/long-division/state/actions.ts` | Action type constants + action creator functions |

### Source — Long Division Module: Components

| File | Responsibility |
|------|---------------|
| `src/modules/long-division/components/DivisionHouse.tsx` | CSS Grid renderer — places cells, rules, bracket |
| `src/modules/long-division/components/DivisionHouse.module.css` | Grid layout, cell sizing, responsive breakpoints |
| `src/modules/long-division/components/Cell.tsx` | Single grid cell: 7 visual states (hidden→visible→active→input→correct→wrong→dimmed) |
| `src/modules/long-division/components/Cell.module.css` | Cell states, animations (pulse, correctFlash, wrongFlash, digitReveal) |
| `src/modules/long-division/components/Bracket.tsx` | Absolute-positioned vertical + horizontal bars with corner curve |
| `src/modules/long-division/components/Bracket.module.css` | Bracket positioning and growth animation |
| `src/modules/long-division/components/HorizontalRule.tsx` | Grid-spanning rule line below multiply rows |
| `src/modules/long-division/components/StepPanel.tsx` | Left sidebar: DMSB colored step indicators with active highlight |
| `src/modules/long-division/components/StepPanel.module.css` | Step panel layout and colors |
| `src/modules/long-division/components/FeedbackArea.tsx` | Right sidebar: prompt text, error feedback, hint button |
| `src/modules/long-division/components/FeedbackArea.module.css` | Feedback area styles |
| `src/modules/long-division/components/HintButton.tsx` | Progressive hint button (label changes by level) |
| `src/modules/long-division/components/TierDisplay.tsx` | Top bar: tier badge + 5 streak dots + star count |
| `src/modules/long-division/components/TierDisplay.module.css` | Tier display animations (dot flash, star pop, tier slide) |
| `src/modules/long-division/components/CookieAnimation.tsx` | Screen 1 SVG: 12 cookies → 3 groups round-robin animation |
| `src/modules/long-division/components/CookieAnimation.module.css` | Cookie positions and transitions |
| `src/modules/long-division/components/BringDownArrow.tsx` | SVG curved path with animated stroke-dashoffset |

### Source — Long Division Module: Screens

| File | Responsibility |
|------|---------------|
| `src/modules/long-division/screens/LessonPhase.tsx` | Container for screens 1-7: navigation dots, back/next, screen dispatch |
| `src/modules/long-division/screens/LessonPhase.module.css` | Lesson navigation layout |
| `src/modules/long-division/screens/Screen1_WhatIsDivision.tsx` | Cookie animation + "each group gets ___" input |
| `src/modules/long-division/screens/Screen2_DivisionHouse.tsx` | Cookie→notation bridge animation + labeled house + quiz |
| `src/modules/long-division/screens/Screen3_FourSteps.tsx` | DMSB cards + click-to-place ordering exercise |
| `src/modules/long-division/screens/Screen4_Walkthrough84.tsx` | 84÷4 narrated+interactive walkthrough (8 steps) |
| `src/modules/long-division/screens/Screen5_Remainder85.tsx` | 85÷4 narrated+interactive + remainder explanation |
| `src/modules/long-division/screens/Screen6_BigNumber1248.tsx` | 1248÷6 three cycles with accelerating interactivity |
| `src/modules/long-division/screens/Screen7_Summary.tsx` | Cheat sheet card + "Let's Try It Together" transition |
| `src/modules/long-division/screens/SkipGate.tsx` | "Prove it" test: one problem, all steps correct → skip to Practice Tier 2 |
| `src/modules/long-division/screens/GuidedPhase.tsx` | 3 hardcoded problems with three-tier hints + redemption |
| `src/modules/long-division/screens/GuidedPhase.module.css` | Guided layout (interstitials, completion messages) |
| `src/modules/long-division/screens/PracticePhase.tsx` | Infinite practice: problem gen → input → feedback → tier advancement |
| `src/modules/long-division/screens/PracticePhase.module.css` | Practice layout (3-column: step panel, house, feedback) |

### Source — Long Division Module: Mini-Drills

| File | Responsibility |
|------|---------------|
| `src/modules/long-division/miniDrills/MultiplicationDrill.tsx` | 5 flash cards for specific divisor's times table |
| `src/modules/long-division/miniDrills/MultiplicationDrill.module.css` | Flash card layout and flip animation |

### Source — Long Division Module: Entry

| File | Responsibility |
|------|---------------|
| `src/modules/long-division/index.tsx` | Module entry: wires up reducer, persistence, phase routing |
| `src/modules/long-division/moduleConfig.ts` | Module registration object (id, title, icon, gradeRange, availableFor) |

---

## Chunk 1: Project Scaffolding + Core Engine

This chunk sets up the project from scratch and implements the pure-logic engine layer — the algorithm and problem generator — with full test coverage. No React components yet.

### Task 1.1: Initialize Vite + React + TypeScript Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Scaffold the project with Vite**

```bash
cd "C:/Users/jonra/OneDrive/Desktop/claude sandbox/GOAT trainer"
npm create vite@latest . -- --template react-ts
```

If prompted about non-empty directory (because `docs/` exists), confirm yes.

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Install dev dependencies for testing**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Configure Vite for GitHub Pages + testing**

Replace `vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/goat-trainer/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 5: Create test setup file**

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Update tsconfig.json for strict mode**

Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Update index.html with iPad meta tags and fonts**

Replace `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="/goat-trainer/goat-icon-192.png" />
    <link rel="manifest" href="/goat-trainer/manifest.json" />
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Nunito:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
    <title>GOAT Trainer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create minimal App.tsx placeholder**

Replace `src/App.tsx` with:

```tsx
export default function App() {
  return <div>GOAT Trainer</div>
}
```

- [ ] **Step 9: Verify build and dev server**

```bash
npm run build
```

Expected: Build succeeds with no errors.

```bash
npm run dev -- --open
```

Expected: Browser opens showing "GOAT Trainer" text.

- [ ] **Step 10: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

### Task 1.2: Define TypeScript Interfaces

**Files:**
- Create: `src/modules/long-division/engine/types.ts`
- Create: `src/types/module.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/modules/long-division/engine
mkdir -p src/modules/long-division/components
mkdir -p src/modules/long-division/screens
mkdir -p src/modules/long-division/state
mkdir -p src/modules/long-division/miniDrills
mkdir -p src/types
mkdir -p src/components/shared
mkdir -p src/hooks
```

- [ ] **Step 2: Create shared module interface**

Create `src/types/module.ts`:

```typescript
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
```

- [ ] **Step 3: Create long division type definitions**

Create `src/modules/long-division/engine/types.ts`:

```typescript
// --- Division House Algorithm Types ---

export interface CellData {
  row: number
  col: number
  digit: string
  type: 'quotient' | 'multiply' | 'subtract' | 'bringdown' | 'dividend' | 'divisor'
  stepIndex: number
  cycle: number
  showMinus: boolean
}

export interface RuleData {
  row: number
  fromCol: number
  toCol: number
}

export interface StepData {
  stepIndex: number
  action: 'divide' | 'multiply' | 'subtract' | 'bringdown'
  cycle: number
  cells: { row: number; col: number; digit: string }[]
  correctAnswer: string
  promptNumber?: number
  promptText?: string
  auto?: boolean
  type: string
}

export interface ComputedHouse {
  cells: CellData[]
  rules: RuleData[]
  totalRows: number
  totalCols: number
  quotient: number
  remainder: number
  steps: StepData[]
}

// --- Problem Types ---

export interface Problem {
  dividend: number
  divisor: number
  quotient: number
  remainder: number
}

// --- State Types ---

export interface InProgressState {
  dividend: number
  divisor: number
  currentStepIndex: number
  tier: number
  streak: number
  problemClean: boolean
}

export interface StepAccuracy {
  divide: { correct: number; total: number }
  multiply: { correct: number; total: number }
  subtract: { correct: number; total: number }
}

export interface ChildProgress {
  tier: number
  totalCorrect: number
  totalAttempted: number
  highestTier: number
  streak: number
  consecutiveDirtyProblems: number
  lastSessionDate: string
  lessonCompleted: boolean
  guidedCompleted: boolean
  stepAccuracy: StepAccuracy
  inProgress: InProgressState | null
  recentProblems: Array<{ dividend: number; divisor: number }>
}

export type Phase = 'skip-gate' | 'lesson' | 'guided' | 'practice'

export interface LDState {
  phase: Phase
  // Lesson
  lessonScreen: number
  lessonStepWithinScreen: number
  lessonInteractionComplete: boolean
  lessonMaxScreenReached: number
  lessonInputAttempts: number
  // Guided
  guidedProblemIndex: number
  guidedStepIndex: number
  guidedAttempts: number
  guidedShowingInterstitial: boolean
  // Practice
  currentProblem: Problem | null
  currentHouseData: ComputedHouse | null
  currentStepIndex: number
  currentAttempts: number
  currentHintLevel: number
  inputValue: string
  tier: number
  highestTier: number
  streak: number
  problemClean: boolean
  consecutiveDirtyProblems: number
  totalCorrect: number
  totalAttempted: number
  recentProblems: Problem[]
  lessonCompleted: boolean
  guidedCompleted: boolean
  showingCompletion: boolean
  showingTierAdvance: boolean
  showTenProblemCheck: boolean
  // Step accuracy
  stepAccuracy: StepAccuracy
  // Mini-drill
  showingMiniDrill: boolean
  miniDrillDivisor: number
  recentMultiplyHints: boolean[]
  // Resume
  inProgress: InProgressState | null
}

export type CellState = 'hidden' | 'visible' | 'active' | 'input' | 'correct' | 'wrong' | 'dimmed'
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/module.ts src/modules/long-division/engine/types.ts
git commit -m "feat: define TypeScript interfaces for module system and long division"
```

### Task 1.3: Implement `computeDivisionHouse` Algorithm

**Files:**
- Create: `src/modules/long-division/engine/computeDivisionHouse.ts`
- Create: `src/modules/long-division/engine/computeDivisionHouse.test.ts`

- [ ] **Step 1: Write failing tests for all 6 verified worked examples**

Create `src/modules/long-division/engine/computeDivisionHouse.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { computeDivisionHouse } from './computeDivisionHouse'
import type { CellData } from './types'

function findCell(cells: CellData[], row: number, col: number): CellData | undefined {
  return cells.find(c => c.row === row && c.col === col)
}

describe('computeDivisionHouse', () => {
  describe('12 ÷ 3 = 4 (single cycle, Screen 2 example)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(12, 3)
      expect(result.quotient).toBe(4)
      expect(result.remainder).toBe(0)
    })

    it('places divisor and dividend correctly', () => {
      const result = computeDivisionHouse(12, 3)
      expect(findCell(result.cells, 1, 0)?.digit).toBe('3')
      expect(findCell(result.cells, 1, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 1, 3)?.digit).toBe('2')
    })

    it('places quotient at correct column', () => {
      const result = computeDivisionHouse(12, 3)
      // 3 > 1, so needs 2 digits, quotientCol = 2+2-1 = 3
      expect(findCell(result.cells, 0, 3)?.digit).toBe('4')
    })

    it('has correct grid dimensions', () => {
      const result = computeDivisionHouse(12, 3)
      expect(result.totalCols).toBe(4) // 2 + 2 digits
      expect(result.totalRows).toBe(5) // 2 + 1 cycle * 3
    })
  })

  describe('84 ÷ 4 = 21 (Screen 4: two cycles, no remainder)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(84, 4)
      expect(result.quotient).toBe(21)
      expect(result.remainder).toBe(0)
    })

    it('places all cells correctly', () => {
      const result = computeDivisionHouse(84, 4)
      // Divisor
      expect(findCell(result.cells, 1, 0)?.digit).toBe('4')
      // Dividend
      expect(findCell(result.cells, 1, 2)?.digit).toBe('8')
      expect(findCell(result.cells, 1, 3)?.digit).toBe('4')
      // Cycle 0: quotient=2, multiply=8, subtract=0, bringdown=4
      expect(findCell(result.cells, 0, 2)?.digit).toBe('2')
      expect(findCell(result.cells, 2, 2)?.digit).toBe('8')
      expect(findCell(result.cells, 4, 2)?.digit).toBe('0')
      expect(findCell(result.cells, 4, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 4, 3)?.type).toBe('bringdown')
      // Cycle 1: quotient=1, multiply=4, subtract=0
      expect(findCell(result.cells, 0, 3)?.digit).toBe('1')
      expect(findCell(result.cells, 5, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 7, 3)?.digit).toBe('0')
    })

    it('has correct rules', () => {
      const result = computeDivisionHouse(84, 4)
      expect(result.rules).toContainEqual({ row: 3, fromCol: 2, toCol: 2 })
      expect(result.rules).toContainEqual({ row: 6, fromCol: 3, toCol: 3 })
    })

    it('has correct grid dimensions', () => {
      const result = computeDivisionHouse(84, 4)
      expect(result.totalCols).toBe(4)
      expect(result.totalRows).toBe(8)
    })

    it('generates correct step sequence', () => {
      const result = computeDivisionHouse(84, 4)
      const actions = result.steps.map(s => s.action)
      expect(actions).toEqual([
        'divide', 'multiply', 'subtract', 'bringdown',
        'divide', 'multiply', 'subtract',
      ])
    })
  })

  describe('85 ÷ 4 = 21 R1 (Screen 5: two cycles, with remainder)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(85, 4)
      expect(result.quotient).toBe(21)
      expect(result.remainder).toBe(1)
    })

    it('places final subtract result as 1', () => {
      const result = computeDivisionHouse(85, 4)
      expect(findCell(result.cells, 7, 3)?.digit).toBe('1')
    })
  })

  describe('72 ÷ 3 = 24 (Guided Example 1)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(72, 3)
      expect(result.quotient).toBe(24)
      expect(result.remainder).toBe(0)
    })

    it('places all cells correctly', () => {
      const result = computeDivisionHouse(72, 3)
      // Cycle 0: 7÷3=2, 2×3=6, 7-6=1, bringdown 2
      expect(findCell(result.cells, 0, 2)?.digit).toBe('2')
      expect(findCell(result.cells, 2, 2)?.digit).toBe('6')
      expect(findCell(result.cells, 4, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 4, 3)?.digit).toBe('2')
      // Cycle 1: 12÷3=4, 4×3=12, 12-12=0
      expect(findCell(result.cells, 0, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 5, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 5, 3)?.digit).toBe('2')
      expect(findCell(result.cells, 7, 3)?.digit).toBe('0')
    })

    it('has rules at correct positions', () => {
      const result = computeDivisionHouse(72, 3)
      expect(result.rules).toContainEqual({ row: 3, fromCol: 2, toCol: 2 })
      expect(result.rules).toContainEqual({ row: 6, fromCol: 2, toCol: 3 })
    })
  })

  describe('95 ÷ 4 = 23 R3 (Guided Example 2)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(95, 4)
      expect(result.quotient).toBe(23)
      expect(result.remainder).toBe(3)
    })

    it('places remainder digit correctly', () => {
      const result = computeDivisionHouse(95, 4)
      expect(findCell(result.cells, 7, 3)?.digit).toBe('3')
    })
  })

  describe('1248 ÷ 6 = 208 (Screen 6: three cycles, zero in quotient)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(result.quotient).toBe(208)
      expect(result.remainder).toBe(0)
    })

    it('handles leading digits correctly (6 > 1, uses two digits)', () => {
      const result = computeDivisionHouse(1248, 6)
      // First quotient digit at col 3 (not col 2)
      expect(findCell(result.cells, 0, 3)?.digit).toBe('2')
    })

    it('places zero in quotient for cycle 1', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(findCell(result.cells, 0, 4)?.digit).toBe('0')
    })

    it('places all cycle cells correctly', () => {
      const result = computeDivisionHouse(1248, 6)
      // Cycle 0: multiply=12, subtract=0, bringdown=4
      expect(findCell(result.cells, 2, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 2, 3)?.digit).toBe('2')
      expect(findCell(result.cells, 4, 3)?.digit).toBe('0')
      expect(findCell(result.cells, 4, 4)?.digit).toBe('4')
      // Cycle 1: multiply=0, subtract=4, bringdown=8
      expect(findCell(result.cells, 5, 4)?.digit).toBe('0')
      expect(findCell(result.cells, 7, 4)?.digit).toBe('4')
      expect(findCell(result.cells, 7, 5)?.digit).toBe('8')
      // Cycle 2: multiply=48, subtract=0
      expect(findCell(result.cells, 8, 4)?.digit).toBe('4')
      expect(findCell(result.cells, 8, 5)?.digit).toBe('8')
      expect(findCell(result.cells, 10, 5)?.digit).toBe('0')
    })

    it('has correct grid dimensions', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(result.totalCols).toBe(6)
      expect(result.totalRows).toBe(11)
    })

    it('marks cycle on each cell', () => {
      const result = computeDivisionHouse(1248, 6)
      // Cycle 0 cells
      expect(findCell(result.cells, 0, 3)?.cycle).toBe(0)
      expect(findCell(result.cells, 2, 2)?.cycle).toBe(0)
      // Cycle 1 cells
      expect(findCell(result.cells, 0, 4)?.cycle).toBe(1)
      expect(findCell(result.cells, 5, 4)?.cycle).toBe(1)
      // Cycle 2 cells
      expect(findCell(result.cells, 0, 5)?.cycle).toBe(2)
      expect(findCell(result.cells, 8, 4)?.cycle).toBe(2)
    })

    it('marks showMinus only on leftmost multiply cell per cycle', () => {
      const result = computeDivisionHouse(1248, 6)
      // Cycle 0: leftmost multiply is (2,2)
      expect(findCell(result.cells, 2, 2)?.showMinus).toBe(true)
      expect(findCell(result.cells, 2, 3)?.showMinus).toBe(false)
      // Cycle 2: leftmost multiply is (8,4)
      expect(findCell(result.cells, 8, 4)?.showMinus).toBe(true)
      expect(findCell(result.cells, 8, 5)?.showMinus).toBe(false)
    })
  })

  describe('738 ÷ 6 = 123 (Guided Example 3)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(738, 6)
      expect(result.quotient).toBe(123)
      expect(result.remainder).toBe(0)
    })

    it('has 9 steps (3 cycles × 3 + 2 bringdowns)', () => {
      const result = computeDivisionHouse(738, 6)
      expect(result.steps).toHaveLength(11)
      // divide, multiply, subtract, bringdown, divide, multiply, subtract, bringdown, divide, multiply, subtract
      const actions = result.steps.map(s => s.action)
      expect(actions).toEqual([
        'divide', 'multiply', 'subtract', 'bringdown',
        'divide', 'multiply', 'subtract', 'bringdown',
        'divide', 'multiply', 'subtract',
      ])
    })

    it('marks bringdown steps as auto', () => {
      const result = computeDivisionHouse(738, 6)
      const bringdowns = result.steps.filter(s => s.action === 'bringdown')
      expect(bringdowns).toHaveLength(2)
      bringdowns.forEach(b => expect(b.auto).toBe(true))
    })
  })

  describe('edge case: 63 ÷ 7 = 9 (single cycle, no bringdown)', () => {
    it('returns correct result', () => {
      const result = computeDivisionHouse(63, 7)
      expect(result.quotient).toBe(9)
      expect(result.remainder).toBe(0)
    })

    it('has only 3 steps (no bringdown)', () => {
      const result = computeDivisionHouse(63, 7)
      const actions = result.steps.map(s => s.action)
      expect(actions).toEqual(['divide', 'multiply', 'subtract'])
    })
  })

  describe('step data correctAnswer field', () => {
    it('has correct answers for 72÷3', () => {
      const result = computeDivisionHouse(72, 3)
      const nonAuto = result.steps.filter(s => !s.auto)
      expect(nonAuto[0].correctAnswer).toBe('2')   // 3 into 7
      expect(nonAuto[1].correctAnswer).toBe('6')   // 2×3
      expect(nonAuto[2].correctAnswer).toBe('1')   // 7-6
      expect(nonAuto[3].correctAnswer).toBe('4')   // 3 into 12
      expect(nonAuto[4].correctAnswer).toBe('12')  // 4×3
      expect(nonAuto[5].correctAnswer).toBe('0')   // 12-12
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/modules/long-division/engine/computeDivisionHouse.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the algorithm**

Create `src/modules/long-division/engine/computeDivisionHouse.ts`:

```typescript
import type { CellData, RuleData, StepData, ComputedHouse } from './types'

export function computeDivisionHouse(dividend: number, divisor: number): ComputedHouse {
  const digits = String(dividend).split('').map(Number)
  const D = digits.length

  const cells: CellData[] = []
  const rules: RuleData[] = []
  const steps: StepData[] = []

  // Fixed cells: divisor at (1, 0)
  cells.push({
    row: 1, col: 0, digit: String(divisor),
    type: 'divisor', stepIndex: -1, cycle: -1, showMinus: false,
  })

  // Fixed cells: dividend digits at (1, 2+i)
  for (let i = 0; i < D; i++) {
    cells.push({
      row: 1, col: 2 + i, digit: String(digits[i]),
      type: 'dividend', stepIndex: -1, cycle: -1, showMinus: false,
    })
  }

  // Determine leading digits for first divide
  let currentNumber = digits[0]
  let digitsUsed = 1
  let lastSubtractResult = 0
  while (currentNumber < divisor && digitsUsed < D) {
    digitsUsed++
    currentNumber = currentNumber * 10 + digits[digitsUsed - 1]
  }

  let quotientCol = 2 + digitsUsed - 1
  let nextDigitIndex = digitsUsed
  let cycle = 0
  let stepIndex = 0
  let quotientStr = ''

  // Main loop
  while (true) {
    // DIVIDE
    const quotientDigit = Math.floor(currentNumber / divisor)
    quotientStr += String(quotientDigit)

    const divideCell: CellData = {
      row: 0, col: quotientCol, digit: String(quotientDigit),
      type: 'quotient', stepIndex, cycle, showMinus: false,
    }
    cells.push(divideCell)

    steps.push({
      stepIndex,
      action: 'divide',
      cycle,
      cells: [{ row: 0, col: quotientCol, digit: String(quotientDigit) }],
      correctAnswer: String(quotientDigit),
      promptNumber: currentNumber,
      promptText: `How many times does ${divisor} go into ${currentNumber}?`,
      type: 'quotient',
    })
    stepIndex++

    // MULTIPLY
    const multiplyResult = quotientDigit * divisor
    const multiplyStr = String(multiplyResult)
    const multiplyCells: CellData[] = []

    for (let i = 0; i < multiplyStr.length; i++) {
      const cell: CellData = {
        row: 2 + cycle * 3,
        col: quotientCol - multiplyStr.length + 1 + i,
        digit: multiplyStr[i],
        type: 'multiply',
        stepIndex,
        cycle,
        showMinus: i === 0,
      }
      cells.push(cell)
      multiplyCells.push(cell)
    }

    steps.push({
      stepIndex,
      action: 'multiply',
      cycle,
      cells: multiplyCells.map(c => ({ row: c.row, col: c.col, digit: c.digit })),
      correctAnswer: String(multiplyResult),
      promptText: `${quotientDigit} × ${divisor}`,
      type: 'multiply',
    })
    stepIndex++

    // HORIZONTAL RULE
    rules.push({
      row: 3 + cycle * 3,
      fromCol: quotientCol - multiplyStr.length + 1,
      toCol: quotientCol,
    })

    // SUBTRACT
    const subtractResult = currentNumber - multiplyResult
    lastSubtractResult = subtractResult
    const subtractStr = String(subtractResult)

    const subtractCells: CellData[] = []
    for (let i = 0; i < subtractStr.length; i++) {
      const cell: CellData = {
        row: 4 + cycle * 3,
        col: quotientCol - subtractStr.length + 1 + i,
        digit: subtractStr[i],
        type: 'subtract',
        stepIndex,
        cycle,
        showMinus: false,
      }
      cells.push(cell)
      subtractCells.push(cell)
    }

    steps.push({
      stepIndex,
      action: 'subtract',
      cycle,
      cells: subtractCells.map(c => ({ row: c.row, col: c.col, digit: c.digit })),
      correctAnswer: String(subtractResult),
      promptText: `${currentNumber} − ${multiplyResult}`,
      type: 'subtract',
    })
    stepIndex++

    // BRING DOWN
    if (nextDigitIndex < D) {
      const broughtDigit = digits[nextDigitIndex]
      const bringDownCol = 2 + nextDigitIndex

      const bdCell: CellData = {
        row: 4 + cycle * 3,
        col: bringDownCol,
        digit: String(broughtDigit),
        type: 'bringdown',
        stepIndex,
        cycle,
        showMinus: false,
      }
      cells.push(bdCell)

      steps.push({
        stepIndex,
        action: 'bringdown',
        cycle,
        cells: [{ row: bdCell.row, col: bdCell.col, digit: bdCell.digit }],
        correctAnswer: String(broughtDigit),
        auto: true,
        type: 'bringdown',
      })
      stepIndex++

      currentNumber = subtractResult * 10 + broughtDigit
      quotientCol = bringDownCol
      nextDigitIndex++
      cycle++
    } else {
      // Done — subtractResult is remainder
      break
    }
  }

  return {
    cells,
    rules,
    totalRows: 2 + cycle * 3 + 3,
    totalCols: 2 + D,
    quotient: parseInt(quotientStr, 10),
    remainder: lastSubtractResult,
    steps,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/modules/long-division/engine/computeDivisionHouse.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Fix any failing tests**

If `totalRows` calculation is off, adjust. The formula is `2 + (cycle * 3) + 3` where `cycle` is the 0-indexed last cycle. Since we break *before* incrementing `cycle` on the last iteration, `totalRows = 2 + cycle * 3 + 3 = 5 + cycle * 3`.

For 84÷4 (2 cycles, cycle ends at 1): `5 + 1*3 = 8`. Correct.
For 1248÷6 (3 cycles, cycle ends at 2): `5 + 2*3 = 11`. Correct.
For 12÷3 (1 cycle, cycle ends at 0): `5 + 0*3 = 5`. Correct.

- [ ] **Step 6: Commit**

```bash
git add src/modules/long-division/engine/computeDivisionHouse.ts src/modules/long-division/engine/computeDivisionHouse.test.ts
git commit -m "feat: implement computeDivisionHouse algorithm with full test coverage"
```

### Task 1.4: Implement `deriveCellStates`

**Files:**
- Create: `src/modules/long-division/engine/deriveCellStates.ts`
- Create: `src/modules/long-division/engine/deriveCellStates.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/modules/long-division/engine/deriveCellStates.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { deriveCellStates } from './deriveCellStates'
import { computeDivisionHouse } from './computeDivisionHouse'
import type { CellState } from './types'

describe('deriveCellStates', () => {
  const house = computeDivisionHouse(1248, 6)

  it('hides all work cells at step 0', () => {
    const states = deriveCellStates(house, 0)
    // Step 0 cells (quotient "2") should be "input"
    const step0 = states.filter(s => s.state === 'input')
    expect(step0.length).toBeGreaterThan(0)

    // Steps > 0 should be hidden
    const futureWork = states.filter(s =>
      s.stepIndex > 0 && s.stepIndex !== -1
    )
    futureWork.forEach(s => expect(s.state).toBe('hidden'))
  })

  it('shows completed cells as visible', () => {
    const states = deriveCellStates(house, 2)
    // Steps 0 and 1 should be visible
    const step0 = states.filter(s => s.stepIndex === 0)
    step0.forEach(s => expect(s.state).toBe('visible'))
  })

  it('dims old cycle cells', () => {
    // At step 8 (cycle 2), cycle 0 cells should be dimmed
    const states = deriveCellStates(house, 8)
    const cycle0Cells = states.filter(s => s.cycle === 0 && s.stepIndex >= 0)
    cycle0Cells.forEach(s => expect(s.state).toBe('dimmed'))
  })

  it('keeps adjacent cycle cells visible (not dimmed)', () => {
    // At step 8 (cycle 2), cycle 1 cells should be visible (not dimmed)
    const states = deriveCellStates(house, 8)
    const cycle1Cells = states.filter(s => s.cycle === 1 && s.stepIndex >= 0 && s.stepIndex < 8)
    cycle1Cells.forEach(s => expect(s.state).toBe('visible'))
  })

  it('always shows dividend and divisor as visible', () => {
    const states = deriveCellStates(house, 0)
    const fixed = states.filter(s => s.type === 'dividend' || s.type === 'divisor')
    fixed.forEach(s => expect(s.state).toBe('visible'))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/modules/long-division/engine/deriveCellStates.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement deriveCellStates**

Create `src/modules/long-division/engine/deriveCellStates.ts`:

```typescript
import type { ComputedHouse, CellData, CellState } from './types'

export interface CellWithState extends CellData {
  state: CellState
}

export function deriveCellStates(
  houseData: ComputedHouse,
  currentStepIndex: number,
): CellWithState[] {
  const currentStep = houseData.steps[currentStepIndex]
  const currentCycle = currentStep?.cycle ?? 0

  return houseData.cells.map(cell => {
    // Fixed cells (divisor, dividend) are always visible
    if (cell.stepIndex === -1) {
      return { ...cell, state: 'visible' as CellState }
    }

    if (cell.stepIndex > currentStepIndex) {
      return { ...cell, state: 'hidden' as CellState }
    }

    if (cell.stepIndex < currentStepIndex) {
      // Dim cells from cycles more than 1 behind
      const dimmed = currentCycle - cell.cycle > 1
      return { ...cell, state: (dimmed ? 'dimmed' : 'visible') as CellState }
    }

    // cell.stepIndex === currentStepIndex
    return { ...cell, state: 'input' as CellState }
  })
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/modules/long-division/engine/deriveCellStates.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/engine/deriveCellStates.ts src/modules/long-division/engine/deriveCellStates.test.ts
git commit -m "feat: implement deriveCellStates for cell visibility logic"
```

### Task 1.5: Implement Problem Generator

**Files:**
- Create: `src/modules/long-division/engine/generateProblem.ts`
- Create: `src/modules/long-division/engine/generateProblem.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/modules/long-division/engine/generateProblem.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateProblem, FALLBACK_PROBLEMS } from './generateProblem'
import type { Problem } from './types'

describe('generateProblem', () => {
  describe('Tier 1: 2-digit ÷ 1-digit, no remainder', () => {
    it('generates valid problems', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(1, [])
        expect(p.dividend).toBeGreaterThanOrEqual(10)
        expect(p.dividend).toBeLessThanOrEqual(99)
        expect(p.divisor).toBeGreaterThanOrEqual(2)
        expect(p.divisor).toBeLessThanOrEqual(9)
        expect(p.remainder).toBe(0)
        expect(p.quotient).toBe(Math.floor(p.dividend / p.divisor))
      }
    })

    it('never produces zero in quotient', () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem(1, [])
        expect(String(p.quotient)).not.toContain('0')
      }
    })
  })

  describe('Tier 2: 2-digit ÷ 1-digit, with remainder', () => {
    it('always has a remainder', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(2, [])
        expect(p.remainder).toBeGreaterThan(0)
      }
    })

    it('never produces zero in quotient', () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem(2, [])
        expect(String(p.quotient)).not.toContain('0')
      }
    })
  })

  describe('Tier 3: 3-digit ÷ 1-digit, no remainder', () => {
    it('generates 3-digit dividends', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(3, [])
        expect(p.dividend).toBeGreaterThanOrEqual(100)
        expect(p.dividend).toBeLessThanOrEqual(999)
        expect(p.remainder).toBe(0)
      }
    })

    it('never produces zero in quotient', () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem(3, [])
        expect(String(p.quotient)).not.toContain('0')
      }
    })
  })

  describe('Tier 4: 3-digit ÷ 1-digit, with remainder', () => {
    it('always has a remainder', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(4, [])
        expect(p.remainder).toBeGreaterThan(0)
      }
    })
  })

  describe('Tier 5: 3-4 digit, may have zero in quotient', () => {
    it('generates 3-4 digit dividends', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(5, [])
        expect(p.dividend).toBeGreaterThanOrEqual(100)
        expect(p.dividend).toBeLessThanOrEqual(9999)
      }
    })
  })

  describe('deduplication', () => {
    it('avoids recent problems', () => {
      const recent = [
        { dividend: 84, divisor: 4 },
        { dividend: 63, divisor: 7 },
      ]
      let dupeCount = 0
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(1, recent)
        if (recent.some(r => r.dividend === p.dividend && r.divisor === p.divisor)) {
          dupeCount++
        }
      }
      // With dedup active, most results should avoid the recent list
      expect(dupeCount).toBeLessThan(5)
    })
  })

  describe('fallback problems', () => {
    it('has valid fallbacks for all 5 tiers', () => {
      for (let tier = 1; tier <= 5; tier++) {
        const fb = FALLBACK_PROBLEMS[tier]
        expect(fb).toBeDefined()
        expect(fb.quotient).toBe(Math.floor(fb.dividend / fb.divisor))
        expect(fb.remainder).toBe(fb.dividend % fb.divisor)
      }
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/modules/long-division/engine/generateProblem.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the generator**

Create `src/modules/long-division/engine/generateProblem.ts`:

```typescript
import type { Problem } from './types'

export const FALLBACK_PROBLEMS: Record<number, Problem> = {
  1: { dividend: 84, divisor: 4, quotient: 21, remainder: 0 },
  2: { dividend: 83, divisor: 5, quotient: 16, remainder: 3 },
  3: { dividend: 432, divisor: 8, quotient: 54, remainder: 0 },
  4: { dividend: 519, divisor: 4, quotient: 129, remainder: 3 },
  5: { dividend: 2418, divisor: 6, quotient: 403, remainder: 0 },
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function hasZeroInQuotient(quotient: number): boolean {
  return String(quotient).includes('0')
}

function isDuplicate(
  p: Problem,
  recent: Array<{ dividend: number; divisor: number }>,
): boolean {
  return recent.some(r => r.dividend === p.dividend && r.divisor === p.divisor)
}

function generateTier1(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(2, Math.floor(99 / divisor))
  const dividend = quotient * divisor
  if (dividend < 10 || dividend > 99) return generateTier1()
  if (hasZeroInQuotient(quotient)) return generateTier1()
  return { dividend, divisor, quotient, remainder: 0 }
}

function generateTier2(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(2, Math.floor(99 / divisor))
  const remainder = randomInt(1, divisor - 1)
  const dividend = quotient * divisor + remainder
  if (dividend < 10 || dividend > 99) return generateTier2()
  if (hasZeroInQuotient(quotient)) return generateTier2()
  return { dividend, divisor, quotient, remainder }
}

function generateTier3(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(11, Math.floor(999 / divisor))
  const dividend = quotient * divisor
  if (dividend < 100 || dividend > 999) return generateTier3()
  if (hasZeroInQuotient(quotient)) return generateTier3()
  return { dividend, divisor, quotient, remainder: 0 }
}

function generateTier4(): Problem {
  const divisor = randomInt(2, 9)
  const quotient = randomInt(11, Math.floor(999 / divisor))
  const remainder = randomInt(1, divisor - 1)
  const dividend = quotient * divisor + remainder
  if (dividend < 100 || dividend > 999) return generateTier4()
  if (hasZeroInQuotient(quotient)) return generateTier4()
  return { dividend, divisor, quotient, remainder }
}

function generateTier5(): Problem {
  const divisor = randomInt(2, 9)
  const usesFourDigits = Math.random() > 0.5
  const maxDividend = usesFourDigits ? 9999 : 999
  const minQuotient = usesFourDigits ? 100 : 11
  const maxQuotient = Math.floor(maxDividend / divisor)
  const quotient = randomInt(minQuotient, maxQuotient)
  const maxRemainder = divisor - 1
  const remainder = randomInt(0, maxRemainder)
  const dividend = quotient * divisor + remainder
  if (dividend < 100 || dividend > 9999) return generateTier5()
  return { dividend, divisor, quotient, remainder }
}

const generators: Record<number, () => Problem> = {
  1: generateTier1,
  2: generateTier2,
  3: generateTier3,
  4: generateTier4,
  5: generateTier5,
}

export function generateProblem(
  tier: number,
  recentProblems: Array<{ dividend: number; divisor: number }>,
): Problem {
  const generate = generators[tier]
  if (!generate) return FALLBACK_PROBLEMS[tier] ?? FALLBACK_PROBLEMS[1]

  for (let attempt = 0; attempt < 100; attempt++) {
    const problem = generate()
    if (!isDuplicate(problem, recentProblems)) {
      return problem
    }
  }

  // Fallback after 100 attempts
  return FALLBACK_PROBLEMS[tier]
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/modules/long-division/engine/generateProblem.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/engine/generateProblem.ts src/modules/long-division/engine/generateProblem.test.ts
git commit -m "feat: implement tier-based problem generator with zero-in-quotient filtering"
```

### Task 1.6: Implement Feedback Templates

**Files:**
- Create: `src/modules/long-division/engine/feedbackTemplates.ts`
- Create: `src/modules/long-division/engine/feedbackTemplates.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/modules/long-division/engine/feedbackTemplates.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getDivideFeedback, getMultiplyFeedback, getSubtractFeedback } from './feedbackTemplates'

describe('getDivideFeedback', () => {
  it('returns "too high" feedback', () => {
    const fb = getDivideFeedback({ student: 5, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('bigger than')
    expect(fb).toContain('Try one less')
  })

  it('returns "too low" feedback', () => {
    const fb = getDivideFeedback({ student: 2, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('fit more')
  })

  it('returns "way off" feedback', () => {
    const fb = getDivideFeedback({ student: 9, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('times table')
  })

  it('returns "zero when shouldnt" feedback', () => {
    const fb = getDivideFeedback({ student: 0, correct: 3, divisor: 4, number: 15 })
    expect(fb).toContain('does fit')
  })

  it('returns "nonzero when should be zero" feedback', () => {
    const fb = getDivideFeedback({ student: 1, correct: 0, divisor: 6, number: 4 })
    expect(fb).toContain('too big to fit')
  })
})

describe('getMultiplyFeedback', () => {
  it('returns correction with correct answer', () => {
    const fb = getMultiplyFeedback({ a: 3, b: 4, student: 10, correct: 12 })
    expect(fb).toContain('3 × 4 = 12')
  })
})

describe('getSubtractFeedback', () => {
  it('returns correction for wrong difference', () => {
    const fb = getSubtractFeedback({ top: 15, bottom: 12, student: 2, correct: 3 })
    expect(fb).toContain('15 − 12 = 3')
  })

  it('detects flipped subtraction', () => {
    // student answered 3 for 12 - 9 (correct), but for 9 - 12 case:
    const fb = getSubtractFeedback({ top: 12, bottom: 9, student: -3, correct: 3 })
    expect(fb).toContain('bottom from the top')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/modules/long-division/engine/feedbackTemplates.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement feedback templates**

Create `src/modules/long-division/engine/feedbackTemplates.ts`:

```typescript
interface DivideFeedbackInput {
  student: number
  correct: number
  divisor: number
  number: number // the number being divided into
}

interface MultiplyFeedbackInput {
  a: number
  b: number
  student: number
  correct: number
}

interface SubtractFeedbackInput {
  top: number
  bottom: number
  student: number
  correct: number
}

export function getDivideFeedback(input: DivideFeedbackInput): string {
  const { student, correct, divisor, number: num } = input

  // Nonzero when should be zero
  if (correct === 0 && student > 0) {
    const product = student * divisor
    return `${divisor} × ${student} = ${product}, but we only have ${num}. ${divisor} is too big to fit even once. Write 0.`
  }

  // Zero when shouldn't be
  if (student === 0 && correct > 0) {
    return `${divisor} does fit into ${num}! How many times?`
  }

  // Way off (difference > 2)
  if (Math.abs(student - correct) > 2) {
    return `Think about your ${divisor} times table. What's the biggest ${divisor} × ___ that fits under ${num}?`
  }

  // Too high
  if (student > correct) {
    const product = student * divisor
    return `${student} × ${divisor} = ${product}, which is bigger than ${num}. Try one less.`
  }

  // Too low
  if (student < correct) {
    const nextProduct = (student + 1) * divisor
    return `You could fit more! ${student + 1} × ${divisor} = ${nextProduct}, which still fits under ${num}.`
  }

  return 'Not quite. Try again.'
}

export function getMultiplyFeedback(input: MultiplyFeedbackInput): string {
  const { a, b, student, correct } = input
  return `Let's check: ${a} × ${b} = ${correct}. You wrote ${student}.`
}

export function getSubtractFeedback(input: SubtractFeedbackInput): string {
  const { top, bottom, student, correct } = input

  // Detect flipped direction (student = bottom - top)
  if (student === bottom - top && student !== correct) {
    return `Make sure you subtract the bottom from the top: ${top} − ${bottom}, not ${bottom} − ${top}.`
  }

  return `Let's recount: ${top} − ${bottom} = ${correct}. You wrote ${student}.`
}

// --- Hint tiers for guided/practice mode ---

export function getDivideHint(tier: number, divisor: number, number: number, correct: number): string {
  if (tier === 1) {
    return `Not quite. Think about the ${divisor} times table. ${divisor} × ___ gets close to ${number} without going over.`
  }
  if (tier === 2) {
    // List multiples up to the answer
    const lines: string[] = []
    for (let i = 1; i <= correct; i++) {
      lines.push(`${divisor} × ${i} = ${divisor * i}`)
    }
    return lines.join('\n')
  }
  // Tier 3: give answer
  return `The answer is ${correct}. ${divisor} × ${correct} = ${divisor * correct}. Type ${correct} to continue.`
}

export function getMultiplyHint(tier: number, a: number, b: number, correct: number): string {
  if (tier === 1) {
    return `Let's double-check: ${a} × ${b} = ?`
  }
  if (tier === 2) {
    return `${a} × ${b} = ${correct}`
  }
  return `The answer is ${correct}. Type ${correct} to continue.`
}

export function getSubtractHint(tier: number, top: number, bottom: number, correct: number): string {
  if (tier === 1) {
    return `Try again: ${top} − ${bottom} = ?`
  }
  if (tier === 2) {
    return `${top} − ${bottom} = ${correct}`
  }
  return `The answer is ${correct}. Type ${correct} to continue.`
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/modules/long-division/engine/feedbackTemplates.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/engine/feedbackTemplates.ts src/modules/long-division/engine/feedbackTemplates.test.ts
git commit -m "feat: implement error-specific feedback templates and hint tiers"
```

### Task 1.7: Run Full Test Suite

- [ ] **Step 1: Run all engine tests**

```bash
npx vitest run
```

Expected: All tests pass (computeDivisionHouse, deriveCellStates, generateProblem, feedbackTemplates).

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit any fixes**

If any fixes were needed:

```bash
git add -A
git commit -m "fix: resolve test/type issues from full suite run"
```

---

## Chunk 2: Division House Visual Components

This chunk builds the core visual rendering layer — the CSS Grid division house and all its sub-components. After this chunk, you can render a static division house for any problem.

### Task 2.1: Cell Component

**Files:**
- Create: `src/modules/long-division/components/Cell.tsx`
- Create: `src/modules/long-division/components/Cell.module.css`

- [ ] **Step 1: Create Cell.module.css with all visual states and animations**

Create `src/modules/long-division/components/Cell.module.css`:

```css
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--digit-font-size, 28px);
  font-weight: 600;
  color: #2D2A26;
  position: relative;
  width: var(--cell-width, 48px);
  height: var(--cell-height, 56px);
}

/* Step-type colors */
.quotient { color: #3B82F6; }
.multiply { color: #22C55E; }
.subtract { color: #F97316; }
.bringdown { color: #A855F7; }
.dividend { color: #2D2A26; }
.divisor { color: #2D2A26; }

/* Visual states */
.hidden {
  opacity: 0;
  pointer-events: none;
}

.visible {
  opacity: 1;
}

.dimmed {
  opacity: 0.4;
}

.active {
  opacity: 1;
  outline: 2px dashed currentColor;
  animation: pulse 1.5s infinite;
}

.input {
  opacity: 1;
}

.inputField {
  width: 100%;
  height: 100%;
  border: 2px dashed currentColor;
  background: #FFF8F0;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: inherit;
  font-weight: 600;
  color: inherit;
  outline: none;
  border-radius: 4px;
  caret-color: transparent;
}

.correct {
  animation: correctFlash 0.4s ease-out;
}

.wrong {
  animation: wrongFlash 0.4s ease-out;
}

/* Minus sign */
.minus {
  position: absolute;
  left: -20px;
  color: #22C55E;
  font-size: inherit;
  font-weight: 600;
}

/* Multi-digit input spans multiple columns */
.multiDigitInput {
  grid-column: var(--span-start) / span var(--span-count);
}

/* Animations */
@keyframes pulse {
  0%, 100% { outline-offset: 0px; opacity: 1; }
  50% { outline-offset: 3px; opacity: 0.8; }
}

@keyframes correctFlash {
  0% { background-color: transparent; transform: scale(1); }
  30% { background-color: #86EFAC; transform: scale(1.1); }
  100% { background-color: transparent; transform: scale(1); }
}

@keyframes wrongFlash {
  0% { background-color: transparent; transform: translateX(0); }
  20% { background-color: #FCA5A5; transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(1px); }
  100% { background-color: transparent; transform: translateX(0); }
}

@keyframes digitReveal {
  0% { opacity: 0; transform: scale(0.7); }
  100% { opacity: 1; transform: scale(1); }
}

.revealing {
  animation: digitReveal 0.2s ease-out;
}
```

- [ ] **Step 2: Create Cell.tsx component**

Create `src/modules/long-division/components/Cell.tsx`:

```tsx
import { useRef, useEffect } from 'react'
import type { CellState } from '../engine/types'
import styles from './Cell.module.css'

interface CellProps {
  row: number
  col: number
  digit: string
  type: string
  state: CellState
  showMinus: boolean
  // For input mode — value driven by NumberPad through parent state (no onChange needed)
  inputValue?: string
  // For multi-digit input
  spanCols?: number
  // For animations
  isRevealing?: boolean
}

export default function Cell({
  row,
  col,
  digit,
  type,
  state,
  showMinus,
  inputValue,
  spanCols,
  isRevealing,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state])

  const gridStyle: React.CSSProperties = {
    gridRow: row + 1,         // CSS grid is 1-indexed
    gridColumn: spanCols
      ? `${col + 1} / span ${spanCols}`
      : col + 1,
  }

  const stateClass = styles[state] ?? ''
  const typeClass = styles[type] ?? ''
  const revealClass = isRevealing ? styles.revealing : ''

  if (state === 'hidden') {
    return <div className={`${styles.cell} ${stateClass}`} style={gridStyle} />
  }

  if (state === 'input') {
    // Input is display-only — value is set by NumberPad through parent state.
    // inputMode="none" suppresses system keyboard on iPad; onChange is not needed.
    return (
      <div className={`${styles.cell} ${typeClass} ${stateClass}`} style={gridStyle}>
        {showMinus && <span className={styles.minus}>−</span>}
        <input
          ref={inputRef}
          className={styles.inputField}
          type="text"
          inputMode="none"
          value={inputValue ?? ''}
          readOnly
          autoComplete="off"
        />
      </div>
    )
  }

  return (
    <div
      className={`${styles.cell} ${typeClass} ${stateClass} ${revealClass}`}
      style={gridStyle}
    >
      {showMinus && <span className={styles.minus}>−</span>}
      {digit}
    </div>
  )
}
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/long-division/components/Cell.tsx src/modules/long-division/components/Cell.module.css
git commit -m "feat: implement Cell component with 7 visual states and animations"
```

### Task 2.2: Bracket Component

**Files:**
- Create: `src/modules/long-division/components/Bracket.tsx`
- Create: `src/modules/long-division/components/Bracket.module.css`

- [ ] **Step 1: Create Bracket.module.css**

Create `src/modules/long-division/components/Bracket.module.css`:

```css
.bracketContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.verticalBar {
  position: absolute;
  width: 3px;
  background: #2D2A26;
  transition: height 0.3s ease-out;
}

.horizontalBar {
  position: absolute;
  height: 3px;
  background: #2D2A26;
}

.corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border-top-left-radius: 6px;
  border-top: 3px solid #2D2A26;
  border-left: 3px solid #2D2A26;
  background: transparent;
}
```

- [ ] **Step 2: Create Bracket.tsx**

Create `src/modules/long-division/components/Bracket.tsx`:

```tsx
import styles from './Bracket.module.css'

interface BracketProps {
  cellWidth: number
  cellHeight: number
  totalCols: number
  visibleRows: number  // grows as steps are revealed
}

export default function Bracket({ cellWidth, cellHeight, totalCols, visibleRows }: BracketProps) {
  // Column 1 is the bracket gutter
  // Vertical bar: right edge of col 1, from top of row 1 to bottom of visible rows
  const vertLeft = cellWidth * 2 - 3  // right edge of col 1 (col 0 + col 1 = 2 cells wide, minus bar width)
  const vertTop = cellHeight          // top of row 1
  const vertHeight = cellHeight * Math.max(1, visibleRows - 1)

  // Horizontal bar: top of row 1, from left of col 2 to right of last col
  const horizLeft = cellWidth * 2
  const horizTop = cellHeight
  const horizWidth = cellWidth * (totalCols - 2)

  // Corner: where vertical meets horizontal
  const cornerLeft = vertLeft - 3
  const cornerTop = vertTop - 3

  return (
    <div className={styles.bracketContainer}>
      <div
        className={styles.verticalBar}
        style={{
          left: `${vertLeft}px`,
          top: `${vertTop}px`,
          height: `${vertHeight}px`,
        }}
      />
      <div
        className={styles.horizontalBar}
        style={{
          left: `${horizLeft}px`,
          top: `${horizTop}px`,
          width: `${horizWidth}px`,
        }}
      />
      <div
        className={styles.corner}
        style={{
          left: `${cornerLeft}px`,
          top: `${cornerTop}px`,
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/long-division/components/Bracket.tsx src/modules/long-division/components/Bracket.module.css
git commit -m "feat: implement Bracket overlay component"
```

### Task 2.3: HorizontalRule Component

**Files:**
- Create: `src/modules/long-division/components/HorizontalRule.tsx`

- [ ] **Step 1: Create HorizontalRule.tsx**

Create `src/modules/long-division/components/HorizontalRule.tsx`:

```tsx
import type { RuleData } from '../engine/types'

interface HorizontalRuleProps {
  rule: RuleData
  visible: boolean
}

export default function HorizontalRule({ rule, visible }: HorizontalRuleProps) {
  if (!visible) return null

  const style: React.CSSProperties = {
    gridRow: rule.row + 1,
    gridColumn: `${rule.fromCol + 1} / span ${rule.toCol - rule.fromCol + 1}`,
    borderBottom: '2px solid #2D2A26',
    height: '100%',
    alignSelf: 'end',
  }

  return <div style={style} />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/components/HorizontalRule.tsx
git commit -m "feat: implement HorizontalRule component for work area lines"
```

### Task 2.4: BringDownArrow Component

**Files:**
- Create: `src/modules/long-division/components/BringDownArrow.tsx`

- [ ] **Step 1: Create BringDownArrow.tsx**

Create `src/modules/long-division/components/BringDownArrow.tsx`:

```tsx
import { useEffect, useState } from 'react'

interface BringDownArrowProps {
  fromRow: number   // dividend row (row 1)
  fromCol: number   // column of the digit being brought down
  toRow: number     // target row
  toCol: number     // same column
  cellWidth: number
  cellHeight: number
  visible: boolean
}

export default function BringDownArrow({
  fromRow,
  fromCol,
  toRow,
  toCol,
  cellWidth,
  cellHeight,
  visible,
}: BringDownArrowProps) {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (visible) {
      setDrawn(false)
      // Trigger draw animation
      requestAnimationFrame(() => setDrawn(true))
    }
  }, [visible])

  if (!visible) return null

  // Calculate pixel positions (center of cells)
  const x1 = (fromCol + 0.5) * cellWidth
  const y1 = (fromRow + 1) * cellHeight    // bottom of source cell
  const x2 = (toCol + 0.5) * cellWidth
  const y2 = toRow * cellHeight             // top of target cell

  // Create a curved path
  const midY = (y1 + y2) / 2
  const path = `M ${x1} ${y1} C ${x1 + 20} ${midY}, ${x2 + 20} ${midY}, ${x2} ${y2}`
  const pathLength = 200 // approximate

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="#A855F7"
        strokeWidth={2}
        strokeDasharray={pathLength}
        strokeDashoffset={drawn ? 0 : pathLength}
        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#A855F7" />
        </marker>
      </defs>
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/components/BringDownArrow.tsx
git commit -m "feat: implement BringDownArrow SVG with animated stroke"
```

### Task 2.5: DivisionHouse Component (CSS Grid Renderer)

**Files:**
- Create: `src/modules/long-division/components/DivisionHouse.tsx`
- Create: `src/modules/long-division/components/DivisionHouse.module.css`

- [ ] **Step 1: Create DivisionHouse.module.css**

Create `src/modules/long-division/components/DivisionHouse.module.css`:

```css
.houseContainer {
  position: relative;
  display: inline-block;
}

.grid {
  display: grid;
  gap: 0;
  position: relative;
}

/* iPad landscape (primary) */
.grid {
  --cell-width: 48px;
  --cell-height: 56px;
  --digit-font-size: 28px;
}

/* Smaller iPads / split view */
@media (max-width: 900px) {
  .grid {
    --cell-width: 44px;
    --cell-height: 48px;
    --digit-font-size: 24px;
  }
}

/* Remainder display */
.remainder {
  color: #F97316;
  font-size: 18px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
  margin-top: 4px;
}
```

- [ ] **Step 2: Create DivisionHouse.tsx**

Create `src/modules/long-division/components/DivisionHouse.tsx`:

```tsx
import { useMemo } from 'react'
import type { ComputedHouse, CellState } from '../engine/types'
import { deriveCellStates } from '../engine/deriveCellStates'
import Cell from './Cell'
import Bracket from './Bracket'
import HorizontalRule from './HorizontalRule'
import BringDownArrow from './BringDownArrow'
import styles from './DivisionHouse.module.css'

interface DivisionHouseProps {
  houseData: ComputedHouse
  currentStepIndex: number
  inputValue: string
  onInput: (value: string) => void
  // Static mode (lesson): all cells visible, no input
  staticMode?: boolean
  // Show remainder label
  showRemainder?: boolean
  // Active bring-down arrow
  activeBringDown?: {
    fromRow: number
    fromCol: number
    toRow: number
    toCol: number
  } | null
}

export default function DivisionHouse({
  houseData,
  currentStepIndex,
  inputValue,
  onInput,
  staticMode = false,
  showRemainder = false,
  activeBringDown = null,
}: DivisionHouseProps) {
  const cellWidth = 48  // will be CSS variable in production
  const cellHeight = 56

  const cellStates = useMemo(() => {
    if (staticMode) {
      // All cells visible in static mode
      return houseData.cells.map(cell => ({
        ...cell,
        state: 'visible' as CellState,
      }))
    }
    return deriveCellStates(houseData, currentStepIndex)
  }, [houseData, currentStepIndex, staticMode])

  // Determine which rules are visible
  // Rules appear AFTER the multiply step completes (before the student inputs subtract)
  const visibleRuleRows = useMemo(() => {
    if (staticMode) return new Set(houseData.rules.map(r => r.row))
    const set = new Set<number>()
    for (const step of houseData.steps) {
      if (step.action === 'multiply' && step.stepIndex < currentStepIndex) {
        // The rule is one row below the multiply result
        const multiplyRow = step.cells[0]?.row
        if (multiplyRow !== undefined) {
          set.add(multiplyRow + 1)
        }
      }
    }
    return set
  }, [houseData, currentStepIndex, staticMode])

  // Calculate visible rows for bracket growth
  const visibleRows = useMemo(() => {
    if (staticMode) return houseData.totalRows
    let maxRow = 1 // at minimum, show through dividend row
    for (const cs of cellStates) {
      if (cs.state !== 'hidden' && cs.row > maxRow) {
        maxRow = cs.row
      }
    }
    return maxRow + 1
  }, [cellStates, staticMode, houseData.totalRows])

  // Current step info for multi-digit input
  const currentStep = houseData.steps[currentStepIndex]
  const isMultiDigit = currentStep && currentStep.cells.length > 1 && !currentStep.auto

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${houseData.totalCols}, var(--cell-width, 48px))`,
    gridTemplateRows: `repeat(${houseData.totalRows}, var(--cell-height, 56px))`,
  }

  return (
    <div className={styles.houseContainer}>
      <div className={styles.grid} style={gridStyle}>
        {cellStates.map((cell, i) => {
          const isCurrentInput = cell.state === 'input'
          const spanCols = isCurrentInput && isMultiDigit ? currentStep.cells.length : undefined

          return (
            <Cell
              key={`${cell.row}-${cell.col}`}
              row={cell.row}
              col={isCurrentInput && isMultiDigit ? currentStep.cells[0].col : cell.col}
              digit={cell.digit}
              type={cell.type}
              state={cell.state}
              showMinus={cell.showMinus}
              inputValue={isCurrentInput ? inputValue : undefined}
              spanCols={spanCols}
            />
          )
        })}

        {houseData.rules.map((rule, i) => (
          <HorizontalRule
            key={`rule-${i}`}
            rule={rule}
            visible={visibleRuleRows.has(rule.row)}
          />
        ))}

        <Bracket
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          totalCols={houseData.totalCols}
          visibleRows={visibleRows}
        />

        {activeBringDown && (
          <BringDownArrow
            fromRow={activeBringDown.fromRow}
            fromCol={activeBringDown.fromCol}
            toRow={activeBringDown.toRow}
            toCol={activeBringDown.toCol}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            visible={true}
          />
        )}
      </div>

      {showRemainder && houseData.remainder > 0 && (
        <div className={styles.remainder}>R{houseData.remainder}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Create a visual test page**

Create a temporary test in `src/App.tsx` to render a static division house:

```tsx
import { computeDivisionHouse } from './modules/long-division/engine/computeDivisionHouse'
import DivisionHouse from './modules/long-division/components/DivisionHouse'

export default function App() {
  const house = computeDivisionHouse(1248, 6)

  return (
    <div style={{ padding: 40, background: '#FDF6EC', minHeight: '100dvh' }}>
      <h1 style={{ fontFamily: 'Quicksand', color: '#2D2A26' }}>
        Division House Test: 1248 ÷ 6
      </h1>
      <DivisionHouse
        houseData={house}
        currentStepIndex={house.steps.length}
        inputValue=""
        onInput={() => {}}
        staticMode={true}
        showRemainder={true}
      />
    </div>
  )
}
```

- [ ] **Step 5: Visual verification**

```bash
npm run dev
```

Open browser. Verify:
- Grid renders with correct digit placement
- Bracket appears (vertical + horizontal bars with corner)
- Minus signs appear next to multiply rows
- Colors match step types (blue quotient, green multiply, orange subtract, purple bringdown)
- Horizontal rules appear between multiply and subtract rows

- [ ] **Step 6: Commit**

```bash
git add src/modules/long-division/components/DivisionHouse.tsx src/modules/long-division/components/DivisionHouse.module.css
git commit -m "feat: implement DivisionHouse CSS Grid renderer with bracket and rules"
```

### Task 2.6: StepPanel Component

**Files:**
- Create: `src/modules/long-division/components/StepPanel.tsx`
- Create: `src/modules/long-division/components/StepPanel.module.css`

- [ ] **Step 1: Create StepPanel.module.css**

Create `src/modules/long-division/components/StepPanel.module.css`:

```css
.panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 100px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #6B6560;
  transition: all 0.2s ease;
}

.step.active {
  color: white;
  transform: scale(1.05);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.divide { --step-color: #3B82F6; }
.multiply { --step-color: #22C55E; }
.subtract { --step-color: #F97316; }
.bringdown { --step-color: #A855F7; }

.divide .dot { background: #3B82F6; }
.multiply .dot { background: #22C55E; }
.subtract .dot { background: #F97316; }
.bringdown .dot { background: #A855F7; }

.step.active.divide { background: #3B82F6; }
.step.active.multiply { background: #22C55E; }
.step.active.subtract { background: #F97316; }
.step.active.bringdown { background: #A855F7; }

.step.active .dot { background: white; }

.label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}
```

- [ ] **Step 2: Create StepPanel.tsx**

Create `src/modules/long-division/components/StepPanel.tsx`:

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/long-division/components/StepPanel.tsx src/modules/long-division/components/StepPanel.module.css
git commit -m "feat: implement StepPanel DMSB indicator component"
```

### Task 2.7: Visual Integration Test

- [ ] **Step 1: Update App.tsx to test interactive mode**

Update `src/App.tsx` to test step-through interaction:

```tsx
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
```

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

Verify:
- Division house renders correctly for 84÷4
- Step panel highlights the current step type
- Typing correct answers advances to the next step
- Cells transition from hidden → input → visible
- Bring-down step auto-advances
- Problem completes after all steps

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

Expected: All engine tests still pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "test: add interactive division house integration test in App"
```

---

## Chunk 3: State Management + Shared Components

This chunk implements the reducer, persistence layer, number pad, and feedback/hint UI — everything needed to wire up interactive problem-solving.

### Task 3.1: Action Types and Creators

**Files:**
- Create: `src/modules/long-division/state/actions.ts`

- [ ] **Step 1: Define all action types**

Create `src/modules/long-division/state/actions.ts`:

```typescript
export type LDAction =
  // Navigation
  | { type: 'SKIP_LESSON' }
  | { type: 'START_GUIDED' }
  | { type: 'START_PRACTICE' }
  // Lesson
  | { type: 'NEXT_LESSON_SCREEN' }
  | { type: 'PREV_LESSON_SCREEN' }
  | { type: 'LESSON_STEP_ADVANCE' }
  | { type: 'LESSON_INPUT_CORRECT' }
  | { type: 'LESSON_INPUT_WRONG' }
  | { type: 'COMPLETE_LESSON' }
  // Guided
  | { type: 'GUIDED_INPUT_CORRECT' }
  | { type: 'GUIDED_INPUT_WRONG' }
  | { type: 'SHOW_GUIDED_INTERSTITIAL' }
  | { type: 'NEXT_GUIDED_PROBLEM' }
  | { type: 'COMPLETE_GUIDED' }
  // Practice
  | { type: 'SET_CURRENT_PROBLEM'; problem: import('../engine/types').Problem; houseData: import('../engine/types').ComputedHouse }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'STEP_CORRECT' }
  | { type: 'STEP_WRONG' }
  | { type: 'USE_HINT' }
  | { type: 'PROBLEM_COMPLETE' }
  | { type: 'ADVANCE_TIER' }
  | { type: 'DEMOTE_TIER' }
  | { type: 'DISMISS_TIER_ADVANCE' }
  | { type: 'DISMISS_COMPLETION' }
  | { type: 'SHOW_TEN_PROBLEM_CHECK' }
  | { type: 'DISMISS_TEN_PROBLEM_CHECK' }
  | { type: 'SHOW_MINI_DRILL'; divisor: number }
  | { type: 'DISMISS_MINI_DRILL' }
  // Hydration
  | { type: 'HYDRATE'; state: Partial<import('../engine/types').LDState> }
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/state/actions.ts
git commit -m "feat: define all reducer action types"
```

### Task 3.2: Reducer Implementation

**Files:**
- Create: `src/modules/long-division/state/reducer.ts`
- Create: `src/modules/long-division/state/reducer.test.ts`

- [ ] **Step 1: Write failing tests for key state transitions**

Create `src/modules/long-division/state/reducer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ldReducer, initialLDState } from './reducer'

describe('ldReducer', () => {
  describe('lesson navigation', () => {
    it('advances lesson screen', () => {
      const state = ldReducer(initialLDState, { type: 'NEXT_LESSON_SCREEN' })
      expect(state.lessonScreen).toBe(2)
      expect(state.lessonMaxScreenReached).toBe(2)
    })

    it('tracks max screen reached', () => {
      let state = initialLDState
      state = ldReducer(state, { type: 'NEXT_LESSON_SCREEN' })
      state = ldReducer(state, { type: 'NEXT_LESSON_SCREEN' })
      state = ldReducer(state, { type: 'PREV_LESSON_SCREEN' })
      expect(state.lessonScreen).toBe(2)
      expect(state.lessonMaxScreenReached).toBe(3)
    })

    it('resets lesson input attempts on screen advance', () => {
      let state = { ...initialLDState, lessonInputAttempts: 2 }
      state = ldReducer(state, { type: 'NEXT_LESSON_SCREEN' })
      expect(state.lessonInputAttempts).toBe(0)
    })
  })

  describe('practice - streak and tier', () => {
    it('increments streak on clean problem', () => {
      const state = { ...initialLDState, phase: 'practice' as const, streak: 2, problemClean: true }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.streak).toBe(3)
    })

    it('resets streak on dirty problem', () => {
      const state = { ...initialLDState, phase: 'practice' as const, streak: 3, problemClean: false }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.streak).toBe(0)
    })

    it('triggers tier advance at streak 5', () => {
      const state = { ...initialLDState, phase: 'practice' as const, streak: 4, problemClean: true, tier: 2 }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.showingTierAdvance).toBe(true)
    })

    it('advances tier', () => {
      const state = { ...initialLDState, tier: 2, highestTier: 2 }
      const next = ldReducer(state, { type: 'ADVANCE_TIER' })
      expect(next.tier).toBe(3)
      expect(next.highestTier).toBe(3)
      expect(next.streak).toBe(0)
      expect(next.consecutiveDirtyProblems).toBe(0)
    })

    it('tracks consecutive dirty problems', () => {
      const state = { ...initialLDState, phase: 'practice' as const, problemClean: false, consecutiveDirtyProblems: 1 }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.consecutiveDirtyProblems).toBe(2)
    })

    it('demotes tier at 3 consecutive dirty (but not below 1)', () => {
      const state = { ...initialLDState, tier: 1, consecutiveDirtyProblems: 2, problemClean: false, phase: 'practice' as const }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      // Tier 1 floor — no demotion
      expect(next.tier).toBe(1)
    })

    it('demotes tier at 3 consecutive dirty when above tier 1', () => {
      const state = { ...initialLDState, tier: 3, consecutiveDirtyProblems: 2, problemClean: false, phase: 'practice' as const }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.tier).toBe(2)
    })
  })

  describe('hints', () => {
    it('increments hint level and marks dirty', () => {
      const state = { ...initialLDState, currentHintLevel: 0, problemClean: true }
      const next = ldReducer(state, { type: 'USE_HINT' })
      expect(next.currentHintLevel).toBe(1)
      expect(next.problemClean).toBe(false)
    })
  })

  describe('step correct/wrong', () => {
    it('advances step on correct', () => {
      const state = { ...initialLDState, currentStepIndex: 2 }
      const next = ldReducer(state, { type: 'STEP_CORRECT' })
      expect(next.currentStepIndex).toBe(3)
      expect(next.currentAttempts).toBe(0)
      expect(next.currentHintLevel).toBe(0)
      expect(next.inputValue).toBe('')
    })

    it('marks dirty on wrong', () => {
      const state = { ...initialLDState, currentAttempts: 0, problemClean: true }
      const next = ldReducer(state, { type: 'STEP_WRONG' })
      expect(next.currentAttempts).toBe(1)
      expect(next.problemClean).toBe(false)
    })
  })

  describe('skip lesson', () => {
    it('jumps to practice tier 2', () => {
      const next = ldReducer(initialLDState, { type: 'SKIP_LESSON' })
      expect(next.phase).toBe('practice')
      expect(next.tier).toBe(2)
      expect(next.lessonCompleted).toBe(true)
      expect(next.guidedCompleted).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/modules/long-division/state/reducer.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the reducer**

Create `src/modules/long-division/state/reducer.ts`. The reducer handles all state transitions. Key logic:

- `PROBLEM_COMPLETE`: increment `totalCorrect`/`totalAttempted`, update streak (reset if dirty, increment if clean), check for tier advance trigger (streak === 5), update `consecutiveDirtyProblems` (reset if clean, increment if dirty, demote if reaches 3 and tier > 1)
- `ADVANCE_TIER`: `tier++`, `highestTier = max(highestTier, tier)`, reset streak and dirty counter
- `DEMOTE_TIER`: `tier = max(1, tier - 1)`, reset streak and dirty counter
- `STEP_CORRECT`: `currentStepIndex++`, reset `currentAttempts`/`currentHintLevel`/`inputValue`
- `STEP_WRONG`: `currentAttempts++`, `problemClean = false`
- `USE_HINT`: `currentHintLevel++`, `problemClean = false`
- `LESSON_INPUT_WRONG`: `lessonInputAttempts++`
- `SKIP_LESSON`: phase='practice', tier=2, both completed flags true

Export `initialLDState` with all fields at zero/default values, `phase: 'lesson'`, `tier: 1`.

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/modules/long-division/state/reducer.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/state/reducer.ts src/modules/long-division/state/reducer.test.ts
git commit -m "feat: implement LDState reducer with tier advancement and demotion logic"
```

### Task 3.3: Persistence Layer

**Files:**
- Create: `src/modules/long-division/state/persistence.ts`
- Create: `src/modules/long-division/state/persistence.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/modules/long-division/state/persistence.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { saveProgress, loadProgress, DEFAULT_PROGRESS } from './persistence'
import type { ChildProgress } from '../engine/types'

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads progress round-trip', () => {
    const progress: ChildProgress = {
      ...DEFAULT_PROGRESS,
      tier: 3,
      totalCorrect: 25,
      streak: 4,
    }
    saveProgress('jack', progress)
    const loaded = loadProgress('jack')
    expect(loaded.tier).toBe(3)
    expect(loaded.totalCorrect).toBe(25)
    expect(loaded.streak).toBe(4)
  })

  it('returns defaults when no saved data', () => {
    const loaded = loadProgress('reese')
    expect(loaded).toEqual(DEFAULT_PROGRESS)
  })

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('goat-trainer-kate-long-division', 'not-json')
    const loaded = loadProgress('kate')
    expect(loaded).toEqual(DEFAULT_PROGRESS)
  })

  it('preserves inProgress state', () => {
    const progress: ChildProgress = {
      ...DEFAULT_PROGRESS,
      inProgress: {
        dividend: 84,
        divisor: 4,
        currentStepIndex: 3,
        tier: 2,
        streak: 1,
        problemClean: true,
      },
    }
    saveProgress('jack', progress)
    const loaded = loadProgress('jack')
    expect(loaded.inProgress?.dividend).toBe(84)
    expect(loaded.inProgress?.currentStepIndex).toBe(3)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/modules/long-division/state/persistence.test.ts
```

- [ ] **Step 3: Implement persistence**

Create `src/modules/long-division/state/persistence.ts`:

```typescript
import type { ChildProgress } from '../engine/types'

const STORAGE_PREFIX = 'goat-trainer-'
const MODULE_SUFFIX = '-long-division'

export const DEFAULT_PROGRESS: ChildProgress = {
  tier: 1,
  totalCorrect: 0,
  totalAttempted: 0,
  highestTier: 1,
  streak: 0,
  consecutiveDirtyProblems: 0,
  lastSessionDate: '',
  lessonCompleted: false,
  guidedCompleted: false,
  stepAccuracy: {
    divide: { correct: 0, total: 0 },
    multiply: { correct: 0, total: 0 },
    subtract: { correct: 0, total: 0 },
  },
  inProgress: null,
  recentProblems: [],
}

export function saveProgress(childId: string, progress: ChildProgress): void {
  const key = `${STORAGE_PREFIX}${childId}${MODULE_SUFFIX}`
  localStorage.setItem(key, JSON.stringify(progress))
}

export function loadProgress(childId: string): ChildProgress {
  const key = `${STORAGE_PREFIX}${childId}${MODULE_SUFFIX}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { ...DEFAULT_PROGRESS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROGRESS, ...parsed }
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/modules/long-division/state/persistence.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/state/persistence.ts src/modules/long-division/state/persistence.test.ts
git commit -m "feat: implement localStorage persistence with safe defaults"
```

### Task 3.4: NumberPad Component

**Files:**
- Create: `src/components/shared/NumberPad.tsx`
- Create: `src/components/shared/NumberPad.module.css`

- [ ] **Step 1: Create NumberPad.module.css**

```css
.pad {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 8px;
}

.key {
  width: 48px;
  height: 48px;
  border: 2px solid #D4C4A8;
  border-radius: 10px;
  background: white;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 600;
  color: #2D2A26;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s;
}

.key:active {
  background: #F5F0E8;
}

.wide {
  width: 72px;
}

.confirm {
  background: #F59E0B;
  border-color: #D97706;
  color: white;
}

.confirm:active {
  background: #D97706;
}
```

- [ ] **Step 2: Create NumberPad.tsx**

```tsx
import styles from './NumberPad.module.css'

interface NumberPadProps {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onConfirm: () => void
  disabled?: boolean
}

export default function NumberPad({ onDigit, onBackspace, onConfirm, disabled }: NumberPadProps) {
  return (
    <div className={styles.pad}>
      {['1','2','3','4','5','6','7','8','9','0'].map(d => (
        <button
          key={d}
          className={styles.key}
          onClick={() => !disabled && onDigit(d)}
          disabled={disabled}
        >
          {d}
        </button>
      ))}
      <button className={`${styles.key} ${styles.wide}`} onClick={() => !disabled && onBackspace()} disabled={disabled}>
        ⌫
      </button>
      <button className={`${styles.key} ${styles.wide} ${styles.confirm}`} onClick={() => !disabled && onConfirm()} disabled={disabled}>
        ✓
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/NumberPad.tsx src/components/shared/NumberPad.module.css
git commit -m "feat: implement NumberPad component for touch input"
```

### Task 3.5: FeedbackArea and HintButton Components

**Files:**
- Create: `src/modules/long-division/components/FeedbackArea.tsx`
- Create: `src/modules/long-division/components/FeedbackArea.module.css`
- Create: `src/modules/long-division/components/HintButton.tsx`

- [ ] **Step 1: Create FeedbackArea.module.css**

Key styles: right sidebar card with white background, border-radius 12px, padding 16px. Feedback text uses Nunito 16px. Slide-up animation (300ms) for hint reveals.

- [ ] **Step 2: Create HintButton.tsx**

Props: `level: number` (0-3), `onClick: () => void`, `disabled: boolean`. Labels: 0="Hint", 1="More Help", 2="Show Answer", 3=hidden. Styled as a subtle button with `#E5DDD0` border.

- [ ] **Step 3: Create FeedbackArea.tsx**

Props: `promptText: string`, `feedbackText: string | null`, `hintLevel: number`, `onHint: () => void`. Renders prompt, feedback message (with slide-up animation), and HintButton.

- [ ] **Step 4: Commit**

```bash
git add src/modules/long-division/components/FeedbackArea.tsx src/modules/long-division/components/FeedbackArea.module.css src/modules/long-division/components/HintButton.tsx
git commit -m "feat: implement FeedbackArea and HintButton components"
```

### Task 3.6: TierDisplay Component

**Files:**
- Create: `src/modules/long-division/components/TierDisplay.tsx`
- Create: `src/modules/long-division/components/TierDisplay.module.css`

- [ ] **Step 1: Create TierDisplay.module.css**

Key elements: tier badge (amber background, rounded pill), 5 streak dots (filled=`#F59E0B`, empty=`#E5DDD0`, 10px circles), star icons. Animations: dot flash gold (300ms), star pop (scale 0→1.2→1, 300ms), tier number slide (400ms).

- [ ] **Step 2: Create TierDisplay.tsx**

Props: `tier: number`, `streak: number`, `showAdvance: boolean`. Renders: "Tier N" pill with star count, 5 dots showing streak progress, advancement animation overlay.

- [ ] **Step 3: Commit**

```bash
git add src/modules/long-division/components/TierDisplay.tsx src/modules/long-division/components/TierDisplay.module.css
git commit -m "feat: implement TierDisplay with streak dots and advancement animation"
```

### Task 3.7: Run Full Suite

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

---

## Chunk 4: Practice Mode

This chunk wires everything together into the main practice loop — the core gameplay experience.

### Task 4.1: PracticePhase Screen

**Files:**
- Create: `src/modules/long-division/screens/PracticePhase.tsx`
- Create: `src/modules/long-division/screens/PracticePhase.module.css`

- [ ] **Step 1: Create PracticePhase.module.css**

Three-column landscape layout using CSS Grid:

```css
.practiceLayout {
  display: grid;
  grid-template-columns: 100px 1fr 240px;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  padding: 16px;
  height: 100dvh;
  box-sizing: border-box;
}

.topBar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stepPanelArea { grid-column: 1; grid-row: 2; }
.houseArea { grid-column: 2; grid-row: 2; display: flex; align-items: center; justify-content: center; }
.feedbackArea { grid-column: 3; grid-row: 2; }
.padArea { grid-column: 1 / -1; grid-row: 3; }
```

- [ ] **Step 2: Create PracticePhase.tsx**

This is the main gameplay component. It:
1. On mount: generates a problem via `generateProblem(tier, recentProblems)`, computes house via `computeDivisionHouse`
2. Dispatches `SET_CURRENT_PROBLEM` to reducer
3. Renders: top bar (TierDisplay + hub button + sound toggle), StepPanel, DivisionHouse, FeedbackArea, NumberPad
4. NumberPad `onDigit` → dispatches `SET_INPUT` (append digit)
5. NumberPad `onBackspace` → dispatches `SET_INPUT` (remove last char)
6. NumberPad `onConfirm` → validates answer:
   - If correct: dispatch `STEP_CORRECT`, play correct sound, check if problem complete
   - If wrong: dispatch `STEP_WRONG`, play wrong sound, show feedback from `feedbackTemplates`
7. On problem complete: dispatch `PROBLEM_COMPLETE`, show completion overlay (2s), generate next problem
8. On tier advance: show advancement animation (banner + dots + star), dispatch `ADVANCE_TIER`
9. Every 10 problems: show check-in ("Keep going or take a break?")
10. Check for mini-drill trigger after each problem

Key: the component reads `currentStep.auto` — if the current step is bringdown, auto-advance after 600ms animation delay.

- [ ] **Step 3: Verify with dev server**

```bash
npm run dev
```

Test: can type answers via number pad, steps advance, problem completes, new problem generates.

- [ ] **Step 4: Commit**

```bash
git add src/modules/long-division/screens/PracticePhase.tsx src/modules/long-division/screens/PracticePhase.module.css
git commit -m "feat: implement PracticePhase with full gameplay loop"
```

### Task 4.2: Multiplication Mini-Drill

**Files:**
- Create: `src/modules/long-division/miniDrills/MultiplicationDrill.tsx`
- Create: `src/modules/long-division/miniDrills/MultiplicationDrill.module.css`

- [ ] **Step 1: Create MultiplicationDrill**

Props: `divisor: number`, `childName: string`, `onComplete: () => void`.

Renders 5 sequential flash cards: `[divisor] × [random 2-9] = ?`. Student types answer via NumberPad. Correct = green flash + next (500ms). Wrong = show correct answer (1.5s) + next. After 5 cards: "Nice! Let's get back to dividing." → calls `onComplete()`.

Does NOT affect tier/streak.

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/miniDrills/MultiplicationDrill.tsx src/modules/long-division/miniDrills/MultiplicationDrill.module.css
git commit -m "feat: implement multiplication mini-drill flash cards"
```

### Task 4.3: Module Entry Point

**Files:**
- Create: `src/modules/long-division/index.tsx`
- Create: `src/modules/long-division/moduleConfig.ts`

- [ ] **Step 1: Create moduleConfig.ts**

```typescript
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
```

- [ ] **Step 2: Create index.tsx (module entry)**

The module entry:
1. Initializes `useReducer(ldReducer, initialLDState)`
2. On mount: hydrates from `loadProgress(childId)`, dispatches `HYDRATE`
3. On meaningful state changes: calls `saveProgress(childId, ...)`
4. Routes based on `state.phase`:
   - `'lesson'` → `<LessonPhase />` (placeholder for now)
   - `'guided'` → `<GuidedPhase />` (placeholder for now)
   - `'practice'` → `<PracticePhase />`
   - `'skip-gate'` → `<SkipGate />` (placeholder for now)

- [ ] **Step 3: Wire into App.tsx temporarily**

Update App.tsx to render `<LongDivisionModule childName="Jack" childId="jack" onExit={() => {}} />` for testing.

- [ ] **Step 4: Test practice mode end-to-end**

```bash
npm run dev
```

Verify: practice mode loads, can solve problems, tier advances after 5 clean, demotes after 3 dirty, progress persists on refresh.

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/index.tsx src/modules/long-division/moduleConfig.ts src/App.tsx
git commit -m "feat: implement module entry with reducer, persistence, and phase routing"
```

---

## Chunk 5: Guided Mode + Lesson Screens

This chunk implements the teaching content — the interactive textbook that precedes practice.

### Task 5.1: GuidedPhase Screen

**Files:**
- Create: `src/modules/long-division/screens/GuidedPhase.tsx`
- Create: `src/modules/long-division/screens/GuidedPhase.module.css`

- [ ] **Step 1: Create GuidedPhase.tsx**

Three hardcoded problems: 72÷3, 95÷4, 738÷6. Uses same DivisionHouse, StepPanel, NumberPad components as Practice.

Key differences from Practice:
- Three-tier hint system (nudge → direct help → give answer + redemption step)
- Redemption step: after Tier 3 hint, show a similar easier problem of the same step type
- No tier/streak tracking
- Interstitial between problems: "Problem [N] of 3" + [Let's Go]
- After problem 3: transition card → [Start Practice]
- Scaffolding reduction: prompts shorten across the 3 problems (full sentence → step+numbers → just numbers)
- Remainder prompt after Guided Example 2 (95÷4): "Can 4 go into 3?" [Yes] [No]

- [ ] **Step 2: Test guided flow**

```bash
npm run dev
```

Verify: 3 guided problems with hints, interstitials, transition to practice.

- [ ] **Step 3: Commit**

```bash
git add src/modules/long-division/screens/GuidedPhase.tsx src/modules/long-division/screens/GuidedPhase.module.css
git commit -m "feat: implement GuidedPhase with three-tier hints and redemption steps"
```

### Task 5.2: LessonPhase Container + Navigation

**Files:**
- Create: `src/modules/long-division/screens/LessonPhase.tsx`
- Create: `src/modules/long-division/screens/LessonPhase.module.css`

- [ ] **Step 1: Create LessonPhase**

Container for screens 1-7. Renders:
- Top: progress dots (7 dots for lesson, 3 for guided, "Practice" pill)
- Bottom: Back/Next buttons
- Center: current screen component

Navigation logic:
- Next disabled if `lessonScreen + 1 > lessonMaxScreenReached + 1`
- Each screen sets `lessonInteractionComplete = true` when its interaction is done
- Next only enables when interaction is complete
- Pacing: 800ms delay before Next re-enables after a step

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/screens/LessonPhase.tsx src/modules/long-division/screens/LessonPhase.module.css
git commit -m "feat: implement LessonPhase container with navigation dots and gating"
```

### Task 5.3: Screen 1 — What Is Division?

**Files:**
- Create: `src/modules/long-division/screens/Screen1_WhatIsDivision.tsx`
- Create: `src/modules/long-division/components/CookieAnimation.tsx`
- Create: `src/modules/long-division/components/CookieAnimation.module.css`

- [ ] **Step 1: Create CookieAnimation**

SVG with `viewBox="0 0 560 340"`. 12 cookie circles (36px, `#D4890E` fill, `#A0680A` stroke, 2 dots inside). 3 group boxes. "Watch" button starts round-robin animation (400ms between cookies, 500ms per move). After all land: counter "4" in each box.

- [ ] **Step 2: Create Screen1**

Content: title, cookie animation, input ("Each group gets ___ cookies"), skip gate link. Correct "4" → feedback + enable Next. Wrong → hint to count cookies.

Skip gate link: "Already know long division? Prove it!" → opens SkipGate.

- [ ] **Step 3: Commit**

```bash
git add src/modules/long-division/screens/Screen1_WhatIsDivision.tsx src/modules/long-division/components/CookieAnimation.tsx src/modules/long-division/components/CookieAnimation.module.css
git commit -m "feat: implement Screen 1 cookie animation and division intro"
```

### Task 5.4: Screen 2 — Meet the Division House

**Files:**
- Create: `src/modules/long-division/screens/Screen2_DivisionHouse.tsx`

- [ ] **Step 1: Create Screen2**

Two phases:
1. **Bridge animation** (5s): cookies → numbers slide to house positions → bracket draws → cookies fade
2. **Labeled house**: static DivisionHouse for 12÷3=4 with animated callout labels (Quotient, Divisor, Dividend) appearing at 0, 1.2s, 2.4s
3. **Quick check**: "In 20 ÷ 5 = 4, which is the dividend?" → [5] [20] [4]

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/screens/Screen2_DivisionHouse.tsx
git commit -m "feat: implement Screen 2 cookie-to-notation bridge and labeled house"
```

### Task 5.5: Screen 3 — The Four Steps

**Files:**
- Create: `src/modules/long-division/screens/Screen3_FourSteps.tsx`

- [ ] **Step 1: Create Screen3**

Four colored step cards (vertical, with left accent bars). DMSB mnemonic. Click-to-place ordering exercise: 4 scrambled pills → 4 numbered slots. Click pill to select, click slot to place. Check button. Correct = green + bounce + Next. Wrong = flash incorrect, keep correct. Third wrong = auto-fill.

- [ ] **Step 2: Commit**

```bash
git add src/modules/long-division/screens/Screen3_FourSteps.tsx
git commit -m "feat: implement Screen 3 four-step cards and ordering exercise"
```

### Task 5.6: Screens 4-6 — Interactive Walkthroughs

**Files:**
- Create: `src/modules/long-division/screens/Screen4_Walkthrough84.tsx`
- Create: `src/modules/long-division/screens/Screen5_Remainder85.tsx`
- Create: `src/modules/long-division/screens/Screen6_BigNumber1248.tsx`

- [ ] **Step 1: Create shared walkthrough infrastructure**

All three screens share the same pattern:
1. "Next Step" button advances narration
2. Narration text appears with bold numbers
3. Input cell highlights → student types answer (even though narration told them)
4. Lesson Input Feedback: 1st wrong = "Look at the bold number above!", 2nd wrong = highlight answer + arrow, 3rd+ = same (never auto-fill)
5. Bring-down auto-animates with SVG arrow
6. Pacing: 800ms before Next re-enables

Build a shared `WalkthroughScreen` component that takes:
- `problem: { dividend: number, divisor: number }`
- `stepNarrations: Array<{ text: string; cells: ...; isAuto?: boolean }>`
- `conclusionText: string`
- `childName: string`

- [ ] **Step 2: Create Screen4 (84÷4 = 21)**

8 steps per spec. All narrated + interactive. Bring-down arrow on step 4.

- [ ] **Step 3: Create Screen5 (85÷4 = 21 R1)**

Same structure as Screen4 with remainder explanation at step 8. Quick check: "What is 13÷4?" → [3] [3 R1] [4] [3 R2].

- [ ] **Step 4: Create Screen6 (1248÷6 = 208)**

3 cycles. Cycle 1: full narrate+type. Cycle 2: zero-in-quotient teaching moment. Cycle 3: accelerated pacing (shorter narration, faster prompts).

- [ ] **Step 5: Commit**

```bash
git add src/modules/long-division/screens/Screen4_Walkthrough84.tsx src/modules/long-division/screens/Screen5_Remainder85.tsx src/modules/long-division/screens/Screen6_BigNumber1248.tsx
git commit -m "feat: implement walkthrough screens 4-6 with narration and interactive input"
```

### Task 5.7: Screen 7 — Summary + SkipGate

**Files:**
- Create: `src/modules/long-division/screens/Screen7_Summary.tsx`
- Create: `src/modules/long-division/screens/SkipGate.tsx`

- [ ] **Step 1: Create Screen7**

Cheat sheet card (max-width 520px): Vocabulary (colored terms), Four Steps (mini-cards), Remember section. "Let's Try It Together" button with pulse animation → `dispatch COMPLETE_LESSON`.

- [ ] **Step 2: Create SkipGate**

One problem (84÷3) in guided mode with NO hints available. All steps correct on first attempt → `dispatch SKIP_LESSON`. Any step wrong → message + return to Screen 1.

- [ ] **Step 3: Commit**

```bash
git add src/modules/long-division/screens/Screen7_Summary.tsx src/modules/long-division/screens/SkipGate.tsx
git commit -m "feat: implement Screen 7 summary and SkipGate challenge"
```

### Task 5.8: Wire All Screens into LessonPhase

- [ ] **Step 1: Update LessonPhase to import and render all 7 screens**

Switch on `lessonScreen` (1-7) to render the correct screen component.

- [ ] **Step 2: Update module index.tsx to route lesson/guided phases**

Replace placeholders with actual components.

- [ ] **Step 3: Full flow test**

```bash
npm run dev
```

Verify: can progress through all 7 lesson screens → 3 guided problems → practice mode. Progress persists on refresh.

- [ ] **Step 4: Run all tests**

```bash
npx vitest run && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire all lesson and guided screens into module routing"
```

---

## Chunk 6: App Shell, Sound, PWA & Deployment

Final chunk — wraps the module in the app shell and prepares for iPad deployment.

### Task 6.1: NamePicker Component

**Files:**
- Create: `src/components/NamePicker.tsx`
- Create: `src/components/NamePicker.module.css`

- [ ] **Step 1: Create NamePicker**

Three large buttons (160×120px, white, rounded, 3px border `#E5DDD0`). On tap: border → `#F59E0B`, background → `#FEF3C7`, scale(1.05) for 200ms. Saves selected child to `localStorage` key `goat-trainer-active-child`. Title: "GOAT Trainer" with goat icon. Subtitle: "Who's training today?"

- [ ] **Step 2: Commit**

```bash
git add src/components/NamePicker.tsx src/components/NamePicker.module.css
git commit -m "feat: implement NamePicker child selector"
```

### Task 6.2: Hub Component

**Files:**
- Create: `src/components/Hub.tsx`
- Create: `src/components/Hub.module.css`

- [ ] **Step 1: Create Hub**

Top bar: "Switch" button (left), "Hi, [name]!" greeting, Stats button (right). Module grid: cards (200×160px, white, rounded, shadow). Active modules show tier + stars from `loadProgress()`. Long Division available for jack/reese; locked for kate. Future modules show lock + "Coming Soon!".

- [ ] **Step 2: Commit**

```bash
git add src/components/Hub.tsx src/components/Hub.module.css
git commit -m "feat: implement Hub module grid with progress display"
```

### Task 6.3: StatsScreen Component

**Files:**
- Create: `src/components/StatsScreen.tsx`
- Create: `src/components/StatsScreen.module.css`

- [ ] **Step 1: Create StatsScreen**

Shows per-child stats loaded from `loadProgress()`: current tier, highest tier, problems done, accuracy, strongest/weakest step. Back button returns to Hub.

- [ ] **Step 2: Commit**

```bash
git add src/components/StatsScreen.tsx src/components/StatsScreen.module.css
git commit -m "feat: implement StatsScreen with per-child progress display"
```

### Task 6.4: App.tsx Router

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.module.css`

- [ ] **Step 1: Implement App routing**

```tsx
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

  if (screen === 'picker') {
    return <NamePicker profiles={CHILDREN} onPick={handlePickChild} />
  }

  if (screen === 'stats' && activeChild) {
    return <StatsScreen childId={activeChild.id} childName={activeChild.name} onBack={() => setScreen('hub')} />
  }

  if (screen === 'module' && activeChild && activeModule) {
    const mod = MODULES.find(m => m.id === activeModule)
    if (mod) {
      const ModComponent = mod.component
      return <ModComponent childName={activeChild.name} childId={activeChild.id} onExit={() => setScreen('hub')} />
    }
  }

  if (screen === 'hub' && activeChild) {
    return (
      <Hub
        child={activeChild}
        modules={MODULES}
        onOpenModule={handleOpenModule}
        onOpenStats={() => setScreen('stats')}
        onSwitchChild={() => { setActiveChild(null); setScreen('picker') }}
      />
    )
  }

  return <NamePicker profiles={CHILDREN} onPick={handlePickChild} />
}
```

- [ ] **Step 2: Create App.module.css**

```css
:root {
  --bg-main: #FDF6EC;
  --text-primary: #2D2A26;
  --text-secondary: #6B6560;
}

body {
  margin: 0;
  padding: 0;
  background: var(--bg-main);
  font-family: 'Nunito', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

#root {
  width: 100vw;
  height: 100dvh;
}
```

- [ ] **Step 3: Test full navigation flow**

```bash
npm run dev
```

Verify: picker → hub → module → practice → back to hub → stats → back. Switch child works.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/App.module.css
git commit -m "feat: implement App router with picker, hub, stats, and module screens"
```

### Task 6.5: Sound System

**Files:**
- Create: `src/hooks/useSound.ts`

- [ ] **Step 1: Implement useSound hook**

```typescript
import { useCallback, useRef, useState } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('goat-trainer-sound-enabled') === 'false'
  })

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }, [])

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (muted) return
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }, [muted, getCtx])

  const playCorrect = useCallback(() => {
    playTone(880, 0.1)
    setTimeout(() => playTone(1000, 0.1), 100)
  }, [playTone])

  const playWrong = useCallback(() => {
    playTone(220, 0.2)
  }, [playTone])

  const playBringDown = useCallback(() => {
    if (muted) return
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(1000, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  }, [muted, getCtx])

  const playTierAdvance = useCallback(() => {
    [880, 988, 1047, 1175].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15), i * 200)
    })
  }, [playTone])

  const playComplete = useCallback(() => {
    playTone(1000, 0.15)
    setTimeout(() => playTone(1200, 0.2), 200)
  }, [playTone])

  const playCookieLand = useCallback(() => {
    playTone(500, 0.1)
  }, [playTone])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m
      localStorage.setItem('goat-trainer-sound-enabled', String(!next))
      return next
    })
  }, [])

  return { playCorrect, playWrong, playBringDown, playTierAdvance, playComplete, playCookieLand, muted, toggleMute }
}
```

- [ ] **Step 2: Wire sound into PracticePhase and GuidedPhase**

Add `const sound = useSound()` to both components. Call `sound.playCorrect()` on correct answers, `sound.playWrong()` on wrong, etc.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSound.ts
git commit -m "feat: implement Web Audio sound system with mute toggle"
```

### Task 6.6: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Create: `public/service-worker.js`
- Create: `public/goat-icon-192.png` (placeholder)
- Create: `public/goat-icon-512.png` (placeholder)

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "GOAT Trainer",
  "short_name": "GOAT",
  "start_url": "/goat-trainer/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#FDF6EC",
  "theme_color": "#F59E0B",
  "icons": [
    { "src": "goat-icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "goat-icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Create service-worker.js**

```javascript
const CACHE_NAME = 'goat-trainer-v1'
const ASSETS = [
  '/goat-trainer/',
  '/goat-trainer/index.html',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      )
    )
  )
})
```

- [ ] **Step 3: Register service worker in main.tsx**

Add to `src/main.tsx`:

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/goat-trainer/service-worker.js')
  })
}
```

- [ ] **Step 4: Create placeholder icons**

Use a simple SVG-to-PNG approach or download a goat emoji icon. Create both 192×192 and 512×512 versions.

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/service-worker.js src/main.tsx public/goat-icon-192.png public/goat-icon-512.png
git commit -m "feat: add PWA manifest, service worker, and icons"
```

### Task 6.7: GitHub Pages Deployment

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install gh-pages**

```bash
npm install -D gh-pages
```

- [ ] **Step 2: Add deploy script to package.json**

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

- [ ] **Step 3: Create GitHub repository**

```bash
cd "C:/Users/jonra/OneDrive/Desktop/claude sandbox/GOAT trainer"
gh repo create goat-trainer --public --source=. --push
```

- [ ] **Step 4: Build and deploy**

```bash
npm run deploy
```

Expected: `dist/` pushed to `gh-pages` branch. Site live at `https://[username].github.io/goat-trainer/`.

- [ ] **Step 5: Enable GitHub Pages in repo settings**

Via CLI or browser: set Pages source to `gh-pages` branch, root directory.

- [ ] **Step 6: Test on iPad**

1. Open URL on iPad Safari
2. Verify landscape layout renders correctly
3. Share → "Add to Home Screen"
4. Launch from home screen — verify standalone mode (no Safari chrome)
5. Test offline after first load

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: configure GitHub Pages deployment with gh-pages"
```

### Task 6.8: Final Integration Test

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: Clean build with no warnings.

- [ ] **Step 4: Full flow verification**

Test complete user journey:
1. Name picker → select Jack
2. Hub → tap Long Division
3. Lesson screens 1-7 (all interactions work)
4. Guided examples 1-3 (hints, redemption steps work)
5. Practice mode (tier advancement, demotion, mini-drills)
6. Back to hub → Stats screen shows progress
7. Switch child → select Reese → fresh progress
8. Refresh page → progress persisted

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: GOAT Trainer v1 complete — long division module with lesson, guided, and practice"
```

---

## Review Fixes — Additional Items from Plan Review

These items were identified during plan review and must be addressed during implementation.

### Fix 1: Responsive Cell Sizing (Chunk 2)

The `Bracket.tsx` and `DivisionHouse.tsx` hardcode `cellWidth = 48` and `cellHeight = 56`. During Task 2.5 implementation, replace hardcoded values with a `useCellSize()` hook or `useRef` + `getComputedStyle` approach that reads from CSS custom properties, respecting the `@media (max-width: 900px)` breakpoint.

### Fix 2: Remove Dead Code (Chunk 2)

- `StepPanel.tsx`: Remove `emoji` field from the `STEPS` constant — it's never rendered.
- `Cell.module.css`: Remove `.multiDigitInput` class — spanning is handled via inline `gridStyle` in Cell.tsx.

### Fix 3: Step Accuracy Updates (Chunk 3)

The `STEP_CORRECT` action in the reducer must also update `stepAccuracy`. When a step is answered correctly on the first attempt (`currentAttempts === 0`), increment `stepAccuracy[action].correct`. Always increment `stepAccuracy[action].total` on `STEP_CORRECT`. Add this logic during Task 3.2 implementation.

### Fix 4: NavBar Component (Chunk 6)

Create `src/components/shared/NavBar.tsx` during Task 6.4 (or as a new Task 6.1b). Props: `title: string`, `onBack?: () => void`, `showSoundToggle?: boolean`, `muted?: boolean`, `onToggleMute?: () => void`. Renders top bar with back button, centered title, and optional sound toggle. Use in PracticePhase, GuidedPhase, LessonPhase, and StatsScreen to avoid reimplementing the top bar pattern.

### Fix 5: Landscape Rotation Message (Chunk 6)

Add a CSS-only portrait overlay during Task 6.4. In `App.module.css`:

```css
.portraitOverlay {
  display: none;
  position: fixed;
  inset: 0;
  background: #FDF6EC;
  z-index: 9999;
  align-items: center;
  justify-content: center;
  font-family: 'Quicksand', sans-serif;
  font-size: 24px;
  color: #2D2A26;
  text-align: center;
  padding: 40px;
}

@media (orientation: portrait) {
  .portraitOverlay {
    display: flex;
  }
}
```

Render `<div className={styles.portraitOverlay}>Please rotate your iPad to landscape mode 🐐</div>` in App.tsx.

### Fix 6: Safe Area Insets (Chunk 3/6)

Add `padding-bottom: env(safe-area-inset-bottom)` to the NumberPad container CSS. This prevents the home indicator on newer iPads from overlapping the bottom row of buttons.

### Fix 7: Sound in Lesson Screens (Chunk 6)

Task 6.5 Step 2 should also wire sound into lesson screens: `playCookieLand()` in Screen 1 cookie animation, `playCorrect()`/`playWrong()` in Screens 4-6 walkthrough inputs, and Screen 3 ordering exercise feedback.

### Fix 8: Tier 5 Completion Milestone (Chunk 4)

After 5 problems at Tier 5, show a gold banner: "You're a long division pro, [name]! You've mastered all 5 levels." Add a `showTier5Celebration: boolean` field to `LDState` and handle in `PROBLEM_COMPLETE` when `tier === 5 && totalAttempted at Tier 5 >= 5`.

### Fix 9: Icon Generation (Chunk 6)

For Task 6.6 Step 4, use a simple approach: create a minimal goat SVG inline and use `<canvas>` to export PNGs, or generate simple colored squares with "🐐" text as placeholders. The icons can be replaced with proper artwork later. Alternatively, use an online favicon generator to create the two PNGs from an emoji.
