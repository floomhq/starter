/**
 * install.js
 * Core install logic for @floomhq/starter.
 *
 * Scope rules (since 0.2.4):
 *   - Default scope is project-local. Skills go to <cwd>/.claude/skills/, etc.,
 *     and the manifest tracker lives at <cwd>/.floom/manifest.json.
 *   - Pass globalScope: true (CLI: --global) to opt into the OLD machine-wide
 *     behaviour. Skills go to ~/.claude/skills/, manifest at ~/.floom/manifest.json.
 *   - The --root override path is for tests; it overrides everything and points
 *     all agent paths into a single sandboxed dir. It is NOT documented for users.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadManifest, fetchSkillDetail } from "./fetch-manifest.js";
import { resolveAgents, detectAgents, SUPPORTED_HARNESSES } from "./detect-agents.js";
import { loadSkillContent, writeSkill } from "./write-skill.js";
import { buildActivationBlock, upsertActivationBlock } from "./activation-companion.js";

/**
 * Compute the path to the local install manifest tracker.
 *  - --root override: <root>/.floom/manifest.json
 *  - global scope:    ~/.floom/manifest.json
 *  - project local:   <cwd>/.floom/manifest.json
 */
function manifestPathFor({ root, globalScope, cwd }) {
  if (root) return path.join(root, ".floom", "manifest.json");
  if (globalScope) return path.join(os.homedir(), ".floom", "manifest.json");
  return path.join(cwd, ".floom", "manifest.json");
}

/**
 * Resolve skill objects from manifest given profile IDs or explicit slugs.
 */
function selectSkills(manifest, opts) {
  if (opts.all) {
    return manifest.skills;
  }

  const slugSet = new Set();

  if (opts.profiles && opts.profiles.length > 0) {
    // Always include core
    const profileIds = opts.profiles.includes("core") ? opts.profiles : ["core", ...opts.profiles];
    for (const pid of profileIds) {
      const profile = manifest.profiles.find((p) => p.id === pid);
      if (!profile) {
        throw new Error(
          `Unknown profile: ${pid}. Valid: ${manifest.profiles.map((p) => p.id).join(", ")}`,
        );
      }
      // v0.2.0 uses skill_slugs; v0.1.x used skills (array of slugs)
      const slugsForProfile = profile.skill_slugs || profile.skills || [];
      for (const slug of slugsForProfile) slugSet.add(slug);
    }
  }

  if (opts.skills && opts.skills.length > 0) {
    for (const slug of opts.skills) {
      const found = manifest.skills.find((s) => s.slug === slug);
      if (!found) throw new Error(`Unknown skill slug: ${slug}`);
      slugSet.add(slug);
    }
  }

  if (slugSet.size === 0) {
    // Default: install the defaultProfiles
    for (const pid of manifest.defaultProfiles || ["core"]) {
      const profile = manifest.profiles.find((p) => p.id === pid);
      if (profile) {
        const slugsForProfile = profile.skill_slugs || profile.skills || [];
        for (const slug of slugsForProfile) slugSet.add(slug);
      }
    }
  }

  return manifest.skills.filter((s) => slugSet.has(s.slug));
}

/**
 * Reject unknown / unsupported harnesses up front so we never silently
 * drop a target the user explicitly asked for. Triggers the explicit
 * "Gemini is not currently supported" error message required by 0.2.4.
 */
function validateHarnesses(harnessList) {
  const errors = [];
  for (const id of harnessList) {
    if (id === "gemini") {
      errors.push(
        "Gemini is not currently supported by Floom Starter Pack.\n" +
          `  Supported agents: Claude Code, Codex, Cursor, Kimi, OpenCode.\n` +
          "  See https://github.com/floomhq/starter for the full list.",
      );
    } else if (!SUPPORTED_HARNESSES.includes(id)) {
      errors.push(
        `Unknown harness: ${id}.\n` +
          `  Supported agents: ${SUPPORTED_HARNESSES.join(", ")}.`,
      );
    }
  }
  return errors;
}

