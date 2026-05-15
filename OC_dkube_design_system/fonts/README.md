# Fonts

## In use

| Family | Role | Source | Weights |
| --- | --- | --- | --- |
| **Manrope** | Display / headlines / brand voice | Google Fonts (SIL OFL) | 400, 500, 600, 700, 800 |
| **Inter** | UI / body / sans | Google Fonts (SIL OFL) | 400, 500, 600, 700 |
| **JetBrains Mono** | Code / mono / metadata | Google Fonts (Apache 2.0) | 400, 500, 600 |

All three are loaded via the `@import` at the top of `../colors_and_type.css`
and via `<link>` in `Brand Guidelines.html`. They do not need to be vendored
locally for HTML prototypes.

## Legacy product fonts (existing DClaw Finance app)

The existing product frontend uses Raleway, Poppins, and Open Sans — those
are retained in the tokens file as `--raleway`, `--poppins`, `--opensans`
for parity with the in-app UI. New surfaces should adopt the Fraunces /
Inter / JetBrains Mono stack.

## Substitutions to flag

- **Manrope** is the display face — chosen because dkube.io uses a single
  modern sans-serif and Manrope is the closest open-source match. If the
  live site uses a different sans (Plus Jakarta Sans, DM Sans, etc.),
  replace `--display` in `colors_and_type.css`.
