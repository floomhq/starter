# Floom Packs

Local-first curated skill packs for agent users.

Package:

```bash
npx @floomhq/packs install
```

CLI:

```bash
floom-packs
```

## Install

Preview the default starter install:

```bash
npx @floomhq/packs install --dry-run
```

Install selected profiles:

```bash
npx @floomhq/packs install --profiles core,dev,writing --targets claude,codex --yes
```

Install every profile:

```bash
npx @floomhq/packs install --all --yes
```

## What It Writes

The installer writes:

- skill folders into target agent skill roots;
- a local index at `~/.floom/packs/starter-index.json`;
- local skill discovery instructions into each selected harness instruction file.

No cloud account, daemon, or MCP is required.

## Targets

Supported targets:

- `claude`
- `codex`
- `cursor`
- `opencode`
- `kimi`
- `all`

## Profiles

Run:

```bash
npx @floomhq/packs list
```

V0 profiles:

- `core`
- `dev`
- `writing`
- `research`
- `marketing`
- `sales`
- `ops`
- `founder`
- `data`
- `design`
- `video`

## Safety

Real installs require `--yes`. Without `--yes`, `install` prints a dry-run plan.

Use `--root <dir>` to test against temporary roots:

```bash
npx @floomhq/packs install --profiles core,dev --targets claude,codex --root /tmp/floom-packs-test --yes
```

## Source Boundaries

Bundled sources:

- Floom-authored skills.
- Selected Apache-2.0 SkillsBench-derived skills.

Planned but not bundled yet:

- skills.sh ecosystem skills.
- superpowers skills.
- standalone-safe gstack skills.

These require license/provenance review before bundling.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the local install model, target
detection, conflict handling, and discovery flow.

## Curation

See [docs/CURATION-BRIEF.md](./docs/CURATION-BRIEF.md) for the next source
curation pass.
