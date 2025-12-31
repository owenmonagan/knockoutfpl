# Knockout FPL Theme Guide

This document defines the visual design system for Knockout FPL. Reference this when building new components or pages.

---

## Color Palette

### Semantic Colors (CSS Variables)

These colors are defined as CSS custom properties in `src/index.css` and referenced via Tailwind.

| Token | HSL | Hex (approx) | Tailwind Class | Usage |
|-------|-----|--------------|----------------|-------|
| Background | `160 18% 4%` | `#0B1210` | `bg-background` | Page backgrounds |
| Foreground | `0 0% 100%` | `#FFFFFF` | `text-foreground` | Primary text |
| Card | `160 16% 9%` | `#131C18` | `bg-card` | Card/surface backgrounds |
| Card Foreground | `0 0% 100%` | `#FFFFFF` | `text-card-foreground` | Text on cards |
| Primary | `153 100% 50%` | `#00FF87` | `bg-primary`, `text-primary` | CTAs, accents, highlights |
| Primary Foreground | `160 18% 4%` | `#0B1210` | `text-primary-foreground` | Text on primary backgrounds |
| Muted | `150 18% 12%` | `#18241F` | `bg-muted` | Subtle backgrounds |
| Muted Foreground | `158 22% 64%` | `#9ABCAC` | `text-muted-foreground` | Secondary/subtle text |
| Border | `157 18% 15%` | `#20332A` | `border-border` | Borders, dividers |
| Ring | `153 100% 50%` | `#00FF87` | `ring-ring` | Focus rings |

### Extended Colors (Tailwind Config)

| Name | Hex | Tailwind Class | Usage |
|------|-----|----------------|-------|
| Primary Hover | `#00CC6A` | `hover:bg-primary-hover` | Primary button hover |
| Surface Card | `#18241F` | `bg-surface-card` | Alternative card background |
| Text Dim | `#6B8A7A` | `text-text-dim` | Tertiary text, placeholders |

### Usage Examples

```tsx
// Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Create Tournament
</Button>

// Card
<Card className="bg-card border-border">
  <CardContent className="text-card-foreground">
    Content here
  </CardContent>
</Card>

// Secondary text
<p className="text-muted-foreground">Supporting text</p>
```

---

## Typography

### Font Family

**Lexend** - A variable font optimized for reading proficiency.

```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| 300 | `font-light` | Subtle supporting text |
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Emphasized body text |
| 700 | `font-bold` | Headings, buttons, labels |
| 900 | `font-black` | Display headlines |

### Type Scale

| Name | Class | Size/Line Height | Usage |
|------|-------|------------------|-------|
| Display XL | `text-display-xl` | 64px/72px | Hero headlines |
| Display LG | `text-display-lg` | 48px/56px | Page titles |
| Heading 1 | `text-heading-1` | 32px/40px | Section headings |
| Heading 2 | `text-heading-2` | 24px/32px | Card titles |
| Heading 3 | `text-heading-3` | 20px/28px | Subsection headings |
| Body LG | `text-body-lg` | 18px/28px | Lead paragraphs |
| Body | `text-body` | 16px/24px | Default body text |
| Body SM | `text-body-sm` | 14px/20px | Supporting text |
| Caption | `text-caption` | 12px/16px | Labels, metadata |

---

## Special Effects

### Text Glow

Use for emphasized headlines (like "Knockout Cup" in the hero):

```tsx
<span className="text-primary text-glow">Knockout Cup</span>
```

```css
.text-glow {
  text-shadow: 0 0 30px rgba(0, 255, 135, 0.2);
}
```

### Button Glow

Use for primary CTA buttons:

```tsx
<Button className="btn-glow">Create Your Tournament</Button>
```

```css
.btn-glow {
  box-shadow: 0 0 20px rgba(0, 255, 135, 0.25);
  transition: all 0.3s ease;
}
.btn-glow:hover {
  box-shadow: 0 0 30px rgba(0, 255, 135, 0.4);
  transform: translateY(-1px);
}
```

### Backdrop Blur

Use for sticky headers and overlays:

```tsx
<header className="bg-background/90 backdrop-blur-md">
```

---

## Component Patterns

### Cards

Standard card with hover effect:

```tsx
<Card className="bg-card border-border hover:border-primary/30 transition-colors">
  <CardContent>...</CardContent>
</Card>
```

### Buttons

**Primary (filled):**
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover btn-glow">
  Primary Action
</Button>
```

**Secondary (outlined):**
```tsx
<Button variant="outline" className="border-border bg-card hover:bg-muted">
  Secondary Action
</Button>
```

### Icons

Use Material Symbols Outlined:

```tsx
<span className="material-symbols-outlined text-primary">emoji_events</span>
```

Common icons:
- `emoji_events` - Trophy (logo, achievements)
- `account_tree` - Bracket structure
- `bolt` - Speed/automation
- `share` - Sharing
- `check_circle` - Checkmarks, success
- `groups` - Team/managers

### Badges

Trust badges with icon:

```tsx
<div className="flex items-center gap-2 text-muted-foreground">
  <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
  Free to start
</div>
```

---

## Spacing

Use Tailwind's default spacing scale. Common patterns:

| Context | Classes |
|---------|---------|
| Section padding | `py-16 md:py-24` or `py-20 md:py-28` |
| Card padding | `p-6` or `p-8` |
| Element gaps | `gap-4`, `gap-6`, `gap-8` |
| Max content width | `max-w-7xl mx-auto` |

---

## Responsive Breakpoints

Use Tailwind defaults:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

Common patterns:
```tsx
// Stack to grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Responsive text
<h1 className="text-4xl md:text-5xl lg:text-display-xl">

// Responsive padding
<section className="px-4 md:px-8 py-16 md:py-24">
```

---

## Do's and Don'ts

### Do

- Use semantic color tokens (`bg-primary`) not raw hex values
- Apply hover states with transitions (`transition-colors`)
- Use `backdrop-blur` for overlays on dark backgrounds
- Keep text readable with sufficient contrast
- Use the glow effects sparingly for emphasis

### Don't

- Don't use the old colors (midnight, navy, gold)
- Don't mix font families (stick to Lexend)
- Don't use pure white backgrounds (use `bg-card` or `bg-muted`)
- Don't forget focus states for accessibility
- Don't overuse glow effects (reserve for primary CTAs)

---

## Migration Notes

### Removed Colors

The following colors from the old theme should no longer be used:

- `midnight` (#0D1F3C) - Replace with `background`
- `navy` (#1A3A5C) - Replace with `card`
- `gold` (#C9A227) - Replace with `primary`
- `gold-light` (#E8D5A3) - Replace with `muted-foreground`

### Font Change

- Old: Inter
- New: Lexend

Update any hardcoded font-family references.