/**
 * Heuristic: does this dir look like a project the user expects to have
 * a project-local .claude/ etc. installed into? If not, ask before
 * creating files. Used to avoid surprising users who run npx in $HOME.
 */
function looksLikeProject(cwd) {
  const markers = [
    "package.json",
    "pyproject.toml",
    ".git",
    ".claude",
    ".codex",
    ".cursor",
    ".kimi",
    ".opencode",
    "Cargo.toml",
    "go.mod",
    "requirements.txt",
  ];
  for (const m of markers) {
    if (fs.existsSync(path.join(cwd, m))) return true;
  }
  return false;
}

/**
 * Synchronous y/n prompt via readline.
 * Resolves true on y/yes (case-insensitive).
 */
async function confirm(question) {
  // Lazy import to avoid pulling readline when --yes is set.
  const readline = await import("node:readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const a = (answer || "").trim().toLowerCase();
      resolve(a === "y" || a === "yes");
    });
  });
}

/**
 * Build the local manifest payload used for tracking installs.
 */
function buildLocalManifestPayload(agents, installedSkills, manifestVersion) {
  const now = new Date().toISOString();
  return {
    version: "1",
    updatedAt: now,
    installed_skills: installedSkills.map((skill) => ({
      slug: skill.slug,
      name: skill.name,
      source: skill.source,
      sourceUrl: skill.upstream
        ? `https://github.com/benchflow-ai/skillsbench/tree/411dc68/${skill.upstream}`
        : "https://github.com/floomhq/starter/tree/main/skills/" + skill.slug,
      version: manifestVersion,
      installedAt: now,
      installedPaths: agents.map((agent) => ({
        harness: agent.id,
        path:
          agent.id === "cursor"
            ? path.join(agent.skillsDir, `${skill.slug}.mdc`)
            : path.join(agent.skillsDir, skill.slug, "SKILL.md"),
      })),
    })),
  };
}

/**
 * Write the local manifest tracker to the resolved path.
 */
function writeLocalManifest(manifestPath, agents, installedSkills, manifestVersion) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  const payload = buildLocalManifestPayload(agents, installedSkills, manifestVersion);
  fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  return manifestPath;
}

/**
 * Main install function.
 *
 * @param {object} opts
 * @param {string[]} opts.profiles - profile IDs
 * @param {string[]} opts.skills - explicit skill slugs
 * @param {boolean} opts.all - install all skills
 * @param {string[]} opts.harness - explicit agent IDs (empty = auto-detect)
 * @param {string|null} opts.root - path override for testing
 * @param {boolean} opts.force - overwrite existing skills
 * @param {boolean} opts.dryRun - print plan but don't write
 * @param {boolean} opts.globalScope - install machine-wide instead of project-local
 * @param {boolean} opts.yes - skip interactive confirmation prompts
 * @param {boolean} opts.verbose - print per-skill fetch errors on failure
 * @param {string} opts.cwd - working dir (defaults to process.cwd())
 * @param {function} opts.log - logger function (defaults to console.log)
 */
