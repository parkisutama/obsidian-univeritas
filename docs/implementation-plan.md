---
title: "Standardization Implementation Plan"
created: "2026-10-09T00:00:00+07:00"
tags:
  - engineering
  - obsidian-plugin
  - plan
status: draft
authority: non-normative
owner: "Parkis Utama"
related:
  - "obsidian-plugin-engineering-standard.md"
  - "developer-experience-audit.md"
---

# Standardization Implementation Plan

This plan brings `obsidian-unimian`, `obsidian-unisastra`, and `obsidian-unistoria` into conformance with the [engineering standard](obsidian-plugin-engineering-standard.md).
Toolchain, dependencies, scripts, code findings, licensing, and CI/CD are sequenced as one piece of work so that no repository is touched twice for the same concern.

Nothing here is applied yet.

## Method

The standard is the specification, so the work is test-first.

1. **Red.** Add a conformance test to each repository. It encodes the standard and fails on today's state.
2. **Green.** Change the repository until the conformance test and `pnpm run verify` pass.
3. **Refactor.** Delete the scripts and configuration the standard no longer needs, with the tests still green.

Behavior that scripts implement (vault copy, version sync, artifact verification) gets unit tests before the script changes.
Code changes that affect what is written into a vault get a characterization test first, then a native check in a test vault.

Each phase is one pull request per repository, merged by squash with a Conventional Commit title.

## Target toolchain

Versions are the latest stable releases on 2026-10-09 that are mutually compatible.

| Tool | Target | Unimian now | Unisastra now | Unistoria now | Note |
| --- | --- | --- | --- | --- | --- |
| Node.js | 24 (LTS) | 24 | 24 | 24 | `engines.node` `>=24` everywhere. |
| pnpm | 12.10.1 | 12.4.2 | 11.21.0 | 12.8.1 | Unisastra crosses a major; review the lockfile diff. |
| TypeScript | 6.0.x | ^6.0.3 | ^5.9.3 | ^6.0.3 | **Not 7.0.2.** `typescript-eslint` 8.71.1 requires `typescript <6.1.0`. |
| `typescript-eslint`, `@typescript-eslint/parser` | 8.71.1 | ^8.70.0 | parser only | ^8.71.0 | The meta package is a peer of `eslint-plugin-obsidianmd`; it stays. |
| ESLint | 9.39.5 | ^10.11.0 | ^10.9.0 | ^9.39.5 | **Not 10.** `eslint-plugin-obsidianmd` depends on plugins whose `eslint` peer stops at 9; `pnpm peers check` is clean only on 9. |
| `eslint-plugin-obsidianmd` | 0.4.2 | ^0.4.2 | ^0.4.1 | ^0.4.2 | Latest. |
| `@eslint/json` | 0.14.0 | 2.1.0 | ^0.14.0 | 0.14.0 | **Not 2.1.1.** The Obsidian plugin pins this peer to exactly `0.14.0`. |
| Biome | 2.5.15 | 2.5.14 | 2.5.8 | 2.5.14 | `recommended` preset; `ultracite` removed. |
| esbuild | 0.28.2 | ^0.28.2 | ^0.25.12 | ^0.28.2 | |
| Vitest, `@vitest/coverage-v8` | 5.0.3 | ^5.0.1 | ^4.1.11 | ^5.0.3 | Unisastra crosses a major. |
| happy-dom | 20.14.6 | ^20.14.5 | none | ^20.14.5 | Only where tests need a DOM. |
| rumdl | 0.2.78 | none | ^0.1.96 | ^0.2.78 | |
| `@types/node` | ^24 | ^24 | ^25 | ^24 | Follows the runtime, not the newest types. |
| Husky | 9.1.7 | none | ^9.1.7 | none | |
| commitlint (`cli`, `config-conventional`) | 21.2.3 | none | ^21.2.2 | none | |
| `obsidian` | 1.14.4 | 1.14.4 | 1.14.4 | 1.14.4 | Done. |

Version ranges: tools that decide lint or format output (`@biomejs/biome`, `obsidian`, `@eslint/json`) are pinned exactly; the rest use a caret range and are held by the lockfile.

