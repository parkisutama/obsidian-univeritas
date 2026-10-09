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

## Working arrangement

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| WRK-01 | Unistoria | Another session was working in the Unistoria checkout (`feature/space-management`, uncommitted changes) during Phase 6. Automated changes now go through worktrees under `.worktrees/`, so plugin checkouts in use are left alone. That branch needs `main` merged in: `main` gained the workflows, hooks, and version 0.0.1. | open |
| WRK-02 | All | The plugin checkouts still sit on the commits they had before Phase 6; pull `main` when convenient. Run `pnpm install` afterwards so the Husky hooks are installed. | open |

## Errors and surprises met during the work

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| ERR-01 | Unisastra | The Markdown lint passed locally on Windows but failed in CI on three broken relative links. The local/CI difference is unexplained. | open |
| ERR-02 | Unisastra | pnpm 11 refused to reuse `node_modules` and asked to purge it. Gone after the move to pnpm 12; cause not investigated. | open |
| ERR-03 | All | pnpm adds a too-new package version to `minimumReleaseAgeExclude` without asking. Decide whether to set `minimumReleaseAgeStrict`. | open |
| ERR-06 | Unistoria | One test timed out at 5 s once during a coverage run and passed on two reruns; which test was not captured. | open |
| ERR-07 | All | release-please demoted and appended the placeholder heading of a non-empty `CHANGELOG.md`; fixed by starting the file empty. | closed 2026-10-09 |
| ERR-08 | All | release-please did not rebuild an open Release PR after the changelog seed was fixed; the stale one was closed and recreated. | closed 2026-10-09 |
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
| VER-07 | Unisastra | Source comments say no code was ported from two `deathau` repositories that declare no license; not compared against upstream. Typewriter Mode, which Unisastra derives from, says it began as a fork of one of them. | open |
| VER-08 | Unimian | The relationship to `mmattia09/obsidian-project-manager` and that project's license. Checked: MIT, adapted in two files, already listed in `THIRD_PARTY_NOTICES.md`. | closed 2026-10-09 |
| VER-09 | All | Git history was scanned for secrets by pattern only, not with a dedicated tool. | open |
| VER-11 | Unimian | The bundle target moved from es2018 to es2022; not loaded in Obsidian on desktop or mobile since. | open |
| VER-12 | All | `pnpm run deploy` and the `dev` vault copy were tested with temporary folders only, not against a real vault. | open |
| VER-13 | Unimian | The release workflow's zip step was rewritten for `dist/` and has not run. | open |
| VER-14 | Unimian | Biome applied safe fixes (import sorting, `import type`) across about 170 files; reviewed only through the automated gates. | open |
| VER-15 | Unimian | Notes created without a template now have frontmatter written by Obsidian's `stringifyYaml` (for example `start: 2026-01-01` instead of `start: "2026-01-01"`). Check that Bases views, the Properties panel, and the Gantt write-back read them the same way. | open |
| VER-16 | Unimian, Unistoria | The message shown to the user when a path with `..` is refused was not seen in Obsidian. | open |
| VER-17 | Unisastra | The legacy cursor migration was not run against a real pre-1.2.0 data folder. | open |
| VER-18 | All | `reuse lint` was not run; `REUSE.toml` and `LICENSES/` were written by hand. The REUSE tool is not part of the toolchain. | open |
| VER-19 | Unisastra | File provenance was decided by git history: a file that traces back to the first commit is treated as derived from Typewriter Mode. Not compared with the upstream repository file by file. | open |
| VER-20 | Unimian | Four stylesheets are attributed to Planner on the basis of shared section structure and class names, not a line comparison. | open |
| VER-21 | Unistoria | The native acceptance scripts under `scripts/native/` now start with two comment lines; not run since. | open |
| VER-22 | All | The release workflow's build, attestation, and upload jobs have not run; the 0.0.1 release is their first run. | open |
| VER-23 | All | That Obsidian lets a plugin version without its own `versions.json` entry inherit the nearest earlier entry. The release flow depends on it. | open |
| VER-24 | All | Dependabot with pnpm 12 and the grouped configuration: one pull request appeared in Unistoria; behaviour over time not observed. | open |
| VER-10 | All | Facts about Obsidian's rules (tag format, release assets, `fundingUrl`) are from memory and need checking against the current Obsidian documentation. | open |

