# Release Checklist

This checklist tracks release readiness for `floomhq/starter` and
`@floomhq/starter`.

## Repository

- [x] Repo is `floomhq/starter`.
- [x] Root manifest exists at `manifest.json`.
- [x] Per-skill JSON files exist under `skills/`.
- [x] CLI package lives under `cli/`.
- [x] Root README uses `npx @floomhq/starter install`.
- [x] License and notice files exist.

## Package

- [x] npm package is `@floomhq/starter`.
- [x] Current npm version is `0.2.5`.
- [x] CLI binary is `starter` with `floom-starter` alias.
- [x] Supported agents are Claude Code, Codex, Cursor, Kimi, and OpenCode.
- [x] Project-local install is the default.
- [x] `--global` is available for machine-wide installs.
- [x] `update`, `uninstall`, `remove`, `list`, and `init` are documented.

## Data

- [x] Locked skill count is 65.
- [x] Profile count is 11.
- [x] Every manifest skill has a matching `skills/<slug>.json`.
- [x] Every per-skill JSON contains `skill_md_content`.
- [x] Third-party source and license summary exists in `licenses/README.md`.

## Verification

- [ ] `npm view @floomhq/starter time --json` matches changelog dates.
- [ ] `npx @floomhq/starter@latest --help` is clear.
- [ ] `npx @floomhq/starter@latest --version` matches npm metadata.
- [ ] CI passes `validate-manifest`.
- [ ] CI passes `validate-skill-jsons`.
- [ ] CI passes `cli-smoke`.

## Known Release Note

`@floomhq/starter@0.2.5` is published on npm, but the published CLI entry point
prints `0.2.4` for `--version`. The local source has been corrected for the next
publish.
