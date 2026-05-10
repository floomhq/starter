# Floom Packs

Local-first curated skill packs for agent users.

Floom Packs installs useful agent skills into the tools people already use:
Claude Code, Codex CLI, Cursor, OpenCode, and Kimi.

No Floom account, cloud sync, daemon, or MCP setup is required.

```bash
npx @floomhq/packs install
```

## What This Is

Floom Packs is a standalone npm package and CLI:

- npm package: `@floomhq/packs`
- CLI binary: `floom-packs`
- default pack: `starter`

It installs:

- local skill folders;
- a local skill index at `~/.floom/packs/starter-index.json`;
- a `local-find-skills` discovery skill;
- short instruction snippets that teach agents how to find and use installed
  skills.

## Quickstart

Preview the install plan:

```bash
npx @floomhq/packs install --dry-run
```

Install into detected local agents:

```bash
npx @floomhq/packs install --yes
```

Install selected profiles:

```bash
npx @floomhq/packs install --profiles core,dev,writing --yes
```

Install selected profiles into explicit agents:

```bash
npx @floomhq/packs install --profiles founder,marketing,sales --targets claude,codex --yes
```

Install everything into every supported agent:

```bash
npx @floomhq/packs install --all --targets all --yes
```

## Commands

```bash
floom-packs list
floom-packs manifest --json
floom-packs install --dry-run
floom-packs install --profiles core,dev --yes
```

`list` prints profile summaries.

`manifest --json` prints the full machine-readable pack manifest for UI and docs
integration.

`install` copies selected skills and writes local discovery instructions.

## Profiles

Current V0 profiles:

| Profile | Purpose |
| --- | --- |
| `core` | Skill discovery, task framing, and project onboarding. |
| `dev` | Code review, tests, security, browser checks, and repo analysis. |
| `writing` | Brand voice, concise drafts, documents, and presentations. |
| `research` | Source-aware briefs, citations, enterprise search, and PDF extraction. |
| `marketing` | Landing pages, positioning, customer synthesis, and brand voice. |
| `sales` | Outbound, customer context, and sales data analysis. |
| `ops` | Meetings, SOPs, onboarding, and file organization. |
| `founder` | Strategy briefs, customer learning, landing pages, and decisions. |
| `data` | Spreadsheets, PDFs, financial QA, and table extraction. |
| `design` | Visual QA and browser-based implementation checks. |
| `video` | Transcript, silence, and filler-word workflows. |

`core` is included automatically unless `--all` is used.

## Target Detection

When `--targets` is omitted, Floom Packs detects installed local agents:

| Target | Detection path | Skill root |
| --- | --- | --- |
| `claude` | `~/.claude` | `~/.claude/skills` |
| `codex` | `~/.codex` or `CODEX_HOME` | `~/.codex/skills` |
| `cursor` | `~/.cursor` | `~/.cursor/skills-cursor` |
| `opencode` | `~/.config/opencode` | `~/.config/opencode/skills` |
| `kimi` | `~/.kimi` | `~/.kimi/skills` |

If no supported agent is detected, pass targets explicitly:

```bash
npx @floomhq/packs install --targets claude,codex --yes
```

## Existing Local Skills

Floom Packs adds skills beside existing local skills. It does not delete or
scan unrelated local skills.

Each installed skill folder receives a provenance file:

```text
.floom-pack.json
```

If a destination folder already exists and does not have Floom Packs provenance,
the installer reports a conflict and refuses to overwrite it.

Use `--force` only when replacing an existing local folder is intentional.

## Safety And Privacy

Default safety behavior:

- `install` is a dry-run unless `--yes` is provided.
- untracked existing skill folders are not overwritten.
- Floom Packs writes only local files.
- no cloud account is required.
- no install telemetry is sent.
- no MCP server or background daemon is started.

See [docs/PRIVACY-SAFETY.md](./docs/PRIVACY-SAFETY.md) for the full safety
model.

## Source Boundaries

Bundled now:

- curated seed skills maintained in this repo;
- selected Apache-2.0 SkillsBench-derived skills.

Planned but not bundled yet:

- skills.sh ecosystem skills;
- native Claude skills and examples;
- standalone-safe gstack skills;
- superpowers skills;
- other clear-license open skill sources.

Third-party content is only bundled after license and provenance review.

See [docs/CURATION-BRIEF.md](./docs/CURATION-BRIEF.md) for the curation task.

## Website And UI Integration

The website can use:

```bash
floom-packs manifest --json
```

for profiles, skill counts, source labels, and supported targets.

See [docs/WEBSITE-INTEGRATION.md](./docs/WEBSITE-INTEGRATION.md) for the UI data
contract, social proof metrics, and copy rules.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the local install model, target
detection, conflict handling, discovery flow, and Mermaid diagrams.

Visual explainer:

https://floom-packs-architecture-2026-05-10.surge.sh/

## Launch Status

This repo is launch-ready as the package backend after the outsourced curation
and UI passes land.

Current verified backend:

- install planner;
- local target detection;
- profile selection;
- local skill copy;
- local index generation;
- instruction injection;
- provenance tracking;
- overwrite protection;
- package tarball execution on a clean VPS.

See [docs/LAUNCH-CHECKLIST.md](./docs/LAUNCH-CHECKLIST.md).

