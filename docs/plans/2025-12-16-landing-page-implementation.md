# Landing Page & Branding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the landing page into the branded Knockout FPL experience with new color system, typography, and component composition.

**Architecture:** Update Tailwind config and CSS variables with brand colors (Midnight Blue, Gold, Navy). Create Navbar, ValueProps, and SocialProof components. Refactor Hero with new branding. Compose all in LandingPage.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Vitest, React Router

---

## Task 1: Install Inter Font

**Files:**
- Modify: `src/index.css:1-5`

**Step 1: Add Google Fonts import to index.css**

Add at the very top of `src/index.css` (before `@tailwind base`):

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

**Step 2: Verify font loads**

Run: `npm run dev`
Expected: Dev server starts, no errors

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(brand): add Inter font import"
```

---

## Task 2: Add Brand Colors to Tailwind Config

**Files:**
- Modify: `tailwind.config.js:8-57`

**Step 1: Add brand color tokens to tailwind.config.js**

Replace the entire `theme.extend` section:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand colors
        midnight: '#0D1F3C',
        navy: '#1A3A5C',
        gold: {
          DEFAULT: '#C9A227',
          light: '#E8D5A3',
        },
        'near-black': '#1A1A1A',
        // shadcn semantic colors (HSL format)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '72px', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'heading-1': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'heading-2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'score': ['28px', { lineHeight: '32px', fontWeight: '700' }],
      },
      boxShadow: {
        'gold': '0 4px 14px rgba(201, 162, 39, 0.3)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

**Step 2: Verify config is valid**

Run: `npm run dev`
Expected: Dev server starts without Tailwind config errors

**Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(brand): add brand colors and typography to Tailwind config"
```

---

## Task 3: Update CSS Variables for Brand Colors

**Files:**
- Modify: `src/index.css:5-32`

**Step 1: Update :root CSS variables**

Replace the `:root` block in `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --primary: 45 71% 47%;
    --primary-foreground: 0 0% 10%;
    --secondary: 207 55% 23%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%;
    --accent: 43 56% 77%;
    --accent-foreground: 0 0% 10%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 45 71% 47%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 216 50% 15%;
    --foreground: 0 0% 100%;
    --card: 216 50% 15%;
    --card-foreground: 0 0% 100%;
    --popover: 216 50% 15%;
    --popover-foreground: 0 0% 100%;
    --primary: 45 71% 47%;
    --primary-foreground: 0 0% 10%;
    --secondary: 207 55% 23%;
    --secondary-foreground: 0 0% 100%;
    --muted: 217 33% 18%;
    --muted-foreground: 0 0% 65%;
    --accent: 43 56% 77%;
    --accent-foreground: 0 0% 10%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 100%;
    --border: 217 33% 18%;
    --input: 217 33% 18%;
    --ring: 45 71% 47%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
}
```

**Step 2: Verify styles apply**

Run: `npm run dev`
Expected: Page loads with new colors (gold primary buttons)

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(brand): update CSS variables with brand color palette"
```

---

## Task 4: Create Navbar Test File

**Files:**
- Create: `src/components/landing/Navbar.test.tsx`

**Step 1: Write the first test (renders)**

Create `src/components/landing/Navbar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: FAIL - Cannot find module './Navbar'

**Step 3: Commit**

```bash
git add src/components/landing/Navbar.test.tsx
git commit -m "test(navbar): add initial render test"
```

---

## Task 5: Create Minimal Navbar Component

**Files:**
- Create: `src/components/landing/Navbar.tsx`

**Step 1: Create minimal component to pass test**

Create `src/components/landing/Navbar.tsx`:

```tsx
export function Navbar() {
  return (
    <nav>
      Navbar
    </nav>
  );
}
```

**Step 2: Run test to verify it passes**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/landing/Navbar.tsx
git commit -m "feat(navbar): create minimal Navbar component"
```

---

## Task 6: Add Navbar Logo Test

**Files:**
- Modify: `src/components/landing/Navbar.test.tsx`

**Step 1: Add test for logo text**

Add to `Navbar.test.tsx` inside the describe block:

```tsx
  it('displays KNOCKOUT FPL logo text', () => {
    renderNavbar();
    expect(screen.getByText('KNOCKOUT FPL')).toBeInTheDocument();
  });
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: FAIL - Unable to find text "KNOCKOUT FPL"

**Step 3: Update component to pass**

Update `src/components/landing/Navbar.tsx`:

