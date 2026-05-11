# Release Checklist

This checklist tracks release readiness for `floomhq/starter` and
`@floomhq/starter`.

## Repository

- [x] Repo is `floomhq/starter`.
- [x] Root manifest exists at `manifest.json`.
- [x] Per-skill JSON files exist under `skills/`.
- [x] CLI package lives under `cli/`.
- [x] Root README uses `npx @floomhq/starter install --global` for the public CTA.
- [x] License and notice files exist.

## Package

- [x] npm package is `@floomhq/starter`.
- [x] Current npm version is `0.2.8`.
- [x] CLI binary is `starter` with `floom-starter` alias.
- [x] Supported agents are Claude Code, Codex, Cursor, Kimi, and OpenCode.
- [x] All 65 skills are the default selection.
- [x] Project-local install is the default scope.
- [x] Remote installs project support files for folder-based skills.
- [x] Codex project-local activation writes to `./AGENTS.md`, verified by a real `codex exec` load test.
- [x] `--global` is available for machine-wide installs.
- [x] `update`, `uninstall`, `remove`, `list`, and `init` are documented.

## Data

- [x] Locked skill count is 65.
- [x] Profile count is 11.
- [x] Every manifest skill has a matching `skills/<slug>.json`.
- [x] Every per-skill JSON contains `skill_md_content`.
- [x] Third-party source and license summary exists in `licenses/README.md`.

## Verification

- [ ] `npm view @floomhq/starter time --json` reports latest `0.2.8`.
- [x] `npx @floomhq/starter@latest --help` is clear.
- [x] `npx @floomhq/starter@latest --version` matches npm metadata.
- [x] CI passes `validate-manifest`.
- [x] CI passes `validate-skill-jsons`.
- [x] CI passes `cli-smoke`.
