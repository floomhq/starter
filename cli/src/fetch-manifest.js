/**
 * fetch-manifest.js
 * Fetches the starter pack manifest from GitHub, with fallback to the bundled copy.
 *
 * Schema v0.2.0:
 *   manifest.json: slim index (~29KB): slug/name/publisher/description/profiles[]/detail_url per skill
 *   skills/<slug>.json: full data per skill: skill_md_content, fires_when, files, source_repo, etc.
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const MANIFEST_BASE_URL =
  "https://raw.githubusercontent.com/floomhq/starter/main/";

const MANIFEST_URL = MANIFEST_BASE_URL + "manifest.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "..", "data", "fallback-manifest.json");

/**
 * Attempt to fetch JSON from a URL.
 * Returns the parsed object, or null on any error.
 */
async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "@floomhq/starter" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Load the bundled fallback manifest from disk.
 */
function loadFallback() {
  const raw = fs.readFileSync(FALLBACK_PATH, "utf8");
  return JSON.parse(raw);
}

function compareVersions(a, b) {
  const left = String(a || "0").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = String(b || "0").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i++) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Returns { manifest, source: "remote" | "fallback" }
 *
 * The returned manifest conforms to the v0.2.0 slim index schema:
 *   manifest.skills[].detail_url: relative path to per-skill JSON
 *   manifest.profiles[].skill_slugs: ordered list of slugs for the profile
 */
export async function loadManifest() {
  const fallback = loadFallback();
  const remote = await fetchJson(MANIFEST_URL);
  if (remote && compareVersions(remote.version, fallback.version) >= 0) {
    return { manifest: remote, source: "remote" };
  }
  return { manifest: fallback, source: "fallback" };
}

/**
 * Fetch the full per-skill detail JSON for a given slug.
 * Returns the parsed object, or null if the fetch fails.
 *
 * The detail JSON contains:
 *   skill_md_content: full SKILL.md text
 *   skill_md_url: upstream raw URL
 *   fires_when: activation trigger description
 *   files: file tree
 *   source_repo: GitHub repo URL
 *   fetched_at: ISO timestamp of last enrichment
 */
export async function fetchSkillDetail(slug) {
  const url = `${MANIFEST_BASE_URL}skills/${encodeURIComponent(slug)}.json`;
  return await fetchJson(url);
}
