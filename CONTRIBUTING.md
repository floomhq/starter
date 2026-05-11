# Contributing

Thanks for considering a contribution. Two main paths:

## Suggest a new skill

Open a [Skill request issue](https://github.com/floomhq/starter/issues/new?template=skill_request.yml). The curated 65 is locked but we may add more in v0.3.

## Fix a bug or improve docs

1. Fork the repo
2. Create a branch from main
3. Make your change
4. Run `cd cli && npm pack && install in a fresh temp dir` to verify CLI still works
5. Open a PR with the verification log in the description

CI will validate manifest schema, per-skill JSON content, and run the smoke test.

## Code style

- No em dashes in user-facing copy (commas, colons, periods)
- 5 supported agents: Claude Code, Codex, Cursor, Kimi, OpenCode (no Gemini)
- Match existing TypeScript / Python style (no big rewrites in unrelated files)
