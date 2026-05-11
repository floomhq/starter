# Privacy And Safety

Floom Starter is local-first.

It installs skill files and activation instructions on the user's machine. It
does not require Floom cloud, a Floom account, a daemon, telemetry, or MCP.

## What The Installer Writes

Project-local is the default scope. In a project directory, Floom Starter writes:

- skill files under `./.claude/skills/`, `./.codex/skills/`, `./.cursor/rules/`,
  `./.opencode/skills/`, or `./.kimi/skills/`;
- activation instructions in the matching local agent file;
- `./.floom/manifest.json` to track installed skills.

Project-local Codex activation is written to `./AGENTS.md`, because Codex reads
the repository instruction file from the project root. The skill files still
live under `./.codex/skills/`.

With `--global`, the same files are written under the user's home directory:

| Agent | Skill directory | Activation file |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/<slug>/SKILL.md` | `~/.claude/CLAUDE.md` |
| Codex CLI | `~/.codex/skills/<slug>/SKILL.md` | `~/.codex/AGENTS.md` |
| Cursor | `~/.cursor/rules/<slug>.mdc` | `~/.cursor/rules/floom-skills.mdc` |
| OpenCode | `~/.config/opencode/skills/<slug>/SKILL.md` | `~/.config/opencode/AGENTS.md` |
| Kimi | `~/.kimi/skills/<slug>/SKILL.md` | `~/.kimi/agents/floom-system.md` |

## What The Installer Does Not Do

Floom Starter does not:

- upload local skills;
- read unrelated local documents;
- start a daemon;
- install an MCP server;
- require login;
- call Floom cloud;
- send install telemetry;
- delete unrelated user skills;
- silently replace untracked local skill files.

## Preview Mode

Use `--dry-run` to print the install plan without writing files.

```bash
npx @floomhq/starter install --dry-run
```

Run without `--dry-run` to install.

```bash
npx @floomhq/starter install
```

## Conflict Protection

If a target skill file exists and differs from the bundled version, Floom Starter
keeps the user's file and prints a warning. `--force` is available for explicit
replacement.

## Local Skill Coexistence

Floom Starter installs managed skills beside existing local skills. The local
manifest includes only Floom-managed skills. It does not claim ownership of
unrelated user skills.

## Privacy-Safe Metrics

The package does not send install telemetry. Public social proof can use:

- npm weekly downloads for `@floomhq/starter`;
- GitHub stars for `floomhq/starter`;
- the locked `manifest.json` count of 65 skills;
- the five supported agents listed in the CLI help.

## Security Notes

Bundled skills may include instructions, supporting text, or script references.
The installer copies skill content locally but does not execute skill scripts.

Third-party skill sources and licenses are tracked in `licenses/README.md`.
