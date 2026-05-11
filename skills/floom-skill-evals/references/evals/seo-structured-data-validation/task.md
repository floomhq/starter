Validate structured data quality for pages in /task/input/site.

Write /task/output/result.json as:
{
  "violations": [
    {"id":"<rule>","url":"<relative path>","details":"<deterministic>"}
  ]
}

Check:
- malformed JSON-LD
- missing required fields for Article (headline, author)
- Organization missing name
- invalid @context
