# DClaw Finance — Design System

> Based on **One Convergence Vol. 01** (`OC_dkube_design_system/`)
> Signature: Purple `#7030A0` · White `#FFFFFF`
> Last updated: May 2026 · **v1.4**

---

## Dual Typography System

Two frontend apps; each uses a different font configuration:

### `frontend/` — Docker app (Manrope / Inter / JetBrains Mono)

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
| Code / Labels | **JetBrains Mono** | 400, 500 | Eyebrows, metadata, invoice numbers |

### `web/` — Vercel app (Raleway / Poppins / JetBrains Mono)

Loaded via Google Fonts link in `layout.tsx`:

| Role | Font | Used for |
|---|---|---|
| Display / Headlines | **Raleway** | Hero headlines, section titles, card headings |
| Body / UI | **Poppins** | Body text, nav links, CTAs |
| Code / Mono | **JetBrains Mono** | Feature tags, mono labels |

> [!note] The `web/` landing page uses `fontFamily: "'Raleway', sans-serif"` and `fontFamily: "'Poppins', sans-serif"` as inline styles on components. Do not switch to `next/font` — Vercel build will timeout on Docker targets.

---

## Color Palette

### Brand Purples (One Convergence)

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--p500` / `--oc-purple` | `#7030A0` | 281 53% 41% | Primary — buttons, accents, active borders |
| `--p300` / `--oc-purple-light` | `#B180F8` | 270 90% 74% | Hover states, chart lines (dark bg only) |
| `#c084fc` | Tailwind purple-400 | Landing page tags, arrows, shimmer |
| `--p700` / `--oc-purple-dark` | `#4A1F6C` | 281 58% 37% | Deep accent, pressed states |
| `--p100` | `#E7D8F4` / `#ece6f5` | — | Subtle borders on purple surfaces |
| `--p50` | `#F5EEFB` / `#f3e8ff` | — | Tag/badge backgrounds |
| `--p25` | `#FAF6FD` / `#faf6ff` | — | Whisper background, card tint |

### Landing Page Dark Backgrounds

| Value | Usage |
|---|---|
| `#0d0618` | Hero, How It Works, Open Source CTA backgrounds |
| `#080410` | Footer background |
| `#1a0a2e` | India First gradient start |
| `#2d0a4e` | India First gradient middle |

### Ink Scale (Text & Chrome)

| Token | Hex | Usage |
|---|---|---|
| `--ink` / `#141414` / `#1a0a2e` | `#141414` | Primary text |
| `--ink-3` / `#5A5A5A` | `#666` (web/) | Body text, descriptions |
| `--rule` | `#E5E5E5` | Hairline dividers |

### Semantic (Finance)

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#18A957` | Paid invoices, positive states |
| `--warning` | `#C2870B` | Pending, due soon |
| `--error` | `#C2240C` | Overdue, destructive |
| Emerald-400/500 | `#34d399`/`#10b981` | Live roadmap indicators, positive trends |

---

## INR Currency Formatting

All amounts displayed in Indian Rupees. Defined in `src/lib/utils.ts` (both `frontend/` and `web/`):

```typescript
formatINR(amount: number): string
  ≥ ₹1,00,00,000  →  "₹X.XX Cr"   // 1 crore+
  ≥ ₹10,00,000    →  "₹X.X L"     // 10 lakhs+ (1 decimal)
  ≥ ₹1,00,000     →  "₹X.XX L"    // 1 lakh+ (2 decimal)
  < ₹1,00,000     →  "₹X,XXX"     // Indian number grouping

inrAxisTick(v): string              // compact form for Recharts Y-axes
  ≥ 1Cr → "₹XCr"  |  ≥ 1L → "₹XL"  |  ≥ 1K → "₹XK"
```

> [!warning] B2 (open defect): `web/src/app/invoices/new/page.tsx` still shows `$` for line item amounts — `formatINR()` not applied there. See [[Finance-v1.4-Roadmap]] B2.

---

## Component Tokens (`frontend/` app)

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

Custom finance state badges:
```tsx
<Badge className="badge-paid">     // success-subtle bg, success text
<Badge className="badge-overdue">  // destructive/10 bg, destructive text
<Badge className="badge-draft">    // muted bg, muted-foreground text
```

### Select (`components/ui/select.tsx`) ⚠ Rewritten

Custom dropdown using React Context — previous native `<select>` did not render `<div>`-based `SelectItem` children.

