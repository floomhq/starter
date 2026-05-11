# Privacy And Safety

Floom Packs V0 is local-first.

It installs skill folders and instruction snippets on the user's machine. It
does not require Floom cloud, a Floom account, a daemon, or MCP.

## What The Installer Writes

Depending on selected targets, Floom Packs writes:

- skill folders under local agent skill roots;
- `.floom-pack.json` provenance files inside managed skill folders;
- `~/.floom/packs/starter-index.json`;
- a bounded instruction block in supported harness instruction files.

Supported instruction files:

| Target | Instruction file |
| --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` |
| Codex CLI | `~/.codex/AGENTS.md` |
| Cursor | `~/.cursor/rules/floom-packs.mdc` |
| OpenCode | `~/.config/opencode/AGENTS.md` |
| Kimi | `~/.kimi/agents/floom-system.md` |

## What The Installer Does Not Do

Floom Packs does not:

- upload local skills;
- read unrelated local documents;
- start a daemon;
- install an MCP server;
- require login;
- call Floom cloud;
- send install telemetry;
- delete unrelated user skills;
- silently replace untracked local skill folders.

## Dry-Run First

`install` is read-only unless `--yes` is passed.

```bash
npx @floomhq/packs install
```

prints the plan and writes nothing.

```bash
npx @floomhq/packs install --yes
```

executes the plan.

## Conflict Protection

Every Floom-managed skill folder gets:

```text
.floom-pack.json
```

That file records:

- package name;
- package version;
- pack id;
- skill slug;
- source;
- install timestamp.

If a destination folder exists without Floom Packs provenance, the installer
reports a conflict and refuses to overwrite it.

`--force` exists for explicit replacement only.

## Local Skill Coexistence

Floom Packs coexists with existing local skills:

```text
existing user skills remain untouched
Floom-managed skills are added beside them
name collisions become conflicts
managed skills can be updated by later installs
```

The local index includes Floom Packs skills only. It does not claim ownership of
unrelated user skills.

## Privacy-Safe Metrics

V0 does not send install telemetry.

For launch social proof, use public package and repository metrics:

- npm weekly downloads for `@floomhq/packs`;
- GitHub stars for `floomhq/packs`;
- current skill count from `floom-packs manifest --json`;
- supported target count from the manifest.

If product telemetry is added later, it needs to be explicit, documented, and
privacy-safe.

## Security Notes

Bundled skills can include supporting scripts or reference files. The installer
copies those files locally but does not execute them.

The agent may execute scripts later if a specific skill instructs it to and the
user authorizes that workflow in their agent environment.

Third-party skills need source and license review before bundling.

