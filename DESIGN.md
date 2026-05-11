# Floom Starter Design System

This document is the visual contract for `floom.dev`, `starter.floom.dev`, and every static page in this repo.

## Brand Position

Floom is not a prompt directory. Floom is the curated capability layer that makes agents behave better after one install.

Primary message:

```text
Your agents become better after installing Floom.
```

Do not frame the product as a generic list of markdown files.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#fafaf7` | Page background |
| `--ink` | `#050505` | Text, borders, primary buttons |
| `--muted` | `#333333` | Body copy |
| `--blue` | `#0094ff` | Data lift, copied state, Codex accent |
| `--link` | `#b8299a` | Links, active nav, text links |
| `--cloud-pink` | `#ff4fd8` | Hero atmosphere only |
| `--line` | `2px solid var(--ink)` | Strong borders |
| `--sans` | `Inter, system-ui, sans-serif` | UI and marketing copy |
| `--mono` | `JetBrains Mono, SF Mono, monospace` | Commands, metrics, technical labels |

## Typography

Use compact editorial type. Large headings are allowed only on the landing hero and major proof sections.

Rules:

- Display headings: 700 or 800 weight, tight line-height, no all-caps.
- Navigation, labels, and buttons: uppercase, heavy weight, wide tracking.
- Body copy: 500 to 600 weight, generous line-height, no low-contrast gray.
- Commands and technical metadata: mono.

## Components

### Navigation

The header is sticky on docs, library, and skill pages. It uses the wordmark at left and compact uppercase links at right.

Active links use `--link`, not blue.

### CTA Buttons

Primary install CTAs use black fill, white text, 2px black border, 14px radius, and a copy icon. The default public command is:

```bash
npx @floomhq/starter install --global
```

### Cards

Cards use the paper surface, black or soft black borders, and small radii. Avoid nested cards. Proof cards can use a soft paper fill, but the border carries the structure.

### Proof Visuals

The landing proof sequence has three jobs:

1. Curated skills improve task success.
2. The selected skills matter more than raw count.
3. Installed skills need activation rules to fire reliably.

Use SkillsBench language precisely:

- `+16.2pp average pass-rate lift` for curated skills.
- `-2.9pp` for kitchen-sink public-index installs.
- Cite `arXiv:2602.12670`.

## Page Templates

| Page | Structure |
| --- | --- |
| Landing | Hero, proof chart, agent strip, three proof cards, FAQ, final CTA |
| Library | Sticky header, sticky filters/sidebar, searchable skill grid/list, sticky install command |
| Skill detail | Sticky header, left TOC, skill hero, files, markdown preview, final CTA |
| Docs | Sticky header, sticky TOC, command blocks, architecture sections |
| Design | Token and component reference for contributors |

## Favicon

Use a round black icon with the wedge-cut `F`. Do not use a square icon background.

## Mobile Rules

- Navigation wraps without overlap.
- CTAs stay at least 44px tall.
- Code blocks scroll horizontally inside their container.
- Sticky sidebars collapse into inline sections below 980px.
- Hero text never relies on fixed-width inline rotator spacing on narrow screens.

## Copy Rules

- Say "curated skills", "one command", "activation rules", and "all eligible agents".
- Explain that Floom installs locally and sends no telemetry.
- Avoid claiming semantic search, background sync, or cloud sync for this starter package.
- Use `fede@floom.dev` for support.
