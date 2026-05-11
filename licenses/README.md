# Third-Party Skill Sources

Floom Starter bundles 65 curated skills. This table summarizes the upstream
source repositories recorded in the per-skill JSON metadata. Each row links
to the vendored LICENSE file in this directory.

| Source | Publisher | Skills | License | Vendored |
| --- | --- | ---: | --- | --- |
| https://github.com/coreyhaines31/marketingskills | coreyhaines31 | 18 | MIT | [coreyhaines31-marketingskills.LICENSE.md](./coreyhaines31-marketingskills.LICENSE.md) |
| https://github.com/benchflow-ai/skillsbench | benchflow-ai | 7 | Apache-2.0 | [benchflow-ai-skillsbench.LICENSE.md](./benchflow-ai-skillsbench.LICENSE.md) |
| https://github.com/pbakaus/impeccable | pbakaus | 3 | Apache-2.0 | [pbakaus-impeccable.LICENSE.md](./pbakaus-impeccable.LICENSE.md) |
| https://github.com/obra/superpowers | obra | 8 | MIT | [obra-superpowers.LICENSE.md](./obra-superpowers.LICENSE.md) |
| https://github.com/anthropics/skills | anthropics | 8 | (no LICENSE in repo) | [anthropics-skills.LICENSE.md](./anthropics-skills.LICENSE.md) |
| https://github.com/mattpocock/skills | mattpocock | 8 | MIT | [mattpocock-skills.LICENSE.md](./mattpocock-skills.LICENSE.md) |
| https://github.com/vercel-labs/agent-browser | vercel-labs | 1 | Apache-2.0 | [vercel-labs-agent-browser.LICENSE.md](./vercel-labs-agent-browser.LICENSE.md) |
| https://github.com/vercel-labs/skills | vercel-labs | 1 | (no LICENSE in repo) | [vercel-labs-skills.LICENSE.md](./vercel-labs-skills.LICENSE.md) |
| https://github.com/vercel-labs/next-skills | vercel-labs | 1 | (no LICENSE in repo) | [vercel-labs-next-skills.LICENSE.md](./vercel-labs-next-skills.LICENSE.md) |
| https://github.com/vercel-labs/agent-skills | vercel-labs | 2 | (no LICENSE in repo) | [vercel-labs-agent-skills.LICENSE.md](./vercel-labs-agent-skills.LICENSE.md) |
| https://github.com/scrapegraphai/just-scrape | scrapegraphai | 1 | MIT | [scrapegraphai-just-scrape.LICENSE.md](./scrapegraphai-just-scrape.LICENSE.md) |
| https://github.com/currents-dev/playwright-best-practices-skill | currents-dev | 1 | MIT | [currents-dev-playwright-best-practices-skill.LICENSE.md](./currents-dev-playwright-best-practices-skill.LICENSE.md) |
| https://github.com/remotion-dev/skills | remotion-dev | 1 | (no LICENSE in repo) | [remotion-dev-skills.LICENSE.md](./remotion-dev-skills.LICENSE.md) |
| https://github.com/supabase/agent-skills | supabase | 1 | MIT | [supabase-agent-skills.LICENSE.md](./supabase-agent-skills.LICENSE.md) |
| https://github.com/wshobson/agents | wshobson | 1 | MIT | [wshobson-agents.LICENSE.md](./wshobson-agents.LICENSE.md) |
| https://github.com/floomhq/floom | floomhq | 3 | Proprietary (Floom team; rights granted for pack distribution) | [floomhq-floom.LICENSE.md](./floomhq-floom.LICENSE.md) |

The Apache-2.0 license text for SkillsBench is also kept verbatim in
`licenses/LICENSE.skillsbench` for backwards compatibility.

Five upstream repositories (`anthropics/skills`, `vercel-labs/skills`,
`vercel-labs/next-skills`, `vercel-labs/agent-skills`, `remotion-dev/skills`)
do not ship a LICENSE file at the time of vendoring. The corresponding
`*.LICENSE.md` documents this absence; redistributors should confirm terms
with the upstream owner.

Per-skill source URLs, raw SKILL.md URLs, publishers, and licenses are
preserved inside `skills/<slug>.json`.
