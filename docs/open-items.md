---
title: "Open Items Register"
created: "2026-10-09T00:00:00+07:00"
tags:
  - engineering
  - obsidian-plugin
status: active
authority: record
owner: "Parkis Utama"
related:
  - "implementation-plan.md"
---

# Open Items Register

Items that came up during the standardization work and are deliberately left for a discussion after the last phase.
Nothing here blocks the current phase. Add an item when it appears; close it with a date and the outcome.

## Development-dependency advisories

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| DEP-01 | Unisastra | `braces` (high) through `stylelint` and `stylelint-config-standard-scss`; no patched release exists. | open |
| DEP-02 | Unisastra | `@vue/server-renderer` (high) through `vitepress` 1.6.4, which pins an old Vite and Vue line. | open |
| DEP-03 | Unisastra | `pnpm-workspace.yaml` overrides `js-yaml` and `vitepress>vite` as security patches; recheck whether they are still needed. | open |
| DEP-04 | Unisastra | `@parcel/watcher` is allowed to run an install script; confirm which package needs it. | open |
| DEP-05 | All | `obsidian@1.14.4` sits in `minimumReleaseAgeExclude`; remove the entry once the release is old enough. | open |
| DEP-06 | All | TypeScript 7 and ESLint 10 are held back by `typescript-eslint` and `eslint-plugin-obsidianmd`; revisit when those support them. | open |

## Errors and surprises met during the work

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| ERR-01 | Unisastra | The Markdown lint passed locally on Windows but failed in CI on three broken relative links. The local/CI difference is unexplained. | open |
| ERR-02 | Unisastra | pnpm 11 refused to reuse `node_modules` and asked to purge it. Gone after the move to pnpm 12; cause not investigated. | open |
| ERR-03 | All | pnpm adds a too-new package version to `minimumReleaseAgeExclude` without asking. Decide whether to set `minimumReleaseAgeStrict`. | open |
| ERR-04 | Unisastra | Vitest 5 cannot resolve the types-only `obsidian` package even when mocked; worked around with a stub alias. | closed 2026-10-09 |
| ERR-05 | Unimian | `strict` surfaced one error: `settings` clashes with the property Obsidian's `Plugin` defines since 1.13. | closed 2026-10-09 |

## Not verified

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| VER-01 | All | Nothing changed since 2026-10-09 has been run inside Obsidian. Evidence so far is typecheck, lint, unit tests, and build only. | open |
| VER-02 | All | The plugins are declared for Obsidian 1.14.4 but have not been accepted natively on that version. | open |
| VER-03 | Unisastra | The five Electron regression scripts under `scripts/*.cjs` were not run after `electron` left the dependencies. | open |
| VER-04 | Unimian | `pnpm run dev` with `.env` loaded through `process.loadEnvFile` was not exercised. | open |
| VER-05 | Unisastra | The tab reformat touched 296 files; reviewed only through the automated gates. | open |
| VER-06 | All | Whether Obsidian itself rejects a vault path containing `..`. | open |
| VER-07 | Unisastra | Two files say "no code ported" from `deathau` repositories that declare no license; not compared against upstream. | open |
| VER-08 | Unimian | The relationship to `mmattia09/obsidian-project-manager` and that project's license. | open |
| VER-09 | All | Git history was scanned for secrets by pattern only, not with a dedicated tool. | open |
| VER-11 | Unimian | The bundle target moved from es2018 to es2022; not loaded in Obsidian on desktop or mobile since. | open |
| VER-12 | All | `pnpm run deploy` and the `dev` vault copy were tested with temporary folders only, not against a real vault. | open |
| VER-13 | Unimian | The release workflow's zip step was rewritten for `dist/` and has not run. | open |
| VER-14 | Unimian | Biome applied safe fixes (import sorting, `import type`) across about 170 files; reviewed only through the automated gates. | open |
| VER-15 | Unimian | Notes created without a template now have frontmatter written by Obsidian's `stringifyYaml` (for example `start: 2026-01-01` instead of `start: "2026-01-01"`). Check that Bases views, the Properties panel, and the Gantt write-back read them the same way. | open |
| VER-16 | Unimian, Unistoria | The message shown to the user when a path with `..` is refused was not seen in Obsidian. | open |
| VER-17 | Unisastra | The legacy cursor migration was not run against a real pre-1.2.0 data folder. | open |
| VER-10 | All | Facts about Obsidian's rules (tag format, release assets, `fundingUrl`) are from memory and need checking against the current Obsidian documentation. | open |

## Decisions taken during the work, to confirm

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| DEC-01 | Unimian | New-note frontmatter uses `stringifyYaml` in a single write, not `processFrontMatter`. `processFrontMatter` needs the file to exist, so the note would be created empty and modified a moment later, which views see as two changes. `stringifyYaml` is the serializer `processFrontMatter` uses, and the one `NoteTemplateService` already used. | open |
| DEC-02 | Unimian, Unistoria | The path guard rejects only `..` segments. A leading slash is left to `normalizePath`, because users commonly type `/Folder` in settings. | open |
| DEC-03 | Unisastra | No path guard was added: the plugin creates no vault files or folders. | open |

## Documentation findings

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| DOC-01 | Unimian | `docs/specs/gantt.md` line 123: table rows without a header row (MD075). | open |
| DOC-02 | Unimian | `docs/specs/periodic-notes.md`: decisions numbered 14, 15, 13 out of order; other text refers to them by number (MD029). | open |
| DOC-03 | Unimian | `docs/architecture/upstream-provenance.md` links to `../specs/code-quality-and-performance.md`, which does not exist (MD057). | open |
| DOC-04 | Unimian | `docs/plans/license-compliance.md` uses bold text as headings (MD036). | open |
| DOC-05 | Unisastra | Status logs, specs, ADRs, and archived documents still name `check:ci`; left as historical records. Decide whether to annotate them. | open |
| DOC-06 | Unimian | `AGENTS.md` is titled "Copilot Custom Instructions", links Planner to the wrong repository URL, and has no `CLAUDE.md` router. | open |
| DOC-07 | All | Each plugin's `AGENTS.md` and `CONTRIBUTING.md` describe commands separately; consolidate the shared part into the workspace standard. | open |

## Coverage

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| COV-01 | Unisastra | Coverage ratchet starts at about 31%; most editor and UI code has no unit tests. | open |
| COV-02 | Unimian | Coverage ratchet is at 18 to 26% while measured coverage is about 72%; raise the floor. | open |

## Temporary states

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| TMP-01 | Unimian, Unisastra | Not installable from GitHub: the manifests name versions whose releases were deleted. Ends with the `0.0.1` release. | open |
| TMP-02 | Unistoria | `build` still copies to the configured vault, so every gate run writes there. Ends in Phase 3. | closed 2026-10-09 |
| TMP-05 | Unisastra | `release`, `ci`, and `validate:release-tag` scripts and `package.json` `obsidianMinAppVersion` remain until the Release PR workflow replaces them in Phase 6. | open |
| TMP-06 | Unimian | `verify:artifacts` does not yet check version consistency; `versions.json` still maps the deleted 1.0.3 release. Both are settled with the reset to 0.0.1. | open |
| TMP-03 | All | Branch protection requires the current CI job names; they change in Phase 6 and the protection must be updated with them. | open |
| TMP-04 | All | No tag ruleset yet; it is set together with release-please so the bot can still create tags. | open |
