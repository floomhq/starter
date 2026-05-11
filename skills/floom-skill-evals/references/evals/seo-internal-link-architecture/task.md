Analyze internal link architecture from /task/input/links.csv.

Write /task/output/result.json:
{
  "orphan_pages": ["/url"],
  "broken_links": [{"source":"/a","target":"/b"}],
  "max_click_depth": <int>
}

Deterministic ordering is required.
