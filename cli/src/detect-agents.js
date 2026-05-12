/**
 * detect-agents.js
 * Detect which AI agent harnesses are installed.
 *
 * Two scopes are supported:
 *   - Global (machine-wide):   paths under the user's HOME (~/.claude/, ~/.codex/, etc.)
 *   - Project-local (default): paths under the current working directory (./.claude/, ./.codex/, etc.)
 *
 * Project-local is the default starting with @floomhq/starter 0.2.4. Pass --global on
 * the install CLI to opt into the OLD global-scope behaviour.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOME = os.homedir();

/**
 * Per-harness path resolver. Given a base directory (HOME for global, cwd for
 * project-local), returns the absolute skillsDir and activationFile.
 *
 * For opencode we keep the global path under ~/.config/opencode/ (XDG-style)
 * but use a project-local ./.opencode/ when in project scope, because there is
 * no good per-project convention for opencode yet and ./.config/opencode/
 * would surprise users.
 */
const PER_HARNESS = {
  claude: {
    label: "Claude Code",
    activationFileName: "CLAUDE.md",
    global: (h) => ({
      presencePath: path.join(h, ".claude"),
      skillsDir: path.join(h, ".claude", "skills"),
      activationFile: path.join(h, ".claude", "CLAUDE.md"),
    }),
    local: (cwd) => ({
      presencePath: path.join(cwd, ".claude"),
      skillsDir: path.join(cwd, ".claude", "skills"),
      activationFile: path.join(cwd, ".claude", "CLAUDE.md"),
    }),
  },
  codex: {
    label: "Codex CLI",
    activationFileName: "AGENTS.md",
    global: (h) => ({
      presencePath: path.join(h, ".codex"),
      skillsDir: path.join(h, ".codex", "skills"),
      activationFile: path.join(h, ".codex", "AGENTS.md"),
    }),
    local: (cwd) => ({
      presencePath: path.join(cwd, ".codex"),
      skillsDir: path.join(cwd, ".codex", "skills"),
      activationFile: path.join(cwd, "AGENTS.md"),
    }),
  },
  cursor: {
    label: "Cursor",
    activationFileName: "floom-skills.mdc",
    global: (h) => ({
      presencePath: path.join(h, ".cursor"),
      skillsDir: path.join(h, ".cursor", "rules"),
      activationFile: path.join(h, ".cursor", "rules", "floom-skills.mdc"),
    }),
    local: (cwd) => ({
      presencePath: path.join(cwd, ".cursor"),
      skillsDir: path.join(cwd, ".cursor", "rules"),
      activationFile: path.join(cwd, ".cursor", "rules", "floom-skills.mdc"),
    }),
  },
  opencode: {
    label: "OpenCode",
    activationFileName: "AGENTS.md",
    global: (h) => ({
      presencePath: path.join(h, ".config", "opencode"),
      skillsDir: path.join(h, ".config", "opencode", "skills"),
      activationFile: path.join(h, ".config", "opencode", "AGENTS.md"),
    }),
    local: (cwd) => ({
      presencePath: path.join(cwd, ".opencode"),
      skillsDir: path.join(cwd, ".opencode", "skills"),
      activationFile: path.join(cwd, ".opencode", "AGENTS.md"),
    }),
  },
  kimi: {
    label: "Kimi",
    activationFileName: "floom-system.md",
    global: (h) => ({
      presencePath: path.join(h, ".kimi"),
      skillsDir: path.join(h, ".kimi", "skills"),
      activationFile: path.join(h, ".kimi", "agents", "floom-system.md"),
    }),
    local: (cwd) => ({
      presencePath: path.join(cwd, ".kimi"),
      skillsDir: path.join(cwd, ".kimi", "skills"),
      activationFile: path.join(cwd, ".kimi", "agents", "floom-system.md"),
    }),
  },
  pi: {
    label: "Pi",
    activationFileName: "AGENTS.md",
    global: (h) => ({
      presencePath: path.join(h, ".pi"),
      skillsDir: path.join(h, ".pi", "skills"),
      activationFile: path.join(h, ".pi", "AGENTS.md"),
    }),
    local: (cwd) => ({
      presencePath: path.join(cwd, ".pi"),
      skillsDir: path.join(cwd, ".pi", "skills"),
      activationFile: path.join(cwd, ".pi", "AGENTS.md"),
    }),
  },
};

export const SUPPORTED_HARNESSES = Object.keys(PER_HARNESS);

/**
 * Build the AGENT_DEFS table for a given scope.
 * @param {object} opts
 * @param {boolean} opts.globalScope - true = use HOME paths, false = use cwd paths
 * @param {string} opts.cwd - working directory (defaults to process.cwd())
 */
export function buildAgentDefs({ globalScope = false, cwd = process.cwd() } = {}) {
  const result = {};
  for (const [id, def] of Object.entries(PER_HARNESS)) {
    const paths = globalScope ? def.global(HOME) : def.local(cwd);
    result[id] = {
      label: def.label,
      activationFileName: def.activationFileName,
      ...paths,
    };
  }
  return result;
}

/**
 * Kept for back-compat with older test code: AGENT_DEFS in global scope.
 */
export const AGENT_DEFS = buildAgentDefs({ globalScope: true });

/**
 * Returns the array of agent IDs detected in the given scope.
 *
 * @param {object} opts
 * @param {boolean} opts.globalScope - true = look under HOME, false = look under cwd
 * @param {string} opts.cwd - working directory (defaults to process.cwd())
 */
export function detectAgents(opts = {}) {
  const defs = buildAgentDefs(opts);
  return Object.entries(defs)
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
 *
 * @param {string[]} ids - agent IDs. Pass [] to auto-detect.
 * @param {string|null} rootOverride - if set, rewrite all paths under this root (test mode).
 *   The rootOverride layout is `<root>/<id>/<skill_or_activation>` and is used by the
 *   test suite so a single tmp dir holds every harness.
 * @param {object} opts
 * @param {boolean} opts.globalScope - true = use HOME paths, false = use cwd paths
 * @param {string} opts.cwd - working directory (defaults to process.cwd())
 */
export function resolveAgents(ids, rootOverride = null, opts = {}) {
  const defs = buildAgentDefs(opts);
  const agentIds = ids.length > 0 ? ids : detectAgents(opts);

  return agentIds.map((id) => {
    const def = defs[id];
    if (!def) {
      throw new Error(
        `Unknown agent: ${id}. Valid: ${SUPPORTED_HARNESSES.join(", ")}`,
      );
    }

    if (!rootOverride) return { id, ...def };

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