```tsx
export function Navbar() {
  return (
    <nav>
      KNOCKOUT FPL
    </nav>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add src/components/landing/Navbar.tsx src/components/landing/Navbar.test.tsx
git commit -m "feat(navbar): add logo text"
```

---

## Task 7: Add Navbar Login Link Test

**Files:**
- Modify: `src/components/landing/Navbar.test.tsx`
- Modify: `src/components/landing/Navbar.tsx`

**Step 1: Add test for login link**

Add to `Navbar.test.tsx`:

```tsx
  it('displays Login link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('Login link navigates to /login', () => {
    renderNavbar();
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: FAIL - Unable to find role "link" with name /login/i

**Step 3: Update component to pass**

Update `src/components/landing/Navbar.tsx`:

```tsx
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav>
      KNOCKOUT FPL
      <Link to="/login">Login</Link>
    </nav>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/components/landing/Navbar.tsx src/components/landing/Navbar.test.tsx
git commit -m "feat(navbar): add login link"
```

---

## Task 8: Add Navbar Logo Link Test

**Files:**
- Modify: `src/components/landing/Navbar.test.tsx`
- Modify: `src/components/landing/Navbar.tsx`

**Step 1: Add test for logo link**

Add to `Navbar.test.tsx`:

```tsx
  it('logo links to home page', () => {
    renderNavbar();
    const logoLink = screen.getByRole('link', { name: /knockout fpl/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: FAIL - Unable to find role "link" with name /knockout fpl/i

**Step 3: Update component to pass**

Update `src/components/landing/Navbar.tsx`:

```tsx
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav>
      <Link to="/">KNOCKOUT FPL</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/components/landing/Navbar.tsx src/components/landing/Navbar.test.tsx
git commit -m "feat(navbar): add logo link to home"
```

---

## Task 9: Style Navbar Component

**Files:**
- Modify: `src/components/landing/Navbar.tsx`

**Step 1: Apply full styling**

Update `src/components/landing/Navbar.tsx`:

```tsx
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-midnight">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-body-lg font-bold uppercase tracking-wide text-white"
        >
          KNOCKOUT FPL
        </Link>
        <Link
          to="/login"
          className="text-white transition-colors hover:text-gold"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
```

**Step 2: Run all tests to verify nothing broke**

Run: `npm test -- src/components/landing/Navbar.test.tsx`
Expected: PASS (5 tests)

**Step 3: Commit**

```bash
git add src/components/landing/Navbar.tsx
git commit -m "style(navbar): apply brand styling with midnight background"
```

---

## Task 10: Update Hero Tests for New Content

**Files:**
- Modify: `src/components/landing/Hero.test.tsx`

**Step 1: Replace Hero tests with new content requirements**

Replace entire `src/components/landing/Hero.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Hero } from './Hero';

describe('Hero', () => {
  const renderHero = () => {
    return render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('displays KNOCKOUT FPL headline', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('KNOCKOUT FPL');
  });

  it('headline is uppercase', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('uppercase');
  });

  it('displays tagline', () => {
    renderHero();
    expect(screen.getByText('Every gameweek is a cup final.')).toBeInTheDocument();
  });

  it('displays Enter the Arena CTA', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /enter the arena/i })).toBeInTheDocument();
  });

  it('CTA links to /signup', () => {
    renderHero();
    const cta = screen.getByRole('link', { name: /enter the arena/i });
    expect(cta).toHaveAttribute('href', '/signup');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/Hero.test.tsx`
Expected: FAIL - headline text/uppercase tests fail

**Step 3: Commit**

```bash
git add src/components/landing/Hero.test.tsx
git commit -m "test(hero): update tests for new brand content"
```

---

## Task 11: Update Hero Component with New Branding

**Files:**
- Modify: `src/components/landing/Hero.tsx`

**Step 1: Replace Hero with branded version**

Replace entire `src/components/landing/Hero.tsx`:

```tsx
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-midnight px-4 py-16 md:py-20 lg:py-32">
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

**Step 2: Run test to verify it passes**

Run: `npm test -- src/components/landing/Hero.test.tsx`
Expected: PASS (6 tests)

**Step 3: Commit**

```bash
git add src/components/landing/Hero.tsx
git commit -m "feat(hero): rebrand with new copy and styling"
```

---

## Task 12: Create ValueProps Test File

**Files:**
- Create: `src/components/landing/ValueProps.test.tsx`

**Step 1: Write ValueProps tests**

Create `src/components/landing/ValueProps.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValueProps } from './ValueProps';

describe('ValueProps', () => {
  it('renders without crashing', () => {
    render(<ValueProps />);
    expect(screen.getByTestId('value-props')).toBeInTheDocument();
  });

  it('displays 3 value prop cards', () => {
    render(<ValueProps />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
  });

  it('card 1 displays sword emoji', () => {
    render(<ValueProps />);
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('card 1 displays headline', () => {
    render(<ValueProps />);
    expect(screen.getByText('One opponent. One winner. Every week.')).toBeInTheDocument();
  });

  it('card 1 displays body', () => {
    render(<ValueProps />);
    expect(screen.getByText('No more chasing points. Just survive.')).toBeInTheDocument();
  });

  it('card 2 displays target emoji', () => {
    render(<ValueProps />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('card 2 displays headline', () => {
    render(<ValueProps />);
    expect(screen.getByText('Your team. Higher stakes.')).toBeInTheDocument();
  });

  it('card 3 displays trophy emoji', () => {
    render(<ValueProps />);
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('card 3 displays headline', () => {
    render(<ValueProps />);
    expect(screen.getByText('Turn your league into sudden death.')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/ValueProps.test.tsx`
Expected: FAIL - Cannot find module './ValueProps'

**Step 3: Commit**

```bash
git add src/components/landing/ValueProps.test.tsx
git commit -m "test(valueprops): add tests for value proposition cards"
```

---

## Task 13: Create ValueProps Component

**Files:**
- Create: `src/components/landing/ValueProps.tsx`

**Step 1: Create component to pass all tests**

Create `src/components/landing/ValueProps.tsx`:

```tsx
const valueProps = [
  {
    icon: '⚔️',
    headline: 'One opponent. One winner. Every week.',
    body: 'No more chasing points. Just survive.',
  },
  {
    icon: '🎯',
    headline: 'Your team. Higher stakes.',
    body: 'Bring your FPL squad. No setup. Just glory.',
  },
  {
    icon: '🏆',
    headline: 'Turn your league into sudden death.',
    body: '32 enter. 1 lifts the trophy.',
  },
];

export function ValueProps() {
  return (
    <section
      data-testid="value-props"
      className="bg-gray-50 px-4 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {valueProps.map((prop, index) => (
          <article
            key={index}
            className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 text-center shadow-sm"
          >
            <span className="text-5xl">{prop.icon}</span>
            <h3 className="text-heading-3 font-semibold text-near-black">
              {prop.headline}
            </h3>
            <p className="text-body text-gray-500">{prop.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

**Step 2: Run test to verify it passes**

Run: `npm test -- src/components/landing/ValueProps.test.tsx`
Expected: PASS (9 tests)

**Step 3: Commit**

```bash
git add src/components/landing/ValueProps.tsx
git commit -m "feat(valueprops): create value proposition cards component"
```

---

## Task 14: Create SocialProof Test File

**Files:**
- Create: `src/components/landing/SocialProof.test.tsx`

**Step 1: Write SocialProof tests**

Create `src/components/landing/SocialProof.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialProof } from './SocialProof';

describe('SocialProof', () => {
  it('renders without crashing', () => {
    render(<SocialProof />);
    expect(screen.getByTestId('social-proof')).toBeInTheDocument();
  });

  it('displays quote text', () => {
    render(<SocialProof />);
    expect(screen.getByText('"Finally, FPL with actual stakes."')).toBeInTheDocument();
  });

  it('displays attribution', () => {
    render(<SocialProof />);
    expect(screen.getByText('— Someone on Reddit, probably')).toBeInTheDocument();
  });

  it('quote is styled as italic', () => {
    render(<SocialProof />);
    const quote = screen.getByText('"Finally, FPL with actual stakes."');
    expect(quote).toHaveClass('italic');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/landing/SocialProof.test.tsx`
Expected: FAIL - Cannot find module './SocialProof'

**Step 3: Commit**

```bash
git add src/components/landing/SocialProof.test.tsx
git commit -m "test(socialproof): add tests for social proof section"
```

---

## Task 15: Create SocialProof Component

**Files:**
- Create: `src/components/landing/SocialProof.tsx`

**Step 1: Create component to pass all tests**

Create `src/components/landing/SocialProof.tsx`:

```tsx
export function SocialProof() {
  return (
    <section
      data-testid="social-proof"
      className="border-t border-gray-200 bg-gray-50 px-4 py-16"
    >
      <div className="mx-auto max-w-3xl text-center">
        <blockquote>
          <p className="text-body-lg italic text-near-black">
            "Finally, FPL with actual stakes."
          </p>
          <cite className="mt-4 block text-body-sm not-italic text-gray-500">
            — Someone on Reddit, probably
          </cite>
        </blockquote>
      </div>
    </section>
  );
}
```

**Step 2: Run test to verify it passes**

Run: `npm test -- src/components/landing/SocialProof.test.tsx`
Expected: PASS (4 tests)

**Step 3: Commit**

```bash
git add src/components/landing/SocialProof.tsx
git commit -m "feat(socialproof): create social proof quote section"
```

---

## Task 16: Update LandingPage Tests

**Files:**
- Modify: `src/pages/LandingPage.test.tsx`

**Step 1: Update tests for new composition**

Replace entire `src/pages/LandingPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  };

  it('renders Navbar', () => {
    renderLandingPage();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders Hero headline', () => {
    renderLandingPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('KNOCKOUT FPL');
  });

  it('renders Hero CTA linking to signup', () => {
    renderLandingPage();
    const cta = screen.getByRole('link', { name: /enter the arena/i });
    expect(cta).toHaveAttribute('href', '/signup');
  });

  it('renders ValueProps section', () => {
    renderLandingPage();
    expect(screen.getByTestId('value-props')).toBeInTheDocument();
  });

  it('renders SocialProof section', () => {
    renderLandingPage();
    expect(screen.getByTestId('social-proof')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/pages/LandingPage.test.tsx`
Expected: FAIL - missing sections

**Step 3: Commit**

```bash
git add src/pages/LandingPage.test.tsx
git commit -m "test(landing): update tests for full page composition"
```

---

## Task 17: Update LandingPage Composition

**Files:**
- Modify: `src/pages/LandingPage.tsx`

**Step 1: Compose all landing page sections**

Replace entire `src/pages/LandingPage.tsx`:

```tsx
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ValueProps } from '../components/landing/ValueProps';
import { SocialProof } from '../components/landing/SocialProof';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueProps />
      <SocialProof />
    </main>
  );
}
```

**Step 2: Run test to verify it passes**

Run: `npm test -- src/pages/LandingPage.test.tsx`
Expected: PASS (5 tests)

**Step 3: Run all tests to ensure nothing broke**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): compose all landing page sections"
```

---

## Task 18: Visual Verification with Playwright

**Files:**
- None (verification only)

**Step 1: Start dev server**

Run: `npm run dev`
Expected: Server starts on http://localhost:5173

**Step 2: Capture page snapshot**

Use Playwright MCP:
```
mcp__playwright__browser_navigate({ url: 'http://localhost:5173' })
mcp__playwright__browser_snapshot()
```

**Verification checklist:**
- [ ] Navbar shows "KNOCKOUT FPL" logo and "Login" link
- [ ] Hero has midnight blue background
- [ ] Headline "KNOCKOUT FPL" is white and uppercase
- [ ] Tagline "Every gameweek is a cup final." is gold-light color
- [ ] "Enter the Arena" button is gold with dark text
- [ ] 3 value prop cards with emojis (⚔️, 🎯, 🏆)
- [ ] Social proof quote section at bottom

**Step 3: Check console for errors**

Use Playwright MCP:
```
mcp__playwright__browser_console_messages({ level: 'error' })
```
Expected: No errors

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(landing): complete landing page rebrand

- Add Inter font and brand color system
- Create Navbar with logo and login link
- Rebrand Hero with KNOCKOUT FPL headline and gold CTA
- Add ValueProps with 3 feature cards
- Add SocialProof quote section
- Compose all sections in LandingPage"
```

---

## Summary

**Total Tasks:** 18
**Estimated Time:** 60-90 minutes

**Files Created:**
- `src/components/landing/Navbar.tsx`
- `src/components/landing/Navbar.test.tsx`
- `src/components/landing/ValueProps.tsx`
- `src/components/landing/ValueProps.test.tsx`
- `src/components/landing/SocialProof.tsx`
- `src/components/landing/SocialProof.test.tsx`

**Files Modified:**
- `tailwind.config.js`
- `src/index.css`
- `src/components/landing/Hero.tsx`
- `src/components/landing/Hero.test.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/LandingPage.test.tsx`

**Commits:** ~15 atomic commits
