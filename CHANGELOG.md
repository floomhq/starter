# Changelog

## Unreleased

- CLI source: `--version` now prints `0.2.5`, matching `cli/package.json`.
- CLI docs/help: replaced stale example slugs with skills that exist in the locked 65-skill manifest.
- Docs: updated stale `@floomhq/packs`, `floomhq/packs`, and `floom-packs` references to the current `@floomhq/starter` package and `floomhq/starter` repo.
- Repo docs: added the missing per-source license table referenced by the README.

## v0.2.5 - 2026-05-11

- CLI: activation block strips trailing `.` from skill descriptions before appending `. Path:` (no more `..` in CLAUDE.md/AGENTS.md bullets).
- CLI: activation block instructs agent to use `find-skills`.
- Known publish issue: npm package metadata is `0.2.5`, but the published CLI entry point still prints `0.2.4` for `--version`.

## v0.2.4 - 2026-05-11

### Repo

- Repo flattened to single-pack layout (`manifest.json` + `skills/` at root, `cli/` subfolder).
- CLI `MANIFEST_BASE_URL` updated to flat path.
- Cron audit: 5 assertion tests added covering enrichment preservation, locked-65 enforcement, no auto-add, fetch failure resilience.
- Legacy v0.1 `bin/floom-packs.mjs`, top-level `package.json`, and `ARCHITECTURE.md` removed.

### CLI hardening

- **Project-local install is now the default.** Skills land in `<cwd>/.claude/skills/`, `<cwd>/.codex/skills/`, etc. Pass `--global` to opt into the previous machine-wide behaviour (writes to `~/.claude/`, `~/.codex/`, etc.). The CLI prints which scope it is using on every install. If the current directory has no project markers (no `package.json`, `.git`, etc.), the CLI asks once before scaffolding (or auto-confirms with `--yes`).
- **`uninstall` and `update` are first-class commands.** `uninstall` is an alias for `remove --all` in the current scope. `update` re-fetches the manifest and per-skill JSONs, re-installs only the skills whose remote version is newer, and never overwrites files you have customised.
- **Gemini is explicitly rejected.** `--harness gemini` (or any unknown harness) prints a clear error and exits `1`.
- **Better partial-failure errors.** When some skills fail to fetch, the summary now reads `Installed N of M skills. K skills failed to fetch SKILL.md content. They were skipped. Failed skills: a, b, c (and N more). Re-run with --verbose for the per-skill fetch errors.` Exit code is `0` on partial success and `1` only when zero skills install.
- **`--version` / `-v` print just the version string** (e.g. `0.2.4`).

## v0.2.3 - 2026-05-11

- Repo renamed `floomhq/packs` to `floomhq/starter`.
- Re-enriched all 65 per-skill JSONs (daily cron PR #10 had wiped `skill_md_content`).
- CLI: install writes manifest + activation block from RESULTS not INTENT, exits non-zero when 0 skills written.
- CLI: `--non-interactive` aliased to `--yes`.
- Bundled fallback rebuilt with current curated slug set.
- README rewritten (high-trust badges, profile breakdown, install + update + uninstall flows).

## v0.2.2 - 2026-05-11

- CLI: `--version` constant updated from `0.1.0` to `0.2.2`.
- CLI: `--non-interactive` added as an alias for `--yes`.
- CLI: activation block and local manifest now use successfully written skills, not intended selections.
- CLI: install exits non-zero when zero skills are written.
- CLI: partial install failures print the first errors.

## v0.2.1 - 2026-05-11

- Per-skill JSON detail loading (slim manifest + lazy-fetch per skill).
- SKILL.md collision behavior: skip with warning.
- Known publish issue: the CLI entry point still printed `0.1.0` for `--version`.

## v0.2.0 - 2026-05-10

- Schema split: slim `manifest.json` + per-skill JSONs at `skills/<slug>.json`.
- Lazy-load skill detail to reduce initial fetch from ~700KB to ~29KB.
- Known publish issue: the CLI entry point still printed `0.1.0` for `--version`.
