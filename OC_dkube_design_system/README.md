# One Convergence — Design System

> Vol. 01 / 2026 · Maintained by Brand & Design, One Convergence

This project is the brand & design system for **One Convergence**, the parent
company behind **DKube** — an enterprise MLOps / AI platform. It contains the
visual foundations (color, type, spacing), the logo system, voice & tone, a
brand‑book HTML page, and a UI kit that mirrors the existing product
frontend.

---

## Sources

The system was built from these inputs (the reader may or may not have access;
links retained for traceability):

| Source | Type | Notes |
| --- | --- | --- |
| `frontend/` (mounted local folder) | Next.js 14 · React 18 · Tailwind 3 · shadcn/ui | Active product codebase. Includes the original "OneConvergence Design System" CSS variables in `src/app/globals.css`. Existing tokens were lifted forward; this system extends them with editorial typography (Fraunces) and a refined component spec for the brand book. |
| User brief (Vol. 01 spec) | Pasted | Defines the brand‑book aesthetic — editorial, white + purple dominant, sharp corners, no gradients. |
| `frontend/src/app/page.tsx`, `layout.tsx` | Existing UI | Source of truth for product UI patterns. |
| `frontend/src/components/ui/*` | shadcn/ui-style components | Reference for product‑level component conventions. |

> ⚠️ The mounted codebase is named `dclaw-finance-frontend`. It is a finance
> application that *uses* the One Convergence design system as its theme.
> Where the brand guidelines page and the existing product diverge in style
> (pill buttons vs. sharp buttons, soft shadow vs. no shadow) the **brand
> guidelines** win — the product UI is treated as an older artifact that
> predates this volume.

---

## What's in this project

| Path | Purpose |
| --- | --- |
| `Brand Guidelines.html` | The single‑page brand style guide. The main deliverable. |
| `colors_and_type.css` | All design tokens. CSS custom properties for color, type, spacing, motion, radius. |
| `SKILL.md` | Agent Skill entry point — makes this system usable by Claude Code. |
| `assets/` | Logos, glyphs, and other visual assets. |
| `fonts/` | Webfont references. |
| `preview/` | Small HTML cards for each token group — populates the Design System tab. |
| `ui_kits/dkube/` | UI kit recreating core DKube product screens. |

---

## Brand architecture

```
One Convergence  (parent company, est. 2014, Santa Clara · Bengaluru)
   └─ DKube      (flagship product — end-to-end MLOps platform)
```

- Use **One Convergence** for corporate communications, partnerships,
  contracts, investor materials.
- Use **DKube** inside the product, on the product site, in developer
  marketing, docs, and technical materials.
- Endorsement formula: **"DKube — an MLOps platform by One Convergence."**

---

## CONTENT FUNDAMENTALS

> How One Convergence writes.

**Voice in one line.** Plainspoken. Technically credible. Respectful of the
reader's time and intelligence.

**Personas.** We address the reader as **you** — singular, second person.
We use **we** for One Convergence, never the royal "we." We never say
"users." We say **engineers, data scientists, platform leads, operators,
admins, customers, teams.**

**Casing.**
- **Sentence case** for headlines, page titles, buttons, menu items, and form
  labels.  ("Start a free trial", not "Start A Free Trial".)
- **Title Case** for proper product names only: One Convergence, DKube,
  Kubernetes, Kubeflow.
- **ALL CAPS** is reserved for monospaced eyebrows, metadata, and tags —
  never for emphasis in prose.

**Sentence shape.**
- Lead with the verb. *"Run distributed training on Kubernetes…"* not *"With
  DKube, you can run…"*
- One idea per sentence. Short over clever.
- Real numbers over adjectives. *"2× faster"* beats *"dramatically faster."*

**Tone dial.**
| Surface | Tone |
| --- | --- |
| Marketing & hero | Confident, declarative |
| Product UI | Neutral, instructional |
| Documentation | Precise, complete |
| Status & errors | Calm, actionable (always state what to do next) |
| Customer comms | Human, accountable |

**Banned vocabulary.** *revolutionize, supercharge, unleash, game-changing,
synergize, leverage (as a verb), best-in-class, end-to-end (without an actual
endpoint), seamlessly, cutting-edge, AI-powered (when describing a feature
that simply uses AI).*

**Emoji.** No. Not in product, not in marketing, not in docs. Acceptable in
internal Slack and informal customer email only.

**Unicode glyphs.** `→`, `·`, `½`, `×` are used as quiet typographic devices
in eyebrows, captions, and arrows. They are part of the system.

**Examples.**

> ✓ *"DKube cuts training-job setup from days to minutes."*
> ✗ *"DKube supercharges your AI workflows and unleashes 10× productivity."*

