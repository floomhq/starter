# Floom Packs Architecture

Floom Packs is a local-first installer for curated agent skills. It is separate
from the Floom cloud product.

Current package:

- npm package name: `@floomhq/packs`
- CLI binary: `floom-packs`
- default pack: `starter`
- repo: `floomhq/packs`

## Product Boundary

Floom Packs V0 installs local skills and local discovery instructions. It does
not require a Floom account, Floom cloud, daemon sync, or MCP.

```mermaid
flowchart LR
  User[User] --> CLI[npx @floomhq/packs install]
  CLI --> Manifest[packs/starter/manifest.json]
  CLI --> Skills[Bundled skill folders]
  CLI --> Detect[Detect local agents]
  Detect --> Claude[Claude Code]
  Detect --> Codex[Codex CLI]
  Detect --> Cursor[Cursor]
  Detect --> OpenCode[OpenCode]
  Detect --> Kimi[Kimi]
  CLI --> Index[~/.floom/packs/starter-index.json]
  CLI --> Instructions[Harness instruction files]
  Skills --> Roots[Local agent skill roots]
  Index --> Discovery[local-find-skills]
  Instructions --> Discovery
```

## Mental Model

```text
curated source skills
        |
        v
pack manifest
        |
        v
floom-packs installer
        |
        +--> local skill folders
        +--> local starter index
        +--> local-find-skills
        +--> instruction snippets
```

The local skill folders remain the runtime surface because Claude Code, Codex,
Cursor, OpenCode, and Kimi can read local files today.

The index and injected instructions solve discoverability without loading every
skill into model context.

## Runtime Flow

```mermaid
sequenceDiagram
  participant U as User
  participant C as floom-packs CLI
  participant M as Manifest
  participant FS as Local filesystem
  participant A as Agent

  U->>C: install --profiles dev,writing --yes
  C->>FS: detect ~/.claude, ~/.codex, ~/.cursor, ~/.config/opencode, ~/.kimi
  C->>M: resolve profiles into skill slugs
  C->>FS: copy selected skill folders
  C->>FS: write .floom-pack.json provenance per skill
  C->>FS: write ~/.floom/packs/starter-index.json
  C->>FS: upsert FLOOM PACKS instruction block
  U->>A: start normal agent work
  A->>FS: read local instructions
  A->>FS: use local-find-skills and starter index
  A->>FS: load only relevant SKILL.md
```

## Install Target Detection

When `--targets` is omitted, the CLI detects installed agents by checking for
their home/config directories.

```mermaid
flowchart TD
  Install[install command] --> Explicit{--targets provided?}
  Explicit -->|yes| UseExplicit[Use requested targets]
  Explicit -->|no| Detect[Detect present local agents]
  Detect --> ClaudePath[~/.claude]
  Detect --> CodexPath[~/.codex or CODEX_HOME]
  Detect --> CursorPath[~/.cursor]
  Detect --> OpenCodePath[~/.config/opencode]
  Detect --> KimiPath[~/.kimi]
  Detect --> Found{any found?}
  Found -->|yes| UseDetected[Install only detected targets]
  Found -->|no| Error[Ask for explicit --targets]
```

Explicit target choices:

- `--targets claude,codex`
- `--targets cursor`
- `--targets all`

## File Writes

For each selected target, the installer writes selected skill folders and one
instruction file.

```mermaid
flowchart LR
  CLI[floom-packs] --> ClaudeRoot[~/.claude/skills]
  CLI --> CodexRoot[~/.codex/skills]
  CLI --> CursorRoot[~/.cursor/skills-cursor]
  CLI --> OpenCodeRoot[~/.config/opencode/skills]
  CLI --> KimiRoot[~/.kimi/skills]

  CLI --> ClaudeInstr[~/.claude/CLAUDE.md]
  CLI --> CodexInstr[~/.codex/AGENTS.md]
  CLI --> CursorInstr[~/.cursor/rules/floom-packs.mdc]
  CLI --> OpenCodeInstr[~/.config/opencode/AGENTS.md]
  CLI --> KimiInstr[~/.kimi/agents/floom-system.md]

  CLI --> Index[~/.floom/packs/starter-index.json]
```

## Conflict Model

The installer writes a `.floom-pack.json` provenance file into every installed
skill folder.

```mermaid
flowchart TD
  SkillWrite[Plan skill write] --> Exists{destination exists?}
  Exists -->|no| Copy[copy skill folder]
  Exists -->|yes| Provenance{has .floom-pack.json from @floomhq/packs?}
  Provenance -->|yes| Replace[replace managed copy]
  Provenance -->|no| Force{--force?}
  Force -->|yes| Replace
  Force -->|no| Conflict[refuse overwrite]
```

This protects user-created local skills from silent replacement.

## Discovery Model

V0 discovery is local. There is no MCP requirement.

```mermaid
flowchart LR
  Instructions[Injected instructions] --> Agent[Agent]
  Index[starter-index.json] --> Finder[local-find-skills]
  Finder --> Agent
  Agent --> Selected[Selected SKILL.md files]
  Selected --> Work[Task execution]
```

The injected instruction block tells agents:

- use local starter skills when relevant;
- search the local index first;
- prefer `local-find-skills` for discovery;
- load only relevant `SKILL.md` files;
- avoid preloading every installed skill.

## Data Model

The pack manifest is the source of truth for profiles, skill membership, source
provenance, and launch targets.

```mermaid
classDiagram
  class PackManifest {
    id
    name
    version
    defaultProfiles
    targets
  }
  class Profile {
    id
    name
    description
    skills[]
  }
  class Skill {
    slug
    name
    source
    upstream
  }
  class Source {
    label
    repo
    commit
    license
    status
  }

  PackManifest "1" --> "*" Profile
  PackManifest "1" --> "*" Skill
  PackManifest "1" --> "*" Source
  Profile "*" --> "*" Skill
  Skill "*" --> "1" Source
```

## Current Source Policy

Bundled now:

- Floom-authored utility skills.
- Selected SkillsBench-derived skills from Apache-2.0 upstream.

Planned curation sources:

- skills.sh ecosystem.
- Native Claude skills and examples.
- gstack, after standalone-safe extraction.
- superpowers, after license/provenance review.
- Other high-signal open skill collections after license review.

Third-party sources are only bundled after provenance and license status are
recorded in the manifest.

## V0 vs Later

```mermaid
flowchart TD
  V0[V0: local packs] --> V1[V1: public npm package]
  V1 --> V2[V2: larger curated source catalog]
  V2 --> V3[V3: optional MCP search]
  V3 --> V4[V4: optional cloud sync]
```

V0:

- local npm installer;
- profile selection;
- local skill folders;
- local index;
- local instructions;
- no login.

Later:

- richer curated sources;
- optional MCP search for larger libraries;
- optional cloud sync after the main Floom backend is stable.

## Verified Behaviors

Current tests verify:

- manifest references existing skill folders;
- every bundled skill has frontmatter and description;
- dry-run writes nothing;
- temp-root install writes skills, index, provenance, and instructions;
- target autodetection works;
- missing detected targets produces an explicit error;
- `--targets all` writes all five launch targets;
- untracked existing skills are not overwritten.