export async function install(opts = {}) {
  const log = opts.log || console.log;
  const cwd = opts.cwd || process.cwd();
  const globalScope = Boolean(opts.globalScope);

  // 0. Validate any explicitly-passed harnesses BEFORE doing any work.
  const requestedHarnesses = opts.harness || [];
  const harnessErrors = validateHarnesses(requestedHarnesses);
  if (harnessErrors.length > 0) {
    for (const err of harnessErrors) {
      log("");
      log("  Error: " + err);
    }
    log("");
    return { failed: true, harnessRejected: true };
  }

  // 1. Load manifest
  const { manifest, source } = await loadManifest();
  if (source === "fallback") {
    log("  (using bundled manifest, floomhq/starter not reachable)");
  }

  // 2. Select skills
  const skills = selectSkills(manifest, opts);
  if (skills.length === 0) {
    throw new Error("No skills selected. Use --profiles, --skills, or --all.");
  }

  // 3. Detect/resolve agents in the chosen scope.
  const agentScopeOpts = { globalScope, cwd };
  const agentIds =
    requestedHarnesses.length > 0 ? requestedHarnesses : detectAgents(agentScopeOpts);

  // Project-local + auto-detect + nothing matches: if the dir doesn't look
  // like a project, ask once before scaffolding .claude/ in $HOME.
  if (
    !globalScope &&
    !opts.root &&
    requestedHarnesses.length === 0 &&
    agentIds.length === 0
  ) {
    if (!looksLikeProject(cwd)) {
      if (!opts.yes) {
        const ok = await confirm(
          `  No project markers found in ${cwd}.\n` +
            `  Create project-local .claude/ here? (y/n) `,
        );
        if (!ok) {
          log("");
          log("  Cancelled. Re-run with --global to install machine-wide instead,");
          log("  or cd into a project directory first.");
          return { cancelled: true };
        }
      }
    }
    // Default to claude when nothing is detected; matches the 60-second
    // promise. Users on other harnesses pass --harness explicitly.
    agentIds.push("claude");
  }

  if (agentIds.length === 0) {
    throw new Error(
      "No AI agents detected. Install Claude Code, Codex, Cursor, OpenCode, or Kimi first.",
    );
  }

  const agents = resolveAgents(agentIds, opts.root || null, agentScopeOpts);

  // 4. Print install scope and plan
  const scopeLabel = opts.root
    ? `test (${opts.root})`
    : globalScope
      ? `global (~/) (machine-wide)`
      : `./project-local`;
  log(`  Installing to: ${scopeLabel}` +
    (!globalScope && !opts.root ? ` (use --global to install machine-wide)` : ""));

  const detected = agents.map((a) => a.label);
  log(`  Detected agents: ${detected.join(", ")}`);
  log(`  Skills selected: ${skills.length}`);

  if (opts.dryRun) {
    log("");
    log("Dry run, no files written. Re-run without --dry-run to install.");
    log("");
    log("Would install:");
    for (const agent of agents) {
      log(`  ${agent.label} (${agent.id})`);
      log(`    skills dir: ${agent.skillsDir}`);
      log(`    activation: ${agent.activationFile}`);
      for (const skill of skills) {
        const dest =
          agent.id === "cursor"
            ? path.join(agent.skillsDir, `${skill.slug}.mdc`)
            : path.join(agent.skillsDir, skill.slug, "SKILL.md");
        log(`      ${skill.slug} -> ${dest}`);
      }
    }
    return { agents, skills, dryRun: true };
  }

  // 5. Pre-fetch all per-skill detail JSONs for SKILL.md content.
  // Track per-slug fetch errors for the verbose / better-error reporting
  // requirement from the 0.2.4 hardening pass.
  const skillContentCache = new Map();
  const fetchErrors = [];

  await Promise.all(
    skills.map(async (skill) => {
      let content = null;
      let fetchErr = null;
      if (source === "remote") {
        try {
          const detail = await fetchSkillDetail(skill.slug);
          if (detail && detail.skill_md_content) {
            content = detail.skill_md_content;
          } else if (detail) {
            fetchErr = "remote per-skill JSON missing skill_md_content";
          } else {
            fetchErr = "remote per-skill JSON fetch returned null";
          }
        } catch (err) {
          fetchErr = `fetch threw: ${err.message}`;
        }
      }
      if (!content) {
        try {
          content = loadSkillContent(skill.slug);
        } catch (err) {
          if (!fetchErr) fetchErr = err.message;
        }
      }
      skillContentCache.set(skill.slug, content);
      if (!content && fetchErr) {
        fetchErrors.push({ slug: skill.slug, error: fetchErr });
      }
    }),
  );

  // 6. Write skills to disk.
  const results = [];
  for (const agent of agents) {
    const agentResults = [];
    for (const skill of skills) {
      const content = skillContentCache.get(skill.slug);
      if (!content) {
        agentResults.push({
          slug: skill.slug,
          action: "error",
          error: "No SKILL.md content available (fetch failed)",
        });
        continue;
      }
      try {
        const result = writeSkill(agent, skill.slug, content, opts.force || false);
        if (result.warn) {
          log(
            `  Kept your custom version of ${skill.slug} at ${result.path}. To overwrite, delete that file first.`,
          );
        }
        agentResults.push({ slug: skill.slug, ...result });
      } catch (err) {
        agentResults.push({ slug: skill.slug, action: "error", error: err.message });
      }
    }
    results.push({ agent, skills: agentResults });
  }

  // 7. Compute results FIRST so the manifest + activation block reflect
  // RESULTS, not INTENT. (Bug from 0.2.0 era: we used to write activation
  // entries for skills that never landed.)
  const allSkillResults = results.flatMap((r) => r.skills);
  const written = allSkillResults.filter((s) => s.action === "written").length;
  const skipped = allSkillResults.filter((s) => s.action === "skipped").length;
  const kept = allSkillResults.filter((s) => s.action === "kept").length;
  const errors = allSkillResults.filter((s) => s.action === "error").length;

  const successfulActions = new Set(["written", "skipped", "kept"]);
  const successfulSlugs = new Set(
    allSkillResults.filter((r) => successfulActions.has(r.action)).map((r) => r.slug),
  );
  const installedSkills = skills.filter((s) => successfulSlugs.has(s.slug));
  const failedSlugs = skills
    .filter((s) => !successfulSlugs.has(s.slug))
    .map((s) => s.slug);

  // 8. Write activation companion (from RESULTS).
  const activationFiles = [];
  for (const agent of agents) {
    const block = buildActivationBlock(agent, installedSkills);
    upsertActivationBlock(agent.activationFile, block);
    activationFiles.push(agent.activationFile);
  }

  // 9. Write local manifest tracker (from RESULTS).
  const manifestPath = manifestPathFor({ root: opts.root || null, globalScope, cwd });
  writeLocalManifest(manifestPath, agents, installedSkills, manifest.version);

  // 10. Print summary with the explicit partial-failure message required
  // by the 0.2.4 hardening pass.
  log("");
  if (errors > 0 && installedSkills.length > 0) {
    log(`  Installed ${installedSkills.length} of ${skills.length} skills.`);
    log(`  ${errors} skills failed to fetch SKILL.md content. They were skipped.`);
    if (failedSlugs.length > 0) {
      const head = failedSlugs.slice(0, 3).join(", ");
      const tail = failedSlugs.length > 3 ? ` (and ${failedSlugs.length - 3} more)` : "";
      log(`  Failed skills: ${head}${tail}`);
    }
    if (!opts.verbose) {
      log(`  Re-run with --verbose for the per-skill fetch errors.`);
    } else if (fetchErrors.length > 0) {
      log(`  Per-skill fetch errors:`);
      for (const e of fetchErrors) {
        log(`    ${e.slug}: ${e.error}`);
      }
    }
  } else {
    log(`  ${written} skills installed, ${kept} skipped (your custom versions kept)`);
    if (skipped > 0) log(`  ${skipped} already up to date (no changes)`);
  }
  log(`  Activation rules written to:`);
  for (const f of activationFiles) log(`    ${f}`);
  log(`  Manifest: ${manifestPath}`);
  log("");
  log(`  Try: ask your agent "find a skill for this task", find-skills will fire.`);

  // 11. Decide exit signal. Per 0.2.4 spec:
  //   - any installs landed:        exit 0 (partial success is success)
  //   - all skills failed:          exit 1
  const failed = errors > 0 && installedSkills.length === 0;
  if (failed) {
    log("");
    log(`  Install FAILED: 0 skills written across all agents (${errors} errors).`);
    log(`  Likely cause: per-skill JSONs missing skill_md_content or network fetch blocked.`);
  }

  return {
    agents,
    skills,
    installedSkills,
    results,
    manifestPath,
    activationFiles,
    failed,
    errors,
    written,
    kept,
    skipped,
    fetchErrors,
  };
}

