// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Adds an SPDX header to every tracked source file that lacks one. Run from a plugin repository:
//
//   node ../templates/tools/add-spdx-headers.mjs [overrides.json]
//
// The default header is GPL-3.0-only with the maintainer's copyright. `overrides.json` maps a
// repository-relative path to the header lines to use instead (for files derived from another
// project). The script never touches a file that already has an identifier in its first lines.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE_DIRS = ["src/", "scripts/", "tests/", "conformance/"];
const LINE_COMMENT = /\.(ts|mts|cts|js|mjs|cjs|scss)$/;
const BLOCK_COMMENT = /\.css$/;
const HEADER_WINDOW = 5;
const DEFAULT_LINES = ["SPDX-License-Identifier: GPL-3.0-only", "Copyright (C) 2026 Parkis Utama"];
// Lines that must stay first in a file: a shebang or a test-environment pragma.
const KEEP_FIRST = /^(#!|\/\/ @vitest-environment\b)/;

const overridesPath = process.argv[2];
const overrides = overridesPath ? JSON.parse(readFileSync(overridesPath, "utf8")) : {};

const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);
let changed = 0;

for (const file of tracked) {
	if (!SOURCE_DIRS.some((dir) => file.startsWith(dir))) continue;
	const block = BLOCK_COMMENT.test(file);
	if (!block && !LINE_COMMENT.test(file)) continue;

	const text = readFileSync(file, "utf8");
	const newline = text.includes("\r\n") ? "\r\n" : "\n";
	const lines = text.split(/\r?\n/);
	if (lines.slice(0, HEADER_WINDOW).some((line) => line.includes("SPDX-License-Identifier:"))) {
		continue;
	}

	const headerLines = overrides[file] ?? DEFAULT_LINES;
	const header = headerLines.map((line) => (block ? `/* ${line} */` : `// ${line}`));
	const kept = KEEP_FIRST.test(lines[0] ?? "") ? [lines.shift()] : [];
	const body = lines[0] === "" ? lines : ["", ...lines];
	writeFileSync(file, [...kept, ...header, ...body].join(newline));
	changed += 1;
}

console.log(`Added an SPDX header to ${changed} file(s).`);
