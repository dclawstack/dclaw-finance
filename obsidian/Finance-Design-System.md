# DClaw Finance — Design System

## Color Palette (Light Mode)

| Token | HSL | Usage |
|---|---|---|
| `--primary` | 161 75% 31% (Emerald-600) | CTAs, active states, logo |
| `--background` | 0 0% 100% | Page background |
| `--foreground` | 215 25% 12% | Body text |
| `--card` | 0 0% 100% | Card surfaces |
| `--secondary` | 215 20% 96% | Chip/tag backgrounds |
| `--muted` | 210 20% 98% | Section backgrounds |
| `--muted-foreground` | 215 16% 47% | Placeholder, helper text |
| `--accent` | 160 60% 96% (Emerald-50) | Hover highlights |
| `--destructive` | 0 84% 60% (Red-500) | Delete, error states |
| `--border` | 215 25% 91% | All borders |
| `--ring` | 161 75% 31% | Focus ring |

## Finance Semantic Tokens

| Token | HSL | Usage |
|---|---|---|
| `--success` | 160 84% 39% (Emerald-500) | Paid invoices, complete |
| `--success-subtle` | 160 60% 96% | Paid badge background |
| `--warning` | 38 92% 50% (Amber-500) | Pending, due soon |
| `--warning-subtle` | 48 96% 95% | Pending badge background |
| `--info` | 217 91% 60% (Blue-500) | Informational |
| `--info-subtle` | 214 100% 97% | Info badge background |
| `--profit` | 160 84% 39% | Positive P&L numbers |
| `--loss` | 0 84% 60% | Negative P&L numbers |

## Typography Classes (types.css)

| Class | Size | Weight | Use for |
|---|---|---|---|
| `.type-display-lg` | 5xl / bold | KPI hero numbers |
| `.type-display` | 4xl / bold | Dashboard totals |
| `.type-heading-xl` | 2xl / semibold | Page titles |
| `.type-heading-lg` | xl / semibold | Section headings |
| `.type-heading` | lg / semibold | Card titles |
| `.type-label-lg` | sm / semibold uppercase | Section labels |
| `.type-label` | xs / semibold uppercase | Table column headers |
| `.type-body` | sm / normal | Body text |
| `.type-body-sm` | xs / normal | Helper text, timestamps |
| `.type-amount-xl` | 4xl tabular-nums | Large KPI amounts |
| `.type-amount-lg` | 2xl tabular-nums | Card amounts |
| `.type-amount` | lg tabular-nums | Table amount cells |
| `.type-amount-sm` | sm tabular-nums | Inline amounts |

## Badge Variants (types.css)

```tsx
<Badge className="badge-paid">Paid</Badge>
<Badge className="badge-pending">Pending</Badge>
<Badge className="badge-overdue">Overdue</Badge>
<Badge className="badge-draft">Draft</Badge>
```

## Installed shadcn/ui Components

`badge` · `button` · `card` · `dialog` · `input` · `label` · `select` · `table` · `tabs`

## Files

| File | Purpose |
|---|---|
| `frontend/src/app/globals.css` | CSS custom properties, base styles |
| `frontend/src/app/types.css` | Typography scale, semantic color helpers, badge variants |
| `frontend/tailwind.config.ts` | Tailwind tokens wired to CSS vars, semantic finance colors |
