// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Copies the shared repository files from templates/plugin/ into a plugin repository and applies
// the package.json changes that go with them. Run from the plugin repository root:
//
//   node ../templates/tools/apply-plugin-template.mjs <github repository name> <bootstrap sha>
//
// It overwrites the shared files; repository-specific content (AGENTS.md, CONTRIBUTING.md) is
// left to the caller.

import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [repoName, bootstrapSha] = process.argv.slice(2);
if (!repoName || !bootstrapSha) {
	console.error("Usage: apply-plugin-template.mjs <github repository name> <bootstrap sha>");
	process.exit(2);
}

const templates = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = (file) => path.join(templates, "plugin", file);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const indent = /^\t/m.test(readFileSync("package.json", "utf8")) ? "\t" : "  ";
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, indent)}\n`);

for (const file of [
	".github/workflows/ci.yml",
	".github/workflows/release.yml",
	".github/dependabot.yml",
	"commitlint.config.mjs",
	".husky/pre-commit",
	".husky/commit-msg",
	"docs/releases/TEMPLATE.md",
	"scripts/versions-map.mjs",
	"tests/versions-map.test.ts",
]) {
	mkdirSync(path.dirname(file), { recursive: true });
	cpSync(from(file), file);
}
cpSync(path.join(templates, "conformance/standard.test.mjs"), "conformance/standard.test.mjs");

writeFileSync("SECURITY.md", readFileSync(from("SECURITY.md"), "utf8").replaceAll("__REPO__", repoName));

const releaseConfig = JSON.parse(
	readFileSync(from("release-please-config.json"), "utf8").replaceAll("__NAME__", pkg.name),
);
// Only commits after this one feed the first changelog; the history before the version restart
// belongs to the withdrawn releases.
releaseConfig["bootstrap-sha"] = bootstrapSha;
writeJson("release-please-config.json", releaseConfig);
writeJson(".release-please-manifest.json", { ".": "0.0.0" });

pkg.scripts = { prepare: "husky", ...pkg.scripts };
if (!/conformance/.test(pkg.scripts.verify)) {
	pkg.scripts.verify = `${pkg.scripts.verify} && pnpm run conformance`;
}
pkg.devDependencies = {
	...pkg.devDependencies,
	"@commitlint/cli": "^21.2.3",
	"@commitlint/config-conventional": "^21.2.3",
	husky: "^9.1.7",
};
pkg.devDependencies = Object.fromEntries(
	Object.entries(pkg.devDependencies).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
);
writeJson("package.json", pkg);

console.log(`Applied the plugin template to ${repoName} (bootstrap ${bootstrapSha.slice(0, 7)}).`);
