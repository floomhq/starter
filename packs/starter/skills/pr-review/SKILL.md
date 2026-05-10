---
title: Pragmatic PR reviewer
description: Review code changes for launch-risk issues.
version: 1.0.0
---

# Pragmatic PR reviewer

Use this skill when reviewing a pull request or local diff.

## Review order

1. Identify user-visible behavior changes.
2. Check auth, permissions, data integrity, and error paths.
3. Check tests cover the risky path.
4. Check the implementation follows existing project patterns.

## Output

- Findings first, ordered by severity.
- Include file and line references.
- Keep summaries short.
- Say clearly when no blocking issues were found.
