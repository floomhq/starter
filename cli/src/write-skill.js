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
const SAFE_SKILL_SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;

export function assertSafeSkillSlug(slug) {
  if (typeof slug !== "string" || !SAFE_SKILL_SLUG.test(slug)) {
    throw new Error(`Unsafe skill slug: ${slug}`);
  }
}

function safeJoinInside(root, ...parts) {
  const dest = path.resolve(root, ...parts);
  const base = path.resolve(root);
  if (dest !== base && !dest.startsWith(base + path.sep)) {
    throw new Error(`Refusing to write outside skill root: ${dest}`);
  }
  return dest;
}

export function prepareSafeWriteTarget(root, dest, label = "file") {
  const basePath = path.resolve(root);
  const destPath = path.resolve(dest);
  if (destPath !== basePath && !destPath.startsWith(basePath + path.sep)) {
    throw new Error(`Refusing to write outside ${label} root: ${destPath}`);
  }

  fs.mkdirSync(basePath, { recursive: true });
  if (fs.lstatSync(basePath).isSymbolicLink()) {
    throw new Error(`Refusing to write through symlinked ${label} root: ${basePath}`);
  }

  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.lstatSync(dir).isSymbolicLink()) {
    throw new Error(`Refusing to write through symlinked ${label} path: ${destPath}`);
  }

  const base = fs.realpathSync(basePath);
  const realDir = fs.realpathSync(dir);
  if (realDir !== base && !realDir.startsWith(base + path.sep)) {
    throw new Error(`Refusing to write through symlinked ${label} path: ${destPath}`);
  }
  if (fs.existsSync(destPath) && fs.lstatSync(destPath).isSymbolicLink()) {
    throw new Error(`Refusing to write through symlinked ${label} file: ${destPath}`);
  }
}

/**
 * Load the SKILL.md content for a given slug.
 * Priority: bundled source tree > embedded data in this package.
 */
export function loadSkillContent(slug) {
  assertSafeSkillSlug(slug);
  // Try source tree first (packs repo development mode)
  const sourceFile = safeJoinInside(BUNDLED_SKILLS_DIR, slug, "SKILL.md");
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
  assertSafeSkillSlug(slug);
  if (agent.id === "cursor") {
    const dest = safeJoinInside(agent.skillsDir, `${slug}.mdc`);
    prepareSafeWriteTarget(agent.skillsDir, dest, "skill");
    if (fs.existsSync(dest) && !force) {
      const existing = fs.readFileSync(dest, "utf8");
      const incomingMdc = convertToCursorMdc(slug, content);
      if (hashContent(existing) === hashContent(incomingMdc)) {
        return { path: dest, action: "skipped" };
      }
      return { path: dest, action: "kept", warn: true };
    }
    const mdcContent = convertToCursorMdc(slug, content);
    fs.writeFileSync(dest, mdcContent, "utf8");
    return { path: dest, action: "written" };
  }

  // All others: write <skillsDir>/<slug>/SKILL.md
  const dest = safeJoinInside(agent.skillsDir, slug, "SKILL.md");
  prepareSafeWriteTarget(agent.skillsDir, dest, "skill");
  if (fs.existsSync(dest) && !force) {
    const existing = fs.readFileSync(dest, "utf8");
    if (hashContent(existing) === hashContent(content)) {
      return { path: dest, action: "skipped" };
    }
    return { path: dest, action: "kept", warn: true };
  }
  fs.writeFileSync(dest, content, "utf8");
  return { path: dest, action: "written" };
}
