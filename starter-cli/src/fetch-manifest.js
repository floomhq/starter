/**
 * fetch-manifest.js
 * Fetches the starter pack manifest from GitHub, with fallback to the bundled copy.
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const MANIFEST_URL =
  "https://raw.githubusercontent.com/floomhq/packs/main/packs/floom-starter/manifest.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "..", "data", "fallback-manifest.json");

/**
 * Attempt to fetch the live manifest from GitHub.
 * Returns the parsed object, or null on any error.
 */
async function fetchRemote(url) {
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

/**
 * Returns { manifest, source: "remote" | "fallback" }
 */
export async function loadManifest() {
  const remote = await fetchRemote(MANIFEST_URL);
  if (remote) {
    return { manifest: remote, source: "remote" };
  }
  return { manifest: loadFallback(), source: "fallback" };
}
