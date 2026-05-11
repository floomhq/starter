# @floomhq/starter

Install curated AI agent skills for Claude Code, Codex, Cursor, OpenCode, and Kimi: zero dependencies, one command.

```bash
npx @floomhq/starter install
```

## What it does

1. Detects your installed AI agents (Claude Code, Codex, Cursor, OpenCode, Kimi)
2. Installs skill files to each agent's local skill directory
3. Appends an activation companion block to your agent's instruction file (`CLAUDE.md`, `AGENTS.md`, etc.)
4. Writes a local manifest to track what was installed

## Install scope

Starting with `0.2.4`, the default scope is **project-local**: skills are installed under the current directory (`./.claude/skills/`, `./.codex/skills/`, etc.). This keeps your machine clean and lets each project own its own skill set.

To install machine-wide (the old behaviour), pass `--global`:

```bash
# Project-local (default): writes to ./.claude/skills/, ./.codex/skills/, etc.
npx @floomhq/starter install

# Machine-wide: writes to ~/.claude/skills/, ~/.codex/skills/, etc.
npx @floomhq/starter install --global
```

The CLI prints which scope it is using on every install.

## Commands

```bash
# Install by profile
npx @floomhq/starter install --profiles core
npx @floomhq/starter install --profiles core,dev,writing

# Install specific skills
npx @floomhq/starter install --skills pr-review,task-brief

# Install everything
npx @floomhq/starter install --all

# Interactive setup (asks your role, picks profiles)
npx @floomhq/starter init

# Show installed skills
npx @floomhq/starter list

# Re-fetch newer skills (preserves your custom edits)
npx @floomhq/starter update

# Remove everything in this scope
npx @floomhq/starter uninstall

# Same thing, explicit form
npx @floomhq/starter remove --all
```

## Flags

| Flag | Description |
|------|-------------|
| `--profiles <ids>` | Comma-separated profile IDs |
| `--skills <slugs>` | Comma-separated skill slugs |
| `--all` | Install all available skills |
| `--harness <ids>` | Target specific agents: `claude,codex,cursor,opencode,kimi` |
| `--global` | Install machine-wide instead of project-local |
| `--force` | Overwrite existing skills |
| `--dry-run` | Print plan without installing |
| `--verbose` | Print per-skill fetch errors on failure |
| `--yes` | Skip interactive prompts (alias: `--non-interactive`) |
| `--version`, `-v` | Print just the version number and exit |

## Profiles

| ID | Description |
|----|-------------|
| `core` | Skill discovery, task framing, project onboarding |
| `dev` | Code review, tests, security, browser, repo analytics |
| `writing` | Brand voice, email drafts, presentations |
| `research` | Research briefs, citations, enterprise search |
| `marketing` | Landing pages, positioning, customer synthesis |
| `sales` | Outbound, customer context, sales analysis |
| `ops` | Meetings, SOPs, onboarding, file organization |
| `founder` | Strategy, research, customer learning, decisions |
| `data` | Spreadsheets, PDFs, financial QA |
| `design` | Visual QA, browser implementation checks |
| `video` | Transcript, silence, filler-word workflows |

## Where skills land

Project-local (default):

| Agent | Skill directory | Activation file |
|-------|----------------|-----------------|
| Claude Code | `./.claude/skills/<slug>/SKILL.md` | `./.claude/CLAUDE.md` |
| Codex CLI | `./.codex/skills/<slug>/SKILL.md` | `./.codex/AGENTS.md` |
| Cursor | `./.cursor/rules/<slug>.mdc` | `./.cursor/rules/floom-skills.mdc` |
| OpenCode | `./.opencode/skills/<slug>/SKILL.md` | `./.opencode/AGENTS.md` |
| Kimi | `./.kimi/skills/<slug>/SKILL.md` | `./.kimi/agents/floom-system.md` |

Machine-wide (with `--global`):

| Agent | Skill directory | Activation file |
|-------|----------------|-----------------|
| Claude Code | `~/.claude/skills/<slug>/SKILL.md` | `~/.claude/CLAUDE.md` |
| Codex CLI | `~/.codex/skills/<slug>/SKILL.md` | `~/.codex/AGENTS.md` |
| Cursor | `~/.cursor/rules/<slug>.mdc` | `~/.cursor/rules/floom-skills.mdc` |
| OpenCode | `~/.config/opencode/skills/<slug>/SKILL.md` | `~/.config/opencode/AGENTS.md` |
| Kimi | `~/.kimi/skills/<slug>/SKILL.md` | `~/.kimi/agents/floom-system.md` |

## Updating

```bash
npx @floomhq/starter update
```

Re-fetches the manifest and per-skill content, re-installs only the skills whose remote version is newer than what you have locally. Files you have customised are NOT overwritten (the collision check from `0.2.1` preserves your versions).

For a fresh install with the latest CLI plus the latest manifest:

```bash
npx @floomhq/starter@latest install
```

## Uninstalling

```bash
# Remove everything in the current scope
npx @floomhq/starter uninstall

# Same thing, explicit form
npx @floomhq/starter remove --all

# Remove specific skills
npx @floomhq/starter remove --skills pr-review,brand-voice

# Remove an entire profile
npx @floomhq/starter remove --profiles dev
```

`uninstall` and `remove` delete the SKILL.md files the installer wrote, clear the Floom activation block from `CLAUDE.md` / `AGENTS.md`, and delete the local manifest. Files the collision check skipped (your custom versions) are not touched. Both commands respect the `--global` flag, so `npx @floomhq/starter uninstall --global` cleans up a previous machine-wide install.

## Listing what's installed

```bash
npx @floomhq/starter list
```

Lists every skill installed via Floom in the current scope, which profile it belongs to, and which agent paths it was written to. Pass `--global` to list machine-wide installs.

## After install

Ask your agent: *"review the changes in this branch"*: the `pr-review` skill fires automatically.

Or: *"find a skill for this task"*: `local-find-skills` searches your installed skills.

## Supported agents

Claude Code, Codex, Cursor, Kimi, OpenCode. Gemini is not supported (the CLI will print a clear error and exit `1` if you pass `--harness gemini`).

## Zero dependencies

`@floomhq/starter` uses only Node.js built-ins (Node 18+). No install overhead.

## Part of Floom

[floom.dev](https://floom.dev): the skill registry for AI coding agents.
