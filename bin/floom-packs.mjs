#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "@floomhq/packs";
const PACKAGE_VERSION = "0.0.0";
const PACK_ID = "starter";
const TARGETS = ["claude", "codex", "cursor", "opencode", "kimi"];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packRoot = path.join(repoRoot, "packs", PACK_ID);
const skillsRoot = path.join(packRoot, "skills");
const manifest = JSON.parse(fs.readFileSync(path.join(packRoot, "manifest.json"), "utf8"));

const instructionMarkers = {
  start: "<!-- FLOOM PACKS START -->",
  end: "<!-- FLOOM PACKS END -->"
};

function usage() {
  return `floom-packs

Usage:
  floom-packs list
  floom-packs install [--profiles core,dev] [--targets claude,codex|all] [--all] [--dry-run] [--yes]

Examples:
  floom-packs install --dry-run
  floom-packs install --profiles core,dev,writing --targets claude,codex --yes
  floom-packs install --all --targets all --yes

When --targets is omitted, floom-packs installs to detected local agents.
Real installs require --yes. Without --yes, install prints a dry-run plan.`;
}

function parseFlags(args) {
  const flags = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) throw new Error(`Unexpected argument: ${arg}`);

    const key = arg.slice(2);
    if (["all", "dry-run", "yes", "force", "json"].includes(key)) {
      flags[key] = true;
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    flags[key] = value;
    index += 1;
  }

  return flags;
}

