#!/usr/bin/env node

// Dependencies
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || process.cwd());
const canonicalPath = resolve(root, ".pullboard/project.json");

/**
 * Read json
 *
 * @param {string} path - Path
 *
 * @returns {Object} Result
 */
async function readJson(path) {

  try {

    const raw = await readFile(path, "utf8");

    // Hand back the parsed config alongside its source path
    return { path, value: JSON.parse(raw) };

    // Fall back to null when the file is absent, rethrow real read failures
  } catch (error) {
    if (error?.code === "ENOENT") return null;

    // Treat malformed JSON as a hard configuration error
    if (error instanceof SyntaxError) throw new Error(`invalid project config JSON: ${path}`);

    // Propagate any other read failure to the caller
    throw error;
  }
}

/**
 * Canonical json
 *
 * @param {Array} value - Value
 *
 * @returns {string} Result
 */
function canonicalJson(value) {

  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;

  // Serialize objects with sorted keys so the digest stays stable
  if (value && typeof value === "object") {

    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }

  // Hand back the JSON encoding for primitive values
  return JSON.stringify(value);
}

const canonical = await readJson(canonicalPath);
if (!canonical) {

  console.error("No .pullboard/project.json found");
  process.exitCode = 2;
} else {
  const text = canonicalJson(canonical.value);
  process.stdout.write(`${JSON.stringify({
    path: canonical.path,
    configDigest: `sha256:${createHash("sha256").update(text).digest("hex")}`,
  })}\n`);
}
