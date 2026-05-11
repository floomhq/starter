/**
 * install.test.js
 * Smoke tests for @floomhq/starter
 *
 * Run: node --test test/install.test.js
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { fetchSupportFiles, loadManifest } from "../src/fetch-manifest.js";
import { upsertActivationBlock } from "../src/activation-companion.js";
import { writeSkill, writeSupportFiles } from "../src/write-skill.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, "..", "bin", "starter.js");
const DATA_DIR = path.join(__dirname, "..", "data");

function run(args, options = {}) {
  const { env, ...rest } = options;
  return execFileSync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      FLOOM_STARTER_SKIP_SUPPORT: "1",
      ...(env || {}),
    },
    ...rest,
  });
}

function tmpRoot(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `floom-starter-${label}-`));
}

// ─── Data files ─────────────────────────────────────────────────────────────

test("bundled fallback manifest exists and has required fields", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "fallback-manifest.json"), "utf8"));
  assert.equal(manifest.pack, "floom-starter");
  assert.ok(Array.isArray(manifest.profiles));
  assert.ok(manifest.profiles.length >= 11, `Expected >=11 profiles, got ${manifest.profiles.length}`);
  assert.ok(Array.isArray(manifest.skills));
  assert.ok(manifest.skills.length >= 29, `Expected >=29 skills, got ${manifest.skills.length}`);
  const coreProfile = manifest.profiles.find((p) => p.id === "core");
  assert.ok(coreProfile, "core profile missing");
});

test("bundled-skills.json has content for all manifest skills", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "fallback-manifest.json"), "utf8"));
  const skills = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "bundled-skills.json"), "utf8"));

  for (const skill of manifest.skills) {
    assert.ok(skills[skill.slug], `Missing bundled content for skill: ${skill.slug}`);
    assert.match(skills[skill.slug], /^---\n/, `${skill.slug} SKILL.md missing YAML frontmatter`);
  }
});

test("loadManifest refuses to downgrade below bundled fallback version", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        pack: "floom-starter",
        version: "0.1.0",
        profiles: [],
        skills: [],
      };
    },
  });

  try {
    const { manifest, source } = await loadManifest();
    assert.equal(source, "fallback");
    assert.equal(manifest.version, "0.2.8");
    assert.ok(manifest.skills.length >= 29);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ─── CLI smoke tests ─────────────────────────────────────────────────────────

test("--help prints usage", () => {
  const output = run(["--help"]);
  assert.match(output, /@floomhq\/starter/);
  assert.match(output, /install/);
  assert.match(output, /init/);
  assert.match(output, /list/);
});

test("install --help prints usage", () => {
  const output = run(["install", "--help"]);
  assert.match(output, /@floomhq\/starter/);
  assert.match(output, /Install all 65 curated skills/);
});

test("default install writes all curated skills", () => {
  const root = tmpRoot("install-default-all");
  const output = run([
    "install",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /65 skills installed into 1 agent/);
  const skillDirs = fs.readdirSync(path.join(root, "claude", "skills"));
  assert.equal(skillDirs.length, 65, `Expected 65 skill dirs, got ${skillDirs.length}`);
});

test("install --dry-run --profiles core writes nothing", () => {
  const root = tmpRoot("dry-run");
  const output = run([
    "install",
    "--dry-run",
    "--profiles", "core",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /Dry run/);
  // No actual files written — find-skills is the first core skill in the remote manifest
  assert.equal(fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")), false);
});

test("install --profiles core writes skills, activation block, and manifest", () => {
  const root = tmpRoot("install-core");
  const output = run([
    "install",
    "--profiles", "core",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /skills installed/);

  // Core profile skills (from remote manifest): find-skills, brainstorming, workplan
  const claudeSkills = path.join(root, "claude", "skills");
  assert.ok(fs.existsSync(path.join(claudeSkills, "find-skills", "SKILL.md")), "find-skills missing");
  assert.ok(fs.existsSync(path.join(claudeSkills, "brainstorming", "SKILL.md")), "brainstorming missing");
  assert.ok(fs.existsSync(path.join(claudeSkills, "workplan", "SKILL.md")), "workplan missing");

  // Activation companion block in CLAUDE.md
  const claudeMd = fs.readFileSync(path.join(root, "claude", "CLAUDE.md"), "utf8");
  assert.match(claudeMd, /<!-- FLOOM-START -->/);
  assert.match(claudeMd, /Floom skills available/);
  assert.match(claudeMd, /<!-- FLOOM-END -->/);

  // Local manifest
  const manifestPath = path.join(root, ".floom", "manifest.json");
  assert.ok(fs.existsSync(manifestPath), "manifest.json missing");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.ok(Array.isArray(manifest.installed_skills));
  assert.ok(manifest.installed_skills.length >= 3, "Expected at least 3 skills in manifest");
});

test("install --profiles core,dev writes all profile skills", () => {
  const root = tmpRoot("install-core-dev");
  const output = run([
    "install",
    "--profiles", "core,dev",
    "--harness", "claude,codex",
    "--root", root,
  ]);

  assert.match(output, /skills installed/);

  // Dev profile skills (from remote manifest): tdd, vercel-react-best-practices
  assert.ok(
    fs.existsSync(path.join(root, "claude", "skills", "tdd", "SKILL.md")),
    "tdd missing in claude"
  );
  assert.ok(
    fs.existsSync(path.join(root, "codex", "skills", "tdd", "SKILL.md")),
    "tdd missing in codex"
  );
  assert.ok(
    fs.existsSync(path.join(root, "codex", "skills", "vercel-react-best-practices", "SKILL.md")),
    "vercel-react-best-practices missing in codex"
  );
});

test("project-local codex activation writes root AGENTS.md", () => {
  const cwd = tmpRoot("codex-project-local");
  fs.mkdirSync(path.join(cwd, ".codex"), { recursive: true });
  const output = run(["install", "--profiles", "core", "--harness", "codex", "--yes"], { cwd });

  assert.match(output, /AGENTS\.md/);
  assert.ok(fs.existsSync(path.join(cwd, "AGENTS.md")), "root AGENTS.md missing");
  assert.equal(
    fs.existsSync(path.join(cwd, ".codex", "AGENTS.md")),
    false,
    "Codex does not load .codex/AGENTS.md for project-local activation",
  );
});

test("install --all writes all curated skills", () => {
  const root = tmpRoot("install-all");
  const output = run([
    "install",
    "--all",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /skills installed/);

  const skillDirs = fs.readdirSync(path.join(root, "claude", "skills"));
  assert.equal(skillDirs.length, 65, `Expected 65 skill dirs, got ${skillDirs.length}`);
});

test("CLI install fetches support files on bundled manifest path", () => {
  const root = tmpRoot("cli-support-files");
  const output = run(
    [
      "install",
      "--skills", "tdd",
      "--harness", "claude",
      "--root", root,
      "--yes",
    ],
    { env: { FLOOM_STARTER_SKIP_SUPPORT: "0" } },
  );

  assert.match(output, /support files written/);
  assert.ok(
    fs.existsSync(path.join(root, "claude", "skills", "tdd", "tests.md")),
    "tdd support file missing",
  );
});

test("support files are fetched and written inside the skill folder", async () => {
  const originalFetch = globalThis.fetch;
  const textEncoder = new TextEncoder();
  globalThis.fetch = async (url) => {
    const value = String(url);
    if (value.includes("/contents/skills/sample/references")) {
      return {
        ok: true,
        async json() {
          return [
            {
              type: "file",
              path: "skills/sample/references/guide.md",
              name: "guide.md",
              size: 12,
              download_url: "https://raw.githubusercontent.com/acme/pack/main/skills/sample/references/guide.md",
            },
          ];
        },
      };
    }
    if (value.endsWith("/references/guide.md")) {
      return {
        ok: true,
        async arrayBuffer() {
          return textEncoder.encode("# Guide\n").buffer;
        },
      };
    }
    return { ok: false };
  };

  try {
    const supportFiles = await fetchSupportFiles({
      skill_md_url: "https://raw.githubusercontent.com/acme/pack/main/skills/sample/SKILL.md",
      files: [
        { name: "SKILL.md", size_bytes: 100, type: "main" },
        { name: "references", size_bytes: 0, type: "support" },
        { name: "evals", size_bytes: 0, type: "support" },
      ],
    });
    assert.equal(supportFiles.length, 1);
    assert.equal(supportFiles[0].path, "references/guide.md");

    const root = tmpRoot("support-files");
    const agent = { id: "claude", skillsDir: path.join(root, "claude", "skills") };
    writeSkill(agent, "sample", "---\nname: sample\n---\n# Sample\n", true);
    const counts = writeSupportFiles(agent, "sample", supportFiles);
    assert.equal(counts.written, 1);
    assert.equal(
      fs.readFileSync(path.join(root, "claude", "skills", "sample", "references", "guide.md"), "utf8"),
      "# Guide\n",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("activation block is idempotent on repeated installs", () => {
  const root = tmpRoot("idempotent");

  // Install twice
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root, "--force"]);

  const claudeMd = fs.readFileSync(path.join(root, "claude", "CLAUDE.md"), "utf8");
  const startCount = (claudeMd.match(/<!-- FLOOM-START -->/g) || []).length;
  const endCount = (claudeMd.match(/<!-- FLOOM-END -->/g) || []).length;
  assert.equal(startCount, 1, "Expected exactly one FLOOM-START marker");
  assert.equal(endCount, 1, "Expected exactly one FLOOM-END marker");
});

test("install --profiles core for cursor writes .mdc files", () => {
  const root = tmpRoot("cursor");
  run([
    "install",
    "--profiles", "core",
    "--harness", "cursor",
    "--root", root,
  ]);

  // Cursor uses .mdc files — find-skills is the first core skill in the remote manifest
  assert.ok(
    fs.existsSync(path.join(root, "cursor", "skills", "find-skills.mdc")),
    "find-skills.mdc missing for cursor"
  );
  const mdc = fs.readFileSync(path.join(root, "cursor", "skills", "find-skills.mdc"), "utf8");
  assert.match(mdc, /---\ndescription:/);
  assert.match(mdc, /alwaysApply: false/);
});

test("list shows installed skills", () => {
  const root = tmpRoot("list");
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  const output = run(["list", "--root", root]);
  assert.match(output, /find-skills/);
  assert.match(output, /brainstorming/);
});

test("install preserves custom SKILL.md and warns on collision", () => {
  const root = tmpRoot("collision");

  // Pre-create a custom SKILL.md for a skill in the dev profile
  const collisionSlug = "tdd";
  const skillDir = path.join(root, "claude", "skills", collisionSlug);
  fs.mkdirSync(skillDir, { recursive: true });
  const customContent = "# My custom tdd skill\nDo not overwrite me.\n";
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), customContent, "utf8");

  const output = run([
    "install",
    "--profiles", "core,dev",
    "--harness", "claude",
    "--root", root,
  ]);

  // Warning must appear with exact copy from spec
  assert.match(output, new RegExp(`Kept your custom version of ${collisionSlug}`));
  assert.match(output, /delete that file first/);

  // Custom file must be preserved byte-for-byte
  const kept = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
  assert.equal(kept, customContent, "Custom SKILL.md was overwritten — it must be preserved");

  // Other skills from core must still be installed
  assert.ok(
    fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")),
    "find-skills should still be installed despite collision on tdd"
  );

  // Summary line mentions skipped (kept) count
  assert.match(output, /skipped \(your custom versions kept\)/);
});

test("installer rejects unsafe slugs before writing outside the skill root", () => {
  const root = tmpRoot("unsafe-slug");
  let threw = false;
  let combined = "";
  try {
    run([
      "install",
      "--skills", "../escape",
      "--harness", "claude",
      "--root", root,
    ]);
  } catch (err) {
    threw = true;
    combined = String(err.stdout || "") + String(err.stderr || "");
  }

  assert.equal(threw, true, "Expected unsafe slug install to fail");
  assert.match(combined, /Unknown skill slug|Unsafe skill slug/);
  assert.equal(
    fs.existsSync(path.join(root, "claude", "escape", "SKILL.md")),
    false,
    "Unsafe slug must not create files outside the skill root",
  );
});

test("writeSkill refuses path traversal slugs from manifest data", () => {
  const root = tmpRoot("write-skill-traversal");
  const agent = {
    id: "claude",
    skillsDir: path.join(root, "claude", "skills"),
  };

  assert.throws(
    () => writeSkill(agent, "../escape", "---\nname: escape\n---\n# Escape\n"),
    /Unsafe skill slug/,
  );
  assert.equal(
    fs.existsSync(path.join(root, "claude", "escape", "SKILL.md")),
    false,
    "Path traversal slug must not write outside skillsDir",
  );
});

test("writeSkill refuses symlinked skill file targets", () => {
  const root = tmpRoot("write-skill-symlink-file");
  const skillsDir = path.join(root, "claude", "skills");
  const skillDir = path.join(skillsDir, "safe-slug");
  const outside = path.join(root, "outside.md");
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(outside, "outside", "utf8");
  fs.symlinkSync(outside, path.join(skillDir, "SKILL.md"));

  assert.throws(
    () => writeSkill(
      { id: "claude", skillsDir },
      "safe-slug",
      "---\nname: safe-slug\n---\n# Safe\n",
      true,
    ),
    /symlinked skill file/,
  );
  assert.equal(fs.readFileSync(outside, "utf8"), "outside");
});

test("writeSkill refuses symlinked skill directories", () => {
  const root = tmpRoot("write-skill-symlink-dir");
  const skillsDir = path.join(root, "claude", "skills");
  const outsideDir = path.join(root, "outside-dir");
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.mkdirSync(outsideDir, { recursive: true });
  fs.symlinkSync(outsideDir, path.join(skillsDir, "safe-slug"));

  assert.throws(
    () => writeSkill(
      { id: "claude", skillsDir },
      "safe-slug",
      "---\nname: safe-slug\n---\n# Safe\n",
      true,
    ),
    /symlinked skill path/,
  );
  assert.equal(fs.existsSync(path.join(outsideDir, "SKILL.md")), false);
});

test("writeSkill refuses a symlinked skills root", () => {
  const root = tmpRoot("write-skill-symlink-root");
  const realSkillsRoot = path.join(root, "outside-skills");
  const symlinkedSkillsRoot = path.join(root, "claude", "skills");
  fs.mkdirSync(path.dirname(symlinkedSkillsRoot), { recursive: true });
  fs.mkdirSync(realSkillsRoot, { recursive: true });
  fs.symlinkSync(realSkillsRoot, symlinkedSkillsRoot);

  assert.throws(
    () => writeSkill(
      { id: "claude", skillsDir: symlinkedSkillsRoot },
      "safe-slug",
      "---\nname: safe-slug\n---\n# Safe\n",
      true,
    ),
    /symlinked skill root/,
  );
  assert.equal(fs.existsSync(path.join(realSkillsRoot, "safe-slug", "SKILL.md")), false);
});

test("activation block refuses symlinked activation files", () => {
  const root = tmpRoot("activation-symlink-file");
  const activationDir = path.join(root, "claude");
  const activationFile = path.join(activationDir, "CLAUDE.md");
  const outside = path.join(root, "outside.md");
  fs.mkdirSync(activationDir, { recursive: true });
  fs.writeFileSync(outside, "outside", "utf8");
  fs.symlinkSync(outside, activationFile);

  assert.throws(
    () => upsertActivationBlock(activationFile, "<!-- FLOOM-START -->\nblocked\n<!-- FLOOM-END -->"),
    /symlinked activation file/,
  );
  assert.equal(fs.readFileSync(outside, "utf8"), "outside");
});

test("install refuses symlinked local manifest targets without writing through them", () => {
  const root = tmpRoot("manifest-symlink-file");
  const floomDir = path.join(root, ".floom");
  const outside = path.join(root, "outside-manifest.json");
  fs.mkdirSync(floomDir, { recursive: true });
  fs.writeFileSync(outside, "outside", "utf8");
  fs.symlinkSync(outside, path.join(floomDir, "manifest.json"));

  let threw = false;
  let combined = "";
  try {
    run([
      "install",
      "--skills", "find-skills",
      "--harness", "claude",
      "--root", root,
    ]);
  } catch (err) {
    threw = true;
    combined = String(err.stdout || "") + String(err.stderr || "");
  }

  assert.equal(threw, true);
  assert.match(combined, /symlinked manifest file/);
  assert.equal(fs.readFileSync(outside, "utf8"), "outside");
});

test("install with only symlink failures exits non-zero without activation or manifest", () => {
  const root = tmpRoot("install-symlink-fail");
  const skillDir = path.join(root, "claude", "skills", "find-skills");
  const outside = path.join(root, "outside.md");
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(outside, "outside", "utf8");
  fs.symlinkSync(outside, path.join(skillDir, "SKILL.md"));

  let threw = false;
  let combined = "";
  try {
    run([
      "install",
      "--skills", "find-skills",
      "--harness", "claude",
      "--root", root,
      "--force",
    ]);
  } catch (err) {
    threw = true;
    combined = String(err.stdout || "") + String(err.stderr || "");
  }

  assert.equal(threw, true);
  assert.match(combined, /Install FAILED/);
  assert.equal(fs.readFileSync(outside, "utf8"), "outside");
  assert.equal(fs.existsSync(path.join(root, "claude", "CLAUDE.md")), false);
  assert.equal(fs.existsSync(path.join(root, ".floom", "manifest.json")), false);
});

test("re-running install with no changes is silent (idempotent)", () => {
  const root = tmpRoot("idempotent-silent");

  // First install
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  // Second install — content unchanged, must produce no ⚠ warnings
  const output = run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  assert.equal(output.includes("⚠"), false, "No warnings expected on idempotent re-run");
  assert.equal(output.includes("Kept your custom version"), false, "No 'kept' message on identical re-run");
});

test("remove --all removes skills and strips activation block", () => {
  const root = tmpRoot("remove");
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  // Verify installed
  assert.ok(fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")));

  run(["remove", "--all", "--harness", "claude", "--root", root]);

  // Skills removed
  assert.equal(
    fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")),
    false,
    "Skill should be removed"
  );

  // Activation block stripped
  if (fs.existsSync(path.join(root, "claude", "CLAUDE.md"))) {
    const content = fs.readFileSync(path.join(root, "claude", "CLAUDE.md"), "utf8");
    assert.equal(content.includes("<!-- FLOOM-START -->"), false, "FLOOM block should be removed");
  }
});

test("remove --all removes Cursor activation file when Floom-only", () => {
  const root = tmpRoot("remove-cursor");
  run(["install", "--profiles", "core", "--harness", "cursor", "--root", root]);

  const activationFile = path.join(root, "cursor", "floom-skills.mdc");
  assert.ok(fs.existsSync(activationFile), "Cursor activation file should exist after install");

  run(["remove", "--all", "--harness", "cursor", "--root", root]);

  assert.equal(
    fs.existsSync(path.join(root, "cursor", "skills", "find-skills.mdc")),
    false,
    "Cursor skill file should be removed",
  );
  assert.equal(
    fs.existsSync(activationFile),
    false,
    "Floom-only Cursor activation file should be removed",
  );
});

test("remove --skills keeps remaining manifest entries and activation block", () => {
  const root = tmpRoot("remove-partial");
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  run(["remove", "--skills", "find-skills", "--harness", "claude", "--root", root, "--yes"]);

  assert.equal(
    fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")),
    false,
    "removed skill should be gone",
  );
  assert.ok(
    fs.existsSync(path.join(root, "claude", "skills", "brainstorming", "SKILL.md")),
    "remaining skill should stay installed",
  );

  const manifestPath = path.join(root, ".floom", "manifest.json");
  assert.ok(fs.existsSync(manifestPath), "manifest should remain after partial remove");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const slugs = manifest.installed_skills.map((skill) => skill.slug);
  assert.equal(slugs.includes("find-skills"), false, "removed skill should leave manifest");
  assert.equal(slugs.includes("brainstorming"), true, "remaining skill should stay in manifest");

  const claudeMd = fs.readFileSync(path.join(root, "claude", "CLAUDE.md"), "utf8");
  assert.match(claudeMd, /<!-- FLOOM-START -->/);
  assert.doesNotMatch(claudeMd, /- \*\*find-skills\*\*/);
  assert.match(claudeMd, /brainstorming/);

  const listOutput = run(["list", "--root", root]);
  assert.doesNotMatch(listOutput, /find-skills/);
  assert.match(listOutput, /brainstorming/);
});

