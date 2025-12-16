# Hero Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add animated trophy rising to crown a tournament bracket with holographic shine effect to the landing page hero.

**Architecture:** Three new components (TrophyAnimation, BracketMotif, ShineEffect) composed into the existing Hero component. All animations use CSS keyframes for performance. Trophy rises on page load, shine burst triggers when it lands, ambient shimmer continues.

**Tech Stack:** React, TypeScript, SVG, CSS keyframes, Tailwind CSS

---

## Task 1: Add CSS Animation Keyframes

**Files:**
- Modify: `src/index.css:85` (add after utilities layer)

**Step 1: Add the animation keyframes to index.css**

Add at the end of the file:

```css
/* Hero Animation System */
@layer components {
  /* Trophy rise animation */
  @keyframes trophy-rise {
    0% {
      transform: translateY(60px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Shine burst - radial expansion */
  @keyframes shine-burst {
    0% {
      transform: scale(0);
      opacity: 0.9;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }

  /* Ambient shimmer - diagonal sweep */
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  /* Bracket fade in */
  @keyframes bracket-fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.8;
    }
  }

  .animate-trophy-rise {
    animation: trophy-rise 0.8s ease-out forwards;
  }

  .animate-shine-burst {
    animation: shine-burst 0.4s ease-out forwards;
    animation-delay: 0.6s;
  }

  .animate-shimmer {
    animation: shimmer 3s ease-in-out infinite;
    animation-delay: 1s;
  }

  .animate-bracket-fade {
    animation: bracket-fade 0.5s ease-out forwards;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .animate-trophy-rise,
    .animate-shine-burst,
    .animate-shimmer,
    .animate-bracket-fade {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
}
```

**Step 2: Verify CSS is valid**

Run: `npm run build`
Expected: Build succeeds with no CSS errors

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(hero): add animation keyframes for trophy rise and shine effect"
```

---

## Task 2: Create BracketMotif Component

**Files:**
- Create: `src/components/landing/BracketMotif.tsx`
- Create: `src/components/landing/BracketMotif.test.tsx`

**Step 1: Write the failing test**

Create `src/components/landing/BracketMotif.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BracketMotif } from './BracketMotif';

