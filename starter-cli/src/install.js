/**
 * install.js
 * Core install logic for @floomhq/starter.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadManifest, fetchSkillDetail } from "./fetch-manifest.js";
import { resolveAgents, detectAgents } from "./detect-agents.js";
import { loadSkillContent, writeSkill } from "./write-skill.js";
import { buildActivationBlock, upsertActivationBlock } from "./activation-companion.js";

const MANIFEST_PATH = path.join(os.homedir(), ".floom", "manifest.json");

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
      if (!profile) throw new Error(`Unknown profile: ${pid}. Valid: ${manifest.profiles.map((p) => p.id).join(", ")}`);
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
 * Write the local manifest file at ~/.floom/manifest.json.
 */
function writeLocalManifest(agents, skills, existingManifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    // OK — file doesn't exist yet
  }

  const now = new Date().toISOString();
  const installedSkills = skills.map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    source: skill.source,
    sourceUrl: skill.upstream
      ? `https://github.com/benchflow-ai/skillsbench/tree/411dc68/${skill.upstream}`
      : "https://github.com/floomhq/packs/tree/main/packs/starter/skills/" + skill.slug,
    version: existingManifest.version,
    installedAt: now,
    installedPaths: agents.map((agent) => ({
      harness: agent.id,
      path:
        agent.id === "cursor"
          ? path.join(agent.skillsDir, `${skill.slug}.mdc`)
          : path.join(agent.skillsDir, skill.slug, "SKILL.md"),
    })),
  }));

  const updated = {
    ...(existing.installed_skills ? existing : {}),
    version: "1",
    updatedAt: now,
    installed_skills: installedSkills,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + "\n", "utf8");
  return MANIFEST_PATH;
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
 * @param {function} opts.log - logger function (defaults to console.log)
 */
