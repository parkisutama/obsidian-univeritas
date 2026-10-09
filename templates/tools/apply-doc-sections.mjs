// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Puts the shared "Release" guidance into a plugin repository's AGENTS.md and CONTRIBUTING.md.
// Run from the plugin repository root:
//
//   node ../templates/tools/apply-doc-sections.mjs [heading to replace in CONTRIBUTING.md ...]
//
// AGENTS.md: the "## Release" section is replaced, or appended when absent.
// CONTRIBUTING.md: every heading named on the command line is removed with its section, then the
// shared "Commits and pull requests" and "Releasing" sections are appended (or replaced).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templates = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../plugin");
const read = (file) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");

/** Splits Markdown into the text before the first `## ` heading and one block per `## ` section. */
function sections(text) {
	const parts = text.split(/^(?=## )/m);
	// A split never happens at index 0, so a text that opens with a heading has no preamble.
	if (text.startsWith("## ")) return { preamble: "", blocks: parts };
	return { preamble: parts[0], blocks: parts.slice(1) };
}

const headingOf = (block) => block.split("\n", 1)[0].replace(/^## /, "").trim();

function upsert(file, shared, alsoRemove = []) {
	const { preamble, blocks } = sections(read(file));
	const incoming = sections(shared).blocks;
	const replaced = new Set([...incoming.map(headingOf), ...alsoRemove]);
	const kept = blocks.filter((block) => !replaced.has(headingOf(block)));
	const body = [...kept, ...incoming].map((block) => `${block.trimEnd()}\n`).join("\n");
	writeFileSync(file, `${preamble.trimEnd()}\n\n${body}`);
}

upsert("AGENTS.md", read(path.join(templates, "AGENTS-release-section.md")));
upsert(
	"CONTRIBUTING.md",
	read(path.join(templates, "CONTRIBUTING-releasing-section.md")),
	process.argv.slice(2),
);
console.log("Updated the release guidance in AGENTS.md and CONTRIBUTING.md.");