function splitList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function expandHome(value) {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

function profileById(id) {
  const profile = manifest.profiles.find((item) => item.id === id);
  if (!profile) throw new Error(`Unknown profile: ${id}`);
  return profile;
}

function skillBySlug(slug) {
  const skill = manifest.skills.find((item) => item.slug === slug);
  if (!skill) throw new Error(`Manifest profile references missing skill: ${slug}`);
  return skill;
}

function selectProfiles(flags) {
  if (flags.all) return manifest.profiles.map((profile) => profile.id);

  const requested = splitList(flags.profiles);
  const selected = requested.length > 0 ? requested : manifest.defaultProfiles;
  const withCore = selected.includes("core") ? selected : ["core", ...selected];
  return [...new Set(withCore)].map((id) => profileById(id).id);
}

function targetPresencePath(target, rootOverride) {
  if (rootOverride) return path.join(rootOverride, target);

  const home = os.homedir();
  const paths = {
    claude: path.join(home, ".claude"),
    codex: process.env.CODEX_HOME ?? path.join(home, ".codex"),
    cursor: path.join(home, ".cursor"),
    opencode: path.join(home, ".config", "opencode"),
    kimi: path.join(home, ".kimi")
  };

  return paths[target];
}

function detectTargets(rootOverride) {
  return TARGETS.filter((target) => fs.existsSync(targetPresencePath(target, rootOverride)));
}

function selectTargets(flags, rootOverride) {
  if (!flags.targets) {
    const detected = detectTargets(rootOverride);
    if (detected.length === 0) {
      throw new Error("No supported local agents detected. Pass --targets claude,codex,cursor,opencode,kimi or --targets all.");
    }
    return detected;
  }

  const requested = splitList(flags.targets);
  const selected = requested.includes("all") ? TARGETS : requested;

  for (const target of selected) {
    if (!TARGETS.includes(target)) throw new Error(`Unknown target: ${target}`);
  }

  return [...new Set(selected)];
}

function targetSkillsDir(target, rootOverride) {
  if (rootOverride) return path.join(rootOverride, target, "skills");

  const home = os.homedir();
  const env = {
    claude: process.env.CLAUDE_SKILLS_DIR,
    codex: process.env.CODEX_SKILLS_DIR,
    cursor: process.env.CURSOR_SKILLS_DIR,
    opencode: process.env.OPENCODE_SKILLS_DIR,
    kimi: process.env.KIMI_SKILLS_DIR
  };
  if (env[target]) return expandHome(env[target]);

  const defaults = {
    claude: path.join(home, ".claude", "skills"),
    codex: path.join(process.env.CODEX_HOME ?? path.join(home, ".codex"), "skills"),
    cursor: path.join(home, ".cursor", "skills-cursor"),
    opencode: path.join(home, ".config", "opencode", "skills"),
    kimi: path.join(home, ".kimi", "skills")
  };

  return defaults[target];
}

function targetInstructionFile(target, rootOverride) {
  if (rootOverride) {
    const files = {
      claude: "CLAUDE.md",
      codex: "AGENTS.md",
      cursor: "floom-packs.mdc",
      opencode: "AGENTS.md",
      kimi: "floom-system.md"
    };
    return path.join(rootOverride, target, files[target]);
  }

  const home = os.homedir();
  const defaults = {
    claude: path.join(home, ".claude", "CLAUDE.md"),
    codex: path.join(process.env.CODEX_HOME ?? path.join(home, ".codex"), "AGENTS.md"),
    cursor: path.join(home, ".cursor", "rules", "floom-packs.mdc"),
    opencode: path.join(home, ".config", "opencode", "AGENTS.md"),
    kimi: path.join(home, ".kimi", "agents", "floom-system.md")
  };

  return defaults[target];
}

function indexPath(rootOverride) {
  if (rootOverride) return path.join(rootOverride, ".floom", "packs", "starter-index.json");
  return path.join(os.homedir(), ".floom", "packs", "starter-index.json");
}

function selectedSkills(profileIds) {
  const slugs = [];
  for (const id of profileIds) {
    const profile = profileById(id);
    slugs.push(...profile.skills);
  }
  return [...new Set(slugs)].map(skillBySlug);
}

function provenanceFor(skill) {
  return {
    package: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    pack: PACK_ID,
    skill: skill.slug,
    source: skill.source,
    installedAt: new Date().toISOString()
  };
}

function existingProvenance(destination) {
  const file = path.join(destination, ".floom-pack.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function canReplace(destination, force) {
  if (!fs.existsSync(destination)) return true;
  if (force) return true;
  const existing = existingProvenance(destination);
  return existing?.package === PACKAGE_NAME && existing?.pack === PACK_ID;
}

function instructionBlock(target, skillsDir, indexFile) {
  return `${instructionMarkers.start}
## Floom Packs

- Use locally installed Floom starter skills when they match the task.
- Search the local skill index first: ${indexFile}
- Prefer the \`local-find-skills\` skill for discovery.
- Load only the specific relevant \`SKILL.md\` files from: ${skillsDir}
- Do not preload every installed skill into context.
- If no local skill matches, continue normally.

Target: ${target}
${instructionMarkers.end}`;
}

function upsertBlock(existing, block) {
  const start = existing.indexOf(instructionMarkers.start);
  const end = existing.indexOf(instructionMarkers.end);
  if (start !== -1 && end !== -1 && end > start) {
    return `${existing.slice(0, start).trimEnd()}\n\n${block}\n${existing.slice(end + instructionMarkers.end.length).trimStart()}`.trim() + "\n";
  }
  return `${existing.trimEnd()}\n\n${block}\n`.trimStart();
}

function buildPlan(flags) {
  const rootOverride = flags.root ? path.resolve(expandHome(flags.root)) : null;
  const profileIds = selectProfiles(flags);
  const targets = selectTargets(flags, rootOverride);
  const skills = selectedSkills(profileIds);
  const idxPath = indexPath(rootOverride);

  const targetPlans = targets.map((target) => {
    const skillsDir = targetSkillsDir(target, rootOverride);
    const instructionFile = targetInstructionFile(target, rootOverride);
    const skillWrites = skills.map((skill) => {
      const destination = path.join(skillsDir, skill.slug);
      return {
        slug: skill.slug,
        source: skill.source,
        sourcePath: path.relative(repoRoot, path.join(skillsRoot, skill.slug)),
        destination,
        conflict: !canReplace(destination, Boolean(flags.force))
      };
    });

    return {
      target,
      skillsDir,
      instructionFile,
      skillWrites,
      conflicts: skillWrites.filter((item) => item.conflict)
    };
  });

  return {
    package: PACKAGE_NAME,
    version: PACKAGE_VERSION,
    pack: PACK_ID,
    profiles: profileIds,
    targets,
    skillCount: skills.length,
    skills,
    indexPath: idxPath,
    targetPlans,
    conflicts: targetPlans.flatMap((targetPlan) => targetPlan.conflicts.map((item) => ({
      target: targetPlan.target,
      slug: item.slug,
      destination: item.destination
    })))
  };
}

function renderPlan(plan) {
  const lines = [
    `Floom Packs dry-run`,
    `Pack: ${plan.pack}`,
    `Profiles: ${plan.profiles.join(", ")}`,
    `Targets: ${plan.targets.join(", ")}`,
    `Skills: ${plan.skillCount}`,
    `Index: ${plan.indexPath}`,
    ""
  ];

  for (const targetPlan of plan.targetPlans) {
    lines.push(`${targetPlan.target}:`);
    lines.push(`  skills: ${targetPlan.skillsDir}`);
    lines.push(`  instructions: ${targetPlan.instructionFile}`);
    lines.push(`  writes: ${targetPlan.skillWrites.length}`);
    if (targetPlan.conflicts.length > 0) lines.push(`  conflicts: ${targetPlan.conflicts.length}`);
  }

  if (plan.conflicts.length > 0) {
    lines.push("");
    lines.push("Conflicts:");
    for (const conflict of plan.conflicts) {
      lines.push(`  - ${conflict.target}:${conflict.slug} -> ${conflict.destination}`);
    }
    lines.push("");
    lines.push("Use --force only when replacing existing local files is intended.");
  }

  return lines.join("\n");
}

function copySkill(skill, destination, force) {
  const source = path.join(skillsRoot, skill.slug);
  if (!fs.existsSync(path.join(source, "SKILL.md"))) throw new Error(`Bundled skill missing SKILL.md: ${skill.slug}`);
  if (!canReplace(destination, force)) throw new Error(`Refusing to overwrite untracked skill: ${destination}`);

  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
  fs.writeFileSync(path.join(destination, ".floom-pack.json"), JSON.stringify(provenanceFor(skill), null, 2) + "\n");
}

function writeIndex(plan) {
  const payload = {
    package: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    pack: PACK_ID,
    profiles: plan.profiles,
    targets: plan.targets,
    installedAt: new Date().toISOString(),
    skills: plan.skills.map((skill) => ({
      slug: skill.slug,
      name: skill.name,
      source: skill.source,
      profiles: manifest.profiles.filter((profile) => profile.skills.includes(skill.slug)).map((profile) => profile.id)
    }))
  };

  fs.mkdirSync(path.dirname(plan.indexPath), { recursive: true });
  fs.writeFileSync(plan.indexPath, JSON.stringify(payload, null, 2) + "\n");
}

function writeInstructions(plan) {
  for (const targetPlan of plan.targetPlans) {
    fs.mkdirSync(path.dirname(targetPlan.instructionFile), { recursive: true });
    const existing = fs.existsSync(targetPlan.instructionFile)
      ? fs.readFileSync(targetPlan.instructionFile, "utf8")
      : "";
    const next = upsertBlock(existing, instructionBlock(targetPlan.target, targetPlan.skillsDir, plan.indexPath));
    fs.writeFileSync(targetPlan.instructionFile, next);
  }
}

function install(flags) {
  const dryRun = Boolean(flags["dry-run"]) || !flags.yes;
  const plan = buildPlan(flags);

  if (flags.json) {
    console.log(JSON.stringify({ dryRun, ...plan }, null, 2));
  } else {
    console.log(renderPlan(plan));
    if (dryRun && !flags["dry-run"]) {
      console.log("");
      console.log("No files changed. Re-run with --yes to install.");
    }
  }

  if (dryRun) return;
  if (plan.conflicts.length > 0) throw new Error("Install has conflicts. Re-run with --force only if replacement is intended.");

  for (const targetPlan of plan.targetPlans) {
    for (const write of targetPlan.skillWrites) {
      copySkill(skillBySlug(write.slug), write.destination, Boolean(flags.force));
    }
  }

  writeIndex(plan);
  writeInstructions(plan);

  if (!flags.json) {
    console.log("");
    console.log(`Installed ${plan.skillCount} skills for ${plan.targets.join(", ")}.`);
  }
}

function list(flags) {
  const payload = {
    pack: manifest.id,
    name: manifest.name,
    profiles: manifest.profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      skillCount: profile.skills.length
    })),
    skills: manifest.skills
  };

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`${manifest.name}`);
  console.log("");
  console.log("Profiles:");
  for (const profile of payload.profiles) {
    console.log(`  ${profile.id.padEnd(10)} ${String(profile.skillCount).padStart(2)}  ${profile.description}`);
  }
  console.log("");
  console.log(`Skills: ${payload.skills.length}`);
}

const [command, ...rest] = process.argv.slice(2);

try {
  if (!command || command === "--help" || command === "-h") {
    console.log(usage());
  } else if (command === "list") {
    list(parseFlags(rest));
  } else if (command === "install") {
    install(parseFlags(rest));
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
