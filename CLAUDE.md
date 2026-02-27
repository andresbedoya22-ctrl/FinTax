# FinTax – Claude Code Instructions

## Stack
Next.js 16, TypeScript, Tailwind CSS, Framer Motion, Shadcn (custom), Supabase, Stripe.
Monorepo root: `src/`. Package manager: pnpm.

## Design system tokens
- Backgrounds: `--bg`, `--surface`, `--surface-2`
- Borders: `--border` (always with opacity: `border-border/35` to `border-border/70`)
- Text: `--text`, `--text-secondary`, `--text-muted`
- Accents: `--accent-green` (primary CTA), `--accent-copper` (editorial), `--accent-teal` (info)
- Radii: `--radius-sm/md/lg/xl/pill`
- Shadows: `shadow-glass`, `shadow-glass-soft`, `shadow-panel`, `shadow-floating`
- Fonts: `font-heading` (Fraunces serif), `font-body` (IBM Plex Sans), `font-mono` (IBM Plex Mono)
- Custom utility classes: `bg-mesh`, `bg-mesh-subtle`, `editorial-frame`, `surface-panel`, `surface-panel-soft`, `hairline-copper`, `focus-ring`

## Typography rules
- h1/h2: always `font-heading tracking-[-0.03em]` — never plain sans
- Eyebrows (section labels above headings): `text-xs uppercase tracking-[0.16em] text-copper` or `text-teal`
- Body copy: `text-sm leading-6 text-secondary`
- Data/amounts/IDs: `font-mono` — use for all EUR amounts, case IDs, codes
- Subtext/captions: `text-xs text-muted`
- Never use `font-bold` on body — use `font-medium` or `font-semibold`

## Spacing rules
- Card padding: `p-5 sm:p-6` on desktop, never `p-4`
- Stack gaps: `space-y-5` or `gap-5`
- Section vertical: `py-16 md:py-24`
- Tight groups: `gap-3` or `space-y-3`

## Color rules
- Never use raw Tailwind colors (blue-500, gray-400, etc.)
- Always use CSS var tokens via Tailwind aliases: `text-green`, `text-copper`, `text-teal`, `text-muted`, `text-secondary`, `text-text`
- Opacity syntax: `bg-green/10`, `border-copper/35`, `text-green/80`
- Hover borders: `hover:border-copper/35` — copper is the hover accent throughout

## Component patterns

### Card
```tsx
<div className="editorial-frame bg-surface/65 p-5 sm:p-6 hairline-copper shadow-panel">
  <p className="text-xs uppercase tracking-[0.16em] text-copper">Eyebrow</p>
  <h3 className="mt-1.5 font-heading text-xl tracking-[-0.02em] text-text">Title</h3>
  <p className="mt-2 text-sm leading-6 text-secondary">Body</p>
</div>
```

### Section header
```tsx
<div>
  <p className="text-xs uppercase tracking-[0.16em] text-copper">Eyebrow</p>
  <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">Title</h2>
  <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">Subtitle</p>
</div>
```

### Status badge
```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border border-green/35 bg-green/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-green">
  <span className="h-1.5 w-1.5 rounded-full bg-green" />
  Completed
</span>
```

### Data row
```tsx
<div className="flex items-center justify-between rounded-xl border border-border/35 bg-surface2/20 px-4 py-3">
  <div>
    <p className="text-sm font-medium text-text">Label</p>
    <p className="text-xs text-muted">Sublabel</p>
  </div>
  <span className="font-mono text-sm text-green">EUR 89.00</span>
</div>
```

### Form field
```tsx
<label className="space-y-1.5">
  <span className="text-xs uppercase tracking-[0.12em] text-muted">Field label</span>
  <Input tone="default" size="md" placeholder="..." />
  <p className="text-xs text-muted">Helper text</p>
</label>
```

## Animation (Framer Motion installed, use it)
- Entry: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}`
- Stagger list: `staggerChildren: 0.06`
- Never animate color changes — only opacity, transform, scale
- Always wrap with `AnimatePresence` for exit animations
- Respect `prefers-reduced-motion` with `useReducedMotion()`

## What makes UI look AI-generated (NEVER DO)
- Generic blue as primary color
- `rounded-lg` on all cards (use `rounded-[var(--radius-xl)]`)
- `text-gray-500` — use `text-muted` or `text-secondary`
- Flat white/dark backgrounds without layering
- Excessive uniform padding
- Default Tailwind shadows (`shadow-md`, `shadow-lg`)
- Monotonous same-size cards in every grid
- Icon + label without visual hierarchy
- Missing eyebrow labels above headings
- `font-bold` on body text

## What makes UI look professionally designed (ALWAYS DO)
- Mix serif heading + sans body in same component
- Asymmetric grids: `grid-cols-[1.1fr_0.9fr]`, `grid-cols-[2fr_1fr]`
- Layered translucent surfaces: `bg-surface/70 backdrop-blur-xl` on `bg-bg`
- Monospace numbers with `text-green` for positive amounts
- `hairline-copper` on featured/highlighted cards
- Eyebrow label before every section heading
- Progress dots, step numbers, status indicators — not just plain text
- Micro-borders with low opacity (`border-border/35`)
- Vary card proportions — not all cards the same height

## Existing components to USE (do not recreate)
- `@/components/ui`: Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Tabs, TabsList, TabsTrigger, TabsContent, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Input, Select, Textarea, Skeleton, Stepper, EmptyState, Toast, ToastProvider, useToast, Pictogram
- `@/components/fintax`: Navbar, Footer, Button (fintax variant), Card+CardHeader+CardBody, Badge, Container, Section, LanguageSwitcher
- `@/components/fintax/dashboard`: DashboardShell, DashboardSidebar, DashboardTopbar, DashboardNotifications
- `@/hooks/useCurrentProfile` — always use for real profile data, never hardcode user info
- `@/lib/mock-data` — fallback only when Supabase unavailable

## Strict rules
- No new npm packages without explicit approval
- No Radix UI (all components are custom)
- No `any` in TypeScript
- No hardcoded colors outside token system
- No inline styles
- No hardcoded user data (names, emails) — use `useCurrentProfile()`
- All components: named export, TypeScript interface for props, `displayName` if using forwardRef
- Server components by default — add `"use client"` only when needed (hooks, events, browser APIs)

## Code quality checklist before finishing any component
- [ ] TypeScript types — no implicit any
- [ ] Uses design token colors only
- [ ] Has eyebrow label if it is a section
- [ ] Font-heading on h1/h2/h3
- [ ] Mobile responsive (sm: breakpoints)
- [ ] focus-ring on all interactive elements
- [ ] Loading state or Skeleton if async data
- [ ] Empty state if list can be empty
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