describe('BracketMotif', () => {
  it('renders an SVG element', () => {
    render(<BracketMotif />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<BracketMotif />);
    expect(screen.getByLabelText(/tournament bracket/i)).toBeInTheDocument();
  });

  it('applies fade animation class', () => {
    render(<BracketMotif />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('animate-bracket-fade');
  });

  it('uses gold color for bracket lines', () => {
    render(<BracketMotif />);
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(path => {
      expect(path).toHaveAttribute('stroke', '#C9A227');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/landing/BracketMotif.test.tsx`
Expected: FAIL - Cannot find module './BracketMotif'

**Step 3: Write minimal implementation**

Create `src/components/landing/BracketMotif.tsx`:

```tsx
export function BracketMotif() {
  return (
    <svg
      className="animate-bracket-fade"
      width="200"
      height="80"
      viewBox="0 0 200 80"
      fill="none"
      aria-label="Tournament bracket decoration"
      role="img"
    >
      {/* Left bracket arm */}
      <path
        d="M 20 70 L 20 50 L 50 50 L 50 30"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right bracket arm */}
      <path
        d="M 180 70 L 180 50 L 150 50 L 150 30"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center connector to trophy position */}
      <path
        d="M 50 30 L 50 15 L 100 15 M 150 30 L 150 15 L 100 15"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Small boxes representing teams */}
      <rect x="10" y="70" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
      <rect x="170" y="70" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
      <rect x="40" y="45" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
      <rect x="140" y="45" width="20" height="10" stroke="#C9A227" strokeWidth="1.5" fill="none" rx="2" />
    </svg>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/landing/BracketMotif.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/components/landing/BracketMotif.tsx src/components/landing/BracketMotif.test.tsx
git commit -m "feat(hero): add BracketMotif SVG component"
```

---

## Task 3: Create TrophyAnimation Component

**Files:**
- Create: `src/components/landing/TrophyAnimation.tsx`
- Create: `src/components/landing/TrophyAnimation.test.tsx`

**Step 1: Write the failing test**

Create `src/components/landing/TrophyAnimation.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrophyAnimation } from './TrophyAnimation';

describe('TrophyAnimation', () => {
  it('renders an SVG trophy', () => {
    render(<TrophyAnimation />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<TrophyAnimation />);
    expect(screen.getByLabelText(/championship trophy/i)).toBeInTheDocument();
  });

  it('applies rise animation class', () => {
    render(<TrophyAnimation />);
    const container = document.querySelector('[data-testid="trophy-container"]');
    expect(container).toHaveClass('animate-trophy-rise');
  });

  it('trophy is gold colored', () => {
    render(<TrophyAnimation />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('fill', '#C9A227');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/landing/TrophyAnimation.test.tsx`
Expected: FAIL - Cannot find module './TrophyAnimation'

**Step 3: Write minimal implementation**

Create `src/components/landing/TrophyAnimation.tsx`:

```tsx
export function TrophyAnimation() {
  return (
    <div
      data-testid="trophy-container"
      className="animate-trophy-rise"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="#C9A227"
        aria-label="Championship trophy"
        role="img"
      >
        {/* Trophy cup */}
        <path d="M12 2C13.1 2 14 2.9 14 4V5H16C16.5 5 17 5.22 17.41 5.59C17.79 5.95 18 6.45 18 7V8C18 9.1 17.1 10 16 10H14.82C14.4 11.17 13.3 12 12 12C10.7 12 9.6 11.17 9.18 10H8C6.9 10 6 9.1 6 8V7C6 6.45 6.21 5.95 6.59 5.59C7 5.22 7.5 5 8 5H10V4C10 2.9 10.9 2 12 2ZM16 7H14V8H16V7ZM10 7H8V8H10V7Z" />
        {/* Trophy stem */}
        <path d="M11 12.5V15H13V12.5C12.7 12.5 12.35 12.5 12 12.5C11.65 12.5 11.3 12.5 11 12.5Z" />
        {/* Trophy base */}
        <path d="M8 17V19H16V17H8ZM7 21V19H17V21C17 21.55 16.55 22 16 22H8C7.45 22 7 21.55 7 21Z" />
      </svg>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/landing/TrophyAnimation.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/components/landing/TrophyAnimation.tsx src/components/landing/TrophyAnimation.test.tsx
git commit -m "feat(hero): add TrophyAnimation SVG component with rise animation"
```

---

## Task 4: Create ShineEffect Component

**Files:**
- Create: `src/components/landing/ShineEffect.tsx`
- Create: `src/components/landing/ShineEffect.test.tsx`

**Step 1: Write the failing test**

Create `src/components/landing/ShineEffect.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ShineEffect } from './ShineEffect';

describe('ShineEffect', () => {
  it('renders shine burst element', () => {
    render(<ShineEffect />);
    const burst = document.querySelector('[data-testid="shine-burst"]');
    expect(burst).toBeInTheDocument();
  });

  it('renders shimmer overlay element', () => {
    render(<ShineEffect />);
    const shimmer = document.querySelector('[data-testid="shimmer-overlay"]');
    expect(shimmer).toBeInTheDocument();
  });

  it('applies burst animation class', () => {
    render(<ShineEffect />);
    const burst = document.querySelector('[data-testid="shine-burst"]');
    expect(burst).toHaveClass('animate-shine-burst');
  });

  it('applies shimmer animation class', () => {
    render(<ShineEffect />);
    const shimmer = document.querySelector('[data-testid="shimmer-overlay"]');
    expect(shimmer).toHaveClass('animate-shimmer');
  });

  it('is not visible to screen readers (decorative)', () => {
    render(<ShineEffect />);
    const container = document.querySelector('[aria-hidden="true"]');
    expect(container).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/landing/ShineEffect.test.tsx`
Expected: FAIL - Cannot find module './ShineEffect'

**Step 3: Write minimal implementation**

Create `src/components/landing/ShineEffect.tsx`:

```tsx
export function ShineEffect() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {/* Radial burst - expands outward from center */}
      <div
        data-testid="shine-burst"
        className="animate-shine-burst absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(201,162,39,0.6) 40%, transparent 70%)',
        }}
      />

      {/* Diagonal shimmer sweep - holographic card effect */}
      <div
        data-testid="shimmer-overlay"
        className="animate-shimmer absolute left-1/2 top-0 h-24 w-48 -translate-x-1/2 opacity-30"
        style={{
          background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/landing/ShineEffect.test.tsx`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/components/landing/ShineEffect.tsx src/components/landing/ShineEffect.test.tsx
git commit -m "feat(hero): add ShineEffect component with burst and shimmer animations"
```

---

## Task 5: Compose Animation Components into Hero

**Files:**
- Modify: `src/components/landing/Hero.tsx`
- Modify: `src/components/landing/Hero.test.tsx`

**Step 1: Add new tests for animation components**

Add to `src/components/landing/Hero.test.tsx` (after existing tests):

```tsx
  it('renders trophy animation', () => {
    renderHero();
    expect(document.querySelector('[data-testid="trophy-container"]')).toBeInTheDocument();
  });

  it('renders bracket motif', () => {
    renderHero();
    expect(screen.getByLabelText(/tournament bracket/i)).toBeInTheDocument();
  });

  it('renders shine effect', () => {
    renderHero();
    expect(document.querySelector('[data-testid="shine-burst"]')).toBeInTheDocument();
  });
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/landing/Hero.test.tsx`
Expected: FAIL - 3 new tests fail (animation components not rendered)

**Step 3: Update Hero component to include animations**

Replace `src/components/landing/Hero.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { TrophyAnimation } from './TrophyAnimation';
import { BracketMotif } from './BracketMotif';
import { ShineEffect } from './ShineEffect';

export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-midnight px-4 py-16 md:py-20 lg:py-32">
      {/* Animation container - trophy crowning the bracket */}
      <div className="relative mb-8 flex flex-col items-center">
        {/* Trophy rises to the top */}
        <div className="relative">
          <TrophyAnimation />
          <ShineEffect />
        </div>

        {/* Bracket motif below trophy */}
        <div className="-mt-2">
          <BracketMotif />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-display-xl">
          KNOCKOUT FPL
        </h1>
        <p className="max-w-[42rem] text-body-lg text-gold-light">
          Every gameweek is a cup final.
        </p>
      </div>

      <div className="mt-10">
        <Link
          to="/signup"
          className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-lg bg-gold px-8 text-lg font-semibold text-near-black shadow-gold transition-colors hover:bg-gold-light"
        >
          Enter the Arena
        </Link>
      </div>
    </section>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/components/landing/Hero.test.tsx`
Expected: PASS (9 tests total)

**Step 5: Run all tests to ensure no regressions**

Run: `npm test`
Expected: All 358+ tests pass

**Step 6: Commit**

```bash
git add src/components/landing/Hero.tsx src/components/landing/Hero.test.tsx
git commit -m "feat(hero): compose trophy, bracket, and shine animation components"
```

---

## Task 6: Visual Verification with Playwright

**Files:**
- None (verification only)

**Step 1: Start dev server**

Run: `npm run dev`
Expected: Server starts on localhost:5173 (or similar port)

**Step 2: Take screenshot of hero animation**

Use Playwright MCP to navigate and capture:

```
browser_navigate({ url: 'http://localhost:5173' })
browser_snapshot()
browser_take_screenshot({ filename: 'hero-animation-final.png' })
```

**Step 3: Verify animation behavior**

- Trophy should be visible at top of hero
- Bracket motif should frame below trophy
- Gold color (#C9A227) should be prominent
- No console errors

**Step 4: Check reduced motion support**

Use browser dev tools to enable `prefers-reduced-motion: reduce` and verify:
- Animations are disabled
- Static end state is shown
- Trophy and bracket are visible without animation

**Step 5: Commit screenshot artifact**

```bash
git add .playwright-mcp/hero-animation-final.png
git commit -m "docs: add hero animation screenshot for reference"
```

---

## Task 7: Final Integration Test

**Files:**
- None (verification only)

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 2: Run build to verify no TypeScript errors**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Check console for errors in browser**

Use Playwright MCP:
```
browser_console_messages({ level: 'error' })
```
Expected: No errors

**Step 4: Final commit if any cleanup needed**

If all checks pass, the feature is complete.

---

## Summary

| Task | Component | Tests | Commit |
|------|-----------|-------|--------|
| 1 | CSS Keyframes | Build check | `feat(hero): add animation keyframes` |
| 2 | BracketMotif | 4 tests | `feat(hero): add BracketMotif SVG component` |
| 3 | TrophyAnimation | 4 tests | `feat(hero): add TrophyAnimation SVG component` |
| 4 | ShineEffect | 5 tests | `feat(hero): add ShineEffect component` |
| 5 | Hero composition | 3 new tests | `feat(hero): compose animation components` |
| 6 | Visual verification | Playwright | `docs: add hero animation screenshot` |
| 7 | Final integration | Full suite | (cleanup if needed) |

**Total new tests:** 16
**Total new files:** 6 (3 components + 3 test files)
**Modified files:** 2 (Hero.tsx, index.css)
