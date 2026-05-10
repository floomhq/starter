/**
 * detect-agents.js
 * Detect which AI agent harnesses are installed on the machine.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOME = os.homedir();

/**
 * Agent definitions.
 * presencePath: a file or directory whose existence confirms the agent is installed.
 * skillsDir: where SKILL.md files go.
 * activationFile: the markdown file where we append the activation companion block.
 */
export const AGENT_DEFS = {
  claude: {
    label: "Claude Code",
    presencePath: path.join(HOME, ".claude"),
    skillsDir: path.join(HOME, ".claude", "skills"),
    activationFile: path.join(HOME, ".claude", "CLAUDE.md"),
    activationFileName: "CLAUDE.md",
  },
  codex: {
    label: "Codex CLI",
    presencePath: path.join(HOME, ".codex"),
    skillsDir: path.join(HOME, ".codex", "skills"),
    activationFile: path.join(HOME, ".codex", "AGENTS.md"),
    activationFileName: "AGENTS.md",
  },
  cursor: {
    label: "Cursor",
    presencePath: path.join(HOME, ".cursor"),
    skillsDir: path.join(HOME, ".cursor", "rules"),
    activationFile: path.join(HOME, ".cursor", "rules", "floom-skills.mdc"),
    activationFileName: "floom-skills.mdc",
  },
  opencode: {
    label: "OpenCode",
    presencePath: path.join(HOME, ".config", "opencode"),
    skillsDir: path.join(HOME, ".config", "opencode", "skills"),
    activationFile: path.join(HOME, ".config", "opencode", "AGENTS.md"),
    activationFileName: "AGENTS.md",
  },
  kimi: {
    label: "Kimi",
    presencePath: path.join(HOME, ".kimi"),
    skillsDir: path.join(HOME, ".kimi", "skills"),
    activationFile: path.join(HOME, ".kimi", "agents", "floom-system.md"),
    activationFileName: "floom-system.md",
  },
};

/**
 * Returns an array of agent IDs that are detected on this machine.
 */
export function detectAgents() {
  return Object.entries(AGENT_DEFS)
    .filter(([, def]) => {
      try {
        fs.accessSync(def.presencePath);
        return true;
      } catch {
        return false;
      }
    })
    .map(([id]) => id);
}

/**
 * Resolve agent definitions for a given list of IDs (or detected IDs).
 * @param {string[]} ids - agent IDs. Pass [] to auto-detect.
 * @param {string|null} rootOverride - if set, rewrite all paths under this root.
 */
export function resolveAgents(ids, rootOverride = null) {
  const agentIds = ids.length > 0 ? ids : detectAgents();

  return agentIds.map((id) => {
    const def = AGENT_DEFS[id];
    if (!def) throw new Error(`Unknown agent: ${id}. Valid: ${Object.keys(AGENT_DEFS).join(", ")}`);

    if (!rootOverride) return { id, ...def };

    // Rewrite all paths under rootOverride for testing
    return {
      id,
      label: def.label,
      presencePath: path.join(rootOverride, id),
      skillsDir: path.join(rootOverride, id, "skills"),
      activationFile: path.join(rootOverride, id, def.activationFileName),
      activationFileName: def.activationFileName,
    };
  });
}
