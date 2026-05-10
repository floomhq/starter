import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "bin", "floom-packs.mjs");
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "packs", "starter", "manifest.json"), "utf8"));

function run(args, options = {}) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });
}

function tmpRoot(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `floom-packs-${name}-`));
}

test("list prints profiles and skill count", () => {
  const output = run(["list"]);
  assert.match(output, /Floom Starter/);
  assert.match(output, /core/);
  assert.match(output, /dev/);
  assert.match(output, /Skills: 29/);
});

test("manifest references existing skills with frontmatter", () => {
  const slugs = new Set();

  for (const skill of manifest.skills) {
    assert.match(skill.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(slugs.has(skill.slug), false, `duplicate skill slug ${skill.slug}`);
    slugs.add(skill.slug);

    const skillFile = path.join(repoRoot, "packs", "starter", "skills", skill.slug, "SKILL.md");
    assert.equal(fs.existsSync(skillFile), true, `${skill.slug} missing SKILL.md`);
    const body = fs.readFileSync(skillFile, "utf8");
    assert.match(body, /^---\n[\s\S]+?\n---\n/, `${skill.slug} missing YAML frontmatter`);
    assert.match(body, /description:/, `${skill.slug} missing description`);
  }

  for (const profile of manifest.profiles) {
    for (const slug of profile.skills) {
      assert.equal(slugs.has(slug), true, `${profile.id} references missing skill ${slug}`);
    }
  }
});

test("install without --yes is a dry-run and writes nothing", () => {
  const root = tmpRoot("dry-run");
  const output = run(["install", "--profiles", "dev", "--targets", "claude,codex", "--root", root]);

  assert.match(output, /No files changed/);
  assert.match(output, /Profiles: core, dev/);
  assert.equal(fs.existsSync(path.join(root, "claude", "skills", "local-find-skills")), false);
});

test("install writes selected skills, index, provenance, and instructions to temp roots", () => {
  const root = tmpRoot("install");
  const output = run([
    "install",
    "--profiles",
    "dev,writing",
    "--targets",
    "claude,codex",
    "--root",
    root,
    "--yes"
  ]);

  assert.match(output, /Installed 12 skills for claude, codex/);
  assert.equal(fs.existsSync(path.join(root, "claude", "skills", "local-find-skills", "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(root, "codex", "skills", "pr-review", "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(root, "codex", "skills", "brand-voice-writer", "SKILL.md")), true);

  const provenance = JSON.parse(fs.readFileSync(path.join(root, "codex", "skills", "pr-review", ".floom-pack.json"), "utf8"));
  assert.equal(provenance.package, "@floomhq/packs");
  assert.equal(provenance.pack, "starter");

  const index = JSON.parse(fs.readFileSync(path.join(root, ".floom", "packs", "starter-index.json"), "utf8"));
  assert.equal(index.skills.length, 12);
  assert.deepEqual(index.targets, ["claude", "codex"]);

  const claudeInstructions = fs.readFileSync(path.join(root, "claude", "CLAUDE.md"), "utf8");
  assert.match(claudeInstructions, /Floom Packs/);
  assert.match(claudeInstructions, /local-find-skills/);
});

test("install refuses to overwrite untracked existing skills", () => {
  const root = tmpRoot("conflict");
  const existing = path.join(root, "claude", "skills", "local-find-skills");
  fs.mkdirSync(existing, { recursive: true });
  fs.writeFileSync(path.join(existing, "SKILL.md"), "# User skill\n");

  assert.throws(
    () => run(["install", "--profiles", "core", "--targets", "claude", "--root", root, "--yes"]),
    /Install has conflicts/
  );

  const dryRun = run(["install", "--profiles", "core", "--targets", "claude", "--root", root, "--dry-run"]);
  assert.match(dryRun, /conflicts: 1/);
});
