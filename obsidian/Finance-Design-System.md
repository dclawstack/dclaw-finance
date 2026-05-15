# DClaw Finance — Design System

> Based on **One Convergence Vol. 01** (`OC_dkube_design_system/`)
> Signature: Purple `#7030A0` · White `#FFFFFF`
> Last updated: May 2026 · v1.2

---

## Color Palette

### Brand Purples (One Convergence)

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--p500` / `--oc-purple` | `#7030A0` | 281 53% 41% | Primary — buttons, accents, active borders |
| `--p300` / `--oc-purple-light` | `#B180F8` | 270 90% 74% | Hover states, chart lines (dark bg only) |
| `--p700` / `--oc-purple-dark` | `#4A1F6C` | 281 58% 37% | Deep accent, pressed states |
| `--p100` | `#E7D8F4` | — | Subtle borders on purple surfaces |
| `--p50` | `#F5EEFB` | — | Tag/badge backgrounds |
| `--p25` | `#FAF6FD` | — | Whisper background, card tint |

### DKube Product-Mark Purples

| Token | Hex | Usage |
|---|---|---|
| `--dkube-purple-dark` | `#6E55A4` | Cube dark face (SVG mark) |
| `--dkube-purple-light` | `#9783C0` | Cube light face (SVG mark) |
| `--dkube-floor` | `#D5D5D5` | Cube floor shadow (SVG mark) |

### Ink Scale (Text & Chrome)

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#141414` | Primary text, dark backgrounds |
| `--ink-2` | `#2A2A2A` | Secondary text |
| `--ink-3` | `#5A5A5A` | Tertiary, captions |
| `--ink-4` | `#8A8A8A` | Placeholder, disabled |
| `--rule` | `#E5E5E5` | Hairline dividers |

### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#FFFFFF` | Card backgrounds, primary surface |
| `--paper-cool` | `#F6F5F7` | Page background, UI mist |
| `--paper-warm` | `#FAF8F4` | Editorial sections |

### Semantic (Finance)

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#18A957` | Paid invoices, positive states |
| `--warning` | `#C2870B` | Pending, due soon |
| `--error` | `#C2240C` | Overdue, destructive |
| `--info` | `#1F3FBF` | Informational |

---

## Typography

Three fonts loaded via CSS `@import` in `globals.css` (not `next/font` — Docker build timeout):

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800
  &family=Inter:wght@400;500;600;700
  &family=JetBrains+Mono:wght@400;500;600&display=swap');
```

| Role | Font | Weights | Used for |
|---|---|---|---|
| Display / Headlines | **Manrope** | 700, 800 | Page titles, KPI numbers, card headings |
| Body / UI | **Inter** | 400, 500, 600 | Body text, labels, buttons |
| Code / Labels | **JetBrains Mono** | 400, 500 | Eyebrows, metadata, invoice numbers, code |

### Type Scale

| Class | Size | Weight | Use |
|---|---|---|---|
| `.type-display-lg` | 5xl | 800 | Hero KPI numbers |
| `.type-display` | 4xl | 700 | Dashboard totals |
| `.type-heading-xl` | 2xl | 600 | Page titles |
| `.type-heading-lg` | xl | 600 | Section headings |
| `.type-heading` | lg | 600 | Card titles |
| `.type-label-lg` | sm | 600 uppercase | Section eyebrows |
| `.type-label` | xs | 600 uppercase | Table headers, metadata |
| `.type-body-lg` | 17px | 400 | Lead body text |
| `.type-body` | 15px | 400 | Standard body |
| `.type-body-sm` | 12px | 400 | Helper text, captions |
| `.type-amount-xl` | 4xl tabular-nums | 800 | Large P&L numbers |
| `.type-amount-lg` | 2xl tabular-nums | 700 | Card amounts |
| `.type-amount` | lg tabular-nums | 600 | Table cells |
| `.type-amount-sm` | sm tabular-nums | 500 | Inline amounts |

> [!note] Typography classes are defined directly in `globals.css` (not `types.css` — that file was deleted; webpack processed it in isolation causing `@layer components` build error).

---

## INR Currency Formatting

All amounts displayed in Indian Rupees with auto-scaling. Defined in `src/lib/utils.ts`:

```typescript
formatINR(amount: number): string
  ≥ ₹1,00,00,000  →  "₹X.XX Cr"   // 1 crore+
  ≥ ₹10,00,000    →  "₹X.X L"     // 10 lakhs+ (1 decimal)
  ≥ ₹1,00,000     →  "₹X.XX L"    // 1 lakh+ (2 decimal)
  < ₹1,00,000     →  "₹X,XXX"     // Indian number grouping

