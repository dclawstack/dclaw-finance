# DKube — UI Kit

> Vol. 01 / 2026 · One Convergence

This UI kit is a high-fidelity recreation of the **DKube** product surface
built using the same patterns as the existing One Convergence product
frontend (Next.js 14 · React 18 · Tailwind 3 · shadcn/ui · Raleway / Poppins
/ Open Sans).

It is **not** the brand-book editorial system — that lives in `Brand Guidelines.html`
at the project root. This kit represents the *in-product* face of the
brand: pill buttons, soft shadows, 10px card radius, the OneConvergence
purple-on-hover treatment, and dense data tables.

## Sources

- `frontend/src/app/globals.css` — design tokens
- `frontend/src/app/layout.tsx` — top nav, brand lockup
- `frontend/src/app/page.tsx` — dashboard, KPI cards, charts
- `frontend/src/components/ui/{button,card,badge,input,table}.tsx`

## Screens covered

1. **Top nav** — sticky bar with brand, primary nav, "Ask AI" pill CTA
2. **Project dashboard** — KPI strip, run timeline, recent pipelines
3. **Pipeline detail** — DAG view, run summary, logs panel
4. **Models / registry** — model table with lineage badges
5. **Notebook launcher** — workspace picker, GPU configurator

Run `index.html` in a browser. The kit uses React + Babel + Tailwind CDN
so no build step is needed.
