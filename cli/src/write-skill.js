/**
 * write-skill.js
 * Write a skill to an agent's skill directory.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the bundled skills directory in the repo (sibling to cli/).
// In the flat layout, the repo only ships per-skill JSON files at skills/<slug>.json,
// not raw SKILL.md trees. This dev-mode lookup is preserved for back-compat: if a
// SKILL.md file happens to exist on disk it will be used. Otherwise the loader
// falls through to data/bundled-skills.json which is the canonical source.
const BUNDLED_SKILLS_DIR = path.resolve(__dirname, "..", "..", "skills");

/**
 * Load the SKILL.md content for a given slug.
 * Priority: bundled source tree > embedded data in this package.
 */
export function loadSkillContent(slug) {
  // Try source tree first (packs repo development mode)
  const sourceFile = path.join(BUNDLED_SKILLS_DIR, slug, "SKILL.md");
  if (fs.existsSync(sourceFile)) {
    return fs.readFileSync(sourceFile, "utf8");
  }

  // Fall back to the embedded skills map bundled with this package
  const { BUNDLED_SKILLS } = await_bundled_skills();
  const content = BUNDLED_SKILLS[slug];
  if (!content) throw new Error(`No bundled content for skill: ${slug}`);
  return content;
}

// Synchronous dynamic require workaround for ES modules
// We pre-load the bundled skills lazily on first call
let _bundledSkills = null;
function await_bundled_skills() {
  if (_bundledSkills) return _bundledSkills;
  const dataPath = path.join(__dirname, "..", "data", "bundled-skills.json");
  if (!fs.existsSync(dataPath)) {
    _bundledSkills = { BUNDLED_SKILLS: {} };
  } else {
    _bundledSkills = { BUNDLED_SKILLS: JSON.parse(fs.readFileSync(dataPath, "utf8")) };
  }
  return _bundledSkills;
}

/**
 * Convert SKILL.md markdown frontmatter to Cursor .mdc format.
 * Cursor rules use a slightly different YAML header.
 */
export function convertToCursorMdc(slug, content) {
  // Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    // No frontmatter, wrap in minimal mdc header
    return `---\ndescription: Floom skill: ${slug}\nglobs: []\nalwaysApply: false\n---\n${content}`;
  }

  const yamlBody = frontmatterMatch[1];
  const body = frontmatterMatch[2];

  // Parse key: value pairs from YAML (simple, no deps)
  const yamlLines = yamlBody.split("\n");
  const yamlFields = {};
  for (const line of yamlLines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    yamlFields[key] = value;
  }

  const description = yamlFields.description || yamlFields.name || `Floom skill: ${slug}`;
  const mdcFrontmatter = `---\ndescription: ${description}\nglobs: []\nalwaysApply: false\n---`;
  return `${mdcFrontmatter}\n${body}`;
}

/**
 * Compute a short SHA-256 hash of a string for content comparison.
 */
function hashContent(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

/**
 * Write a skill to the target agent's skill directory.
 *
 * For Claude/Codex/OpenCode/Kimi: writes <skillsDir>/<slug>/SKILL.md
 * For Cursor: writes <skillsDir>/<slug>.mdc (converted format)
 *
 * Collision behaviour (when !force):
 *   - File absent              → write normally, action: "written"
 *   - File present, same hash  → silent skip (idempotent), action: "skipped"
 *   - File present, diff hash  → keep user file, action: "kept", warn: true
 */
export function writeSkill(agent, slug, content, force = false) {
  if (agent.id === "cursor") {
    const dest = path.join(agent.skillsDir, `${slug}.mdc`);
    if (fs.existsSync(dest) && !force) {
      const existing = fs.readFileSync(dest, "utf8");
      const incomingMdc = convertToCursorMdc(slug, content);
      if (hashContent(existing) === hashContent(incomingMdc)) {
        return { path: dest, action: "skipped" };
      }
      return { path: dest, action: "kept", warn: true };
    }
    fs.mkdirSync(agent.skillsDir, { recursive: true });
    const mdcContent = convertToCursorMdc(slug, content);
    fs.writeFileSync(dest, mdcContent, "utf8");
    return { path: dest, action: "written" };
  }

  // All others: write <skillsDir>/<slug>/SKILL.md
  const dest = path.join(agent.skillsDir, slug, "SKILL.md");
  if (fs.existsSync(dest) && !force) {
    const existing = fs.readFileSync(dest, "utf8");
    if (hashContent(existing) === hashContent(content)) {
      return { path: dest, action: "skipped" };
    }
    return { path: dest, action: "kept", warn: true };
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
  return { path: dest, action: "written" };
}
