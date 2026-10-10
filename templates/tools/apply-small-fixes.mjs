// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// One-off maintenance applied to each plugin repository on 2026-10-10. Run from the plugin
// repository root. Kept as a record of what the "small fixes" pull requests changed.
//
//   node <workspace>/templates/tools/apply-small-fixes.mjs

import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templates = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(file, "utf8");

// 1. The conformance test: REUSE markers and the supply-chain check.
cpSync(path.join(templates, "conformance/standard.test.mjs"), "conformance/standard.test.mjs");

// 2. pnpm asks before installing a version younger than the minimum release age, instead of
//    adding it to the exclusion list by itself.
let workspace = read("pnpm-workspace.yaml");
if (!/^minimumReleaseAgeStrict:/m.test(workspace)) {
	workspace = `${workspace.trimEnd()}\n\n# Ask before installing a version younger than the minimum release age; never exclude it silently.\nminimumReleaseAgeStrict: true\n`;
	writeFileSync("pnpm-workspace.yaml", workspace);
}

// 3. Scripts that build the license banner contain the SPDX tag as text; tell REUSE to skip it.
const START = "// REUSE-IgnoreStart";
const END = "// REUSE-IgnoreEnd";
for (const file of ["scripts/license-banner.mjs"]) {
	if (!existsSync(file)) continue;
	const text = read(file);
	if (text.includes(START)) continue;
	const lines = text.split("\n");
	// Keep the file's own header (the leading comment lines) outside the ignored region.
	let headerEnd = 0;
	while (headerEnd < lines.length && lines[headerEnd].startsWith("//")) headerEnd += 1;
	const body = lines.slice(headerEnd).join("\n").trimEnd();
	writeFileSync(
		file,
		`${lines.slice(0, headerEnd).join("\n")}\n\n// This file writes the SPDX tag into build output; the markers keep the REUSE linter from\n// reading those strings as this file's own license.\n${START}\n${body}\n${END}\n`,
	);
}

// 4. Local caches of the Markdown linter stay out of git.
const ignore = read(".gitignore");
if (!/^\.rumdl_cache\/?$/m.test(ignore)) {
	writeFileSync(".gitignore", `${ignore.trimEnd()}\n\n# Markdown lint cache\n.rumdl_cache\n`);
}

console.log("Applied the small fixes.");
