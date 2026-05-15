---
name: one-convergence-design
description: Use this skill to generate well-branded interfaces and assets for One Convergence (parent company) and DKube (flagship MLOps/AI platform) — for production code or throwaway prototypes, mocks, slides, marketing pages, and product UI. Contains the brand guidelines, design tokens (color, type, spacing), logos, voice & tone, and a UI kit derived from the existing product frontend.
user-invocable: true
---

# One Convergence design skill

Read `README.md` in this skill first — it contains the brand architecture
(One Convergence → DKube), content fundamentals (voice, tone, banned
vocabulary), visual foundations (color, type, spacing, motion), and an
iconography note. Then read `colors_and_type.css` for the full token list.

## How to use this skill

1. **Get oriented.** Read `README.md` and skim `Brand Guidelines.html` —
   that page is the canonical visual reference for the brand book aesthetic.
2. **Pick the right surface mode.**
    - **Editorial / brand / marketing** — sharp 2px corners, no shadow, thin
      1px Ink rules, Fraunces display, Inter UI, white + purple dominant.
      Use the patterns in `Brand Guidelines.html`.
    - **Product UI** — soft 10px card radius, pill buttons, subtle shadow,
      Raleway / Poppins / Open Sans (legacy). Use the components in
      `ui_kits/dkube/`.
3. **Copy, don't draw.** Use the real assets in `assets/`. Use Lucide icons
   from CDN (`https://unpkg.com/lucide-static@latest/icons/...`) rather than
   drawing your own SVG. Never use emoji.
4. **Use the tokens.** Import `colors_and_type.css` and reference `--oc-purple`,
   `--ink`, `--paper`, `--space-4`, etc. Don't hand-pick new hexes.
5. **Match the voice.** When writing copy, see the "we say / we don't say"
   examples in README. Plainspoken, technically credible, no AI hype words.

## When to invoke this skill

If the user asks you to design or generate something for One Convergence or
DKube — a landing page, a deck, a pricing page, a docs site, a feature
launch, an in-app screen, a status email, a swag mock, a UI prototype —
read this skill end to end before producing output.

## Production vs. throwaway

- **Production code:** the user likely has a real frontend codebase
  (probably Next.js + Tailwind + shadcn/ui, matching the structure in
  `ui_kits/dkube/`). Hand them tokens, classnames, and component code
  rather than full HTML files.
- **Throwaway / mock / slide / prototype:** copy assets out of this
  skill and emit a single self-contained HTML file. Use Tailwind CDN or
  inline CSS that maps to the tokens.

## If invoked without context

Ask the user:
- What are you designing? (page, in-product screen, deck, asset)
- One Convergence (corporate) or DKube (product) — which brand voice?
- Production code, or a throwaway visual mock?
- Any specific section, audience, or feature in play?

Then act as the senior brand designer for One Convergence.
