# Floom Static Prototype Context

This folder is a local static prototype for Floom, not the full
`floomhq/floom` application repo. Use it as a design and interaction reference
for Floom web surfaces.

Upstream project: https://github.com/floomhq/floom

Floom's product premise is: share AI agent skills with a link. A Floom skill can
be brand voice knowledge, company facts, onboarding docs, sales workflows,
coding standards, or later executable agent skills. The upstream repo contains
the real implementation and product docs.

## Upstream Context

The GitHub project describes these main pieces:

- `cli/` - Node 22 TypeScript CLI, published as `@floomhq/floom`.
- `mcp-sync/` - MCP server preview, published as `@floomhq/floom-mcp-sync`.
- `web/` - Next.js app and API routes, deployed to Vercel.
- `supabase/` - SQL migrations for the `skills_minimal` schema.

Version 0 is intentionally narrow: terminal publish, link share, and local add.
Markdown is the source interface. No dashboard, marketplace, or hosted execution
is in scope for V0.

Important V0 CLI/user flows from upstream:

- `floom publish <file>`
- `floom add <url-or-slug>`
- `floom info <url-or-slug>`
- `floom search <query>`
- `floom delete <url-or-slug>`
- Public raw Markdown skill endpoint
- Minimal auth

Version 1 preview adds sync/watch/setup flows, folder-aware local writes, MCP
startup/poll sync, local conflict protection, and public/starter-library search.

## What This Folder Contains

This folder contains standalone HTML/CSS pages for a Floom web concept:

- `home.html` — main marketing landing (**Home** in the shared nav).
- `skills.html` — skills pack browser (**Skills** in nav).
- `docs.html` — documentation (**Docs** in nav).
- `about.html` — about (**About** in nav).
- `library.html` — library / dashboard surface (prototype; not part of the four primary nav destinations).
- `index.html` — alternate “fold-style” prototype; **Home** in nav points to **`home.html`** so URLs stay canonical.
- `floom-concept-07.html` — older standalone concept (different IA than Home / Skills / Docs / About).
- `docs.html` - documentation-style page for skills, MCP, sync, CLI, and agents.
- `settings.html` - account, MCP, library, and connected-agent settings surface.
- `signin.html` - sign-in/onboarding page.
- `floom-pages.css` - shared styling for the secondary pages.
- `design-tokens.css` - canonical token demo for Paper/code-to-design sync.
- `assets/` - local prototype assets.

There is no app framework in this folder and no build step is required for the
prototype pages.

## Local Preview

Serve the folder directly:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8000/home.html
```

Other useful routes:

```text
http://127.0.0.1:8000/skills.html
http://127.0.0.1:8000/docs.html
http://127.0.0.1:8000/about.html
http://127.0.0.1:8000/index.html
http://127.0.0.1:8000/library.html
http://127.0.0.1:8000/settings.html
http://127.0.0.1:8000/signin.html
http://127.0.0.1:8000/floom-concept-07.html
```

`package.json` currently only declares `vercel` as a dependency and does not
define scripts. Prefer the static server above unless this folder is later
converted into a real app.

## Design Notes

The current concept uses a bold editorial/SaaS visual language: crisp black
rules, bright Floom blue, paper-like backgrounds, heavy uppercase utility text,
terminal command pills, and dense product panels.

When editing, keep these primary nav targets identical anywhere the four-route header appears (**Home**, **Skills**, **Docs**, **About**):

- Home -> `home.html`
- Skills -> `skills.html`
- Docs -> `docs.html`
- About -> `about.html`

Concept-only pages (`floom-concept-07.html`) use different labels; legacy bookmark files redirect as follows:

- `/skill.html` redirects to **`skills.html`**.
- `Floom v0 landing.html` redirects to **`home.html`**.

Older concept page (`floom-concept-07.html`) keeps a different IA:

- Library → `library.html`
- Skills → `skills.html`
- Agents → `settings.html#agents`
- Docs → `docs.html`
- Install → `settings.html#mcp`

Shared chrome pages:

- Sign in → `signin.html`

The secondary pages share `floom-pages.css`. The main concept page has extensive
inline CSS, so changes to shared styling may need to be mirrored manually there.

## Paper Bridge Demo

This folder also doubles as a Paper/Cursor bridge demo: tokens live in code, and
Paper can become the canvas where layout and UX are iterated with an agent while
still anchored to real values.

Suggested flow, if Paper Desktop is available:

1. Launch Paper Desktop and open any Paper file so the MCP server is available
   at `http://127.0.0.1:29979/mcp`.
2. Ask an agent to read `design-tokens.css` and design a dashboard shell on a
   new artboard using only those variables for color, spacing, and type scale.
3. After tweaking the canvas, ask the agent to implement the selected frame in
   code using the same token names.

The loop is: tokens -> Paper -> production components, without retyping design
values into a disconnected tool.

## Future Agent Guidance

- Treat this as a prototype snapshot unless a `.git` folder or app framework is
  added later.
- Use upstream `https://github.com/floomhq/floom` for product truth, API scope,
  CLI behavior, and deployment architecture.
- Do not assume these static pages are wired to real auth, Supabase, or CLI
  behavior.
- Preserve the current visual direction unless asked to explore a new one.
- If adding pages, reuse `floom-pages.css` patterns and update all relevant nav
  links.
- If turning this into a real app, align routes and copy with the upstream
  `web/` app rather than inventing a parallel product model.
