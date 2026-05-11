/**
 * activation-companion.js
 * Append (or replace) the Floom activation block in agent instruction files.
 */

import fs from "node:fs";
import path from "node:path";

import { prepareSafeWriteTarget } from "./write-skill.js";

const BLOCK_START = "<!-- FLOOM-START -->";
const BLOCK_END = "<!-- FLOOM-END -->";

/**
 * Build the activation block content.
 * @param {object[]} agents - resolved agent definitions
 * @param {object[]} skills - selected skill objects from manifest
 */
export function buildActivationBlock(agent, skills) {
  const lines = [
    BLOCK_START,
    `## Floom skills available`,
    ``,
    `You have ${skills.length} skills installed via Floom. When a task matches a skill description, load that skill's SKILL.md and follow it.`,
    ``,
  ];

  for (const skill of skills) {
    let skillPath;
    if (agent.id === "cursor") {
      skillPath = path.join(agent.skillsDir, `${skill.slug}.mdc`);
    } else {
      skillPath = path.join(agent.skillsDir, skill.slug, "SKILL.md");
    }
    const desc = (skill.description || skill.slug).replace(/\.+\s*$/, "");
    lines.push(`- **${skill.name || skill.slug}**: ${desc}. Path: \`${skillPath}\``);
  }

  lines.push(``);
  lines.push(`Use the installed skill list above first. If the match is unclear, use \`find-skills\` to inspect only local Floom-installed skills before reaching for general tools.`);
  lines.push(BLOCK_END);
  return lines.join("\n");
}

/**
 * Insert or replace the Floom block in the activation file.
 * Idempotent: replaces an existing block if present.
 */
export function upsertActivationBlock(filePath, block) {
  prepareSafeWriteTarget(path.dirname(filePath), filePath, "activation");

  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const startIdx = existing.indexOf(BLOCK_START);
  const endIdx = existing.indexOf(BLOCK_END);

  let next;
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace existing block
    const before = existing.slice(0, startIdx).trimEnd();
    const after = existing.slice(endIdx + BLOCK_END.length).trimStart();
    next = [before, block, after].filter(Boolean).join("\n\n") + "\n";
  } else {
    // Append to file
    const trimmed = existing.trimEnd();
    next = (trimmed ? trimmed + "\n\n" : "") + block + "\n";
  }

  fs.writeFileSync(filePath, next, "utf8");
}

/**
 * Remove the Floom block from an activation file without following symlinked
 * parent directories or symlinked files.
 */
export function stripActivationBlock(filePath) {
  if (!fs.existsSync(filePath)) return false;
  prepareSafeWriteTarget(path.dirname(filePath), filePath, "activation");

  const content = fs.readFileSync(filePath, "utf8");
  const startIdx = content.indexOf(BLOCK_START);
  const endIdx = content.indexOf(BLOCK_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return false;

  const before = content.slice(0, startIdx).trimEnd();
  const after = content.slice(endIdx + BLOCK_END.length).trimStart();
  const next = [before, after].filter(Boolean).join("\n\n") + "\n";
  fs.writeFileSync(filePath, next, "utf8");
  return true;
}
