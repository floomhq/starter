/**
 * activation-companion.js
 * Append (or replace) the Floom activation block in agent instruction files.
 */

import fs from "node:fs";
import path from "node:path";

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
  lines.push(`Use \`find-skills\` first when you're not sure which skill applies.`);
  lines.push(BLOCK_END);
  return lines.join("\n");
}

/**
 * Insert or replace the Floom block in the activation file.
 * Idempotent: replaces an existing block if present.
 */
export function upsertActivationBlock(filePath, block) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

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
