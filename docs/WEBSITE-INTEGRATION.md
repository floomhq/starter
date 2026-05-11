# Website Integration

This document is the data contract for `floom.dev`.

The public site treats this repository as the source of truth. The package name,
repo links, supported agents, and skill counts must match the files in this repo.

## Primary CTA

Default install command:

```bash
npx @floomhq/starter install
```

Profile examples:

```bash
npx @floomhq/starter install --profiles core,dev,writing
npx @floomhq/starter install --profiles founder,marketing,sales
npx @floomhq/starter install --all
```

## Manifest Data

The site can read `manifest.json` from the repo root.

```text
https://raw.githubusercontent.com/floomhq/starter/main/manifest.json
```

Important fields:

- `total_skills`: locked at 65;
- `profiles`: 11 profile records with `skill_slugs`;
- `skills`: slim skill index with names, descriptions, profile membership, and detail URLs;
- `defaultProfiles`: currently `["core"]`.

## Supported Agents

Show exactly five supported agents:

- Claude Code
- Codex
- Cursor
- Kimi
- OpenCode

## Profile Selector Behavior

Core is selected by default. Users can add any profile:

- dev
- writing
- research
- marketing
- sales
- ops
- founder
- data
- design
- video

Command generation:

```text
npx @floomhq/starter install --profiles core,dev,writing
```

If every profile is selected:

```text
npx @floomhq/starter install --all
```

## Social Proof Metrics

Use public metrics only:

| Metric | Source |
| --- | --- |
| npm weekly downloads | npm downloads API for `@floomhq/starter`; display `New package` when the API returns 404 before enough download history exists |
| npm monthly downloads | npm downloads API for `@floomhq/starter`; display `New package` when the API returns 404 before enough download history exists |
| package version | npm registry metadata for `@floomhq/starter` |
| GitHub stars | GitHub API for `floomhq/starter` |
| bundled skills | `manifest.total_skills` |
| supported agents | hard-coded from this document and CLI help |

Do not claim private install telemetry. The CLI sends none.

## Copy Rules

Use:

- "Local-first"
- "No account required"
- "No daemon"
- "No MCP setup required"
- "Adds skills beside your existing local skills"
- "Keeps user-modified skill files unless `--force` is passed"
- "Curated starter profiles"

Avoid:

- "cloud sync"
- "semantic search"
- "marketplace"
- "auto-updating"
- "all skills are benchmark-proven"
- "replaces your existing skills"

## Normalized Model

```json
{
  "packageName": "@floomhq/starter",
  "repo": "floomhq/starter",
  "installCommand": "npx @floomhq/starter install",
  "profiles": 11,
  "skills": 65,
  "targets": ["claude", "codex", "cursor", "kimi", "opencode"]
}
```
