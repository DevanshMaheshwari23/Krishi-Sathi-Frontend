# Krishi Sathi Redesign Specification

## Visual Direction

- Style: **Modern earthy premium**
- Theme support: **light + dark**
- Tone: practical, confident, field-friendly readability

## Typography

- Display: `Sora`
- Body and UI text: `Source Sans 3`
- Scale:
  - Display XL: 3rem / 1.1
  - Heading L: 2rem / 1.2
  - Heading M: 1.5rem / 1.3
  - Body: 1rem / 1.5
  - Caption: 0.875rem / 1.4

## Semantic Color Tokens

- Brand: moss/leaf gradient with warm amber accent.
- Semantic tokens drive all surfaces instead of fixed utility colors.
- Required tokens:
  - background, surface, surface-muted, surface-strong
  - text, text-muted, text-soft
  - border, border-strong
  - primary, primary-foreground, accent
  - success, warning, danger, info

## Spacing and Shape

- Base spacing scale: 4, 8, 12, 16, 24, 32, 48
- Radius scale:
  - small 10px
  - medium 14px
  - large 20px
  - pill 999px

## Elevation

- Card shadow: subtle default, stronger on hover/focus.
- Interactive surfaces use border + shadow, no heavy blur dependence.

## Motion Rules

- Page entry: 150-260ms fade/slide.
- Interactive hover/press: 80-140ms.
- Expand/collapse: 180-240ms.
- Respect `prefers-reduced-motion`: disable non-essential motion.

## Accessibility Guardrails

- Minimum contrast 4.5:1 for body text.
- Focus-visible ring on interactive controls.
- Dialogs, palettes, and menus keyboard navigable.
- Form errors include clear inline messages and icon/color support.

## Component Inventory

- Core primitives:
  - Button, Input, Textarea, Select, Card, Badge, Tabs, Modal, Skeleton
- Layout primitives:
  - AppShell, PageShell, PageHeader, StatCard, SectionCard, EmptyState, FilterBar
- Utility blocks:
  - Toast provider, command palette, notification center, chat widget

## Implementation Rules

- Avoid dynamic Tailwind string interpolation for color variants.
- Use explicit variant maps and semantic token classes.
- Keep route-level code splitting on page boundaries.
- Keep API and business behavior unchanged unless fixing integration defects.
