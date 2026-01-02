# Visual Regression Testing

Directory structure for AI-powered visual regression testing across all routes, states, and viewports.

## Directory Structure

```
visual-tests/
├── baselines/          # Golden images (git committed)
│   └── {route}/{state}/
│       ├── mobile-375x667.png
│       ├── tablet-768x1024.png
│       └── desktop-1920x1080.png
├── current/            # Current test run (gitignored)
├── diffs/              # Visual diff output (gitignored)
├── reports/            # AI analysis reports (gitignored)
├── config/             # Configuration files
│   ├── viewports.ts    # Viewport definitions
│   ├── routes.ts       # Route + state definitions
│   └── thresholds.ts   # Diff tolerance settings
└── scripts/            # Capture and analysis scripts
```

## Viewports

| Name | Dimensions | Device |
|------|------------|--------|
| `mobile` | 375x667 | iPhone SE |
| `tablet` | 768x1024 | iPad |
| `desktop` | 1920x1080 | Full HD |

## Routes & States

| Route | States |
|-------|--------|
| `/` (landing) | default, authenticated |
| `/login` | default, validation-error, auth-error, loading |
| `/signup` | default, validation-error, loading |
| `/forgot-password` | default, success, error |
| `/connect` | default, validation-error, invalid-team, loading |
| `/dashboard` | empty, with-tournaments, with-matches, loading |
| `/leagues` | empty, with-leagues, loading |
| `/league/:id` | default, not-found, loading |
| `/profile` | default, editing, loading |

## File Naming Convention

```
{route}/{state}/{viewport}-{width}x{height}.png

Examples:
- login/default/mobile-375x667.png
- dashboard/with-tournaments/desktop-1920x1080.png
```

## Usage

### Capturing Baselines

```bash
# Future: Run capture script
npm run visual:capture
```

### Comparing Against Baselines

```bash
# Future: Run comparison script
npm run visual:compare
```

### AI Analysis

```bash
# Future: Run AI analysis on diffs
npm run visual:analyze
```

## Adding New Routes/States

1. Add route config to `config/routes.ts`
2. Create directory: `baselines/{route}/{state}/`
3. Add `.gitkeep` file
4. Capture baseline screenshots

## Thresholds

Default tolerance: 1% pixel difference

Adjust per-route or per-viewport thresholds in `config/thresholds.ts` for:
- Dynamic content (timestamps, counters)
- Anti-aliasing differences across viewports
