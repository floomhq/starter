# Floom Starter Pack

**One skill library, synced across every agent.**

The Floom Starter Pack is a curated portfolio of 63 unique skills (102 profile slots across 11 profiles) designed to give any Claude Code, Codex, Cursor, or OpenCode agent an immediate productivity baseline — from discovery and planning through shipping, marketing, and video production.

Skills are sourced primarily from [skills.sh](https://skills.sh) (battle-tested, real install counts) with targeted additions from SkillsBench (Apache 2.0, academically validated) and three proprietary Floom skills that fill genuine gaps.

Install: [floom.dev/starter](https://floom.dev/starter)

---

## Profiles

### Core (9 skills)

Everyday agent hygiene: skill discovery, planning, quality gate, debugging, parallelism, context management.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| find-skills | vercel-labs | [skills.sh](https://skills.sh/vercel-labs/skills/find-skills) | 1,400,000 | MIT | Meta-skill that helps the agent discover other skills. | agent needs to find a skill matching a task description, on first session setup |
| skill-creator | anthropics | [skills.sh](https://skills.sh/anthropics/skills/skill-creator) | 195,500 | Apache-2.0 | Creates reusable skill files from workflows demonstrated in the current session. | "create a skill", "save this workflow as a skill" |
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Structured ideation and clarification before starting open-ended work. | any vague request, "help me think through X", before starting anything open-ended |
| grill-me | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/grill-me) | 108,900 | MIT | Interrogates plans and assumptions with adversarial questions before implementation. | before any implementation, "ask me questions", "challenge my plan" |
| systematic-debugging | obra | [skills.sh](https://skills.sh/obra/superpowers/systematic-debugging) | 88,500 | MIT | Structured symptom-to-root-cause debugging methodology. | any bug, test failure, unexpected behavior |
| writing-plans | obra | [skills.sh](https://skills.sh/obra/superpowers/writing-plans) | 87,800 | MIT | Creates structured multi-step plans before touching code or documents. | "make a plan", "how should I implement this", before touching code |
| verification-before-completion | obra | [skills.sh](https://skills.sh/obra/superpowers/verification-before-completion) | 63,400 | MIT | Blocks "should work now" completions; forces evidence before success claims. | before claiming complete, before commit/PR, after any fix |
| executing-plans | obra | [skills.sh](https://skills.sh/obra/superpowers/executing-plans) | 71,300 | MIT | Structured plan execution with checkpoints; companion to writing-plans. | after a plan is made, "execute this plan", "start working on this" |
| workplan | floomhq | [floomhq/floom](https://github.com/floomhq/floom) | — | Proprietary | Context-compaction-safe external runbook; no skills.sh equivalent. | "create a runbook", "where was I", any 2+ step task, session recovery after compaction |

---

### Dev (12 skills)

Code review, debugging, testing, security, browser QA, build health, deployment, parallel agents.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| vercel-react-best-practices | vercel-labs | [skills.sh](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) | 386,000 | MIT | 40+ React/Next.js rules from Vercel; most proven React skill on skills.sh. | any React/Next.js work |
| web-design-guidelines | vercel-labs | [skills.sh](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) | 308,300 | MIT | Comprehensive frontend and UI design guidelines from Vercel. | any frontend/UI work |
| next-best-practices | vercel-labs | [skills.sh](https://skills.sh/vercel-labs/next-skills/next-best-practices) | 82,500 | MIT | Next.js-specific routing, data fetching, and middleware patterns. | any Next.js project, routing, data fetching, middleware |
| supabase-postgres-best-practices | supabase | [skills.sh](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices) | 154,800 | Apache-2.0 | Supabase and Postgres schema design, query optimization, and best practices. | any Supabase/Postgres work, schema design, query optimization |
| tdd | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/tdd) | 76,900 | MIT | Test-driven development: red-green-refactor with automated verification. | "implement this feature", any new functionality |
| improve-codebase-architecture | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/improve-codebase-architecture) | 77,700 | MIT | Structured codebase architecture review and refactoring guidance. | "refactor this", "improve architecture", large codebase concerns |
| requesting-code-review | obra | [skills.sh](https://skills.sh/obra/superpowers/requesting-code-review) | 77,000 | MIT | Dispatches a fresh reviewer subagent with precise context for code review. | "code review", before merging major features |
| dispatching-parallel-agents | obra | [skills.sh](https://skills.sh/obra/superpowers/dispatching-parallel-agents) | 59,100 | MIT | Parallel agent coordination for complex tasks with independent sub-tasks. | any task with independent sub-tasks, "run these in parallel" |
| webapp-testing | anthropics | [skills.sh](https://skills.sh/anthropics/skills/webapp-testing) | 64,800 | Apache-2.0 | Browser-based end-to-end app testing with Anthropic's testing framework. | "test this app", "browser test", "verify this flow" |
| playwright-best-practices | currents-dev | [skills.sh](https://skills.sh/currents-dev/playwright-best-practices-skill/playwright-best-practices) | 37,100 | MIT | Official Playwright end-to-end testing patterns and best practices. | any Playwright/E2E test work |
| diagnose | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/diagnose) | 54,000 | MIT | Structured debugging: symptom → hypothesis → root cause → fix. | "debug this", "why is this broken" |
| finishing-a-development-branch | obra | [skills.sh](https://skills.sh/obra/superpowers/finishing-a-development-branch) | 56,900 | MIT | Structured branch completion checklist; prevents half-done states. | "I'm done with this feature", "how do I land this" |

---

### Writing (9 skills)

Brand voice, editing, rewriting, launch copy, email drafts, document polish.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| copywriting | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/copywriting) | 92,900 | MIT | Professional copywriting frameworks for campaigns, landing pages, and external communications. | any external copy task, "write copy for X" |
| copy-editing | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/copy-editing) | 55,900 | MIT | Systematic editing for clarity, tone, structure, and brevity. | "edit this", "improve this draft", "tighten this copy" |
| content-strategy | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/content-strategy) | 63,300 | MIT | Content planning, audience mapping, and distribution strategy. | "content plan", "what should we publish", "content calendar" |
| writing-plans | obra | [skills.sh](https://skills.sh/obra/superpowers/writing-plans) | 87,800 | MIT | Structures multi-section documents before drafting. | any document longer than 3 paragraphs |
| verification-before-completion | obra | [skills.sh](https://skills.sh/obra/superpowers/verification-before-completion) | 63,400 | MIT | Forces proofread and fact-check before submitting any document. | before sharing a draft, before publishing |
| brand-guidelines | anthropics | [skills.sh](https://skills.sh/anthropics/skills/brand-guidelines) | 37,500 | Apache-2.0 | Brand voice and tone guidelines for consistent external communications. | writing external copy, editing founder posts, keeping voice consistent |
| doc-coauthoring | anthropics | [skills.sh](https://skills.sh/anthropics/skills/doc-coauthoring) | 38,900 | Apache-2.0 | Collaborative document authoring: outlines, drafts, and review cycles. | "co-write this doc", "help me draft this", any long-form collaboration |
| internal-comms | anthropics | [skills.sh](https://skills.sh/anthropics/skills/internal-comms) | 32,900 | Apache-2.0 | Internal communication templates: status updates, meeting notes, memos. | "write an internal update", "draft team memo", status communications |
| docx | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Word document manipulation: placeholders, headers/footers, tables. | any .docx file work, "edit this Word doc", "generate a Word report" |

---

### Research (8 skills)

Web research, source synthesis, reading documents, data gathering, brief generation.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Structured ideation; prevents aimless searching by defining the research brief first. | "research X", any open-ended research request |
| just-scrape | scrapegraphai | [skills.sh](https://skills.sh/scrapegraphai/just-scrape/just-scrape) | 62,500 | MIT | Zero-config web scraping with no API key required; default scraper in this pack. | "scrape this site", "extract data from URL", "get all links from X" |
| agent-browser | vercel-labs | [skills.sh](https://skills.sh/vercel-labs/agent-browser/agent-browser) | 256,100 | MIT | Headless browser agent for visiting pages, filling forms, and extracting content. | "visit this page", "fill this form", "browse and extract" |
| pdf | anthropics | [skills.sh](https://skills.sh/anthropics/skills/pdf) | 99,000 | Apache-2.0 | PDF reading and structured extraction for papers, reports, and documents. | any PDF input, "read this paper", "extract from this report" |
| xlsx | anthropics | [skills.sh](https://skills.sh/anthropics/skills/xlsx) | 73,300 | Apache-2.0 | Excel/CSV spreadsheet reading, analysis, and generation. | "put this research in a spreadsheet", "compare these sources" |
| zoom-out | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/zoom-out) | 53,600 | MIT | Establishes broader context before deep-diving into a topic. | "give me context on X", "what's the bigger picture" |
| fuzzy-match | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Reconciles entity names across datasets using fuzzy string matching. | "match these lists", "find duplicates", "reconcile company names" |
| writing-plans | obra | [skills.sh](https://skills.sh/obra/superpowers/writing-plans) | 87,800 | MIT | Structures research output and synthesis documents into logical sections. | "organize my findings", "structure this research into a doc" |

---

### Marketing (12 skills)

Landing pages, SEO, positioning, campaign copy, CRO, customer research, GTM.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| seo-audit | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/seo-audit) | 103,300 | MIT | Full SEO audit: on-page, schema, sitemap, indexability, keyword analysis. | "seo audit", "check seo", any landing page work |
| copywriting | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/copywriting) | 92,900 | MIT | Professional copywriting frameworks for campaigns and landing pages. | any campaign copy, landing page copy |
| marketing-psychology | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/marketing-psychology) | 68,000 | MIT | Behavioral science applied to copy and design for higher conversion. | "make this more persuasive", "improve conversion" |
| social-content | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/social-content) | 64,300 | MIT | Social media content creation across LinkedIn, X, Instagram, and more. | "write a tweet", "social posts", "content for LinkedIn" |
| content-strategy | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/content-strategy) | 63,300 | MIT | Content planning, audience mapping, and distribution strategy. | "content plan", "what should we publish" |
| programmatic-seo | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/programmatic-seo) | 62,000 | MIT | Programmatic page generation and SEO at scale. | "programmatic SEO", "generate pages at scale" |
| page-cro | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/page-cro) | 55,000 | MIT | Conversion rate optimization for landing pages. | "improve conversion", "optimize this landing page", CRO audit |
| analytics-tracking | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/analytics-tracking) | 55,300 | MIT | Analytics setup, event tracking, and funnel analysis. | "set up analytics", "track this event", "measure conversion" |
| launch-strategy | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/launch-strategy) | 53,600 | MIT | GTM planning, launch sequencing, and channel strategy. | "launch plan", "how do we launch this" |
| schema-markup | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/schema-markup) | 53,000 | MIT | Structured data markup for SERP features (FAQ, HowTo, Product). | "add schema markup", "rich snippets" |
| ab-test-setup | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/ab-test-setup) | 49,900 | MIT | A/B test design, statistical significance, and implementation guidance. | "a/b test this", "experiment setup", "what should we test" |
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Clarifies positioning brief before drafting copy. | "help me position this", before any campaign |

---

### Sales (8 skills)

Lead research, outbound drafts, CRM notes, meeting prep, proposal writing, revenue ops.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| cold-email | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/cold-email) | 44,100 | MIT | Structured cold email sequences with personalization frameworks. | "write cold email to X", "outbound sequence", "email template" |
| copywriting | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/copywriting) | 92,900 | MIT | Persuasive sales copy frameworks for outbound, proposals, and follow-ups. | any outbound copy, proposal draft, follow-up |
| sales-enablement | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/sales-enablement) | 40,900 | MIT | Sales collateral, battlecards, and objection handling frameworks. | "objection handling", "competitive battlecard", "sales deck" |
| revops | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/revops) | 39,600 | MIT | Revenue ops: pipeline management, reporting, and CRM cleanup. | "CRM cleanup", "pipeline report", "revenue ops", "sales metrics" |
| churn-prevention | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/churn-prevention) | 42,000 | MIT | Retention tactics, churn analysis, and win-back strategies. | "reduce churn", "win back users", "retention campaign" |
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Clarifies the ask and audience before drafting any outreach. | "write cold email to X", "draft a proposal for Y" |
| verification-before-completion | obra | [skills.sh](https://skills.sh/obra/superpowers/verification-before-completion) | 63,400 | MIT | Checks all facts before sending; prevents hallucinated details in outreach. | before sending any email, before submitting any proposal |
| fuzzy-match | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Reconciles lead lists, dedupes prospects, and matches company names. | "clean this lead list", "dedupe CRM", "match these companies" |

---

### Ops (10 skills)

SOPs, checklists, handoffs, process docs, incident response, postmortems, security.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| workplan | floomhq | [floomhq/floom](https://github.com/floomhq/floom) | — | Proprietary | Context-compaction-safe external runbook for SOPs and handoffs. | "create a runbook", "document this process", "write an SOP" |
| writing-plans | obra | [skills.sh](https://skills.sh/obra/superpowers/writing-plans) | 87,800 | MIT | Structures multi-step procedures before executing them. | any process with 2+ steps, "how do we handle X" |
| to-issues | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/to-issues) | 57,300 | MIT | Converts processes and discussions into tracked tasks and GitHub issues. | "create action items", "track this process", "GitHub issues" |
| triage | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/triage) | 46,900 | MIT | State machine-based issue classification and incident prioritization. | "triage this", "classify this incident", prioritizing issues |
| diagnose | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/diagnose) | 54,000 | MIT | Root cause analysis for incidents using structured debugging workflow. | "incident investigation", "root cause analysis" |
| verification-before-completion | obra | [skills.sh](https://skills.sh/obra/superpowers/verification-before-completion) | 63,400 | MIT | Required before signing off any incident as resolved. | before claiming an incident is resolved |
| dispatching-parallel-agents | obra | [skills.sh](https://skills.sh/obra/superpowers/dispatching-parallel-agents) | 59,100 | MIT | Runs multiple ops tasks in parallel (e.g. multi-service health checks). | multi-service incidents, parallel runbook execution |
| internal-comms | anthropics | [skills.sh](https://skills.sh/anthropics/skills/internal-comms) | 32,900 | Apache-2.0 | Postmortems, incident reports, status updates, and team memos. | "write a postmortem", "incident report", "team status update" |
| pdf | anthropics | [skills.sh](https://skills.sh/anthropics/skills/pdf) | 99,000 | Apache-2.0 | Read vendor contracts, compliance docs, and audit reports from PDF. | "read this contract", "extract from this audit report" |
| xlsx | anthropics | [skills.sh](https://skills.sh/anthropics/skills/xlsx) | 73,300 | Apache-2.0 | Track metrics, maintain checklists, and manage incident logs in spreadsheets. | "track this in a spreadsheet", "create an incident log" |

---

### Founder (10 skills)

Investor updates, strategy memos, pitch polish, hiring, roadmap synthesis, board prep.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Strategy and narrative ideation before writing memos or decks. | "help me think through X", before any investor update |
| grill-me | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/grill-me) | 108,900 | MIT | Exhaustive questioning before writing investor narrative. | "challenge my pitch", "what questions will investors ask" |
| writing-plans | obra | [skills.sh](https://skills.sh/obra/superpowers/writing-plans) | 87,800 | MIT | Structures multi-section documents before drafting. | any document longer than 3 paragraphs |
| copywriting | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/copywriting) | 92,900 | MIT | Investor-grade copy: clear, specific, no hype. | writing investor updates, team memos, public posts |
| to-prd | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/to-prd) | 60,200 | MIT | Synthesizes strategy and discussions into structured PRD-style documents. | "turn this into a document", "roadmap from these signals" |
| pricing-strategy | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/pricing-strategy) | 58,800 | MIT | Pricing model design, positioning, and packaging strategy. | "pricing model", "how should we price this" |
| launch-strategy | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/launch-strategy) | 53,600 | MIT | GTM planning and launch sequencing. | "launch plan", "how do we launch this" |
| seo-audit | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/seo-audit) | 103,300 | MIT | Full SEO audit; founders own the website and its findability. | "check our SEO", "audit the landing page" |
| product-marketing-context | coreyhaines31 | [skills.sh](https://skills.sh/coreyhaines31/marketingskills/product-marketing-context) | 58,800 | MIT | Frames product in market context: messaging, positioning, and ICP definition. | "positioning", "who is our customer", "market context" |
| pdf | anthropics | [skills.sh](https://skills.sh/anthropics/skills/pdf) | 99,000 | Apache-2.0 | PDF reading for term sheets, investor materials, contracts, and board decks. | any PDF input, "read this term sheet" |

---

### Data (9 skills)

CSV/XLSX/PDF extraction, analysis, data quality, fuzzy matching, performance optimization.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| xlsx | anthropics | [skills.sh](https://skills.sh/anthropics/skills/xlsx) | 73,300 | Apache-2.0 | Excel/CSV spreadsheet reading, analysis, and generation. | any .xlsx/.csv/.tsv file, "analyze this data" |
| pdf | anthropics | [skills.sh](https://skills.sh/anthropics/skills/pdf) | 99,000 | Apache-2.0 | PDF reading and structured extraction for data sources. | any PDF as data source, "read this report" |
| just-scrape | scrapegraphai | [skills.sh](https://skills.sh/scrapegraphai/just-scrape/just-scrape) | 62,500 | MIT | Zero-config web scraping for data gathering with no API key. | "scrape this data", "extract from this website" |
| fuzzy-match | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Reconciles entity names across datasets using fuzzy string matching. | "match these lists", "dedupe companies" |
| python-parallelization | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | CPU-bound to multiprocessing, I/O-bound to asyncio; parallelization patterns for data pipelines. | "parallelize this", "make this data pipeline faster" |
| memory-optimization | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Reduces memory footprint, fixes leaks, and guides efficient data structure selection. | "out of memory", "reduce memory usage" |
| testing-python | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | pytest for data pipelines: fixtures, parametrize, and mocking patterns. | writing tests for data scripts, "test my pipeline" |
| zoom-out | mattpocock | [skills.sh](https://skills.sh/mattpocock/skills/zoom-out) | 53,600 | MIT | Establishes broader data architecture context before analysis. | before deep-diving, "give me context on this data" |
| docx | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Word document manipulation to generate reports from data analysis results. | "put this analysis in a Word doc" |

---

### Design (9 skills)

UI critique, visual QA, wireframe review, design system checks, screenshot-driven review.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| frontend-design | anthropics | [skills.sh](https://skills.sh/anthropics/skills/frontend-design) | 390,700 | Apache-2.0 | Frontend design guidance: typography, layout, color, and component patterns. | any frontend design decision, "design this component", "how should this look" |
| web-design-guidelines | vercel-labs | [skills.sh](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) | 308,300 | MIT | Comprehensive frontend and UI design guidelines from Vercel. | any frontend work, "check the design", before shipping any UI |
| audit | pbakaus | [skills.sh](https://skills.sh/pbakaus/impeccable/audit) | 82,200 | Apache-2.0 | Systematic UX audit across accessibility, layout, and interaction patterns. | "ux review", "audit this design", "review the UI" |
| polish | pbakaus | [skills.sh](https://skills.sh/pbakaus/impeccable/polish) | 85,500 | Apache-2.0 | Refines UI to a higher quality bar with specific actionable improvements. | "polish this", "improve the UI", "make this look better" |
| critique | pbakaus | [skills.sh](https://skills.sh/pbakaus/impeccable/critique) | 83,000 | Apache-2.0 | Adversarial design critique identifying specific visual and UX weaknesses. | "critique this design", "what's wrong with this UI" |
| tailwind-design-system | wshobson | [skills.sh](https://skills.sh/wshobson/agents/tailwind-design-system) | 40,400 | MIT | Tailwind CSS design system patterns: tokens, components, and consistency. | any Tailwind project, design system work, "improve the design system" |
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Explores design intent before implementing or critiquing. | before any design decision, "should I use X or Y" |
| verification-before-completion | obra | [skills.sh](https://skills.sh/obra/superpowers/verification-before-completion) | 63,400 | MIT | Visual verification before claiming design work done. | before claiming any design work complete |
| wireframe-to-react | floomhq | [floomhq/floom](https://github.com/floomhq/floom) | — | Proprietary | 4-phase workflow: wireframe HTML to production React with visual parity gate. | "implement this wireframe", "convert to React" |

---

### Video (6 skills)

Audio cleanup, caption generation, silence/filler removal, frame review, transcript extraction.

| Skill | Publisher | Source | Installs | License | Description | Fires when |
|---|---|---|---|---|---|---|
| video-polish | floomhq | [floomhq/floom](https://github.com/floomhq/floom) | — | Proprietary | ElevenLabs audio isolation + Gemini-aligned captions; integrated audio cleanup and captioning pipeline. | "polish this video", "clean the audio", "add captions" |
| remotion-best-practices | remotion-dev | [skills.sh](https://skills.sh/remotion-dev/skills/remotion-best-practices) | 299,500 | MIT | Best practices for programmatic video generation with Remotion. | "create a video programmatically", "Remotion project", video generation from code |
| audio-extractor | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Extracts audio from video to WAV format for analysis. | "extract audio from this video", "get the audio track" |
| video-processor | benchflow-ai | [benchflow-ai/skillsbench](https://github.com/benchflow-ai/skillsbench) | — | Apache-2.0 | Removes video segments (silences, openings) via ffmpeg filter_complex. | "remove silences", "cut the intro", batch segment removal |
| brainstorming | obra | [skills.sh](https://skills.sh/obra/superpowers/brainstorming) | 147,400 | MIT | Clarifies video brief and objectives before starting production. | before any video project, "what should this video cover" |
| verification-before-completion | obra | [skills.sh](https://skills.sh/obra/superpowers/verification-before-completion) | 63,400 | MIT | Verifies video output before publishing. | before publishing any video |

---

## Sources we draw from

| Source | Description | License | Skills in this pack |
|---|---|---|---|
| **skills.sh** | The primary skill registry — battle-tested skills with real install counts from thousands of real agent sessions. Covers vercel-labs, obra/superpowers, mattpocock, anthropics, coreyhaines31, pbakaus/impeccable, and more. | Varies per publisher (MIT / Apache-2.0 dominant) | 89 profile slots |
| **Superpowers (obra)** | Sub-source of skills.sh. 14 skills for agent hygiene, planning, parallelism, and quality gates. MIT. | MIT | 20 profile slots |
| **SkillsBench (benchflow-ai)** | Academic-validated skill benchmarks. Apache 2.0. Used for data pipeline, document, and file-processing skills not covered on skills.sh. | Apache-2.0 | 10 profile slots |
| **Floom proprietary** | Three Floom-internal skills that fill genuine gaps — no proven skills.sh equivalent exists for their specific workflows. | Proprietary (Floom team) | 3 profile slots (workplan, wireframe-to-react, video-polish) |

Skills excluded from this pack: gstack skills (review, ship, investigate, guard, health, browse, codex, skillify) — no explicit redistributable license. Firecrawl — requires API key, use `just-scrape` instead.

---

## License compliance

| Skill | License | Redistribution status |
|---|---|---|
| find-skills | MIT | Clear — freely redistributable |
| skill-creator | Apache-2.0 | Clear — freely redistributable with attribution |
| brainstorming | MIT | Clear — freely redistributable |
| grill-me | MIT | Clear — freely redistributable |
| systematic-debugging | MIT | Clear — freely redistributable |
| writing-plans | MIT | Clear — freely redistributable |
| verification-before-completion | MIT | Clear — freely redistributable |
| executing-plans | MIT | Clear — freely redistributable |
| workplan | Proprietary (Floom team) | Floom has full rights — included by owner |
| vercel-react-best-practices | MIT | Clear — freely redistributable |
| web-design-guidelines | MIT | Clear — freely redistributable |
| next-best-practices | MIT | Clear — freely redistributable |
| supabase-postgres-best-practices | Apache-2.0 | Clear — freely redistributable with attribution |
| tdd | MIT | Clear — freely redistributable |
| improve-codebase-architecture | MIT | Clear — freely redistributable |
| requesting-code-review | MIT | Clear — freely redistributable |
| dispatching-parallel-agents | MIT | Clear — freely redistributable |
| webapp-testing | Apache-2.0 | Clear — freely redistributable with attribution |
| playwright-best-practices | MIT | Clear — freely redistributable |
| diagnose | MIT | Clear — freely redistributable |
| finishing-a-development-branch | MIT | Clear — freely redistributable |
| copywriting | MIT | Clear — freely redistributable |
| copy-editing | MIT | Clear — freely redistributable |
| content-strategy | MIT | Clear — freely redistributable |
| brand-guidelines | Apache-2.0 | Clear — freely redistributable with attribution |
| doc-coauthoring | Apache-2.0 | Clear — freely redistributable with attribution |
| internal-comms | Apache-2.0 | Clear — freely redistributable with attribution |
| docx | Apache-2.0 | Clear — freely redistributable with attribution |
| just-scrape | MIT | Clear — freely redistributable |
| agent-browser | MIT | Clear — freely redistributable |
| pdf | Apache-2.0 | Clear — freely redistributable with attribution |
| xlsx | Apache-2.0 | Clear — freely redistributable with attribution |
| zoom-out | MIT | Clear — freely redistributable |
| fuzzy-match | Apache-2.0 | Clear — freely redistributable with attribution |
| seo-audit | MIT | Clear — freely redistributable |
| marketing-psychology | MIT | Clear — freely redistributable |
| social-content | MIT | Clear — freely redistributable |
| programmatic-seo | MIT | Clear — freely redistributable |
| page-cro | MIT | Clear — freely redistributable |
| analytics-tracking | MIT | Clear — freely redistributable |
| launch-strategy | MIT | Clear — freely redistributable |
| schema-markup | MIT | Clear — freely redistributable |
| ab-test-setup | MIT | Clear — freely redistributable |
| cold-email | MIT | Clear — freely redistributable |
| sales-enablement | MIT | Clear — freely redistributable |
| revops | MIT | Clear — freely redistributable |
| churn-prevention | MIT | Clear — freely redistributable |
| to-issues | MIT | Clear — freely redistributable |
| triage | MIT | Clear — freely redistributable |
| to-prd | MIT | Clear — freely redistributable |
| pricing-strategy | MIT | Clear — freely redistributable |
| product-marketing-context | MIT | Clear — freely redistributable |
| python-parallelization | Apache-2.0 | Clear — freely redistributable with attribution |
| memory-optimization | Apache-2.0 | Clear — freely redistributable with attribution |
| testing-python | Apache-2.0 | Clear — freely redistributable with attribution |
| frontend-design | Apache-2.0 | Clear — freely redistributable with attribution |
| audit | Apache-2.0 | Clear — freely redistributable with attribution |
| polish | Apache-2.0 | Clear — freely redistributable with attribution |
| critique | Apache-2.0 | Clear — freely redistributable with attribution |
| tailwind-design-system | MIT | Clear — freely redistributable |
| wireframe-to-react | Proprietary (Floom team) | Floom has full rights — included by owner |
| video-polish | Proprietary (Floom team) | Floom has full rights — included by owner |
| remotion-best-practices | MIT | Clear — freely redistributable |
| audio-extractor | Apache-2.0 | Clear — freely redistributable with attribution |
| video-processor | Apache-2.0 | Clear — freely redistributable with attribution |

**Summary:** 38 MIT, 22 Apache-2.0, 3 Proprietary (Floom, included by owner). Zero source-available or unknown-license skills in this pack. The anthropic/skills pdf/xlsx/docx skills use Apache-2.0 equivalents from benchflow-ai/skillsbench where source-availability is a concern.

---

[floom.dev/starter](https://floom.dev/starter)
