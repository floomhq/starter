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
  assert.equal(manifest.id, "starter");
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
  // No actual files written
  assert.equal(fs.existsSync(path.join(root, "claude", "skills", "local-find-skills", "SKILL.md")), false);
});

test("install --profiles core writes skills, activation block, and manifest", () => {
  const root = tmpRoot("install-core");
  const output = run([
    "install",
    "--profiles", "core",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /Installed/);

  // Core profile skills: local-find-skills, task-brief, project-onboarding
  const claudeSkills = path.join(root, "claude", "skills");
  assert.ok(fs.existsSync(path.join(claudeSkills, "local-find-skills", "SKILL.md")), "local-find-skills missing");
  assert.ok(fs.existsSync(path.join(claudeSkills, "task-brief", "SKILL.md")), "task-brief missing");
  assert.ok(fs.existsSync(path.join(claudeSkills, "project-onboarding", "SKILL.md")), "project-onboarding missing");

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

  assert.match(output, /Installed/);

  // Dev profile skills should be present
  assert.ok(
    fs.existsSync(path.join(root, "claude", "skills", "pr-review", "SKILL.md")),
    "pr-review missing in claude"
  );
  assert.ok(
    fs.existsSync(path.join(root, "codex", "skills", "pr-review", "SKILL.md")),
    "pr-review missing in codex"
  );
  assert.ok(
    fs.existsSync(path.join(root, "codex", "skills", "security-review", "SKILL.md")),
    "security-review missing in codex"
  );
});

test("install --all writes all 29 skills", () => {
  const root = tmpRoot("install-all");
  const output = run([
    "install",
    "--all",
    "--harness", "claude",
    "--root", root,
  ]);

  assert.match(output, /Installed 29 skills/);

  const skillDirs = fs.readdirSync(path.join(root, "claude", "skills"));
  assert.equal(skillDirs.length, 29, `Expected 29 skill dirs, got ${skillDirs.length}`);
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

  // Cursor uses .mdc files
  assert.ok(
    fs.existsSync(path.join(root, "cursor", "skills", "local-find-skills.mdc")),
    "local-find-skills.mdc missing for cursor"
  );
  const mdc = fs.readFileSync(path.join(root, "cursor", "skills", "local-find-skills.mdc"), "utf8");
  assert.match(mdc, /---\ndescription:/);
  assert.match(mdc, /alwaysApply: false/);
});

test("list shows installed skills", () => {
  const root = tmpRoot("list");
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  const output = run(["list", "--root", root]);
  assert.match(output, /local-find-skills/);
  assert.match(output, /task-brief/);
});

test("remove --all removes skills and strips activation block", () => {
  const root = tmpRoot("remove");
  run(["install", "--profiles", "core", "--harness", "claude", "--root", root]);

  // Verify installed
  assert.ok(fs.existsSync(path.join(root, "claude", "skills", "local-find-skills", "SKILL.md")));

  run(["remove", "--all", "--harness", "claude", "--root", root]);

  // Skills removed
  assert.equal(
    fs.existsSync(path.join(root, "claude", "skills", "local-find-skills", "SKILL.md")),
    false,
    "Skill should be removed"
  );

  // Activation block stripped
  if (fs.existsSync(path.join(root, "claude", "CLAUDE.md"))) {
    const content = fs.readFileSync(path.join(root, "claude", "CLAUDE.md"), "utf8");
    assert.equal(content.includes("<!-- FLOOM-START -->"), false, "FLOOM block should be removed");
  }
});