/**
 * Update: re-fetch the manifest, re-install only skills whose remote fetched_at
 * is newer than the local installedAt. User-modified SKILL.md files are NOT
 * overwritten (the existing collision-detection in writeSkill handles that).
 */
export async function update(opts = {}) {
  const log = opts.log || console.log;
  const cwd = opts.cwd || process.cwd();
  const globalScope = Boolean(opts.globalScope);

  const harnessErrors = validateHarnesses(opts.harness || []);
  if (harnessErrors.length > 0) {
    for (const err of harnessErrors) {
      log("");
      log("  Error: " + err);
    }
    log("");
    return { failed: true, harnessRejected: true };
  }

  const manifestPath = manifestPathFor({ root: opts.root || null, globalScope, cwd });

  if (!fs.existsSync(manifestPath)) {
    log(`  No installed manifest found at ${manifestPath}.`);
    log(`  Run \`npx @floomhq/starter install\` first.`);
    return { failed: true };
  }

  const localManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const localBySlug = new Map(
    (localManifest.installed_skills || []).map((s) => [s.slug, s]),
  );

  log("");
  log(`  Floom Starter, checking for updates against ${manifestPath}`);

  const { manifest } = await loadManifest();
  // Find skills where remote is newer than local, OR local entry is missing
  // skill_md_content (always re-fetch in that case).
  const slugsToCheck = Array.from(localBySlug.keys());

  const toUpdate = [];
  let unchanged = 0;
  await Promise.all(
    slugsToCheck.map(async (slug) => {
      const detail = await fetchSkillDetail(slug);
      if (!detail) return;
      const remoteFetchedAt = detail.fetched_at || "";
      const local = localBySlug.get(slug);
      const localInstalledAt = (local && local.installedAt) || "";
      if (!remoteFetchedAt) return;
      if (!localInstalledAt || remoteFetchedAt > localInstalledAt) {
        toUpdate.push(slug);
      } else {
        unchanged++;
      }
    }),
  );

  log(`  ${toUpdate.length} skills have updates. ${unchanged} are up to date.`);

  if (toUpdate.length === 0) {
    log(`  Nothing to do.`);
    return { updated: 0, unchanged };
  }

  // Re-run install for just those slugs, preserving the user's scope.
  const result = await install({
    ...opts,
    profiles: [],
    skills: toUpdate,
    all: false,
    harness: opts.harness || [],
    log,
  });
  return { updated: result.installedSkills ? result.installedSkills.length : 0, unchanged, ...result };
}