> ✓ *"Model lineage is automatic. Auditors get one URL."*
> ✗ *"Our game-changing compliance suite empowers stakeholders end-to-end."*

> ✓ *"Bring your own cluster, or run on ours. Both work."*
> ✗ *"A best-in-class hybrid cloud-native platform for the modern AI enterprise."*

---

## VISUAL FOUNDATIONS

> The aesthetic in one line: **purple on white, editorial restraint,
> enterprise legibility.**

### Color
- **Dominant:** Purple `#9057FF` and Paper `#FFFFFF` — together carry the
  identity. ~70% of any surface is paper; ~10–20% is purple.
- **Workhorse:** the Ink scale (`#141414 → #5A5A5A → #E5E5E5`) does the
  heavy lifting for type, rules, and UI chrome.
- **Accents:** Cobalt, Ember, Warm Paper — reserved for editorial moments.
  Never exceed ~5% of a surface.
- **No gradients.** Solid fills only. (One exception: the in-app product UI
  retains a soft shadow on cards — see "Existing product UI" below.)
- **Two purples, one brand.** `#9057FF` is the *real* corporate brand
  purple, sampled from the official One Convergence logo. The existing
  product (DClaw Finance, `frontend/`) ships a different, more muted
  purple `#7030A0` — retained as `--legacy-purple-500` for backward compat,
  but **all new One Convergence surfaces use `#9057FF`.** The DKube product
  mark has its own pair (`#6E55A4` / `#9783C0`) drawn from the official
  cube logo.

### Type
- **Display & headlines:** **Manrope** (variable, weights 400–800). Heavy
  weights (700/800) carry the brand at scale; italics are not used —
  emphasize via weight, color, or rule.
- **UI & body:** Inter — 400/500/600/700.
- **Code & technical:** JetBrains Mono — 400/500/600. Also used for
  monospace eyebrows, metadata, and captions.
- *Existing product UI* (DClaw Finance) ships with **Raleway / Poppins /
  Open Sans** — these are retained inside that app and listed in
  `colors_and_type.css` for parity, but new surfaces use Manrope/Inter.

### Spacing & layout
- **4px base spacing scale.** Tokens at 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **12-column macro grid.** 1320px max-width, 32px gutter, 32px page-padding.
- **Asymmetric composition** is encouraged — generous whitespace, single
  strong column, occasional pull-out.

### Backgrounds, imagery, illustration
- Backgrounds are **flat solid colors** — Paper, Mist (`#F6F5F7`), Warm
  Paper (`#FAF8F4`), or Ink (`#141414`).
- No full-bleed photography baked into the brand. Where imagery is needed
  (case studies, hero animation), it is **product UI screenshots** with a
  thin ink border, or **data visualizations**. Never stock photography.
- No hand-drawn illustrations, no decorative patterns, no textures.
- No background gradients. Ever.

### Borders, rules, dividers
- **Thin 1px rules** in `#E5E5E5` for inline dividers and table rules.
- **1px Ink rules** (`#141414`) for section breaks and bordered cells.
- Dotted rules are acceptable in tables and forms.
- No drop shadows for separation — use rules.

### Corner radii
- Brand guidelines page: **2px** for buttons, inputs, badges. **0px** for
  bordered cells.
- Product UI (existing DClaw app): inherits **10px** card radius and
  **rounded-full** pill buttons. This is a deliberate divergence — the
  product is from an earlier phase of the system.
- Future products should adopt the brand guidelines radii (0–4px).

### Shadows & elevation
- Brand guidelines page: **no shadow.** Period.
- Product UI: a single approved shadow — `0 2px 15px rgba(0,0,0,0.06–0.08)` —
  used only on cards, never on inputs or buttons. Optional purple-tinted
  hover shadow: `0 2px 20px rgba(112,48,160,0.3)`.
- New marketing surfaces: no shadow.

### Animation & motion
- **Duration:** 120ms (fast), 200ms (default), 320ms (slow).
- **Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` for almost everything. Linear
  is acceptable for marquee/loading indicators only.
- **What we animate:** color and background-color on hover/focus, opacity on
  reveal, border on focus.
- **What we don't:** transform-based bounces, scale-pops, parallax,
  scroll-jacking.

### Hover / press states
- **Hover (button primary):** background shifts from Purple 500 → Purple 700.
- **Hover (link):** color shifts from Ink → Purple 500; underline appears.
- **Hover (card):** thin border darkens from `#E5E5E5` → `#141414`. No lift.
- **Press:** no scale-down. Background goes one shade darker than hover.
  Active state on inputs: 3px Purple 50 focus ring.