Unisastra-only tools: `sass` 1.105.1, `stylelint` 17.16.0, `stylelint-config-standard-scss` 17.0.0, `vitepress` 1.6.4.

### Dependencies to remove

| Plugin | Package | Why it can go | Verify by |
| --- | --- | --- | --- |
| Unimian | `ultracite` | Biome no longer extends it; removes one high advisory path. | `pnpm run lint` |
| Unimian | `jiti` | Only needed because the ESLint config is `.mts`; rename it to `.mjs`. | `pnpm run lint:obsidian` |
| Unimian | `vite` | Vitest brings its own. | `pnpm run test` |
| Unimian | `dotenv` | Replaced by `node:util` `parseEnv`, as in Unistoria. | `pnpm run dev` |
| Unisastra | `ultracite` | Same as Unimian; expect new Biome diagnostics to fix. | `pnpm run lint` |
| Unisastra | `electron` | Used for types and for regression probes; it downloads a binary at install and carries ten advisories. Keep the probes outside `verify`, or type them without the package. | probes still run |
| Unisastra | `@types/codemirror` | CodeMirror 5 typings; the plugin uses CodeMirror 6. | `pnpm run typecheck` |
| Unisastra | `builtin-modules` | `node:module` `builtinModules` does the same. | `pnpm run build` |
| Unisastra | `tsx` | Node 24 runs TypeScript files directly; otherwise convert scripts to `.mjs`. | every script runs |

### Problems that the alignment solves by itself

- Unimian's two high advisories: one disappears with `ultracite`; the other (`source-map-js`) needs a patched transitive release and is rechecked after the upgrade.
- Most of Unisastra's 26 advisories: `electron` accounts for ten. The `vitepress` and `stylelint` chains remain development-only and are tracked by Dependabot.
- Unisastra's five allowed install scripts drop to the set Unistoria uses once `electron` is removed and `@parcel/watcher` is rechecked.
- The `--config.confirmModulesPurge` problem in Unisastra goes away once all three share one pnpm version.

## Phases

### Phase 0 — Baseline

| Step | Detail |
| --- | --- |
| Push | Push the one local commit in each repository (minimum Obsidian 1.14.4). |
| Record | Run `pnpm run check:ci` in each repository and keep the output as the starting evidence. |
| Visibility | `obsidian-unistoria` is public as of 2026-10-09. |

### Phase 1 — Conformance test (red)

Add `conformance/standard.test.mjs` and a `conformance` script (`node --test`) to each repository. The same file is used in all three; the master copy lives in this repository under `templates/conformance/`. It uses the Node test runner so it does not depend on each repository's Vitest version.

Status: done on 2026-10-09. Failing checks at merge: Unimian 14 of 17, Unisastra 15 of 17, Unistoria 11 of 17.

It asserts:

- `package.json` has every script in the standard's script contract, and none of the retired names (`check:ci`, `lint:fix`, `version`, `ci`, `release`, `validate:release-tag`, `typecheck:fast`, `typecheck:ci`).
- `packageManager`, `engines.node`, and `.node-version` hold the standard values; `private` is `true`.
- `manifest.json` `minAppVersion` equals the pinned `obsidian` version; `versions.json` maps the current version to it.
- `build` output is `dist/`; no build artifact is tracked by git.
- Every workflow sets top-level `permissions: contents: read`, pins each action to a 40-character SHA, and contains no `${{ github.` inside a `run:` block.
- `ci.yml` runs `pnpm run verify`.
- `SECURITY.md`, `.github/dependabot.yml`, `.env.example`, `CHANGELOG.md`, `AGENTS.md`, and `CLAUDE.md` exist.
- Every source file under `src/`, `scripts/`, and `tests/` starts with an `SPDX-License-Identifier` line.

Exit: the test is committed and fails; the list of failures is the work list for the next phases.
The test is excluded from `verify` until Phase 6 turns it on, so `main` stays green.

### Phase 2 — Toolchain and dependencies

