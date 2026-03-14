# GOAT Trainer — Design Specification

## Overview

GOAT Trainer is a progressive learning platform for the Ramsey kids (Jack 9, Reese 7, Kate 4), deployed as a PWA on their iPads. The first module is Long Division. The platform is designed to host future modules across subjects (math, reading comprehension, etc.) at different grade levels, with per-child module availability.

## Table of Contents

1. [Platform Architecture](#1-platform-architecture)
2. [PWA & Deployment](#2-pwa--deployment)
3. [Hub & Navigation](#3-hub--navigation)
4. [Module: Long Division — The Division House](#4-module-long-division)
5. [Visual Design System](#5-visual-design-system)
6. [State Architecture](#6-state-architecture)
7. [Sound System](#7-sound-system)
8. [Resolved Decisions](#8-resolved-decisions)
9. [Implementation Notes](#9-implementation-notes)

---

## 1. Platform Architecture

### Tech Stack

- **Framework:** Vite + React 18 + TypeScript
- **Styling:** CSS Modules or inline styles (no external CSS framework)
- **Fonts:** Google Fonts — Quicksand (headings), Nunito (body), JetBrains Mono (numbers)
- **Audio:** Web Audio API (no external audio files)
- **Persistence:** `localStorage` with per-child keys
- **Deployment:** GitHub Pages (static, no backend)
- **Target:** iPad Safari, landscape orientation locked

### Project Structure

```
goat-trainer/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Offline support
│   ├── goat-icon-192.png      # PWA icon
│   └── goat-icon-512.png      # PWA icon
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Router: name picker → hub → module
│   ├── components/
│   │   ├── NamePicker.tsx     # Jack / Reese / Kate selection
│   │   ├── Hub.tsx            # Per-child module grid
│   │   ├── StatsScreen.tsx    # Per-child progress stats
│   │   └── shared/           # Reusable across modules
│   │       ├── NavBar.tsx
│   │       ├── NumberPad.tsx
│   │       └── SoundManager.tsx
│   ├── modules/
│   │   └── long-division/
│   │       ├── index.tsx           # Module entry
│   │       ├── engine/
│   │       │   ├── computeDivisionHouse.ts   # Core algorithm
│   │       │   ├── generateProblem.ts        # Tier-based generator
│   │       │   ├── feedbackTemplates.ts      # Hardcoded error feedback
│   │       │   └── types.ts                  # TypeScript interfaces
│   │       ├── components/
│   │       │   ├── DivisionHouse.tsx         # CSS Grid renderer
│   │       │   ├── Cell.tsx                  # Single digit cell
│   │       │   ├── Bracket.tsx               # Division house bracket
│   │       │   ├── HorizontalRule.tsx        # Work area lines
│   │       │   ├── StepPanel.tsx             # DMSB step indicator
│   │       │   ├── FeedbackArea.tsx          # Prompts + hints
│   │       │   ├── TierDisplay.tsx           # Tier + streak dots
│   │       │   ├── HintButton.tsx
│   │       │   └── CookieAnimation.tsx       # Screen 1 SVG animation
│   │       ├── screens/
│   │       │   ├── LessonPhase.tsx           # Screens 1-7 container
│   │       │   ├── Screen1_WhatIsDivision.tsx
│   │       │   ├── Screen2_DivisionHouse.tsx
│   │       │   ├── Screen3_FourSteps.tsx
│   │       │   ├── Screen4_Walkthrough84.tsx
│   │       │   ├── Screen5_Remainder85.tsx
│   │       │   ├── Screen6_BigNumber1248.tsx
│   │       │   ├── Screen7_Summary.tsx
│   │       │   ├── GuidedPhase.tsx
│   │       │   ├── PracticePhase.tsx
│   │       │   └── SkipGate.tsx              # "Prove it" test
│   │       ├── state/
│   │       │   ├── reducer.ts                # useReducer logic
│   │       │   └── persistence.ts            # localStorage read/write
│   │       └── miniDrills/
│   │           └── MultiplicationDrill.tsx    # Flash cards intervention
│   ├── hooks/
│   │   ├── useSound.ts
│   │   └── useLocalStorage.ts
│   └── types/
│       └── module.ts          # Shared module interface
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Module Interface

Every module (long division, future reading comprehension, etc.) implements this interface:

```typescript
interface Module {
  id: string;                    // "long-division"
  title: string;                 // "Long Division"
  description: string;           // "Learn to divide big numbers step by step"
  icon: string;                  // Emoji or SVG reference
  gradeRange: [number, number];  // [3, 5] = grades 3-5
  availableFor: string[];        // ["jack", "reese"] — child IDs
  component: React.ComponentType<ModuleProps>;
}

interface ModuleProps {
  childName: string;             // "Jack"
  childId: string;               // "jack"
  onExit: () => void;            // Return to hub
}
```

New modules are added by creating a folder under `src/modules/`, implementing the interface, and registering in a central module registry. No changes needed to the hub, name picker, or shell.

---

## 2. PWA & Deployment

### PWA Manifest

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

Key: `"orientation": "landscape"` locks the app to landscape when launched from the home screen. `"display": "standalone"` removes the Safari chrome (URL bar, tabs).

### Service Worker

A cache-first service worker that caches all static assets (HTML, JS, CSS, fonts) on first load. The app works fully offline after the first visit. The only external dependency is Google Fonts, which are cached on first load.

**Cache versioning:** The service worker uses a versioned cache name (e.g., `goat-trainer-v1`). On update, increment the version — the new service worker deletes old caches and re-caches fresh assets. This ensures kids get updates after you push a fix.

### GitHub Pages Deployment

- Repository: `goat-trainer` (or similar)
- Vite config: `base: '/goat-trainer/'`
- Deploy via `gh-pages` npm package: `npm run deploy` pushes `dist/` to the `gh-pages` branch
- URL: `https://[username].github.io/goat-trainer/`
- Setup: open URL on each kid's iPad → Share → "Add to Home Screen" → done

### iPad-Specific Configuration

- Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
- Apple-specific meta tags:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="goat-icon-192.png">
  ```
- Use `100dvh` for viewport height (not `100vh`) to handle Safari's dynamic toolbar
- Safe area insets: `env(safe-area-inset-bottom)` for bottom-positioned elements

---

## 3. Hub & Navigation

### Name Picker (Launch Screen)

Displayed on first launch or when no child is selected. Three large buttons, each with the child's name:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              🐐  GOAT Trainer                   │
│                                                 │
│     ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│     │         │  │         │  │         │     │
│     │  Jack   │  │  Reese  │  │  Kate   │     │
│     │         │  │         │  │         │     │
│     └─────────┘  └─────────┘  └─────────┘     │
│                                                 │
│              Who's training today?              │
│                                                 │
└─────────────────────────────────────────────────┘
```

Each button: 160×120px, border-radius 16px, background white, border 3px solid #E5DDD0. On tap: border color → #F59E0B, background → #FEF3C7, scale(1.05) for 200ms, then transition to hub.

The selected child is saved to `localStorage` key `goat-trainer-active-child`. On subsequent launches, skip the picker and go directly to that child's hub. A "Switch User" button (small, top-left corner of hub) returns to the picker.

### Hub Screen (Per-Child Module Grid)

After selecting a child, the hub shows their available modules:

```
┌─────────────────────────────────────────────────┐
│  ← Switch    Hi, Jack! 🐐          [Stats 📊]  │
│─────────────────────────────────────────────────│
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  ➗           │  │  🔒           │            │
│  │  Long        │  │  Coming      │            │
│  │  Division    │  │  Soon!       │            │
│  │              │  │              │            │
│  │  Tier 3 ⭐⭐⭐ │  │              │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

Module cards: 200×160px, border-radius 12px, white background, subtle shadow. Active modules show the child's current progress (tier, stars). Locked/future modules show a lock icon and "Coming Soon!" in gray.

For Kate (age 4): Long Division shows as locked. The hub shows placeholder cards for future age-appropriate modules.

The Stats button (top-right, 📊 icon) opens the stats screen for the current child.

### Stats Screen

Accessible from the hub. Shows the current child's progress:

```
┌─────────────────────────────────────────────────┐
│  ← Back          Jack's Stats                   │
│─────────────────────────────────────────────────│
│                                                 │
│  Long Division                                  │
│  ─────────────────────────────────              │
│  Current Tier:   Tier 3 ⭐⭐⭐                    │
│  Highest Tier:   Tier 3                         │
│  Problems Done:  47                             │
│  Accuracy:       82%                            │
│  Strongest Step: Subtract (94%)                 │
│  Weakest Step:   Multiply (71%)                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

Data sourced from `localStorage`. Accuracy = (problems solved without any hints) / (total problems attempted). Step-level accuracy tracked per step type across all problems.

---

## 4. Module: Long Division

### 4A. The Division House — Visual Layout Specification

This is the core visual component. It renders long division exactly as written on paper.

#### Anatomy

```
        2  4          ← quotient row (builds left to right)
      ┌─────┐
  4   │ 9  6          ← dividend row
      - 8             ← first multiply result
      ───
        1  6           ← first subtract result + bring down
      - 1  6           ← second multiply result
      ──────
           0           ← final subtract result (or remainder)
```

#### Grid Coordinate System

Zero-indexed (row, col). Column 0 = divisor. Column 1 = bracket gutter (visual only). Columns 2+ = dividend/work digits.

**Fixed rows:**
- Row 0: Quotient
- Row 1: Divisor + bracket + dividend

**Work area rows (starting at row 2):** Each cycle = 3 rows:
- Cycle row 0: Multiply result (with minus sign)
- Cycle row 1: Horizontal rule (visual only)
- Cycle row 2: Subtract result (+ brought-down digit if applicable)

Cycle N occupies rows: `2 + (N * 3)`, `3 + (N * 3)`, `4 + (N * 3)`.

**Grid dimensions:**
- Columns: `2 + D` where D = number of dividend digits
- Rows: `2 + (C * 3)` where C = number of division cycles

#### Cell Coordinate Algorithm: `computeDivisionHouse(dividend, divisor)`

**Inputs:**
- `dividend`: array of digit characters, e.g., [9, 6] for 96
- `divisor`: integer, e.g., 4
- `D`: length of dividend array

**Fixed cells:**

| Cell | Row | Col | Type |
|------|-----|-----|------|
| Divisor digit | 1 | 0 | "divisor" |
| Dividend digit i | 1 | 2 + i | "dividend" |

**Algorithm:**

```
currentNumber = 0
cycle = 0

// Determine how many leading digits needed for first divide
currentNumber = dividend[0]
digitsUsed = 1
while (currentNumber < divisor AND digitsUsed < D):
    digitsUsed += 1
    currentNumber = currentNumber * 10 + dividend[digitsUsed - 1]

quotientCol = 2 + digitsUsed - 1
nextDigitIndex = digitsUsed

LOOP:
    // DIVIDE
    quotientDigit = floor(currentNumber / divisor)
    Place: row=0, col=quotientCol, digit=quotientDigit, type="quotient"

    // MULTIPLY
    multiplyResult = quotientDigit * divisor
    multiplyStr = String(multiplyResult)
    for i in 0..multiplyStr.length-1:
        Place: row=2+(cycle*3), col=quotientCol-multiplyStr.length+1+i,
               digit=multiplyStr[i], type="multiply"
    // Minus sign annotation on leftmost multiply cell

    // HORIZONTAL RULE
    Place rule: row=3+(cycle*3),
                fromCol=quotientCol-multiplyStr.length+1,
                toCol=quotientCol

    // SUBTRACT
    subtractResult = currentNumber - multiplyResult
    subtractStr = String(subtractResult)
    for i in 0..subtractStr.length-1:
        Place: row=4+(cycle*3), col=quotientCol-subtractStr.length+1+i,
               digit=subtractStr[i], type="subtract"

    // BRING DOWN
    if nextDigitIndex < D:
        broughtDigit = dividend[nextDigitIndex]
        bringDownCol = 2 + nextDigitIndex
        Place: row=4+(cycle*3), col=bringDownCol,
               digit=broughtDigit, type="bringdown"

        currentNumber = subtractResult * 10 + broughtDigit
        quotientCol = bringDownCol
        nextDigitIndex += 1
        cycle += 1
        GOTO LOOP
    else:
        DONE — subtractResult is remainder
```

**Return value:**

```typescript
interface ComputedHouse {
  cells: CellData[];
  rules: RuleData[];
  totalRows: number;
  totalCols: number;
  quotient: number;
  remainder: number;
  steps: StepData[];  // Ordered student-input steps for guided/practice
}

interface CellData {
  row: number;
  col: number;
  digit: string;
  type: "quotient" | "multiply" | "subtract" | "bringdown" | "dividend" | "divisor";
  stepIndex: number;
  cycle: number;               // which division cycle (0-indexed) this cell belongs to
  showMinus: boolean;          // true only for leftmost multiply cell per cycle
}

interface RuleData {
  row: number;
  fromCol: number;
  toCol: number;
}

interface StepData {
  stepIndex: number;
  action: "divide" | "multiply" | "subtract" | "bringdown";
  cells: { row: number; col: number; digit: string }[];
  correctAnswer: string;       // the expected answer as a string ("6", "12", "0")
  promptNumber?: number;       // for divide: the number being divided into
  promptText?: string;         // display text like "2 × 6"
  auto?: boolean;              // true for bringdown (no student input)
  type: string;                // cell color type
}

interface Problem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

interface InProgressState {
  dividend: number;
  divisor: number;
  currentStepIndex: number;    // which step the child was on
  tier: number;
  streak: number;
  problemClean: boolean;
}
```

#### Verified Worked Examples

**1248 ÷ 6 = 208 (3 cycles, zero in quotient):**

```
Fixed: (1,0)="6" divisor, (1,2)="1", (1,3)="2", (1,4)="4", (1,5)="8" dividend

Cycle 0 (6>1, uses 2 digits, currentNumber=12, quotientCol=3):
  (0,3)="2" quotient    (2,2)="1" (2,3)="2" multiply
  Rule row=3 cols 2-3    (4,3)="0" subtract    (4,4)="4" bringdown

Cycle 1 (currentNumber=4, quotientCol=4):
  (0,4)="0" quotient    (5,4)="0" multiply
  Rule row=6 col 4       (7,4)="4" subtract    (7,5)="8" bringdown

Cycle 2 (currentNumber=48, quotientCol=5):
  (0,5)="8" quotient    (8,4)="4" (8,5)="8" multiply
  Rule row=9 cols 4-5    (10,5)="0" subtract

Grid: 6 cols × 11 rows. Quotient=208, Remainder=0.
```

**85 ÷ 4 = 21 R1 (2 cycles, remainder):**

```
Fixed: (1,0)="4" divisor, (1,2)="8", (1,3)="5" dividend

Cycle 0 (8>=4, digitsUsed=1, quotientCol=2):
  (0,2)="2" quotient    (2,2)="8" multiply
  Rule row=3 col 2       (4,2)="0" subtract    (4,3)="5" bringdown

Cycle 1 (currentNumber=5, quotientCol=3):
  (0,3)="1" quotient    (5,3)="4" multiply
  Rule row=6 col 3       (7,3)="1" subtract

Grid: 4 cols × 8 rows. Quotient=21, Remainder=1.
```

#### CSS Grid Implementation

```css
.division-house {
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--cell-width));
  grid-template-rows: repeat(var(--rows), var(--cell-height));
  position: relative;
  gap: 0;
}

/* iPad landscape (primary) */
.division-house {
  --cell-width: 48px;
  --cell-height: 56px;
  --digit-font-size: 28px;
}

/* Smaller iPads / split view */
@media (max-width: 900px) {
  .division-house {
    --cell-width: 44px;
    --cell-height: 48px;
    --digit-font-size: 24px;
  }
}
```

Minimum cell size: **44×44pt** (Apple HIG touch target minimum for children).

#### Bracket Rendering

Not a grid cell. Overlay elements:
- **Vertical bar:** 3px solid `#2D2A26`, right edge of col 1, from top of row 1 to bottom of the last *visible* row. In static mode (lesson Screen 2), drawn at full height. In interactive mode (guided/practice), the bracket starts covering only the dividend row and grows as work area rows are revealed.
- **Horizontal bar:** 3px solid `#2D2A26`, top of row 1, from left of col 2 to right of last col
- **Corner curve:** 6px border-radius at top-left junction

#### Minus Sign Rendering

Absolutely positioned `<span>` inside leftmost multiply cell, offset `left: -20px`. Same font and color as the multiply digit (#22C55E).

#### Horizontal Rule Rendering

`<div>` spanning the rule's columns:
- `grid-row: rule.row + 1` (CSS 1-indexed)
- `grid-column: rule.fromCol + 1 / span (rule.toCol - rule.fromCol + 1)`
- `border-bottom: 2px solid #2D2A26`
- `height: 100%; align-self: end`

#### Cell Visual States

| State | CSS | Description |
|-------|-----|-------------|
| hidden | `opacity: 0; pointer-events: none` | Future step, invisible |
| visible | `opacity: 1` | Completed step, colored by type |
| active | `opacity: 1; outline: 2px dashed [step-color]; animation: pulse 1.5s infinite` | Next cell to fill |
| input | Contains `<input>` styled to match cell. `border: 2px dashed [step-color]; background: #FFF8F0` | Student types here |
| correct | `animation: correctFlash 0.4s` — green flash, then → visible | Just answered correctly |
| wrong | `animation: wrongFlash 0.4s` — red flash + shake, then → input | Wrong answer |
| dimmed | `opacity: 0.4` | Old cycle, faded back |

#### Multi-Digit Input

For multiply/subtract answers that are 2 digits (e.g., "12"):
- Single `<input>` field spans 2 columns: `grid-column: [col] / span 2`
- Student types the full number
- Validation compares as integers (leading zeros accepted: "08" matches 8)
- After correct submission, input replaced with individual digit cells

#### Animation Keyframes

```css
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

@keyframes bringDown {
  0% { opacity: 0; transform: translateY(calc(-1 * var(--slide-distance))); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes completionBounce {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}
```

#### Edge Cases

1. **Zero in quotient:** Valid digit, must be placed. Hint: "6 is bigger than 4, so it doesn't fit at all. When that happens, we write 0."
2. **Single-cycle problems (e.g., 63÷7):** Only one cycle, no bring-down. Algorithm handles naturally.
3. **Divisor > first digit (e.g., 1248÷6):** Algorithm's while-loop consumes digits until `currentNumber >= divisor`.
4. **Remainder display:** "R[n]" label below last subtract cell, styled `color: #F97316; font-size: 18px; font-weight: 700`.

---

### 4B. Phase 1: Lesson Screens (1-7)

#### Navigation

- Bottom of screen: "Back" and "Next" buttons
- Top: progress dots (7 for lessons, 3 for guided, "Practice" pill)
- Students can go backward but not skip ahead on first pass. The Next button is disabled if `lessonScreen + 1 > lessonMaxScreenReached + 1` (enforced by checking state before enabling the button).
- Each screen has a completion trigger before Next enables
- **Pacing:** When "Next Step" is tapped, the digit animates in quickly (~300ms), then a brief pause (~800ms) before the button re-enables. This prevents spam-clicking through without looking.

#### Lesson Input Model (Screens 4-6)

Screens 4-6 are narrated walkthroughs, but the student still **types each answer themselves** — even though the narration just told them what it is. This builds muscle memory of *where digits go* in the division house.

**Flow per step:**
1. Student taps "Next Step"
2. Narration appears explaining the step (e.g., "Look at the first digit: **8**. How many times does **4** go into **8**? ... **2** times.")
3. The target cell(s) become input fields — student must type the answer
4. On correct: green flash, cell fills, proceed to next step
5. On wrong: feedback based on attempt count (see below)

**Lesson Input Feedback (not the same as Guided/Practice hints):**

| Attempt | Response |
|---------|----------|
| 1st wrong | "Look at the bold number in the explanation above!" — nudge back to narration text. Narration text pulses briefly to draw attention. |
| 2nd wrong | Direct help: highlight the exact number in the narration with a glowing ring + arrow pointing to the input field. Text: "Type **[answer]** into the box." |
| 3rd+ wrong | Same as 2nd — they must still type it themselves. Input field is never auto-filled during lessons. |

This is deliberately gentler than Guided/Practice feedback — the goal is placing digits, not testing knowledge. But the student always has to type the correct answer to proceed.

#### Screen 1: "What is Division?"

**Content:**

> **Splitting Things Up**
>
> Imagine you have 12 cookies and you want to split them into 3 equal groups. How many cookies end up in each group?

**Cookie Distribution Animation:**

Rendered as an SVG with `viewBox="0 0 560 340"` (scales to fit container, no hardcoded pixel positions). 12 cookie circles (36px diameter, fill `#D4890E`, stroke `#A0680A` 2px, two chocolate chip dots inside). 3 group boxes (140×100px, rounded, fill `#FFF8F0`, stroke `#D4C4A8`), labeled "Group 1", "Group 2", "Group 3".

"Watch" button starts animation. Cookies move one at a time (400ms delay between each, 500ms transition per move) into boxes in round-robin order, arranging in a 2×2 grid inside each box. After all 12 land, a bold "4" counter appears in each box (fade in 300ms).

**Interaction (appears after counters):**

"Each group gets ___ cookies." Input field: 48×40px, JetBrains Mono 24px, numeric only, maxLength=1.

- Correct ("4"): green border, feedback text: "That's right! 12 ÷ 3 = 4. Division tells us how many each group gets when we split equally." Next enables.
- Wrong: orange border flash, hint "Count the cookies in each group," counters pulse, input clears

"Replay" link appears after first play.

**"Already know long division? Prove it!" link:**

Subtle link below main content. Tapping it presents one problem (e.g., 84÷3) in guided mode with no hints available. Solve every step correctly on first attempt → skip to Practice at Tier 2. Any step wrong → "Let's walk through the lesson together — it'll be quick!" returns to Screen 1.

#### Screen 2: "Meet the Division House"

**Cookie-to-Notation Bridge (NEW — plays before labels):**

Before the labeled division house appears, a bridge animation connects Screen 1's cookies to the written notation:

1. The three boxes with 4 cookies each fade in at the top (2s hold for recognition)
2. The number "3" (friend count) lifts from the boxes label and slides to the divisor position (left of bracket) — 600ms ease-in-out
3. The number "12" (total cookies) lifts from above the cookie grid and slides to the dividend position (inside the bracket) — 600ms
4. The number "4" (cookies per box) lifts from inside a box counter and slides to the quotient position (above the bracket) — 600ms
5. The division house bracket draws itself around them — stroke animation, 500ms
6. Cookies and boxes fade out, leaving just the division house — 400ms
7. Brief pause (800ms), then callout labels begin appearing

This takes ~5 seconds total and makes the connection visceral.

**Division House (12÷3=4, static, all cells visible):**

```
Cells:
  (1,0)="3" divisor    (1,2)="1" (1,3)="2" dividend
  (0,3)="4" quotient
  (2,2)="1" (2,3)="2" multiply    Rule row=3 cols 2-3
  (4,3)="0" subtract
```

**Animated Callout Labels (appear sequentially after bridge):**

1. **Quotient** (t=0, blue): "**Quotient** — the answer" → targets (0,3)
2. **Divisor** (t=1200ms, green): "**Divisor** — how many groups" → targets (1,0)
3. **Dividend** (t=2400ms, orange): "**Dividend** — the number being split up" → targets (1,2)-(1,3)

Labels: colored background, 1px border, 6px radius, connector line to target. Fade in 400ms.

**Interaction (t=3600ms):**

> **Quick check:** In 20 ÷ 5 = 4, which number is the dividend?

Three buttons: [5] [20] [4]. Correct=20. Wrong answers get specific feedback explaining which part they picked. Correct answer → relevant label on house pulses. Next enables.

#### Screen 3: "The Four Steps (they repeat!)"

**Content:**

> **The Four Steps (they repeat!)**
>
> Long division follows the same four steps over and over until you're done.

**Four step cards** (vertical stack, colored left accent bars):

1. 🔵 DIVIDE — How many times does the divisor fit?
2. 🟢 MULTIPLY — Multiply your answer by the divisor
3. 🟠 SUBTRACT — Subtract to find what's left over
4. 🟣 BRING DOWN — Bring down the next digit

**Mnemonic:** "**D**ad, **M**om, **S**ister, **B**rother" (letters colored to match steps)

**Click-to-Place Ordering Exercise:**

Four pills in scrambled order: [Subtract] [Bring Down] [Divide] [Multiply]. Four numbered slots. Click a pill to select it (highlight ring), click a slot to place it. "Check" button after all placed.

- Correct order: green flash, bounce, Next enables
- Wrong: incorrect slots flash orange, correct stay green, feedback with mnemonic reminder
- Third wrong attempt: auto-fills with staggered animation, Next enables

No drag-and-drop. Click-to-place only.

#### Screen 4: "First Walkthrough — 84 ÷ 4"

**Layout:** StepPanel (left), DivisionHouse (center), NarrationArea (below). Student advances with "Next Step" button.

**Problem:** 84 ÷ 4 = 21, no remainder. Grid: 4 cols × 8 rows.

**Step sequence (8 steps, narrated + interactive — student types each answer):**

| Step | Type | Narration | Student Input | Cell(s) |
|------|------|-----------|---------------|---------|
| 1 | DIVIDE | "Look at the first digit: **8**. How many times does **4** go into **8**? ... **2** times." | Type **2** | (0,2) |
| 2 | MULTIPLY | "Multiply: **2 × 4 = 8**. Write it below." | Type **8** | (2,2) + minus sign |
| 3 | SUBTRACT | "Subtract: **8 − 8 = 0**." | Type **0** | (4,2), rule at row 3 |
| 4 | BRING DOWN | "Bring down the next digit: **4**." | *Auto-animates* | "4" slides from (1,3) to (4,3) |
| 5 | DIVIDE | "Start the cycle again! **4** goes into **4** exactly **1** time." | Type **1** | (0,3) |
| 6 | MULTIPLY | "Multiply: **1 × 4 = 4**." | Type **4** | (5,3) |
| 7 | SUBTRACT | "Subtract: **4 − 4 = 0**. Nothing left over!" | Type **0** | (7,3), rule at row 6 |
| 8 | CONCLUSION | "**84 ÷ 4 = 21** with no remainder. We went through the four steps twice!" | — | Quotient bounce, equation display |

**Per-step flow:** Student taps "Next Step" → narration appears → input cell highlights → student types answer → correct → next step. Wrong answers use the Lesson Input Feedback system (see above). Bring-down steps auto-animate (no input).

**Bring-down arrow:** SVG curved path from bottom of (1,3) to top of (4,3), stroke `#A855F7`, animated draw effect (stroke-dashoffset), arrowhead at end. Fades out after digit lands.

#### Screen 5: "What's a Remainder? — 85 ÷ 4"

Same layout as Screen 4 (narrated + interactive). Problem: 85 ÷ 4 = 21 R1.

**Steps 1-7:** Same narrate-then-type pattern as Screen 4, but with "5" instead of "4" as the second dividend digit. Step 7 subtract: student types "1" instead of "0".

**Step 8 — Remainder Explanation (multi-paragraph narration):**

> "We have **1** left, but there are no more digits to bring down."
> "Can 4 go into 1? No — 1 is less than 4."
> "This leftover is called the **remainder**. We write it as **R1**."
> "**85 ÷ 4 = 21 R1**"
> "If you had 85 stickers and 4 friends, each gets 21, and you have 1 left over."

"R1" label appears below (7,3). Final equation in large text.

**Interaction:**

> **Quick check:** What is 13 ÷ 4?

Four buttons: [3] [3 R1] [4] [3 R2]. Correct = "3 R1". Specific feedback for each wrong answer. Next enables on correct.

#### Screen 6: "Bigger Numbers — 1,248 ÷ 6"

Same layout (narrated + interactive). Problem: 1248 ÷ 6 = 208. Grid: 6 cols × 11 rows.

**Cycle 1 — Narrated + type (4 steps, student types each):**

All steps follow the narrate-then-type pattern. Includes teaching callout: "Because 6 didn't fit into the first digit, our answer starts in the second position." Bring-down auto-animates.

**Cycle 2 — Narrated + type, with zero-in-quotient teaching moment:**

Same narrate-then-type pattern. The divide step is the key teaching moment: "How many times does 6 go into 4?" — student inputs answer.

Teaching callout (appears after correct answer or after 2 wrong attempts): "6 is bigger than 4, so it goes in **0** times. We still write the 0! Don't skip it — every position needs a digit."

**Cycle 3 — Accelerated narration + final input:**

Narration condenses: "Last cycle! 6 into 48..." Student types 8 (quotient). Then: "8 × 6 = ..." Student types 48 (multiply). Then: "48 − 48 = ..." Student types 0 (subtract). Pacing is faster — shorter narration, immediate input prompts, building confidence for Guided mode.

**Conclusion:** "**1,248 ÷ 6 = 208**. We went through the four steps three times. Even with bigger numbers, it's the same pattern every time." Quotient bounce.

#### Screen 7: "Lesson Summary"

**Cheat Sheet Card** (centered, max-width 520px):

Sections:
1. **VOCABULARY** — Dividend, Divisor, Quotient, Remainder (colored terms with definitions)
2. **THE FOUR STEPS** — Four mini-cards with colored left bars + looping arrow icon
3. **REMEMBER** — Zero in quotient rule, remainder definition, DMSB mnemonic

**Transition prompt:** "You've learned the four steps. Now let's do some problems together — I'll help you through them."

"Let's Try It Together" button with pulse animation. Crossfade to Phase 2 (Guided Examples).

---

### 4C. Phase 2: Guided Examples

#### How Guided Mode Works

Division house drawn with problem set up. App highlights one cell at a time. StepPanel highlights current step. Student inputs answer via number pad.

**Input flow per cycle:**
1. DIVIDE — student types quotient digit
2. MULTIPLY — student types product
3. SUBTRACT — student types difference
4. BRING DOWN — auto-animates (no input)

#### Three-Tier Feedback System

**Tier 1 (first wrong):** Specific nudge
- Divide: "Not quite. Think about the [divisor] times table. [divisor] × ___ gets close to [number] without going over."
- Multiply: "Let's double-check: [a] × [b] = ?"
- Subtract: "Try again: [top] − [bottom] = ?"

**Tier 2 (second wrong):** Direct help
- Divide: lists multiples up to the answer
- Multiply: shows the fact directly
- Subtract: shows subtraction with explanation

**Tier 3 (third wrong):** Give answer + redemption step
- Shows answer with explanation
- Student types correct answer to confirm
- Then a redemption prompt appears: a similar but easier problem of the same step type, with brief context explaining why this sub-skill matters in division
- Example: "That multiply step tells us how many we've already handed out. Let's try another: What is 3 × 6?"
- If redemption correct → continue. If wrong → show answer, move on (don't trap in loop)

#### Guided Example 1: 72 ÷ 3 = 24

Clean division, no remainder, two cycles. Confidence builder.

Grid: 4 cols × 8 rows.

| # | Step | Cell(s) | Prompt | Correct |
|---|------|---------|--------|---------|
| 1 | Divide | (0,2) | "How many times does 3 go into 7?" | 2 |
| 2 | Multiply | (2,2) | "What is 2 × 3?" | 6 |
| 3 | Subtract | (4,2) | "What is 7 − 6?" | 1 |
| — | Bring Down | (4,3) auto | | |
| 4 | Divide | (0,3) | "How many times does 3 go into 12?" | 4 |
| 5 | Multiply | (5,2)-(5,3) span 2 | "What is 4 × 3?" | 12 |
| 6 | Subtract | (7,3) | "What is 12 − 12?" | 0 |

Rules: row 3 col 2, row 6 cols 2-3.

Completion: "Great work, [name]! 72 ÷ 3 = 24. You did every step yourself!"

#### Guided Example 2: 95 ÷ 4 = 23 R3

Introduces remainder in guided context.

Grid: 4 cols × 8 rows.

| # | Step | Cell(s) | Prompt | Correct |
|---|------|---------|--------|---------|
| 1 | Divide | (0,2) | "How many times does 4 go into 9?" | 2 |
| 2 | Multiply | (2,2) | "What is 2 × 4?" | 8 |
| 3 | Subtract | (4,2) | "What is 9 − 8?" | 1 |
| — | Bring Down | (4,3) auto | | |
| 4 | Divide | (0,3) | "How many times does 4 go into 15?" | 3 |
| 5 | Multiply | (5,2)-(5,3) span 2 | "What is 3 × 4?" | 12 |
| 6 | Subtract | (7,3) | "What is 15 − 12?" | 3 |

After step 6, remainder prompt: "We have 3 left, and no more digits. Can 4 go into 3?" [Yes] [No]. Correct=No.

Completion: "**95 ÷ 4 = 23 R3**"

#### Guided Example 3: 738 ÷ 6 = 123

Three-digit, three cycles, builds stamina.

Grid: 5 cols × 11 rows.

| # | Step | Cell(s) | Prompt | Correct |
|---|------|---------|--------|---------|
| 1 | Divide | (0,2) | "How many times does 6 go into 7?" | 1 |
| 2 | Multiply | (2,2) | "What is 1 × 6?" | 6 |
| 3 | Subtract | (4,2) | "What is 7 − 6?" | 1 |
| — | Bring Down | (4,3) auto | | |
| 4 | Divide | (0,3) | "Divide: 6 into 13?" | 2 |
| 5 | Multiply | (5,2)-(5,3) span 2 | "2 × 6?" | 12 |
| 6 | Subtract | (7,3) | "13 − 12?" | 1 |
| — | Bring Down | (7,4) auto | | |
| 7 | Divide | (0,4) | "6 into 18?" | 3 |
| 8 | Multiply | (8,3)-(8,4) span 2 | "3 × 6?" | 18 |
| 9 | Subtract | (10,4) | "18 − 18?" | 0 |

Rules: row 3 col 2, row 6 cols 2-3, row 9 cols 3-4.

Scaffolding reduction: prompts shorten across cycles (full sentence → step+numbers → just numbers).

Completion: "You just solved a three-digit problem, [name]. The process is always the same — you've got this."

#### Between Guided Problems

Completion → 2s display → crossfade to interstitial: "Problem [N] of 3" with next problem preview + [Let's Go] button.

After Guided 3, transition card: "**You're ready, [name]!** You've solved three problems with my help. Now it's your turn to fly solo. If you get stuck, the 💡 Hint button is always there." → [Start Practice] button.

---

### 4D. Phase 3: Practice Mode

#### Problem Generation

Pure JavaScript, no API. Deterministic, works offline.

```typescript
function generateProblem(tier: number): Problem {
  const divisor = randomInt(2, 9);

  switch (tier) {
    case 1: // 2-digit ÷ 1-digit, no remainder
      // Filter: quotient must NOT contain digit 0
      // (zero-in-quotient is a Tier 5 concept)

    case 2: // 2-digit ÷ 1-digit, WITH remainder

    case 3: // 3-digit ÷ 1-digit, no remainder
      // Filter: quotient must NOT contain digit 0

    case 4: // 3-digit ÷ 1-digit, WITH remainder

    case 5: // 3-4 digit, may have zero in quotient (intentionally)
  }
}
```

**Critical filter for Tiers 1-4:** After generating the problem, check if the quotient contains the digit 0. If so, regenerate. Zero-in-quotient is explicitly a Tier 5 concept and should not appear earlier.

**Deduplication:** Track last 10 problems. Regenerate on duplicate (same dividend AND divisor).

**Fallback problems** (if generator fails after 3 retries):

```typescript
const FALLBACK = {
  1: { dividend: 84, divisor: 4, quotient: 21, remainder: 0 },
  2: { dividend: 83, divisor: 5, quotient: 16, remainder: 3 },
  3: { dividend: 432, divisor: 8, quotient: 54, remainder: 0 },
  4: { dividend: 519, divisor: 4, quotient: 129, remainder: 3 },
  5: { dividend: 2418, divisor: 6, quotient: 403, remainder: 0 },
};
```

#### Practice Layout (Landscape iPad)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Hub    Tier 2 ⭐⭐    Streak: ●●●○○         [🔇] [📊]   │
│──────────────────────────────────────────────────────────────│
│                                                              │
│  ┌──────┐  ┌────────────────────┐  ┌───────────────────┐   │
│  │STEPS │  │                    │  │ FEEDBACK           │   │
│  │      │  │  DIVISION HOUSE    │  │                    │   │
│  │🔵 DIV│  │                    │  │ "How many times    │   │
│  │🟢 MUL│  │      2  _         │  │  does 5 go into 8?"│   │
│  │🟠 SUB│  │    ┌─────┐        │  │                    │   │
│  │🟣 BD │  │ 5  │ 8  3         │  │     [💡 Hint]      │   │
│  │      │  │    [__]            │  │                    │   │
│  │      │  │                    │  │                    │   │
│  └──────┘  └────────────────────┘  └───────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [1] [2] [3] [4] [5] [6] [7] [8] [9] [0]  [⌫] [✓]  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### Number Pad

Always visible, single row on landscape iPad. 12 buttons:

- Digits 0-9: 48×48px each
- Backspace (⌫): 72×48px
- Confirm (✓): 72×48px, amber background

Styling: `border-radius: 10px; border: 2px solid #D4C4A8; font-family: JetBrains Mono; font-size: 22px`.

On touch devices: input field has `inputMode="none"` to suppress system keyboard. Number pad clicks programmatically update the input value without stealing focus.

#### Tier System

**Advancement:** 5 correct problems in a row with no hints used on any step. Strict — earning it is the point.

**Advancement animation:**
1. All 5 streak dots flash gold (300ms)
2. Tier number increments with vertical slide animation (400ms)
3. New star appears with pop animation (scale 0→1.2→1, 300ms)
4. Banner slides down: "Level Up, [name]! Tier [N]!" — gold background, stays 2s, slides up
5. Streak dots reset

**Demotion:** Triggered when 3 consecutive "dirty" problems. A problem is "dirty" if any step needed 2+ attempts OR any hint (Tier 1+) was used. Quiet — no animation, no banner. Tier label updates, star disappears, dots reset. Problem difficulty adjusts silently. **Demotion does not apply at Tier 1** (cannot go below Tier 1).

**A problem counts as "clean" (toward advancement) if:** every step was answered correctly on the first attempt with no hints requested.

#### Hint System

Hint button in feedback area. Label changes by level:
- Level 0: "Hint"
- Level 1: "More Help"
- Level 2: "Show Answer"
- Level 3: button hidden

Hints appear with slide-up animation (300ms), replacing previous hint.

Using any hint on a problem means that problem does NOT count toward the 5-in-a-row advancement streak (it resets the streak to 0). Hints also count the problem as "dirty" for the demotion counter. In short: hints prevent advancement AND contribute to demotion — they are a support tool with real consequences to encourage independent attempts.

#### Error-Specific Feedback Templates

**DIVIDE step:**

| Error | Detection | Template |
|-------|-----------|----------|
| Too high | student > correct | "[student] × [divisor] = [product], which is bigger than [number]. Try one less." |
| Too low | student < correct AND fits more | "You could fit more! [student+1] × [divisor] = [product], which still fits under [number]." |
| Way off | abs(student-correct) > 2 | "Think about your [divisor] times table. What's the biggest [divisor] × ___ that fits under [number]?" |
| Zero when shouldn't | student=0 AND correct>0 | "[divisor] does fit into [number]! How many times?" |
| Nonzero when should be zero | student>0 AND correct=0 | "[divisor] × [student] = [product], but we only have [number]. [divisor] is too big to fit even once. Write 0." |

**MULTIPLY step:**

| Error | Template |
|-------|----------|
| Wrong product | "Let's check: [a] × [b] = [correct]. You wrote [student]." |

**SUBTRACT step:**

| Error | Template |
|-------|----------|
| Wrong difference | "Let's recount: [top] − [bottom] = [correct]. You wrote [student]." |
| Flipped direction | "Make sure you subtract the bottom from the top: [top] − [bottom], not [bottom] − [top]." |

**API feedback hook (v2):** The feedback system accepts an optional async function that can provide richer, AI-generated feedback. For v1, this hook is unused. Architecture allows plugging in an API proxy later without changing the feedback display logic.

#### Multiplication Mini-Drills

**Trigger:** Student needs Tier 2+ hints on multiply steps for 3 out of the last 5 problems.

**Presentation:**

> "Let's warm up your ×[divisor] facts real quick, [name]!"

5 flash cards focused on the specific divisor. Each card shows `[divisor] × [n] = ?` where n is randomized 2-9. Student types answer via number pad.

- Correct: green flash, next card after 500ms
- Wrong: show correct answer for 1.5s, then next card

After 5 cards, brief encouragement: "Nice! Let's get back to dividing." Returns to division practice.

The mini-drill does NOT affect tier/streak — it's a support tool, not an assessment.

#### Session Persistence

Save to `localStorage` after every meaningful action:

```typescript
interface ChildProgress {
  tier: number;
  totalCorrect: number;
  totalAttempted: number;
  highestTier: number;
  streak: number;
  consecutiveDirtyProblems: number;  // for demotion tracking (persists across sessions)
  lastSessionDate: string;
  lessonCompleted: boolean;
  guidedCompleted: boolean;
  // Step-level accuracy tracking
  stepAccuracy: {
    divide: { correct: number; total: number };
    multiply: { correct: number; total: number };
    subtract: { correct: number; total: number };
  };
  // In-progress problem state (for resume)
  inProgress: InProgressState | null;
  recentProblems: Array<{ dividend: number; divisor: number }>;
}
```

Storage key: `goat-trainer-[childId]-long-division`

**Hydration flow (on module load):**
1. Read `ChildProgress` from `localStorage`
2. Map fields to `LDState`: `tier`, `streak`, `totalCorrect`, `totalAttempted`, `stepAccuracy`, `consecutiveDirtyProblems` copy directly
3. If `inProgress` exists, recompute `ComputedHouse` from `inProgress.dividend` and `inProgress.divisor` using `computeDivisionHouse()`, then set `currentStepIndex` from `inProgress.currentStepIndex`
4. Prompt: "You were working on a problem, [name]. Want to continue or start a new one?"

**Serialization flow (on every meaningful action):**
Write the current `LDState` fields back to `ChildProgress` in `localStorage`. "Meaningful action" = step completed, problem completed, tier changed, hint used, or phase changed.

#### Practice Mode Milestones

- **After 10 problems:** "You've done 10 problems, [name]! Want to keep going or take a break?" [Keep Going] [Back to Hub]. Appears once per session.
- **After completing Tier 5 (5 problems at Tier 5):** "You're a long division pro, [name]! You've mastered all 5 levels." Gold banner, 3s display. Practice continues.
- **Check-in interval:** Every 10 problems for all tiers.

---

## 5. Visual Design System

### Color Palette

```
Background:        #FDF6EC (warm cream)
Card/House BG:     #FFFFFF
Text primary:      #2D2A26 (warm dark brown)
Text secondary:    #6B6560 (warm gray)

Step colors:
  Divide:          #3B82F6 (blue)
  Multiply:        #22C55E (green)
  Subtract:        #F97316 (orange)
  Bring Down:      #A855F7 (purple)

Feedback:
  Correct:         #86EFAC (light green)
  Wrong:           #FCA5A5 (light red)

UI:
  Button primary:  #F59E0B (amber)
  Button hover:    #D97706
  Progress dots:   #F59E0B (filled), #E5DDD0 (empty)
```

Step colors are always paired with their step name label (DIVIDE, MULTIPLY, etc.) for colorblind accessibility.

### Typography

```
Headings:  'Quicksand', sans-serif  — rounded, friendly
Body:      'Nunito', sans-serif     — warm, clear for young readers
Numbers:   'JetBrains Mono', mono   — precise grid alignment
```

### Cell Sizing

| Context | Width | Height | Font Size |
|---------|-------|--------|-----------|
| iPad landscape (primary) | 48px | 56px | 28px |
| Smaller iPad / split view | 44px | 48px | 24px |

Minimum: 44×44pt (Apple HIG for children).

### Responsive: Landscape-Only

Since the app is locked to landscape via PWA manifest, we design for one orientation:

- **iPad (1024×768):** Full 3-column layout (StepPanel + House + Feedback)
- **iPad Air/Pro (1180×820+):** Same layout with more breathing room
- **iPad Mini (1024×768):** Same layout, may use slightly smaller cells

No portrait layout needed. If somehow loaded in a browser without PWA lock, show a "Please rotate to landscape" message.

---

## 6. State Architecture

### Top-Level App State

```typescript
interface AppState {
  // Navigation
  activeChild: ChildProfile | null;
  currentModule: string | null;   // "long-division" or null (hub)
}

interface ChildProfile {
  id: string;       // "jack", "reese", "kate"
  name: string;     // "Jack", "Reese", "Kate"
}
```

### Long Division Module State (useReducer)

```typescript
interface LDState {
  // Phase navigation
  phase: "skip-gate" | "lesson" | "guided" | "practice";

  // Lesson
  lessonScreen: number;                // 1-7
  lessonStepWithinScreen: number;      // for walkthrough screens
  lessonInteractionComplete: boolean;
  lessonMaxScreenReached: number;
  lessonInputAttempts: number;         // wrong attempts on current lesson input (0-2+), resets per step

  // Guided
  guidedProblemIndex: number;          // 0-2
  guidedStepIndex: number;
  guidedAttempts: number;              // wrong attempts on current step (0-3), resets between steps
  guidedShowingInterstitial: boolean;

  // Practice
  currentProblem: Problem | null;
  currentHouseData: ComputedHouse | null;
  currentStepIndex: number;
  currentAttempts: number;
  currentHintLevel: number;            // 0-3
  inputValue: string;
  tier: number;                        // 1-5
  streak: number;                      // 0-5
  problemClean: boolean;               // true if no hints/errors so far this problem
  consecutiveDirtyProblems: number;    // problems where any step had 2+ attempts or any hint used (triggers demotion at 3)
  totalCorrect: number;
  totalAttempted: number;
  recentProblems: Problem[];           // last 10, for dedup
  showingCompletion: boolean;
  showingTierAdvance: boolean;
  showTenProblemCheck: boolean;

  // Step accuracy tracking
  stepAccuracy: {
    divide: { correct: number; total: number };
    multiply: { correct: number; total: number };
    subtract: { correct: number; total: number };
  };

  // Multiplication mini-drill
  showingMiniDrill: boolean;
  miniDrillDivisor: number;
  recentMultiplyHints: boolean[];      // last 5 problems, true if needed Tier 2+ on multiply

  // In-progress state for resume
  inProgress: InProgressState | null;
}
```

### Cell State Derivation

Cell states are computed from `currentHouseData` + `currentStepIndex`, NOT stored directly:

```typescript
function deriveCellStates(houseData, currentStepIndex): CellState[] {
  // Determine current cycle from the current step's data
  const currentStep = houseData.steps[currentStepIndex];
  const currentCycle = currentStep?.cycle ?? 0;

  return houseData.cells.map(cell => {
    if (cell.stepIndex > currentStepIndex) return { ...cell, state: "hidden" };
    if (cell.stepIndex < currentStepIndex) {
      // Dim cells from cycles more than 1 behind (uses cell.cycle, not arithmetic)
      return { ...cell, state: currentCycle - cell.cycle > 1 ? "dimmed" : "visible" };
    }
    return { ...cell, state: "input" };
  });
}
```

Note: `cell.cycle` is stored directly on each `CellData` by `computeDivisionHouse()`, not derived from `stepIndex`. This avoids arithmetic errors caused by the last cycle having no bring-down step (3 steps instead of 4).

---

## 7. Sound System

Web Audio API tones, no external files. All sounds are short synthesized tones.

| Event | Sound | Duration |
|-------|-------|----------|
| Correct answer | Pleasant ascending pop (two quick notes) | ~200ms |
| Wrong answer | Soft low tone (gentle, not a buzzer) | ~200ms |
| Bring down | Quick descending whoosh | ~300ms |
| Tier advance | 3-4 ascending celebratory notes | ~800ms |
| Problem complete | Satisfying double-ding | ~400ms |
| Cookie landing | Soft "plop" | ~100ms |

Mute toggle: top-right corner of practice screen. State saved to `localStorage`. Default: sound on.

Implementation: create an `AudioContext` on first user interaction (required by browser autoplay policy). Each sound is a function that creates oscillator nodes with specific frequencies and envelopes.

---

## 8. Resolved Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Vite + React + TypeScript | Spec designed as component tree; TypeScript catches state bugs; Vite gives fast dev + optimized build |
| 2 | PWA with landscape lock | Kids use it like an app; `orientation: landscape` in manifest |
| 3 | localStorage (not window.storage) | window.storage doesn't exist in browsers; localStorage works on iPad Safari |
| 4 | Per-child storage keys | Three kids, separate progress |
| 5 | Name picker → Hub → Module | Future modules across subjects without rearchitecting |
| 6 | Web Audio API for sounds | No external audio files; works offline; synthesized tones are small |
| 7 | Cookie-to-notation bridge in Screen 2 | Overexplain — connect concrete concept to abstract notation |
| 8 | Hint Tier 3 = answer + redemption step | Prevents "fail twice for free answers" exploit; includes context about why the sub-skill matters |
| 9 | 5 in a row for tier advancement | Strict; earning it is the point |
| 10 | Click-to-place only (no drag-and-drop) | Simpler, works better on iPad, same learning outcome |
| 11 | "Prove it" skip gate on Screen 1 | Respects kids who already know; gates at Tier 2 |
| 12 | Lesson screens narrated + interactive | Student types every answer (even after narration tells them) — builds muscle memory of where digits go. Narration → input → correct to proceed. Gentle 3-tier feedback: nudge → highlight answer → keep highlighting (never auto-fill). |
| 13 | Multiplication mini-drills | Root-cause intervention when multiply is the bottleneck |
| 14 | Student-visible stats (not parent-hidden) | Kid owns their progress |
| 15 | No API feedback in v1 | Security (no exposed API key), offline support, hardcoded templates are sufficient. Architecture supports plugging in later. |
| 16 | Zero-in-quotient filtered from Tiers 1-4 | Tier 5 concept; shouldn't surprise early learners |
| 17 | SVG viewBox for cookie animation | Scales to any viewport; no hardcoded pixel positions |
| 18 | 100dvh not 100vh | iOS Safari dynamic viewport |
| 19 | Grid cells min 44×44pt | Apple HIG touch target minimum for children |
| 20 | Personalization with child's name | "Great job, Jack!" in feedback and completion messages |
| 21 | Module interface for future expansion | New subjects (reading comprehension, etc.) at different grade levels per child |

---

## 9. Implementation Notes

### Recommended Build Order

1. **`computeDivisionHouse()` + tests** — core algorithm, verify against all worked examples
2. **`<DivisionHouse>` component** — CSS Grid renderer in static mode
3. **`<Cell>` component** — all 7 visual states + animations
4. **Practice mode** — exercises all interactive components
5. **Guided examples** — same components, hardcoded problems, three-tier feedback + redemption
6. **Lesson screens** — Screens 4-6 first (reuse house), then 1-3 (custom), then 7 (static)
7. **Name picker + Hub + Stats** — shell around the module
8. **Sound system** — Web Audio integration
9. **PWA setup** — manifest, service worker, icons
10. **GitHub Pages deployment** — Vite config, gh-pages package
11. **iPad testing** — test on actual devices, verify landscape lock, touch targets, safe areas

### Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Nunito:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
```

### Bug Fixes from Original Spec

- ✅ `window.storage` → `localStorage`
- ✅ Screen 2: removed contradictory `(0,2)` coordinate; correct is `(0,3)`
- ✅ Guided Example 1 (72÷3): rule at row 6 corrected to "cols 2-3" (not "col 3")
- ✅ Grid cells: minimum 44×44pt (was 36px wide on mobile)
- ✅ `100dvh` used throughout (not `100vh`)
- ✅ Cookie animation uses SVG viewBox (not hardcoded pixels)
- ✅ Screen 3: click-to-place only (no drag-and-drop)
- ✅ Zero-in-quotient filtered from Tiers 1-4 problem generator
- ✅ GitHub Pages `base` URL configured in vite.config.ts
- ✅ Tier demotion trigger clarified: 3 consecutive "dirty" problems (2+ attempts or any hint on any step)

### Fixes from Spec Review (Round 1)

- ✅ `CellData.cycle` stored directly (not derived from `stepIndex / 4`) — fixes dimming bug for 3+ cycle problems
- ✅ `correctDigit` and `correctAnswer` consolidated into single `correctAnswer: string` field
- ✅ `Problem` and `InProgressState` interfaces explicitly defined
- ✅ `ChildProgress` now includes `consecutiveDirtyProblems` for cross-session demotion tracking
- ✅ Hydration/serialization flow between `LDState` and `ChildProgress` documented
- ✅ Hint clarified: NOT neutral — resets advancement streak AND counts toward demotion
- ✅ Demotion does not apply at Tier 1 (explicit floor)
- ✅ Screen 1 cookie text: "share with 3 friends" → "split into 3 equal groups" (avoids child-as-recipient ambiguity)
- ✅ Screen 7 button: "Start Practice" → "Let's Try It Together" (matches destination: Guided phase, not Practice)
- ✅ `guidedAttempts` resets between steps (not between problems)
- ✅ Service worker uses versioned cache name for updates
- ✅ Bracket growth: interactive mode grows bracket as rows are revealed
- ✅ `lessonMaxScreenReached` enforcement logic specified