- *Existing product UI* uses a more decorative purple-tinted hover shadow on
  cards — retained for product parity, not extended.

### Transparency & blur
- Transparency is used for overlays only (modal scrim: `rgba(20,20,20,0.6)`).
- Backdrop-blur is used at most once per surface — for sticky toolbars on
  scroll. Never decoratively.

### Cards & containers
- Bordered card: 1px Ink border, 0px radius, no shadow, paper background.
  Used in brand book, marketing, and editorial.
- Soft card (product UI only): 1px `#E5E5E5` border, 10px radius, soft
  shadow `0 2px 15px rgba(0,0,0,0.08)`.
- Maximum nesting depth: 2. A card inside a card inside a card is wrong.

### Layout rules
- Section padding: `96px` top/bottom (desktop), `64px` (tablet), `48px`
  (mobile).
- Sticky elements (top nav, scroll progress) have a 1px Ink bottom border.
- Page footer is on the Ink background — sets the brand close.

### Imagery color mood
- When photography or illustration is used (rare), prefer cool tones, low
  saturation, and the option to convert to monochrome. No warm orange/red
  imagery. No grain or film texture.

---

## ICONOGRAPHY

> See `assets/` for SVG sources.

- **Primary icon system:** [Lucide](https://lucide.dev) (already a dependency
  of the product frontend: `lucide-react@0.400`). Stroke-only, 1.5px stroke,
  rounded line-caps, 24×24 grid. This is the in-product set.
- **Brand glyphs:** The One Convergence parent mark and the DKube product
  badge live in `assets/` as standalone SVGs. They are the only "decorative"
  illustrations sanctioned by the system.
- **Editorial arrows:** `→`, `↗`, `↘`, `→` as Unicode in mono captions.
  Used for tone dials, "we say / we don't say" labels, and footer marks.
- **Emoji:** Not used. See content fundamentals.
- **Unicode used as iconography:** `→ · ½ × ✓` — all set in JetBrains Mono.
- **Status icons in product UI:** Lucide `check-circle-2`, `alert-triangle`,
  `x-circle`, `info` — always paired with a textual label and the matching
  semantic color.

The brand‑book page draws the OC and DKube marks inline as small SVGs (see
`Brand Guidelines.html`) and copies of these are exported into `assets/`.

---

## File index

```
README.md                  ← you are here
SKILL.md                   ← Agent Skill entry point
Brand Guidelines.html      ← single-page brand style guide (main deliverable)
colors_and_type.css        ← all design tokens

assets/
  oc-mark.svg              ← One Convergence primary mark
  oc-mark-mono.svg         ← Monochrome version
  oc-glyph.svg             ← Glyph only (favicon, avatar)
  dkube-mark.svg           ← DKube product mark
  dkube-mark-reversed.svg

fonts/
  README.md                ← font sources and substitution notes

preview/
  *.html                   ← small cards rendering each token group

ui_kits/
  dkube/
    README.md
    index.html             ← interactive prototype of DKube product
    *.jsx                  ← component recreations
```

---

## Caveats & substitutions

- **Manrope is the display + headline face.** The brief asked for fonts
  pulled from `dkube.io`. The site's Webflow CSS could not be inspected
  directly, but visual inspection shows a single modern sans-serif with no
  serif aesthetic. Manrope is the closest open-source match for the
  enterprise-AI tone and is what the system commits to. **If One
  Convergence has a licensed display face** (e.g. the actual font used on
  dkube.io if it differs from Manrope), swap `--display` in
  `colors_and_type.css` and the change propagates everywhere.
- **Inter** is used for UI body and serves as Manrope's fallback. The
  existing product still ships Raleway/Poppins/Open Sans — both are listed
  in tokens for backward compat.
- **DKube logo** is the official trademarked isometric-cube mark, drawn
  inline in SVG using the brand purples sampled from the AVIF source
  (`#6E55A4` dark face, `#9783C0` light face, `#D5D5D5` floor). The AVIF
  original lives at `assets/dkube-mark-official.avif`.
- **One Convergence parent mark** is the official OC monogram — two
  interlocking outlined rings reading as O + C, set in `#9057FF`. The
  source PNG provided by the brand owner is preserved at
  `assets/oc-logo-official.png`. The SVG recreation lives at
  `assets/oc-glyph.svg` (+ mono and reversed variants) and is what gets
  inlined across the brand book.
- The existing finance product (`dclaw-finance-frontend`) sits visually
  *inside* the One Convergence design system but predates this volume of
  the brand book. We retain its pill buttons and soft shadows in the product
  UI kit; the brand guidelines define the forward direction.