| Order | Repository | Work |
| --- | --- | --- |
| 1 | Unistoria | Bump to the target table. Smallest change; proves the versions work together. |
| 2 | Unimian | Bump, remove four packages, rename `eslint.config.mts` to `.mjs`, set `strict` and `target` ES2022 in `tsconfig.json`, drop the `LpcHost.ts` exclusion. |
| 3 | Unisastra | pnpm 11 to 12, TypeScript 5.9 to 6.0, Vitest 4 to 5, esbuild 0.25 to 0.28, Biome to `recommended`, remove five packages. Reformat to tabs if that decision is confirmed. |

Risks:

- `strict` in Unimian will surface type errors. They are fixed in this phase, not suppressed.
- Unisastra takes three major upgrades at once. Do them as separate commits inside the pull request so a failure is attributable.

Exit: `pnpm run check:ci` passes in each repository; `pnpm audit --prod` is clean; the development-only advisories that remain are listed in the pull request.

Status: done on 2026-10-09. `pnpm audit` reports nothing in Unimian and Unistoria, and two development-only high advisories in Unisastra (`braces` through Stylelint has no patched release; `@vue/server-renderer` through VitePress). Unisastra was reformatted to tabs in a separate pull request. Two items moved to Phase 3: removing `tsx` from Unisastra, and Unisastra's Vitest wrapper.

Findings worth keeping:

- Vitest 5 cannot load the types-only `obsidian` package even when a test mocks it; each repository aliases `obsidian` to a file under `tests/fixtures/`.
- Obsidian's `Plugin` class defines `settings` since 1.13, so a subclass declares it with `declare settings: T`.
- pnpm adds a too-new version to `minimumReleaseAgeExclude` by itself. Prefer the previous version over accepting that entry.

### Phase 3 — Scripts and build layout

Tests first, in each repository:

- vault copy: refuses a folder name that differs from the plugin ID, refuses a missing `plugins` parent, refuses missing artifacts, copies exactly three files;
- `version:sync`: writes three files, rejects a `v` prefix, never edits an existing `versions.json` entry;
- `verify:artifacts`: fails on a missing or empty artifact, a missing license banner, or a version mismatch.

Unistoria already has these tests; they are the reference.

| Repository | Work |
| --- | --- |
| Unistoria | `build` stops copying to the vault; add `deploy` (build, then copy); rename `check:ci` to `verify`. |
| Unimian | Build to `dist/`; untrack `styles.css`; add `scripts/vault-copy.mjs` and `deploy`; `lint` becomes `biome check`; `lint:fix` becomes `fix`; add `lint:md` and `.rumdl.toml`; replace `version-bump.mjs` with `scripts/sync-version.mjs`; rename `check:ci` to `verify`. |
| Unisastra | `deploy` builds first; `check` gains `test`; remove the two `typecheck` aliases; add `test:coverage` with a measured threshold; add `version:sync` and `.env.example`; rename `check:ci` to `verify`. `release`, `ci`, and `validate:release-tag` stay until Phase 6 replaces them. |

Vitest wrappers (`scripts/run-vitest.mjs`, `scripts/test.mjs`) are removed only if `vitest run` passes in the Windows CI job without them.

Exit: script-contract assertions in the conformance test pass; `pnpm run verify` passes; `pnpm run deploy` works against a test vault.

Status: done on 2026-10-09, except that `deploy` was exercised with temporary folders only. Unimian was first reformatted with Biome in its own pull request so that `lint` could become `biome check`. Unisastra runs its TypeScript scripts with Node directly; `tsx` is removed. Both Vitest wrappers are still in place. Items left open are in the [open items register](open-items.md).

### Phase 4 — Code findings

| Finding | Test first | Then |
| --- | --- | --- |
| Unimian writes frontmatter by string concatenation | Characterization test: record the exact file content produced today for strings, numbers, dates, lists, links, and keys with `:` or spaces. | Create the file with an empty body, then write properties through `processFrontMatter`. Compare the output to the recorded content. In a test vault, check that Bases views and the Properties panel read the new notes the same way, and that the template path (Templater, core Templates) still merges correctly. Differences in quoting or key order are accepted only if Obsidian reads them identically. |
| Vault paths accept `..` | In a test vault, call `vault.create` with a `..` path and record what Obsidian does. Unit tests for the helper: rejects `..`, empty segments, and absolute paths. | Add one path helper per plugin and route every path built from user data through it. If Obsidian already rejects the path, keep the helper for the clearer error. |
| Unisastra stores migrated cursor data unvalidated | Unit test: malformed JSON shapes are ignored. | Validate the shape before assigning. |
| Unimian loads remote cover images | none | State it in `README.md`. |

