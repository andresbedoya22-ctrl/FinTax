# UI Design Skill – FinTax Premium Aesthetic

## Reference products (study these aesthetics)
- Linear.app — dark, dense, editorial hierarchy
- Vercel Dashboard — glass surfaces, monospace data
- Stripe Dashboard — structured data tables, trust signals
- Craft.do — typography-first, serif + sans mixing
- Raycast — compact density, copper/warm accent tones

## Core visual principles

### 1. Layered depth (not flat)
Every screen has 3 depth levels:
- Level 0: `bg-bg` — the page background (darkest)
- Level 1: `bg-surface/70 backdrop-blur-xl` — cards, panels
- Level 2: `bg-surface2/35` — nested elements, inputs, subtabs

### 2. Typographic contrast
Never use one font weight throughout. Mix:
- `font-heading font-semibold tracking-[-0.03em]` for titles
- `font-medium text-text` for labels
- `text-secondary` for body
- `text-muted text-xs` for metadata
- `font-mono text-green` for amounts and data

### 3. Accent economy
- Copper = editorial, hover, featured borders
- Green = success, active state, primary action, positive amounts
- Teal = informational labels, neutral icons
- Never use all three on the same component

### 4. Motion as feedback
- Hover: `transition-all duration-200` always
- Entry: `opacity-0 → opacity-100` + `translateY(8px) → 0`
- Never sudden appearance — always fade or slide

## Patterns library

### Hero stat card
```tsx
<div className="editorial-frame hairline-copper bg-surface/65 p-5">
  <p className="text-xs uppercase tracking-[0.16em] text-muted">Label</p>
  <p className="mt-2 font-mono text-3xl font-semibold text-green">EUR 1,286</p>
  <p className="mt-1 text-xs text-secondary">+12% vs vorig jaar</p>
</div>
```

### Two-column info card
```tsx
<div className="editorial-frame bg-surface/65 p-5">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">Field A</p>
      <p className="mt-1 text-sm font-medium text-text">Value A</p>
    </div>
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">Field B</p>
      <p className="mt-1 text-sm font-medium text-text">Value B</p>
    </div>
  </div>
</div>
```

### Step indicator inline
```tsx
<div className="flex items-center gap-2">
  <span className="grid h-6 w-6 place-items-center rounded-full border border-copper/40 bg-copper/10 text-xs font-semibold text-copper">
    3
  </span>
  <span className="text-sm font-medium text-text">Step title</span>
  <span className="ml-auto text-xs text-muted">2 of 5</span>
</div>
```

### Notification/alert row
```tsx
<div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-3">
  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
  <div>
    <p className="text-sm font-medium text-text">Action required</p>
    <p className="text-xs text-secondary">Upload missing document to continue</p>
  </div>
</div>
```

### Progress bar with label
```tsx
<div>
  <div className="mb-1.5 flex items-center justify-between">
    <span className="text-xs text-muted">Profile completeness</span>
    <span className="font-mono text-xs text-green">68%</span>
  </div>
  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
    <div
      className="h-full rounded-full bg-gradient-to-r from-green to-copper transition-all"
      style={{ width: "68%" }}
    />
  </div>
</div>
```

### Empty state (editorial style)
```tsx
<div className="editorial-frame bg-mesh-subtle p-8 text-left shadow-panel">
  <div className="mb-5 flex items-center gap-3">
    <div className="grid h-12 w-12 place-items-center rounded-full border border-copper/25 bg-copper/10 text-copper">
      <FileText className="h-5 w-5" />
    </div>
    <div className="h-px w-14 bg-gradient-to-r from-copper/45 to-transparent" />
  </div>
  <h3 className="font-heading text-2xl tracking-[-0.03em] text-text">No cases yet</h3>
  <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Start by selecting a service below.</p>
  <div className="mt-5">
    <Button size="md">Start your first case</Button>
  </div>
</div>
```

### Wizard step layout
```tsx
<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
  {/* Main content */}
  <div className="space-y-5">
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-copper">Step 2 of 5</p>
      <h2 className="mt-2 font-heading text-2xl tracking-[-0.03em] text-text">Personal details</h2>
    </div>
    {/* form fields */}
  </div>
  {/* Sidebar stepper */}
  <div className="hidden lg:block">
    <Stepper steps={steps} currentStep={2} />
  </div>
</div>
```

## Anti-patterns (reject these when reviewing code)
| Bad | Good |
|-----|------|
| `className="bg-white dark:bg-gray-900"` | `className="bg-bg"` |
| `className="text-gray-500"` | `className="text-muted"` |
| `className="rounded-lg border shadow-md"` | `className="editorial-frame shadow-panel"` |
| `className="font-bold text-xl"` | `className="font-heading text-xl tracking-[-0.02em]"` |
| `className="p-4"` on desktop card | `className="p-5 sm:p-6"` |
| `href="#"` | real route or handler |
| Hardcoded `"Demo User"` | `profile?.full_name ?? "..."` |
| `<div className="flex gap-2">` for status | proper Badge component |