## Decisions taken during the work, to confirm

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| DEC-01 | Unimian | New-note frontmatter uses `stringifyYaml` in a single write, not `processFrontMatter`. `processFrontMatter` needs the file to exist, so the note would be created empty and modified a moment later, which views see as two changes. `stringifyYaml` is the serializer `processFrontMatter` uses, and the one `NoteTemplateService` already used. | open |
| DEC-02 | Unimian, Unistoria | The path guard rejects only `..` segments. A leading slash is left to `normalizePath`, because users commonly type `/Folder` in settings. | open |
| DEC-07 | All | `versions.json` holds an entry only when `minAppVersion` changes, instead of one per release as first written in the standard. This removes a job that would have pushed to the Release PR. | open |
| DEC-08 | All | The GitHub release is published at once and its files follow about two minutes later, rather than a draft release published after upload. | open |
| DEC-09 | All | `RELEASE_TOKEN` is optional. Without it the maintainer closes and reopens the Release PR to start CI. Creating the token is a maintainer action. | open |
| DEC-10 | All | commitlint does not enforce subject case, so Dependabot's `Bump ...` titles pass. | open |
| DEC-03 | Unisastra | No path guard was added: the plugin creates no vault files or folders. | open |
| DEC-04 | Unisastra | Unisastra is a fork of Typewriter Mode (MIT, Davis Riedel), which was not part of the earlier licensing analysis. The move to GPL-3.0-only went ahead because MIT allows it; 132 files keep `GPL-3.0-only AND MIT` with the upstream copyright. | open |
| DEC-05 | Unisastra | Upstream notice files moved from `licenses/` to `third-party-notices/` so `LICENSES/` can hold SPDX texts; the two names collide on Windows. The shipped folder is still `licenses/`. | open |
| DEC-06 | Unimian, Unistoria | Root configuration files such as `esbuild.config.mjs` have no SPDX header; they are covered by `REUSE.toml`. Unimian's derives from Planner's. | open |

## Documentation findings

| ID | Plugin | Item | State |
| --- | --- | --- | --- |
| DOC-01 | Unimian | `docs/specs/gantt.md` line 123: table rows without a header row (MD075). | open |
| DOC-02 | Unimian | `docs/specs/periodic-notes.md`: decisions numbered 14, 15, 13 out of order; other text refers to them by number (MD029). | open |
| DOC-03 | Unimian | `docs/architecture/upstream-provenance.md` links to `../specs/code-quality-and-performance.md`, which does not exist (MD057). | open |
| DOC-04 | Unimian | `docs/plans/license-compliance.md` uses bold text as headings (MD036). | open |
| DOC-05 | Unisastra | Status logs, specs, ADRs, and archived documents still name `check:ci`; left as historical records. Decide whether to annotate them. | open |
| DOC-06 | Unimian | `AGENTS.md` is titled "Copilot Custom Instructions", links Planner to the wrong repository URL, and has no `CLAUDE.md` router. | closed 2026-10-09 |
| DOC-08 | Unisastra | Six developer guides and `DEVELOPMENT.md` still describe the old release steps; each carries a note pointing to `CONTRIBUTING.md`. Rewrite them. | open |
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
| TMP-05 | Unisastra | `release`, `ci`, and `validate:release-tag` scripts and `package.json` `obsidianMinAppVersion` remain until the Release PR workflow replaces them in Phase 6. | closed 2026-10-09 |
| TMP-06 | Unimian | `verify:artifacts` does not yet check version consistency; `versions.json` still maps the deleted 1.0.3 release. Both are settled with the reset to 0.0.1. | closed 2026-10-09 |
| TMP-07 | All | The Release PR `chore: release 0.0.1` is open and waits for the maintainer. CI has not run on it; close and reopen it, or set `RELEASE_TOKEN`. | open |
| TMP-08 | Unimian, Unisastra, Unistoria | Dependabot pull requests opened before the standardization are stale (some update packages that were removed). Close or let Dependabot rebase them. | open |
| TMP-03 | All | Branch protection requires the current CI job names; they change in Phase 6 and the protection must be updated with them. Now `Verify`, `Test (Windows)`, `Commit messages`. | closed 2026-10-09 |
| TMP-04 | All | No tag ruleset yet; it is set together with release-please so the bot can still create tags. | open |
