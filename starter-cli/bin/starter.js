#!/usr/bin/env node
/**
 * @floomhq/starter — CLI entry point
 *
 * Install curated AI agent skills for Claude Code, Codex, Cursor, OpenCode, and Kimi.
 *
 * Usage:
 *   npx @floomhq/starter install --profiles core,dev
 *   npx @floomhq/starter install --skills pr-review,task-brief
 *   npx @floomhq/starter install --all
 *   npx @floomhq/starter init
 *   npx @floomhq/starter list
 *   npx @floomhq/starter remove --all
 */

import { install, remove, list } from "../src/install.js";
import { runInit } from "../src/init-interactive.js";

const PACKAGE_VERSION = "0.2.2";

function usage() {
  return `
  @floomhq/starter v${PACKAGE_VERSION}

  Install curated AI skills for Claude Code, Codex, Cursor, OpenCode, and Kimi.

  Commands:
    install        Install skills to detected agents
    init           Interactive: pick your role, auto-install matching profiles
    list           Show installed skills
    remove --all   Remove all installed skills

  Install flags:
    --profiles <ids>    Comma-separated profile IDs (core, dev, writing, research,
                        marketing, sales, ops, founder, data, design, video)
    --skills <slugs>    Comma-separated skill slugs for direct selection
    --all               Install all available skills
    --harness <ids>     Comma-separated agent IDs: claude,codex,cursor,opencode,kimi
                        (default: auto-detect installed agents)
    --force             Overwrite existing skills
    --dry-run           Print plan without installing
    --yes               Skip interactive prompts (alias: --non-interactive)
    --non-interactive   Same as --yes

  Examples:
    npx @floomhq/starter install --profiles core,dev
    npx @floomhq/starter install --skills pr-review,task-brief --harness claude
    npx @floomhq/starter install --all
    npx @floomhq/starter init
    npx @floomhq/starter list
    npx @floomhq/starter remove --all
`.trim();
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const [command, ...rest] = args;
  const flags = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    const boolFlags = ["all", "force", "dry-run", "yes", "non-interactive"];
    if (boolFlags.includes(key)) {
      // --non-interactive is an alias for --yes
      if (key === "non-interactive") {
        flags["yes"] = true;
      } else {
        flags[key] = true;
      }
      continue;
    }
    const value = rest[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    flags[key] = value;
    i++;
  }

  return { command, flags };
}

function splitList(value) {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function log(msg) {
  process.stdout.write(msg + "\n");
}

function formatProfiles(str) {
  if (!str) return [];
  return splitList(str);
}

async function main() {
  const { command, flags } = parseArgs(process.argv);

  if (!command || command === "--help" || command === "-h") {
    log(usage());
    return;
  }

  if (command === "--version" || command === "-v") {
    log(PACKAGE_VERSION);
    return;
  }

  if (command === "install") {
    log("");
    log("  Floom Starter — installing skills...");
    log("");
    const result = await install({
      profiles: formatProfiles(flags.profiles),
      skills: splitList(flags.skills),
      all: Boolean(flags.all),
      harness: splitList(flags.harness),
      root: flags.root || null,
      force: Boolean(flags.force),
      dryRun: Boolean(flags["dry-run"]),
      log,
    });
    if (result && result.failed) {
      process.exit(1);
    }
    return;
  }

  if (command === "init") {
    await runInit({
      harness: splitList(flags.harness),
      root: flags.root || null,
      force: Boolean(flags.force),
      log,
    });
    return;
  }

  if (command === "list") {
    log("");
    list({
      root: flags.root || null,
      log,
    });
    return;
  }

  if (command === "remove") {
    log("");
    log("  Floom Starter — removing skills...");
    log("");
    await remove({
      all: Boolean(flags.all),
      harness: splitList(flags.harness),
      root: flags.root || null,
      dryRun: Boolean(flags["dry-run"]),
      log,
    });
    return;
  }

  log(`Unknown command: ${command}`);
  log("");
  log(usage());
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`\n  Error: ${err.message}\n\n`);
  process.exit(1);
});
