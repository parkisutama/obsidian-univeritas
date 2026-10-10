// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Moves guides from a plugin repository into this repository under docs/<plugin>/, keeping their
// folder layout, and keeps every link working. Run from the plugin repository root:
//
//   node <workspace>/templates/tools/move-docs.mjs <github repo> <plugin folder name> <path> [...]
//
// A path is a tracked Markdown file or a folder of them. A leading `docs/` is dropped from the
// destination, so `docs/en/for-users/a.md` lands in `docs/<plugin>/en/for-users/a.md`.
//
// Links are rewritten three ways:
//   - moved file -> moved file: stays relative;
//   - moved file -> file that stays in the plugin repository: absolute link to that repository;
//   - file that stays in the plugin repository -> moved file: absolute link to this repository.
//
// The moved files are removed from the plugin repository with `git rm`.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [repo, plugin, ...inputs] = process.argv.slice(2);
if (!repo || !plugin || inputs.length === 0) {
	console.error("Usage: move-docs.mjs <github repo> <plugin folder name> <path> [...]");
	process.exit(2);
}

const OWNER = "parkisutama";
const WORKSPACE_REPO = "obsidian-univeritas";
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const posix = (p) => p.split(path.sep).join("/");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" });

const tracked = git("ls-files").split("\n").filter(Boolean);
const moved = tracked.filter(
	(file) =>
		file.endsWith(".md") &&
		inputs.some((input) => file === input || file.startsWith(`${input.replace(/\/$/, "")}/`)),
);
if (moved.length === 0) throw new Error("No tracked Markdown file matches the given paths.");
const movedSet = new Set(moved);

/** Where a moved file lands, relative to the workspace repository root. */
const destination = (file) => `docs/${plugin}/${file.replace(/^docs\//, "")}`;
const pluginUrl = (file) => `https://github.com/${OWNER}/${repo}/blob/main/${file}`;
const workspaceUrl = (file) =>
	`https://github.com/${OWNER}/${WORKSPACE_REPO}/blob/main/${destination(file)}`;

// [text](target) and [text](target "title"); the target has no spaces or is wrapped in <>.
const LINK = /(\]\()(<[^>]+>|[^)\s]+)((?:\s+"[^"]*")?\))/g;
const isExternal = (target) => /^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target);

function rewriteLinks(text, fromFile, resolveTarget) {
	return text.replace(LINK, (whole, open, rawTarget, close) => {
		const wrapped = rawTarget.startsWith("<");
		const target = wrapped ? rawTarget.slice(1, -1) : rawTarget;
		if (isExternal(target)) return whole;
		const [targetPath, anchor = ""] = target.split(/(?=#)/);
		if (targetPath === "") return whole;
		const resolved = posix(path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), decodeURI(targetPath))));
		const next = resolveTarget(resolved);
		if (next === null) return whole;
		const encoded = encodeURI(next) + anchor;
		return `${open}${wrapped ? `<${encoded}>` : encoded}${close}`;
	});
}

// 1. Copy each moved file with its outgoing links fixed.
for (const file of moved) {
	const to = destination(file);
	const text = rewriteLinks(readFileSync(file, "utf8"), file, (resolved) => {
		const clean = resolved.replace(/\/$/, "");
		if (movedSet.has(clean)) {
			return posix(path.posix.relative(path.posix.dirname(to), destination(clean))) || ".";
		}
		// A folder or a file that stays behind: link to the plugin repository.
		const isFolder = !tracked.includes(clean);
		return isFolder
			? `https://github.com/${OWNER}/${repo}/tree/main/${clean}`
			: pluginUrl(clean);
	});
	const target = path.join(workspace, to);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, text);
}

// 2. Point the files that stay behind at the new location.
let relinked = 0;
for (const file of tracked) {
	if (!file.endsWith(".md") || movedSet.has(file)) continue;
	const before = readFileSync(file, "utf8");
	const after = rewriteLinks(before, file, (resolved) =>
		movedSet.has(resolved) ? workspaceUrl(resolved) : null,
	);
	if (after !== before) {
		writeFileSync(file, after);
		relinked += 1;
	}
}

// 3. Remove the moved files from the plugin repository.
git("rm", "-q", "--", ...moved);

console.log(
	`Moved ${moved.length} file(s) to docs/${plugin}/ and relinked ${relinked} file(s) that stay in ${repo}.`,
);
