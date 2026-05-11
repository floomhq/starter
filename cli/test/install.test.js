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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, "..", "bin", "starter.js");
const DATA_DIR = path.join(__dirname, "..", "data");

function run(args, options = {}) {
  return execFileSync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
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

// ─── CLI smoke tests ─────────────────────────────────────────────────────────

test("--help prints usage", () => {
  const output = run(["--help"]);
  assert.match(output, /@floomhq\/starter/);
  assert.match(output, /install/);
  assert.match(output, /init/);
  assert.match(output, /list/);
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

test("install --all writes all skills (>=29)", () => {
  const root = tmpRoot("install-all");
  const output = run([
    "install",
    "--all",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /skills installed/);

  const skillDirs = fs.readdirSync(path.join(root, "claude", "skills"));
  assert.ok(skillDirs.length >= 29, `Expected >=29 skill dirs, got ${skillDirs.length}`);
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
