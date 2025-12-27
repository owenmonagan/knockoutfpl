# Knockout FPL

A web application that creates knockout tournaments from Fantasy Premier League classic leagues.

## Tech Stack

- React 19 + TypeScript + Vite
- Vitest for unit/integration testing
- Playwright for E2E testing
- Firebase (Auth, Firestore, Cloud Functions)

## Getting Started

### Prerequisites

- Node.js v18+ (v20+ recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
# Start dev server
npm run dev

# Run unit tests
npm test

# Run unit tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive + manual verification)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# View E2E test report
npm run test:e2e:report

# Run all tests (unit + E2E)
npm run test:all
```

## Testing Strategy

This project uses a two-layer testing approach:

### Layer 1: Unit & Integration Tests (Vitest)

**Purpose:** Fast feedback loop during development

**Location:** `src/**/*.test.ts(x)`

**Run with:**
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:ui       # Interactive mode
```

### Layer 2: E2E Tests (Playwright)

**Purpose:** Visual verification and full user flow testing

**Location:** `e2e/**/*.spec.ts`

**Run with:**
```bash
npm run test:e2e        # Headless mode
npm run test:e2e:ui     # UI mode (best for manual verification)
npm run test:e2e:debug  # Debug mode with breakpoints
```

**Manual Verification Workflow:**
1. Run `npm run test:e2e:ui`
2. Interactive test runner opens with:
   - Live browser preview
   - Step-through test execution
   - Element inspection
   - Time-travel debugging
3. View test reports: `npm run test:e2e:report`

See [e2e/README.md](e2e/README.md) for detailed E2E testing guide.

## Project Structure

See [CLAUDE.md](CLAUDE.md) for detailed project planning and architecture.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
