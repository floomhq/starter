# Changelog

## v0.2.4 - 2026-05-11

- Repo flattened to single-pack layout (`manifest.json` + `skills/` at root, `cli/` subfolder).
- CLI `MANIFEST_BASE_URL` updated to flat path.
- Cron audit: 5 assertion tests added covering enrichment preservation, locked-65 enforcement, no auto-add, fetch failure resilience.

## v0.2.3 - 2026-05-11

- Repo renamed `floomhq/packs` to `floomhq/starter`.
- Re-enriched all 65 per-skill JSONs (daily cron PR #10 had wiped `skill_md_content`).
- CLI: install writes manifest + activation block from RESULTS not INTENT, exits non-zero when 0 skills written.
- CLI: `--non-interactive` aliased to `--yes`.
- Bundled fallback rebuilt with current curated slug set.
- README rewritten (high-trust badges, profile breakdown, install + update + uninstall flows).

## v0.2.2 (skipped) - patch reserved.

## v0.2.1 - 2026-05-10

- Per-skill JSON detail loading (slim manifest + lazy-fetch per skill).
- SKILL.md collision behavior: skip with warning.

## v0.2.0 - 2026-05-10

- Schema split: slim `manifest.json` + per-skill JSONs at `skills/<slug>.json`.
- Lazy-load skill detail to reduce initial fetch from ~700KB to ~29KB.
