// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Checks the GitHub links between this repository and the plugin repositories, in both
// directions. The Markdown lint only sees relative links, so a guide moved here or a
// specification moved there would otherwise break links silently.
//
//   node templates/tools/check-cross-links.mjs [ref]
//
// Run from the workspace root, with the plugin repositories checked out in their folders.
// `ref` is the plugin revision to read (default `HEAD`; use `origin/main` when a checkout
// has local changes). This repository is read from the working tree.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const OWNER = "parkisutama";
const WORKSPACE = "obsidian-univeritas";
const PLUGINS = ["obsidian-unimian", "obsidian-unisastra", "obsidian-unistoria"];
const ref = process.argv[2] ?? "HEAD";

const git = (cwd, ...args) =>
	execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const lines = (text) => text.split("\n").filter(Boolean);

/** Yields `{ repository, target, line }` for every `blob` or `tree` link on `main`. */
function* links(text) {
	const pattern = new RegExp(
		`https://github\\.com/${OWNER}/([\\w.-]+)/(?:blob|tree)/main/([^\\s)>"'\`\\]]*)`,
		"g",
	);
	const rows = text.split("\n");
	for (let index = 0; index < rows.length; index += 1) {
		for (const match of rows[index].matchAll(pattern)) {
			const target = decodeURIComponent(match[2].replace(/[#?].*$/, "").replace(/[/.,;:]+$/, ""));
			yield { repository: match[1], target, line: index + 1 };
		}
	}
}

const broken = [];
let checked = 0;

const trees = new Map();
for (const plugin of PLUGINS) {
	if (!existsSync(path.join(plugin, ".git"))) {
		console.warn(`skipped ${plugin}: not checked out`);
		continue;
	}
	trees.set(plugin, new Set(lines(git(plugin, "ls-tree", "-r", "-t", "--name-only", ref))));
}

// This repository -> plugin repositories.
for (const file of lines(git(".", "ls-files", "-co", "--exclude-standard", "*.md"))) {
	if (!existsSync(file)) continue;
	for (const link of links(readFileSync(file, "utf8"))) {
		const tree = trees.get(link.repository);
		if (!tree) continue;
		checked += 1;
		if (link.target !== "" && !tree.has(link.target)) {
			broken.push(`${file}:${link.line} -> ${link.repository}: ${link.target}`);
		}
	}
}

// Plugin repositories -> this repository.
for (const [plugin, tree] of trees) {
	for (const file of tree) {
		if (!file.endsWith(".md")) continue;
		for (const link of links(git(plugin, "show", `${ref}:${file}`))) {
			if (link.repository !== WORKSPACE) continue;
			checked += 1;
			if (link.target !== "" && !existsSync(link.target)) {
				broken.push(`${plugin}/${file}:${link.line} -> ${WORKSPACE}: ${link.target}`);
			}
		}
	}
}

for (const row of broken) console.error(`broken: ${row}`);
console.log(`${checked} cross-repository links checked, ${broken.length} broken`);
process.exit(broken.length === 0 ? 0 : 1);