// ─── 0.2.4 hardening: --version, gemini reject, uninstall alias ─────────────

test("--version prints just the version number", () => {
  const output = run(["--version"]).trim();
  assert.match(output, /^\d+\.\d+\.\d+$/, `Expected semver, got: ${JSON.stringify(output)}`);
});

test("-v prints just the version number", () => {
  const output = run(["-v"]).trim();
  assert.match(output, /^\d+\.\d+\.\d+$/, `Expected semver, got: ${JSON.stringify(output)}`);
});

test("--harness gemini is explicitly rejected with exit 1", () => {
  let threw = false;
  let combined = "";
  try {
    run(["install", "--harness", "gemini", "--yes"]);
  } catch (err) {
    threw = true;
    combined = String(err.stdout || "") + String(err.stderr || "");
    assert.equal(err.status, 1, `Expected exit 1 on gemini reject, got ${err.status}`);
  }
  assert.ok(threw, "CLI should have exited non-zero for --harness gemini");
  assert.match(combined, /Gemini is not currently supported/);
  assert.match(combined, /Claude Code, Codex, Cursor, Kimi, OpenCode/);
});

test("uninstall is an alias for remove --all in the same scope", () => {
  const root = tmpRoot("uninstall-alias");
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);
  assert.ok(
    fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")),
    "skill should exist after install",
  );
  run(["uninstall", "--harness", "claude", "--root", root, "--yes"]);
  assert.equal(
    fs.existsSync(path.join(root, "claude", "skills", "find-skills", "SKILL.md")),
    false,
    "uninstall should remove the skill",
  );
});