- `Select` manages open/closed state + selected value via `Ctx` context
- `SelectItem` calls `register(value, label)` in `useLayoutEffect` on mount
- `SelectContent` renders as absolutely-positioned overlay

### Tabs (`components/ui/tabs.tsx`) ⚠ Rewritten

React Context-based — previous implementation only supported `defaultValue`.

- Supports both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) modes
- `TabsContent` renders only when `active === value`

---

## `web/` Landing Page Components

The Vercel-native `web/` app uses inline Tailwind + custom patterns (not shadcn components):

| Pattern | Classes |
|---|---|
| Light section card | `bg-[#faf6ff] border border-[#ece6f5] rounded-2xl p-6` |
| Dark section card | `bg-white/5 border border-white/10 rounded-2xl p-8` |
| Section badge (light) | `text-xs font-bold tracking-[0.2em] uppercase text-[#7030A0] bg-[#f3e8ff] px-4 py-2 rounded-full` |
| Section badge (dark) | `text-[#c084fc] bg-white/10 rounded-full` |
| Feature tag | `text-[10px] bg-[#1a0a2e] text-white px-2.5 py-1 rounded-full font-mono` |
| Phase pill (roadmap) | `text-[10px] font-bold tracking-[0.15em] uppercase text-[#9d6dc7] bg-[#f3e8ff] px-2.5 py-1 rounded-full font-mono` |
| Shimmer text | `.shimmer-text` — purple gradient + `animation: shimmer 4s linear infinite` |
| Dot grid bg | `.dot-grid` — `radial-gradient(circle, rgba(160,100,220,0.25) 1px, transparent 1px)` |
| Float animation | `.float-card` — `translateY(0px) ↔ translateY(-12px)` over 5s |
| `FadeUp` | Custom component — IntersectionObserver; `translateY(40px) → 0`, opacity 0 → 1 |

---

## Navbar (Layout)

### `frontend/` app — `frontend/src/app/layout.tsx`

- White background, subtle bottom shadow
- Purple bold "DClaw" wordmark + grey "Finance" on left
- Nav links: Dashboard · Invoices · Expenses · Cash Flow · Forecast · Reports · Budgets · Clients
- "Ask AI" pill button (purple) on right

### `web/` app — no persistent navbar

The Vercel app renders a landing page with all navigation in the hero CTAs and footer link grid. Individual app pages (`/dashboard`, `/expenses`, etc.) have their own inline nav patterns.

---

## Recharts Configuration

Chart color assignments:
| Series | Color | Usage |
|---|---|---|
| Revenue | `#7030A0` | Primary brand purple |
| Expenses | `#C084FC` | Light purple |
| Profit | `#10B981` / green | Positive metric |
| Confidence band | `rgba(112, 48, 160, 0.15)` | Forecast shading |
| Cash inflow | `#7030A0` | Area chart |
| Cash outflow | `#C084FC` | Area chart |

All charts use `inrAxisTick()` on Y-axes.

---

## CSS Files

| File | Purpose |
|---|---|
| `frontend/src/app/globals.css` | OC design tokens, `@tailwind` directives, type scale, badge variants |
| ~~`frontend/src/app/types.css`~~ | **Deleted** — content inlined into `globals.css` |

> [!warning] Do NOT recreate `types.css`. Webpack processes CSS `@import` files in isolation without Tailwind context → `@layer components` build error.

---

## Installed Components (`frontend/`)

`badge` · `button` · `card` · `dialog` · `input` · `label` · `select` (custom) · `table` · `tabs` (custom)

---

## OC Brand Assets

Located in `OC_dkube_design_system/`:

| File | Content |
|---|---|
| `colors_and_type.css` | All design tokens as CSS custom properties |
| `Brand Guidelines.html` | Single-page brand style guide |
| `assets/oc-logo-official.png` | One Convergence parent mark |

DKube cube SVG (inline, from brand purples):
```svg
<polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="#6E55A4"/>  <!-- dark face -->
<polygon points="32,4 60,20 32,36 4,20"             fill="#9783C0"/>  <!-- light face -->
<polygon points="4,20 32,36 32,60 4,44"             fill="#D5D5D5"/>  <!-- floor -->
```

---

## Related Notes

- [[Finance-Architecture]] — stack rules, anti-patterns, model rules
- [[Finance-v1.4-Roadmap]] — all features shipped, open bugs, v2.0 backlog
