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

async function fetchBytes(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "@floomhq/starter" },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
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

function parseRawGithubUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== "raw.githubusercontent.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 5) return null;
    const [owner, repo, ref, ...filePathParts] = parts;
    const fileName = filePathParts[filePathParts.length - 1];
    if (fileName !== "SKILL.md") return null;
    return {
      owner,
      repo,
      ref,
      skillDir: filePathParts.slice(0, -1).join("/"),
    };
  } catch {
    return null;
  }
}

function encodePathParts(value) {
  return value.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function safeSupportPath(value) {
  if (!value || typeof value !== "string") return null;
  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.some((part) => part === "." || part === "..")) return null;
  return parts.join("/");
}

function isSkippedSupportPath(value) {
  const first = value.split("/")[0];
  return first === "evals" || first === ".git" || first === "__pycache__";
}

async function fetchGithubContents(meta, relPath) {
  const apiPath = [meta.skillDir, relPath].filter(Boolean).join("/");
  const url =
    `https://api.github.com/repos/${encodeURIComponent(meta.owner)}/${encodeURIComponent(meta.repo)}` +
    `/contents/${encodePathParts(apiPath)}?ref=${encodeURIComponent(meta.ref)}`;
  return await fetchJson(url);
}

async function collectDownloadTargets(meta, relPath, out, limits) {
  if (out.length >= limits.maxFiles) return;
  const safePath = safeSupportPath(relPath);
  if (!safePath || isSkippedSupportPath(safePath)) return;

  const listing = await fetchGithubContents(meta, safePath);
  if (!listing) return;
  const entries = Array.isArray(listing) ? listing : [listing];

  for (const entry of entries) {
    if (out.length >= limits.maxFiles) return;
    const childPath = safeSupportPath(entry.path?.replace(`${meta.skillDir}/`, "") || entry.name);
    if (!childPath || isSkippedSupportPath(childPath)) continue;
    if (entry.type === "dir") {
      await collectDownloadTargets(meta, childPath, out, limits);
    } else if (entry.type === "file" && entry.download_url && entry.size <= limits.maxBytesPerFile) {
      out.push({ path: childPath, url: entry.download_url, size: entry.size || 0 });
    }
  }
}

/**
 * Fetch support files/folders for remote skill details.
 *
 * The starter pack ships the SKILL.md entrypoints in-package. Support files are
 * fetched from the upstream raw GitHub URL when the network is available so
 * folder-based skills keep their references/scripts without bloating the npm
 * tarball. Missing support files never block the core SKILL.md install.
 */
export async function fetchSupportFiles(detail, opts = {}) {
  const limits = {
    maxFiles: opts.maxFiles || 80,
    maxBytesPerFile: opts.maxBytesPerFile || 250_000,
    maxTotalBytes: opts.maxTotalBytes || 2_000_000,
  };
  const meta = parseRawGithubUrl(detail?.skill_md_url);
  if (!meta || !Array.isArray(detail?.files)) return [];

  const targets = [];
  for (const file of detail.files) {
    const relPath = safeSupportPath(file.name);
    if (!relPath || relPath === "SKILL.md" || isSkippedSupportPath(relPath)) continue;
    if ((file.size_bytes || 0) > 0) {
      const rawUrl =
        `https://raw.githubusercontent.com/${encodeURIComponent(meta.owner)}/${encodeURIComponent(meta.repo)}` +
        `/${encodeURIComponent(meta.ref)}/${encodePathParts([meta.skillDir, relPath].filter(Boolean).join("/"))}`;
      targets.push({ path: relPath, url: rawUrl, size: file.size_bytes || 0 });
    } else {
      await collectDownloadTargets(meta, relPath, targets, limits);
    }
    if (targets.length >= limits.maxFiles) break;
  }

  const files = [];
  let totalBytes = 0;
  for (const target of targets) {
    if (files.length >= limits.maxFiles) break;
    if (target.size > limits.maxBytesPerFile) continue;
    if (totalBytes + target.size > limits.maxTotalBytes) break;
    const bytes = await fetchBytes(target.url);
    if (!bytes) continue;
    totalBytes += bytes.length;
    files.push({ path: target.path, bytes });
  }
  return files;
}
