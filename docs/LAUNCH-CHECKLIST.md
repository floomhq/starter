# Launch Checklist

This checklist tracks the package backend readiness for Floom Packs.

The outsourced curation and UI design work are separate tracks. This checklist
covers the repo/package foundation.

## Backend Package

- [x] Standalone repo exists: `floomhq/packs`.
- [x] Package name selected: `@floomhq/packs`.
- [x] CLI binary selected: `floom-packs`.
- [x] Package version set to `0.1.0`.
- [x] Default pack exists: `starter`.
- [x] Pack manifest exists.
- [x] Profile model exists.
- [x] Source/provenance model exists.
- [x] `manifest --json` exists for UI integration.
- [x] `list` command exists.
- [x] `install` command exists.
- [x] `install` defaults to dry-run.
- [x] Real install requires `--yes`.
- [x] Local target autodetection works.
- [x] Explicit `--targets` works.
- [x] `--targets all` works.
- [x] Temp-root test mode works with `--root`.
- [x] Existing untracked skills are protected.
- [x] Managed skills carry `.floom-pack.json` provenance.
- [x] Local index is written.
- [x] Harness instructions are upserted with bounded markers.

## Supported Targets

- [x] Claude Code.
- [x] Codex CLI.
- [x] Cursor.
- [x] OpenCode.
- [x] Kimi.

## Docs

- [x] README quickstart.
- [x] Architecture doc with Mermaid.
- [x] Privacy and safety doc.
- [x] Website integration doc.
- [x] Curation brief.
- [x] Launch checklist.
- [x] Visual HTML architecture explainer.

## Verification

- [x] Local test suite passes.
- [x] Manifest references existing skill folders.
- [x] Every bundled skill has frontmatter and description.
- [x] Dry-run writes no files.
- [x] Temp install writes expected files.
- [x] Conflict behavior is tested.
- [x] Autodetect behavior is tested.
- [x] npm tarball executes locally.
- [x] npm tarball executes on `hetzner` with temp HOME.
- [x] Fresh clone on `hetzner` passes tests.

## Pre-Public Launch Gates

- [ ] Curation pass replaces or expands the seed bundle with approved sources.
- [ ] Third-party license/provenance table is complete.
- [ ] UI page consumes manifest data.
- [ ] UI page handles npm stats unavailable/zero state.
- [ ] npm package is published.
- [ ] npm download stats endpoint returns package data.
- [ ] public repo visibility decision is final.
- [ ] final package smoke test uses the published npm package:

```bash
npx @floomhq/packs install --dry-run
```

## Current Launch Readiness

Backend package readiness: `94/100`.

Remaining backend deductions:

- package is not published to npm yet;
- final curated source set is outsourced and not merged yet;
- UI is outsourced and not merged yet;
- final public/private repo decision remains open.

Once those four items land, the repo can move to `100/100` for the scoped
Floom Packs launch.

