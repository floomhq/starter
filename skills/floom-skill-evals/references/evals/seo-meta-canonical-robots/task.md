Audit the provided mini website for SEO technical issues.

Input location:
- /task/input/site

Required output:
- Write JSON to /task/output/result.json with schema:
  {
    "issues": [
      {
        "id": "<stable issue id>",
        "url": "<relative path>",
        "severity": "high|medium|low",
        "details": "<short deterministic detail>"
      }
    ]
  }

Scope:
- title/meta description presence
- canonical tag correctness
- robots directives conflicts
- robots.txt disallowing important pages
- sitemap coverage

Use stable issue IDs and deterministic output ordering (sort by id then url).
