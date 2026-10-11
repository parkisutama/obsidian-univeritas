// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Measures how much of each file in a plugin repository also appears in an upstream revision.
//
//   node provenance.mjs <plugin dir> <upstream dir> <upstream rev> <ext regex> <rename pairs json> [fine]
//
// A file is cut into format-insensitive segments (whitespace, quote style, and declaration
// modifiers such as `export` removed, split on `;`, `{`, `}`), and segments of 20+ characters are
// compared with the pool of all upstream segments. With `fine`, segments are also split on `,`
// and kept from 14 characters, which finds shared entries inside long literals (option lists,
// union types) at the cost of more chance matches. Output: one tab-separated line per plugin
// file: share, matched/total, best upstream file.
//
// A low share does not prove a file is original: read the candidates before changing a header.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const [pluginDir, upstreamDir, rev, extPattern, renamesJson = "[]", mode = ""] = process.argv.slice(2);
const fine = mode === "fine";
const MODIFIERS = /\b(export\s+default|export|declare|public|private|protected|readonly|static)\s+/g;
const ext = new RegExp(extPattern);
const renames = JSON.parse(renamesJson);
const git = (cwd, ...args) =>
	execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

function segments(text) {
	let t = text
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/^\s*\/\/.*$/gm, "")
		.replace(MODIFIERS, "")
		.toLowerCase();
	for (const [from, to] of renames) t = t.split(from).join(to);
	t = t.replace(/\s+/g, "").replace(/['`]/g, '"').replace(/,(?=[)\]}])/g, "");
	return t.split(fine ? /[;{},]/ : /[;{}]/).filter((s) => s.length >= (fine ? 14 : 20));
}

const upstreamFiles = git(upstreamDir, "ls-tree", "-r", "--name-only", rev)
	.split("\n")
	.filter((f) => ext.test(f));
const pool = new Map(); // segment -> Set(upstream file)
for (const file of upstreamFiles) {
	const text = git(upstreamDir, "show", `${rev}:${file}`);
	for (const seg of segments(text)) {
		if (!pool.has(seg)) pool.set(seg, new Set());
		pool.get(seg).add(file);
	}
}

const pluginFiles = git(pluginDir, "ls-files").split("\n").filter((f) => ext.test(f));
for (const file of pluginFiles) {
	const segs = segments(readFileSync(path.join(pluginDir, file), "utf8"));
	const votes = new Map();
	let matched = 0;
	for (const seg of segs) {
		const owners = pool.get(seg);
		if (!owners) continue;
		matched += 1;
		for (const owner of owners) votes.set(owner, (votes.get(owner) ?? 0) + 1);
	}
	const best = [...votes.entries()].sort((a, b) => b[1] - a[1])[0];
	const share = segs.length === 0 ? 0 : matched / segs.length;
	console.log(
		[share.toFixed(2), `${matched}/${segs.length}`, file, best ? `${best[0]} (${best[1]})` : "-"].join("\t"),
	);
}
