/**
 * init-interactive.js
 * Interactive "what's your work?" onboarding flow.
 * Maps user's role to profiles, then runs install.
 */

import readline from "node:readline";
import { install } from "./install.js";

const ROLE_TO_PROFILES = {
  "1": { label: "Developer / Engineer", profiles: ["core", "dev"] },
  "2": { label: "Founder / Product", profiles: ["core", "founder", "dev"] },
  "3": { label: "Writer / Content", profiles: ["core", "writing"] },
  "4": { label: "Researcher / Analyst", profiles: ["core", "research", "data"] },
  "5": { label: "Marketer / Growth", profiles: ["core", "marketing", "writing"] },
  "6": { label: "Sales", profiles: ["core", "sales"] },
  "7": { label: "Ops / Admin", profiles: ["core", "ops"] },
  "8": { label: "Video / Media", profiles: ["core", "video"] },
  "9": { label: "All (install everything)", profiles: null }, // null = --all
};

function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

export async function runInit(opts = {}) {
  const log = opts.log || console.log;

  log("");
  log("  Floom Starter, skill installer for AI agents");
  log("  ─────────────────────────────────────────────");
  log("");
  log("  What best describes your work?");
  log("");
  for (const [key, value] of Object.entries(ROLE_TO_PROFILES)) {
    log(`    ${key}.  ${value.label}`);
  }
  log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  let choice;
  while (true) {
    choice = await prompt(rl, "  Your choice (1-9): ");
    if (ROLE_TO_PROFILES[choice]) break;
    log("  Please enter a number from 1 to 9.");
  }

  const selected = ROLE_TO_PROFILES[choice];
  log("");
  log(`  Installing profiles for: ${selected.label}`);
  log("");

  rl.close();

  const installOpts = {
    ...opts,
    profiles: selected.profiles || [],
    all: selected.profiles === null,
    log,
  };

  await install(installOpts);
}
