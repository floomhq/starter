<div align="center">

# Floom Starter Pack

**65 hand-picked AI agent skills. One install. Auto-activates.**

Works with Claude Code, Codex, Cursor, Kimi, OpenCode.

[![npm version](https://img.shields.io/npm/v/@floomhq/starter?color=0094ff&style=flat-square)](https://www.npmjs.com/package/@floomhq/starter)
[![npm downloads](https://img.shields.io/npm/dm/@floomhq/starter?color=0094ff&style=flat-square)](https://www.npmjs.com/package/@floomhq/starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-0094ff.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/floomhq/starter?color=0094ff&style=flat-square)](https://github.com/floomhq/starter)

[Install](#install) · [What you get](#what-you-get) · [How it works](#how-it-works) · [Docs](https://starter.floom.dev/docs) · [Browse skills](https://starter.floom.dev/library)

</div>

---

## Install

```bash
npx @floomhq/starter install
```

Installs 65 curated skills into the AI agent you use. Auto-detects Claude Code, Codex, Cursor, Kimi, or OpenCode.

## What you get

65 skills across 11 profiles:

| Profile | Skills | Examples |
|---------|--------|----------|
| Core | 9 | find-skills, skill-creator, brainstorming, grill-me, systematic-debugging, writing-plans |
| Dev | 12 | next-best-practices, supabase-postgres-best-practices, tdd, webapp-testing, frontend-design |
| Writing | 9 | copywriting, copy-editing, content-strategy, brand-guidelines, doc-coauthoring |
| Research | 8 | just-scrape, agent-browser, pdf, xlsx, zoom-out |
| Marketing | 12 | seo-audit, marketing-psychology, social-content, programmatic-seo, page-cro, analytics-tracking |
| Sales | 8 | cold-email, sales-enablement, revops, churn-prevention, pricing-strategy |
| Ops | 10 | workplan, to-issues, to-prd, triage, internal-comms |
| Founder | 10 | pricing-strategy, product-marketing-context, launch-strategy, brand-guidelines |
| Data | 9 | xlsx, pdf, just-scrape, fuzzy-match, python-parallelization, testing-python |
| Design | 9 | frontend-design, web-design-guidelines, audit, polish, critique, tailwind-design-system |
| Video | 6 | video-polish, remotion-best-practices, audio-extractor, video-processor |

[Browse the full library](https://starter.floom.dev/library)

## How it works

1. One npm command runs the installer.
2. Auto-detect your AI agent (Claude Code, Codex, Cursor, Kimi, OpenCode).
3. Skills install locally to your project (`.claude/skills/`, `.codex/skills/`, etc.).
4. Activation rules are added to your agent's config so the right skill fires on the right task.
5. Floom keeps it current with daily refreshes from the upstream skills.sh registry. Install counts updated, content kept fresh.

## Why curated

skills.sh has 91,000+ AI agent skills. Most agents drown in choice or pick wrong. We picked the 65 that move the needle, ranked by real install counts on skills.sh, organized into 11 profiles for clarity.

**+18.6pp pass-rate lift** on real benchmarks vs. an unconfigured agent. **-2.9pp** for kitchen-sink (install everything) approach. Curation matters.

## Updating

```bash
npx @floomhq/starter update
```

Pulls the latest install counts and any updated SKILL.md content. Skills you customized are preserved.

## Listing what is installed

```bash
npx @floomhq/starter list
```

## Uninstalling

```bash
npx @floomhq/starter uninstall
```

Removes the skill directories and the activation block from your agent's config. Your other skills are not touched.

## Architecture

```
floomhq/starter (this repo)
├── packs/floom-starter/
│   ├── manifest.json           slim index (65 skills + 11 profiles)
│   └── skills/<slug>.json      full per-skill data (SKILL.md content, files, source)
└── starter-cli/
    └── @floomhq/starter (npm)  the CLI users install
```

The CLI fetches the slim manifest at install time, then lazy-loads per-skill JSONs only for skills the user installs. Daily refresh cron preserves user-edited skills and updates upstream metadata.

## Privacy

No telemetry. No account required. No daemon running. The CLI runs once, writes files locally, exits. Source code is open and auditable.

## License

MIT, copyright Floom contributors.

Individual skills retain their own licenses. See [licenses/README.md](licenses/README.md) for the per-source license table.

## Contributors

- [Federico de Ponte](https://x.com/fede_vault)
- Adam Beaudoin

Pull requests welcome.

## Links

- Site: [starter.floom.dev](https://starter.floom.dev)
- npm: [@floomhq/starter](https://www.npmjs.com/package/@floomhq/starter)
- Library: [Browse all 65 skills](https://starter.floom.dev/library)
- Docs: [starter.floom.dev/docs](https://starter.floom.dev/docs)
