# Website Integration

This document is the UI/data contract for adding a Floom Packs page to the
website.

The UI design work is separate from this repo. The website needs to treat the
manifest as the source of truth.

## Primary CTA

Default install command:

```bash
npx @floomhq/packs install
```

Profile examples:

```bash
npx @floomhq/packs install --profiles core,dev,writing --yes
npx @floomhq/packs install --profiles founder,marketing,sales --yes
npx @floomhq/packs install --all --targets all --yes
```

## Manifest Data

The package exposes the full manifest:

```bash
floom-packs manifest --json
```

Shape:

```json
{
  "id": "starter",
  "name": "Floom Starter",
  "description": "A broad local-first starter portfolio of curated agent skills.",
  "version": "0.1.0",
  "defaultProfiles": ["core"],
  "targets": ["claude", "codex", "cursor", "opencode", "kimi"],
  "profiles": [],
  "skills": [],
  "sources": {}
}
```

The UI can read:

- profile id/name/description;
- profile skill counts;
- total unique selected skill count;
- supported target labels;
- source labels and source status.

## Website Sections

Recommended page sections:

1. Hero: "Curated skills for every agent."
2. Install command with copy button.
3. Profile selector.
4. "What gets installed" summary.
5. Supported agents row.
6. Safety/trust block.
7. Source/provenance block.
8. Architecture explainer link.
9. FAQ.

## Profile Selector Behavior

Core is selected by default.

Users can add any profile:

- dev;
- writing;
- research;
- marketing;
- sales;
- ops;
- founder;
- data;
- design;
- video.

Command generation:

```text
npx @floomhq/packs install --profiles core,dev,writing --yes
```

If every profile is selected:

```text
npx @floomhq/packs install --all --yes
```

Target selection can be hidden in the primary UI because the installer
autodetects local agents. Advanced UI can expose:

```text
--targets claude,codex
--targets all
```

## Social Proof Metrics

Use public, low-trust-risk metrics first:

| Metric | Source |
| --- | --- |
| npm weekly downloads | `https://api.npmjs.org/downloads/point/last-week/@floomhq/packs` |
| npm monthly downloads | `https://api.npmjs.org/downloads/point/last-month/@floomhq/packs` |
| package version | npm registry metadata |
| GitHub stars | GitHub API for `floomhq/packs` |
| bundled skills | `manifest.skills.length` |
| supported agents | `manifest.targets.length` |

Do not claim install counts from telemetry in V0. V0 has no install telemetry.

## Copy Rules

Use:

- "Local-first"
- "No account required"
- "No daemon"
- "No MCP setup required"
- "Adds skills beside your existing local skills"
- "Refuses to overwrite untracked skills"
- "Curated starter profiles"

Avoid:

- "cloud sync"
- "semantic search"
- "marketplace"
- "auto-updating"
- "all skills are benchmark-proven"
- "replaces your existing skills"

## UI States

Required states:

- default core-only command;
- multiple profiles selected;
- all profiles selected;
- command copied;
- source/provenance expanded;
- safety block expanded;
- mobile stacked layout;
- package not yet published on npm;
- npm stats unavailable or zero;
- GitHub stars unavailable.

## Launch Page Data Contract

The UI can use this normalized model:

```json
{
  "packageName": "@floomhq/packs",
  "cliName": "floom-packs",
  "installCommand": "npx @floomhq/packs install",
  "profiles": [
    {
      "id": "dev",
      "name": "Dev",
      "description": "Code review, tests, security, browser checks, and repo analysis.",
      "skillCount": 5
    }
  ],
  "targets": ["claude", "codex", "cursor", "opencode", "kimi"],
  "metrics": {
    "skills": 29,
    "targets": 5
  }
}
```

## Architecture Link

Use:

```text
https://floom-packs-architecture-2026-05-10.surge.sh/
```

for the visual architecture explainer until the page is migrated into the main
docs site.