inrAxisTick(v): string              // compact form for Recharts Y-axes
  ≥ 1Cr → "₹XCr"  |  ≥ 1L → "₹XL"  |  ≥ 1K → "₹XK"
```

---

## Component Tokens

### Button (`components/ui/button.tsx`)

| Variant | Background | Text | Hover |
|---|---|---|---|
| `default` | `#7030A0` | white | `#B180F8` |
| `outline` | white | `#7030A0` | `#7030A0` bg, white text |
| `destructive` | `#ed3c0d` | white | `#e6573f` |
| `secondary` | `#f7f7f7` | `#444444` | `#ededed` |
| `ghost` | transparent | `#7030A0` | purple-50 bg |

Shape: `rounded-full` (pill). Focus ring: 2px `#7030A0`.

### Card (`components/ui/card.tsx`)

- Border: `1px solid #ededed`
- Background: `#FFFFFF`
- Shadow: `0px 2px 15px rgba(0,0,0,0.08)`
- Radius: `10px` (`rounded-[10px]`)
- `CardTitle` uses Raleway font

### Badge (`components/ui/badge.tsx`)

| Variant | Style |
|---|---|
| `default` | purple bg, white text |
| `secondary` | `#f7f7f7` bg, `#444` text |
| `destructive` | red-100 bg, red-700 text |
| `outline` | purple border, purple text, white bg |

Shape: `rounded-full`. Custom className overrides for finance states:
```tsx
<Badge className="badge-paid">     // success-subtle bg, success text
<Badge className="badge-overdue">  // destructive/10 bg, destructive text
<Badge className="badge-draft">    // muted bg, muted-foreground text
```

### Select (`components/ui/select.tsx`) ⚠ Rewritten

**Custom dropdown using React Context** — previous native `<select>` did not render `<div>`-based `SelectItem` children as options.

- `Select` manages open/closed state + selected value via `Ctx` context
- `SelectItem` calls `register(value, label)` in `useLayoutEffect` on mount
- `SelectContent` renders as absolutely-positioned overlay, hidden when `open=false`
- Outside-click handler on the root `<div ref>` closes dropdown

### Tabs (`components/ui/tabs.tsx`) ⚠ Rewritten

**React Context-based** — previous implementation only supported `defaultValue`, not controlled `value`/`onValueChange`.

- `Tabs` provides `TabsContext` with `active` state and `setActive` callback
- Supports both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) modes
- `TabsTrigger` reads/writes context; `TabsContent` renders only when `active === value`

---

## Navbar (Layout)

File: `frontend/src/app/layout.tsx`

- White background, subtle bottom shadow
- Purple bold "DClaw" wordmark + grey "Finance" on left
- Nav links in `#545454`, purple underline + color on hover
- "Ask AI" pill button (purple, hover lightens) on right
- 8 links: Dashboard · Invoices · Expenses · Forecast · Reports · Budgets · Clients *(Ask AI in nav button)*

---

## CSS Files

| File | Purpose |
|---|---|
| `frontend/src/app/globals.css` | All CSS — OC design tokens, `@tailwind` directives, type scale classes, badge variants, semantic helpers |
| ~~`frontend/src/app/types.css`~~ | Deleted — content inlined into `globals.css` |

> [!warning] Do NOT recreate `types.css` as a separate file. Webpack processes CSS `@import` files in isolation without the Tailwind context, causing `@layer components` build errors.

---

## Installed Components

`badge` · `button` · `card` · `dialog` · `input` · `label` · `select` (custom) · `table` · `tabs` (custom)

---

## OC Brand Assets

Located in `OC_dkube_design_system/`:

| File | Content |
|---|---|
| `colors_and_type.css` | All design tokens as CSS custom properties |
| `Brand Guidelines.html` | Single-page brand style guide |
| `assets/oc-logo-official.png` | One Convergence parent mark |
| `assets/dkube-mark-official.avif` | DKube official cube logo |
| `uploads/Dkube_Icon_Logo_Purple.avif` | DKube icon in brand purple |

DKube cube SVG (inline, from brand purples):
```svg
<polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="#6E55A4"/>  <!-- dark face -->
<polygon points="32,4 60,20 32,36 4,20"             fill="#9783C0"/>  <!-- light face -->
<polygon points="4,20 32,36 32,60 4,44"             fill="#D5D5D5"/>  <!-- floor -->
```

---

## Related Notes

- [[Finance-Architecture]] — stack rules, anti-patterns, model rules
- [[Finance-v1.2-Roadmap]] — all features shipped, v2.0 backlog
