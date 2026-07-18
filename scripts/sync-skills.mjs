#!/usr/bin/env node

// Mirror the maintained Pullboard skills from the monorepo into this distribution
// repo so the published plugin can never silently drift from the source of truth.
// The monorepo is private; this script is maintainer-only and takes its path as an
// argument (or the PULLBOARD_MONOREPO env var). It copies apps/skills/* verbatim into
// pullboard/skills/ and fails loudly if the source is missing — never a silent skip.

import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const monorepo = resolve(process.argv[2] || process.env.PULLBOARD_MONOREPO || "");

if (!process.argv[2] && !process.env.PULLBOARD_MONOREPO) {
  console.error("usage: node scripts/sync-skills.mjs <path-to-pullboard-monorepo>");
  console.error("   or: PULLBOARD_MONOREPO=<path> node scripts/sync-skills.mjs");
  process.exit(2);
}

const source = join(monorepo, "apps", "skills");
if (!existsSync(source) || !statSync(source).isDirectory()) {
  console.error(`source skills directory not found: ${source}`);
  console.error("point this at a checkout of the Pullboard monorepo (the one that owns apps/skills).");
  process.exit(1);
}

const destination = join(repoRoot, "pullboard", "skills");
rmSync(destination, { recursive: true, force: true });

const skills = readdirSync(source).filter((entry) => statSync(join(source, entry)).isDirectory()).sort();
if (skills.length === 0) {
  console.error(`no skills found under ${source}`);
  process.exit(1);
}

for (const skill of skills) {
  cpSync(join(source, skill), join(destination, skill), { recursive: true, dereference: true });
  console.log(`synced ${skill}`);
}

console.log(`\n${skills.length} skill(s) mirrored into pullboard/skills from ${source}`);
