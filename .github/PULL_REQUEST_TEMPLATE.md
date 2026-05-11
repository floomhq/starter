## What

Describe the change in one sentence.

## Why

Explain the motivation: bug fix, docs update, skill metadata correction, or release prep.

## Verification

- [ ] Local smoke test passes (`cd cli && npm pack && install in fresh dir`)
- [ ] If touching manifest: schema valid (CI will check)
- [ ] If touching cron: dry-run preserves enrichment
- [ ] No new em-dashes in user-facing copy
- [ ] Supported agents remain exactly Claude Code, Codex, Cursor, Kimi, and OpenCode

## Notes

Add reviewer context here, or write `None`.