export async function install(opts = {}) {
  const log = opts.log || console.log;

  // 1. Load manifest
  const { manifest, source } = await loadManifest();
  if (source === "fallback") {
    log("  (using bundled manifest — floomhq/packs not reachable)");
  }

  // 2. Select skills
  const skills = selectSkills(manifest, opts);
  if (skills.length === 0) throw new Error("No skills selected. Use --profiles, --skills, or --all.");

  // 3. Detect/resolve agents
  const agentIds = opts.harness && opts.harness.length > 0 ? opts.harness : detectAgents();
  if (agentIds.length === 0) {
    throw new Error("No AI agents detected. Install Claude Code, Codex, Cursor, OpenCode, or Kimi first.");
  }

  const agents = resolveAgents(agentIds, opts.root || null);

  // 4. Print plan
  const detected = agents.map((a) => a.label);
  log(`  Detected agents: ${detected.join(", ")}`);
  log(`  Skills selected: ${skills.length}`);

  if (opts.dryRun) {
    log("");
    log("Dry run — no files written. Re-run without --dry-run to install.");
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

  // 5. Install skills to each agent
  // Pre-fetch all per-skill detail JSONs for SKILL.md content (v0.2.0 schema).
  // Falls back to local loadSkillContent if the remote fetch fails.
  const skillContentCache = new Map();
  await Promise.all(
    skills.map(async (skill) => {
      // Try per-skill JSON first (v0.2.0); fall back to bundled content
      let content = null;
      if (source === "remote") {
        const detail = await fetchSkillDetail(skill.slug);
        if (detail && detail.skill_md_content) {
          content = detail.skill_md_content;
        }
      }
      if (!content) {
        try {
          content = loadSkillContent(skill.slug);
        } catch {
          content = null;
        }
      }
      skillContentCache.set(skill.slug, content);
    })
  );

  const results = [];
  for (const agent of agents) {
    const agentResults = [];
    for (const skill of skills) {
      const content = skillContentCache.get(skill.slug);
      if (!content) {
        agentResults.push({ slug: skill.slug, action: "error", error: "No SKILL.md content available" });
        continue;
      }
      try {
        const result = writeSkill(agent, skill.slug, content, opts.force || false);
        if (result.warn) {
          log(`  ⚠ Kept your custom version of ${skill.slug} at ${result.path}. To overwrite, delete that file first.`);
        }
        agentResults.push({ slug: skill.slug, ...result });
      } catch (err) {
        agentResults.push({ slug: skill.slug, action: "error", error: err.message });
      }
    }
    results.push({ agent, skills: agentResults });
  }

  // 6. Write activation companion
  const activationFiles = [];
  for (const agent of agents) {
    const block = buildActivationBlock(agent, skills);
    upsertActivationBlock(agent.activationFile, block);
    activationFiles.push(agent.activationFile);
  }

  // 7. Write local manifest
  const manifestPath = opts.root
    ? path.join(opts.root, ".floom", "manifest.json")
    : MANIFEST_PATH;

  // Override MANIFEST_PATH for test root
  if (opts.root) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    const now = new Date().toISOString();
    const localManifest = {
      version: "1",
      updatedAt: now,
      installed_skills: skills.map((skill) => ({
        slug: skill.slug,
        name: skill.name,
        source: skill.source,
        version: manifest.version,
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
    fs.writeFileSync(manifestPath, JSON.stringify(localManifest, null, 2) + "\n", "utf8");
  } else {
    writeLocalManifest(agents, skills, manifest);
  }

  // 8. Print summary
  const allSkillResults = results.flatMap((r) => r.skills);
  const written = allSkillResults.filter((s) => s.action === "written").length;
  const skipped = allSkillResults.filter((s) => s.action === "skipped").length;
  const kept = allSkillResults.filter((s) => s.action === "kept").length;
  const errors = allSkillResults.filter((s) => s.action === "error").length;

  log("");
  log(`  ${written} skills installed, ${kept} skipped (your custom versions kept)`);
  if (skipped > 0) log(`  ${skipped} already up to date (no changes)`);
  if (errors > 0) log(`  Errors: ${errors}`);
  log(`  Activation rules written to:`);
  for (const f of activationFiles) log(`    ${f}`);
  log(`  Manifest: ${manifestPath}`);
  log("");
  log(`  Try: ask your agent "review the changes in this branch" — pr-review will fire.`);

  return { agents, skills, results, manifestPath, activationFiles };
}

/**
 * Remove installed skills.
 */
export async function remove(opts = {}) {
  const log = opts.log || console.log;
  const { manifest } = await loadManifest();

  const agentIds = opts.harness && opts.harness.length > 0 ? opts.harness : detectAgents();
  const agents = resolveAgents(agentIds, opts.root || null);

  let removed = 0;

  for (const agent of agents) {
    for (const skill of manifest.skills) {
      if (agent.id === "cursor") {
        const dest = path.join(agent.skillsDir, `${skill.slug}.mdc`);
        if (fs.existsSync(dest)) {
          if (!opts.dryRun) fs.rmSync(dest);
          removed++;
        }
      } else {
        const dest = path.join(agent.skillsDir, skill.slug);
        if (fs.existsSync(dest)) {
          if (!opts.dryRun) fs.rmSync(dest, { recursive: true });
          removed++;
        }
      }
    }

    // Remove activation block
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

  if (opts.dryRun) {
    log(`Dry run: would remove ${removed} skill entries.`);
  } else {
    log(`Removed ${removed} skills from ${agents.map((a) => a.label).join(", ")}.`);
  }

  return { removed };
}

/**
 * List installed skills.
 */
export function list(opts = {}) {
  const log = opts.log || console.log;
  const manifestPath = opts.root
    ? path.join(opts.root, ".floom", "manifest.json")
    : MANIFEST_PATH;

  if (!fs.existsSync(manifestPath)) {
    log("No skills installed. Run: npx @floomhq/starter install --profiles core");
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
