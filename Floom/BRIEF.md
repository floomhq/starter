# Floom — Cursor Composer Brief

## What is Floom

Floom is a skills marketplace for AI agents. It lets users find, install, and manage reusable skill packages that improve agent task performance across Claude, Codex, Cursor, Gemini, Kimi, and more. Built by Federico and Adam, two founders based at Frontier Tower, SF.

---

## File Structure

```
Floom/
├── home.html               # Home (main landing)
├── index.html             # Alternate fold-layout prototype (Home links to home.html)
├── skills.html             # Skills browser
├── docs.html               # Docs
├── about.html              # About (hero-only stub)
├── library.html            # Library / dashboard prototype (not primary nav)
├── settings.html           # Settings
├── signin.html             # Sign in
├── floom-pages.css         # Shared design system CSS
├── design-tokens.css       # Token overrides
└── assets/
    ├── about-hero.jpg      # Golden Gate Bridge photo
    └── dithering-blue.png
```

---

## Design System

All pages use `floom-pages.css` as the base. Key tokens:

```css
--paper: #fafaf7       /* page background */
--ink: #050505         /* primary text + borders */
--muted: #333333
--blue: #0094ff        /* brand accent, links, hover states */
--blue-soft: #bfe6ff
--blue-pale: #eaf7ff
--cloud-pink: #ff4fd8
--line: 2px solid var(--ink)
--sans: Inter, ui-sans-serif ...
--mono: JetBrains Mono, SF Mono ...
```

**Aesthetic:** Swiss/editorial. Heavy black borders (`--line`), paper background, tight uppercase labels with wide letter-spacing, no rounded corners on structural elements, flat shadows.

**Typography:**
- Wordmark: 28px, weight 900, letter-spacing -0.06em
- Eyebrow/labels: 12px, weight 900, letter-spacing 0.16em, uppercase, color `--blue`
- H1: clamp(56px, 5.8vw, 84px), weight 700, letter-spacing -0.035em
- Lead/body: 19–21px, weight 500, line-height 1.65, color #242424

**Links:** `color: var(--blue)`, `text-decoration: none` — no underlines.

**Nav pattern (every page):**
```html
<nav class="nav">
  <a class="wordmark" href="home.html">
    <strong>Floom</strong>
    <span>Open source · MIT</span>
  </a>
  <div class="nav-right">
    <div class="nav-links">
      <a href="home.html">Home</a>
      <a href="skills.html">Skills</a>
      <a href="docs.html">Docs</a>
      <a href="about.html" aria-current="page">About</a>
    </div>
  </div>
</nav>
```

---

## About page (`about.html`)

Nav label **About**. Page shows the Golden Gate Bridge hero image (`assets/about-hero.jpg`) in a bordered frame only — **no founder or team body copy** on this static prototype.

**Reference copy — not emitted in prototype HTML:**

> Floom is being built by Federico and Adam. We wanted a way to increase our agent's task performance and realized the effective use of skills is one of the best ways to do that. Once it worked for us we wanted to share it with you.
>
> We are just two guys in a room at Frontier Tower burning an outrageous amount of tokens per second.
>
> Many more features to come soon so you can get the most out of life and your agents.
>
> Stay tuned!

**(When used again)** Federico → https://x.com/fedeponte1 · Adam → https://x.com/adamthesalmon · Frontier Tower → https://maps.app.goo.gl/RxAswngFcjRHxxxo7

---

## Landing Page (`home.html`)

Single self-contained file (~3,100 lines, inline CSS + JS). Sections in order:

1. **Nav**
2. **Hero** — animated agent rotator in headline (Claude, Cursor, Codex, Gemini, Kimi, OpenCode), terminal-style CTA button
3. **Skills browser** — filterable category accordion, 90 skills across 11 categories
4. **How it works** — skill match panel with animated search demo
5. **Social proof / testimonials**
6. **Final CTA** — download skills pack

---

## Dev Server

Running via `npx serve` on `http://localhost:8080`. Serves from the `Floom/` directory root.

---

## Design Principles to Preserve

- No rounded corners on images or structural containers
- Links: brand blue (`#0094ff`), no underline
- Borders are always `2px solid #050505`
- Keep it minimal — no decorative gradients or shadows on the about page
- Uppercase eyebrow labels above sections where used