Exit: new tests pass; native check recorded in the pull request.

### Phase 5 — Licensing and SPDX

See [Licensing analysis](#licensing-analysis). Work per repository:

1. Add an `SPDX-License-Identifier` line and copyright lines to every source file.
2. Put each license text in `LICENSES/<SPDX-ID>.txt`; keep `LICENSE` at the root for GitHub and for the Obsidian lint rule.
3. Add `REUSE.toml` for files that cannot carry a header (JSON, lockfile, images).
4. Complete `THIRD_PARTY_NOTICES.md` and the bundled license banner.

Exit: the SPDX assertion in the conformance test passes.

### Phase 6 — CI/CD

| Item | Work |
| --- | --- |
| `ci.yml` | One file, identical in the three repositories apart from repository-specific steps. Jobs `verify` (Ubuntu), `test-windows`, `commitlint`. SHA-pinned actions, top-level `contents: read`, `concurrency`, `pnpm audit --prod`. |
| `release.yml` | release-please with `include-v-in-tag: false`. Job 1 maintains the Release PR and runs `version:sync` so `manifest.json` and `versions.json` follow. Job 2 runs only when a release is created: `pnpm run verify`, attest provenance, upload `main.js`, `manifest.json`, `styles.css`, then publish the release. Job 1 has `contents: write` and `pull-requests: write`; the build steps of job 2 run before any write step. |
| Draft-then-publish | The release is created as a draft and published after the assets are uploaded, so Obsidian never sees a release without assets. Confirmed on the first `0.0.1` release. |
| Changelog sections | release-please sections mapped to Keep a Changelog: `feat` to Added, `fix` to Fixed, `perf` and `refactor` to Changed, `revert` to Removed, security fixes to Security. |
| Hooks | Husky `pre-commit` runs `pnpm run check`; `commit-msg` runs commitlint. Added to Unimian and Unistoria. |
| Repository files | `SECURITY.md`, `.github/dependabot.yml` (npm and GitHub Actions, weekly, grouped), pull request template. |
| Release record | `docs/releases/TEMPLATE.md` from the Playbook template. Required for minor and major releases. |
| Agent instruction | A "Release" section in `AGENTS.md`: when a Release PR for a minor or major version is open, draft `docs/releases/X.Y.Z.md` from the template, fill the evidence summary from the CI run and the changelog, list what was not natively tested, leave `Decision: pending`, and never set it to `approved`. |
| Retire | Unisastra's `release`, `ci`, `validate:release-tag` scripts and their `scripts/lib` files; Unimian's tag-check step; `commitlint.yml` merged into `ci.yml`. |
| Conformance | The conformance test joins `verify`. |

Exit: conformance test fully green in all three; a pull request shows all jobs passing.

### Phase 7 — Reset to 0.0.1 and GitHub settings

This phase deletes public tags and releases and cannot be undone.

1. Delete the GitHub releases and tags of Unimian (`v1.0.1`, `1.0.2`, `1.0.3`) and Unisastra (`1.0.0`, `1.0.1`, `1.1.0`), on the remote and locally.
2. Set the version to `0.0.1` with `version:sync`; reset `versions.json` to one entry; start `CHANGELOG.md` empty.
3. Add a "Version reset" note to each affected `README.md`: earlier versions were learning releases, they are withdrawn, and an existing installation must be reinstalled because `0.0.1` is lower than the installed version.
4. Seed release-please at `0.0.1` and merge the first Release PR.
5. GitHub settings on all three: squash merge only, delete branch on merge, `main` protected with required checks `verify`, `test-windows`, and `commitlint`, a tag ruleset limiting release tags, private vulnerability reporting, secret scanning, and push protection.

Exit: each repository has exactly one release, `0.0.1`, with three assets and a provenance attestation, installable in a test vault.

## Licensing analysis

Sources: SPDX headers and attribution comments in each repository, and the license each upstream repository declares on GitHub.
This is an engineering inventory, not legal advice.

### Upstream code

| Plugin | Upstream | Upstream license | Relationship stated in source |
| --- | --- | --- | --- |
| Unimian | SawyerRensel/Planner | GPL-3.0 | Derived from; 20 files |
| Unimian | lhassa8/obsidian-bases-gantt | MIT | Portions adapted |
| Unimian | mmattia09/obsidian-project-manager | not checked | Referenced once; relationship to confirm |
| Unimian | fullcalendar, @jaeungkim/gantt-chart, preact, temporal-polyfill | MIT (as noticed) | Bundled |
| Unisastra | 0png/Floaty-Toolbar | MIT | Adapted |
| Unisastra | czottmann/obsidian-mononote | MIT | Adapted |
| Unisastra | dy-sh/obsidian-remember-cursor-position | MIT | Adapted |
| Unisastra | artisticat1/focus-active-sentence | MIT | Adapted |
| Unisastra | ryanpcmcquen/obsidian-focus-mode | MPL-2.0 | Adapted; TypeScript and SCSS |
| Unisastra | vslinko/obsidian-zoom, jobedom/obsidian-hemingway-mode | MIT | Inspired by; no code ported |
| Unisastra | deathau/cm-typewriter-scroll-obsidian, deathau/cm-show-whitespace-obsidian | **no license declared** | Inspired by; no code ported |
| Unistoria | parkisutama/obsidian-unimian | GPL-3.0-only | One file adapted |

### Conclusions

- **Unimian must stay GPL-3.0.** It is a derivative of a GPL-3.0 work. Check whether Planner says "only" or "or later" and mirror it for the derived files.
- **Unistoria stays GPL-3.0-only** while it contains the file adapted from Unimian. It could only be relicensed if that file is replaced or shown to be entirely your own code.
- **Unisastra can stay MIT.** MIT code may be reused under MIT. The MPL-2.0 files stay under MPL-2.0 at file level, which MPL allows inside a larger MIT work. Moving Unisastra to GPL-3.0-only is also permitted, but nothing requires it.

### Gaps to close in Phase 5

| Plugin | Gap |
| --- | --- |
| Unimian | 69 of 173 source files have no SPDX header. Two headers have trailing whitespace. Confirm the `obsidian-project-manager` relationship and license. |
| Unisastra | No SPDX header in any of 291 files. The files adapted from `obsidian-focus-mode` need `MPL-2.0`. License notices for `obsidian-remember-cursor-position` and `focus-active-sentence` are missing from `licenses/` and from the bundle banner. Both `LICENSES/` and `licenses/` exist; keep one. |
| Unisastra | The two `deathau` repositories declare no license, so no code from them may be present. Review the two "no code ported" files against upstream once and record the result. |
| Unistoria | 37 of 73 source files have no SPDX header. |

## Decisions still open

| Decision | Options | Blocks |
| --- | --- | --- |
| none | | |

Decided on 2026-10-09:

- **Indentation:** tabs in all three repositories. Unisastra is reformatted in Phase 2 as its own commit.
- **License:** all three plugins use `GPL-3.0-only`. Unisastra moves from MIT; its MPL-2.0 files keep MPL-2.0.
- **Pull requests:** the agent merges by squash once CI is green. `main` is protected in all three repositories, including for administrators.
- **Tags and releases:** deleted in Unimian and Unisastra on 2026-10-09, ahead of the rest of Phase 7.
- **Workspace repository:** stays local for now; plugin folders are ignored, not submodules. `README.md`, `CHANGELOG.md`, `SECURITY.md`, `LICENSE`, and release records stay in each plugin repository.
- **`electron` in Unisastra:** removed from `devDependencies`. Five manual regression scripts under `scripts/` run inside Electron and are not wired to any `package.json` script or workflow; they are run on demand with `pnpm dlx electron@<version>`, documented in `CONTRIBUTING.md`. `src/electron-remote.d.ts` imports one type from `electron` and is rewritten as a local interface.
- **`@eslint/json`:** `0.14.0`. ESLint itself is `9.39.5`.