/**
 * Remove installed skills.
 *
 * @param {object} opts
 * @param {boolean} opts.all - remove every installed skill
 * @param {string[]} opts.skills - explicit slugs to remove
 * @param {string[]} opts.profiles - all skills in these profiles
 * @param {string[]} opts.harness - which agents to clean (default: all detected in scope)
 * @param {string|null} opts.root - test sandbox root
 * @param {boolean} opts.dryRun - print plan, write nothing
 * @param {boolean} opts.globalScope - operate on global ~/ paths instead of cwd
 * @param {function} opts.log - logger
 */
export async function remove(opts = {}) {
  const log = opts.log || console.log;
  const cwd = opts.cwd || process.cwd();
  const globalScope = Boolean(opts.globalScope);

  const harnessErrors = validateHarnesses(opts.harness || []);
  if (harnessErrors.length > 0) {
    for (const err of harnessErrors) {
      log("");
      log("  Error: " + err);
    }
    log("");
    return { failed: true, harnessRejected: true };
  }

  const { manifest } = await loadManifest();

  const agentScopeOpts = { globalScope, cwd };
  const agentIds =
    opts.harness && opts.harness.length > 0 ? opts.harness : detectAgents(agentScopeOpts);

  // For project-local removal we want the agents the user actually has installed
  // here. If none, fall back to "claude" so a misclick on uninstall is not a
  // loud crash.
  const agents = resolveAgents(
    agentIds.length > 0 ? agentIds : ["claude"],
    opts.root || null,
    agentScopeOpts,
  );

  // Choose which slugs to remove
  const allSlugs = new Set();
  if (opts.all) {
    for (const s of manifest.skills) allSlugs.add(s.slug);
  }
  if (opts.skills && opts.skills.length > 0) {
    for (const slug of opts.skills) allSlugs.add(slug);
  }
  if (opts.profiles && opts.profiles.length > 0) {
    for (const pid of opts.profiles) {
      const profile = manifest.profiles.find((p) => p.id === pid);
      if (!profile) continue;
      for (const slug of profile.skill_slugs || profile.skills || []) {
        allSlugs.add(slug);
      }
    }
  }
  if (allSlugs.size === 0) {
    // Default: behave as `--all` when nothing was specified (uninstall convention)
    for (const s of manifest.skills) allSlugs.add(s.slug);
  }

  let removed = 0;

  for (const agent of agents) {
    for (const slug of allSlugs) {
      if (agent.id === "cursor") {
        const dest = path.join(agent.skillsDir, `${slug}.mdc`);
        if (fs.existsSync(dest)) {
          if (!opts.dryRun) fs.rmSync(dest);
          removed++;
        }
      } else {
        const dest = path.join(agent.skillsDir, slug);
        if (fs.existsSync(dest)) {
          if (!opts.dryRun) fs.rmSync(dest, { recursive: true });
          removed++;
        }
      }
    }

    if (!opts.dryRun && fs.existsSync(agent.activationFile)) {
      const content = fs.readFileSync(agent.activationFile, "utf8");
      const startIdx = content.indexOf("<!-- FLOOM-START -->");
      const endIdx = content.indexOf("<!-- FLOOM-END -->");
      if (startIdx !== -1 && endIdx !== -1) {
        const before = content.slice(0, startIdx).trimEnd();
        const after = content.slice(endIdx + "<!-- FLOOM-END -->".length).trimStart();
        const next = [before, after].filter(Boolean).join("\n\n") + "\n";
        fs.writeFileSync(agent.activationFile, next, "utf8");
      }
    }
  }

  // Also remove the local manifest tracker if it exists and we removed everything.
  if (!opts.dryRun) {
    const manifestPath = manifestPathFor({ root: opts.root || null, globalScope, cwd });
    if (fs.existsSync(manifestPath)) {
      fs.rmSync(manifestPath);
    }
  }

  if (opts.dryRun) {
    log(`Dry run: would remove ${removed} skill entries.`);
  } else {
    log(`Removed ${removed} skills from ${agents.map((a) => a.label).join(", ")}.`);
  }

  return { removed };
}

/**
 * `uninstall` is a user-facing alias for `remove --all` in the current scope.
 */
export async function uninstall(opts = {}) {
  return remove({ ...opts, all: true });
}

/**
 * List installed skills.
 */
export function list(opts = {}) {
  const log = opts.log || console.log;
  const cwd = opts.cwd || process.cwd();
  const globalScope = Boolean(opts.globalScope);
  const manifestPath = manifestPathFor({ root: opts.root || null, globalScope, cwd });

  if (!fs.existsSync(manifestPath)) {
    log(`No skills installed at ${manifestPath}.`);
    log(`Run: npx @floomhq/starter install --profiles core`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const skills = data.installed_skills || [];

  if (skills.length === 0) {
    log("No skills installed.");
    return;
  }

  log(`Installed skills (${skills.length}):`);
  for (const skill of skills) {
    const harnesses = (skill.installedPaths || []).map((p) => p.harness).join(", ");
    log(`  ${skill.slug.padEnd(32)} ${harnesses}`);
  }
  log("");
  log(`Manifest: ${manifestPath}`);
}
