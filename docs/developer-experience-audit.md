---
title: Cross-repository Developer Experience Audit
created: 2026-09-29T00:00:00+07:00
modified: 2026-09-29T00:00:00+07:00
tags:
  - engineering
  - developer-experience
---

# Cross-repository Developer Experience Audit

This is the canonical comparison and decision register for `obsidian-unimian`
and `obsidian-unisastra`. Keep cross-repository DX decisions and follow-ups here;
do not copy this register into either plugin repository. Aim for consistent
developer outcomes where that helps, while keeping product-specific tooling where
the evidence supports it. Identical dependencies are not an objective by
themselves.

## Scope and audit method

This pass inspected the current checkouts on 2026-09-29. It read both repository
`AGENTS.md` files, manifests, lock/config files, contributor and developer docs,
scripts, source import references, and GitHub workflows. The audit document was
created under `obsidian-unimian/docs/` and moved to this repository as
`docs/developer-experience-audit.md`. It is absent from the Unimian checkout;
Git currently reports this repository's `docs/` directory as untracked. The
Unimian working-tree change in `src/views/timeline/index.ts` is pre-existing and
out of scope.

For every area, record:

1. Repository-relative evidence for both repositories, including the behavior
   behind commands and workflow steps where applicable.
2. A separate repository state: `Present`, `Partial`, `Absent`, or `Unverified`.
3. One comparison decision: `Standardize`, `Keep separate`, `Replace`, or
   `Defer`, with rationale. A decision records an audit recommendation; it does
   not authorize implementation.
4. A linked, bounded follow-up with dependencies, owner, status, and verifiable
   completion criteria.

`Present` means the mechanism exists; it does not mean it was run successfully.
Use `Unverified` for claims requiring a command run, remote GitHub setting,
actual Obsidian host, or maintainer input. Cite repo-relative paths and relevant
script/workflow sections. Never record secret values. Keep native Obsidian
acceptance separate from build/test results. Do not stage or commit this audit.

## Decision vocabulary

- `Standardize`: adopt a shared outcome or contract, while allowing different
  implementations when needed.
- `Keep separate`: retain a documented product-specific behavior.
- `Replace`: identify a concrete existing mechanism that should be replaced;
  no replacement is authorized by this audit alone.
- `Defer`: evidence or a maintainer decision is still needed. Name it in the
  linked follow-up.

## Comparison register

| ID | Area | Unimian: status and evidence | Unisastra: status and evidence | Decision and reason | Follow-up |
| --- | --- | --- | --- | --- | --- |
| DX-01 | Runtime and package-manager toolchain | **Present.** `.node-version` is `24`; current manifest declares `node >=24`, `pnpm@12.4.2`; `pnpm-lock.yaml`, `pnpm-workspace.yaml`; `.npmrc` absent. `CONTRIBUTING.md` recommends Node 24/fnm and pnpm 12. CI reads the version file and uses frozen install. | **Present.** `.node-version` is `24`; current manifest declares `node >=24 <25`, `pnpm@11.21.0`; `pnpm-lock.yaml`, `.npmrc` sets `tag-version-prefix = ""`; setup guide recommends Corepack. CI hardcodes Node 24 and uses frozen install. | **Standardize (maintainer decision, 2026-09-29).** Set common Node floor to `>=24` with no upper bound; keep `.node-version` at `24` for the current latest LTS line and use fnm locally. Configure both CI workflows to read `.node-version`. Set both `packageManager` pins to pnpm `12.7.0`, the latest stable pnpm release verified on this date. Preserve Unisastra's no-`v` release-tag behavior; verify whether `.npmrc`'s `tag-version-prefix` has any effect under pnpm 12. The current `pnpm run release` script creates the tag with `git tag` directly, so it already omits the prefix. “Stable” here means the latest LTS Node line: official releases list Node 24 as LTS and Node 26 as Current on this date. The open Node range permits later majors, but CI at 24 alone does not prove compatibility on them; `>=24` also does not encode LTS-only support. Corepack is not bundled starting with Node 25, so fnm selects Node while local setup must separately bootstrap the pinned pnpm. pnpm 11-to-12 lockfile effects must be reviewed when implementation is authorized. Sources: [Node releases](https://nodejs.org/en/about/previous-releases), [Node 25 Corepack removal](https://nodejs.org/en/blog/release/v25.0.0), [pnpm configuration](https://pnpm.io/11.x/configuring), [pnpm installation and compatibility](https://pnpm.io/installation), [pnpm 12.7 release](https://github.com/pnpm/pnpm/releases/tag/v12.7.0), [pnpm GitHub Action pin discovery](https://github.com/pnpm/action-setup). | DX-FU-01, DX-FU-07 |
| DX-02 | Dependencies and libraries | **Present.** Direct dependency inventory and source references recorded below. Runtime view libraries are bundled by `esbuild.config.mjs`; `scripts/license-banner.mjs` checks bundled package notices. | **Present.** Direct dependency inventory and source references recorded below. Build tooling bundles via `scripts/lib/build.ts`; `scripts/lib/artifact-verification.ts` checks shipped notices. Obsidian and CodeMirror are external host APIs in build config. | **Keep separate** for product/runtime libraries; **Defer** shared tool-version alignment. Calendar/Gantt visualization needs differ from editor/CodeMirror integration. Review direct/peer/transitive relationships, shipped bundle impact, licenses, security/update policy and supported APIs before any package change. | DX-FU-02 |
| DX-03 | Script and command interface | **Present.** `package.json`: `dev`, `build`, `lint`, `lint:fix`, `lint:obsidian`, `typecheck`, `test`, `test:coverage`, `verify:artifacts`, `check`, `check:ci`, `version`. `scripts/run-vitest.mjs` launches Vitest with the active Node executable for Windows `.cmd` compatibility. | **Present.** `package.json`: `dev`, `debug`, `build`, `deploy`, `release`, `ci`, `check`, `check:ci`, lint/fix and docs commands. Implementations route through `scripts/run-tsx.mjs`; `scripts/dev.ts` builds, prepares test-vault and optionally deploys. | **Standardize** a small documented command contract (`check`, `check:ci`, `test`, `build`, `verify:artifacts`) and explicit side-effect descriptions. Preserve useful repo-specific commands. Same names currently run different gate sets. | DX-FU-03 |
| DX-04 | Local development and vault deploy | **Present.** `esbuild.config.mjs` loads `.env` in watch mode and copies root `main.js`, `manifest.json`, `styles.css` to `OBSIDIAN_VAULT_PLUGIN_PATH` after successful builds; no test-vault setup. `.env.example` and `CONTRIBUTING.md` describe the path. | **Present.** `scripts/dev.ts` watches `src/` and `manifest.json`, builds to `dist/`, prepares ignored `test-vault/`, then calls `deployPlugin()`. `scripts/lib/deploy-plugin.ts` reads only the configured path from `.env`, skips if optional path missing, and checks destination folder basename against built manifest ID before copying. | **Keep separate.** Deployment/test-vault workflows have different safeguards and side effects. Align documentation around setup, watch behavior, paths, and exactly what each command writes; do not point either workflow at an operational vault by default. | DX-FU-03 |
| DX-05 | Tests and quality gates | **Present.** `package.json` `check` runs Biome lint, Obsidian ESLint, typecheck and tests. `check:ci` adds coverage tests, production build and artifact verification. `vitest.config.mts` defines coverage thresholds. `CONTRIBUTING.md` describes native QA. | **Present.** `check` runs fast typecheck plus Biome, Obsidian ESLint, Stylelint and rumdl; `check:ci` adds tests, build, artifact and VitePress docs build. `scripts/test.mjs` wraps Vitest. `AGENTS.md` and developer QA docs distinguish automated from native acceptance. | **Standardize** the gate layers and report names; **Keep separate** repo-specific linters, coverage thresholds, docs build, and native acceptance. The configured gates were inspected but not executed here. | DX-FU-03, DX-FU-06 |
| DX-06 | Git, branches, hooks and commit policy | **Partial.** `CONTRIBUTING.md` recommends branch prefixes. No tracked Husky/commitlint configuration or workflow commit-message check found. Remote branch-protection settings cannot be inferred from checkout. | **Present.** `.husky/pre-commit` runs read-only `pnpm run check`; `.husky/commit-msg` runs commitlint using `@commitlint/config-conventional`; `.github/workflows/commitlint.yml` checks all PR commits. `docs/en/reference/branching-conventions.md`, `commit-push-and-release.md`, and `ADR-001-ai-development-context-and-gates.md` document rationale and workflow. Branch protection settings remain unverified. | **Defer.** Decide whether both repos need a common commit format and which checks are required. Hook and CI enforcement have maintenance and contributor costs; actual branch protection is external evidence. | DX-FU-04 |
| DX-07 | Documentation platform, language and content quality | **Partial.** `README.md`, `CONTRIBUTING.md`, `docs/`, specs and architecture docs exist. No docs-specific build, publish workflow, Markdown lint, spelling or grammar gate found in package/workflow/config inventory. `.editorconfig` sets UTF-8/LF and tabs. | **Present.** `docs/` has VitePress ID/English locales and sidebar; `scripts/lint-md.mjs` invokes rumdl; `.rumdl.toml` configures Markdown rules. `docs/.vitepress/config.ts` sets `ignoreDeadLinks: true`. `.editorconfig` sets Markdown width. No dedicated spelling/grammar checker found. Pages workflow builds and publishes on main. | **Defer** platform parity and writing rules. Compare audience, localization and maintenance cost first. A lint/build is not proof of grammar or spelling; ignored dead links mean link completeness is not established. | DX-FU-05 |
| DX-08 | CI workflow | **Present.** `.github/workflows/ci.yml`: push to all branches, PR to main, manual dispatch; frozen install; Linux quality/coverage/build/artifacts and separate Windows tests. `CONTRIBUTING.md` records the Windows pnpm shim failure motivating that job. | **Present.** `.github/workflows/check.yml`: push, PR and reusable workflow; frozen install and `check:ci` on Ubuntu. `commitlint.yml` and `docs.yml` run separate checks. No Windows test job found in these workflows; `ADR-001-ai-development-context-and-gates.md` documents a prior cross-platform runner rationale in its project history. | **Standardize** reproducible install and named gate outcomes. **Keep separate** OS matrix based on product-specific evidence; each platform job should have a documented failure mode or support need. Workflow success/branch protection not verified in this audit. | DX-FU-06 |
| DX-09 | Versioning and release | **Present.** `version-bump.mjs` is the `version` lifecycle: syncs `manifest.json`/`versions.json` and stages them. `.github/workflows/release.yml` requires tag equal manifest version, runs `check:ci`, zips `main.js`, `manifest.json`, `styles.css`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, and creates a GitHub Release with those assets. | **Present.** `.npmrc` contains `tag-version-prefix = ""`; separately, `scripts/lib/release-plugin.ts` syncs metadata, requires changelog entry, validates, runs `check:ci`, commits release metadata, then creates the local annotated tag with `git tag -a "${targetVersion}"` (no `v`). `scripts/validate-release-tag.mjs` checks tag/package/manifest/versions metadata. `.github/workflows/release.yml` runs checks, builds zip/assets, creates release notes and attests provenance. | **Standardize** version/tag consistency and a minimum artifact-verification contract; **Keep separate** release authoring and provenance steps pending common maintainer policy. Unisastra's no-`v` tag contract is enforced by its release script and validation; `.npmrc`'s contribution is unverified and should not be assumed. Unimian's workflow and Unisastra's local release script have different side effects. | DX-FU-07 |
| DX-10 | Build artifacts and repository hygiene | **Present.** `esbuild.config.mjs` creates root artifacts; `.gitignore` excludes `main.js`, maps, coverage, `.env`; `scripts/verify-build-artifacts.mjs` requires nonempty artifacts and license banners. Production build rejects unlisted bundled package notices. | **Present.** `scripts/lib/build.ts` writes `dist/` and license files; `.gitignore` excludes `dist/`, test vault, docs cache/output, `.env`; artifact verifier checks identity/version and notice banners/copies. Release zip includes `dist/` recursively. | **Standardize** artifact inventory, ignored generated files, and verification evidence format. **Keep separate** notice files and archive contents where dependency/license needs differ. Compare actual release archives only when release artifacts are available; no builds were run here. | DX-FU-07 |

## Direct dependency inventory

Versions below are the declared ranges/pins in the current `package.json`, not a
claim that packages resolve or install successfully. Usage notes come from
manifest roles and source/script imports. Lockfiles were present; no install or
dependency audit command was run. Packages should only be aligned after checking
usage, host API compatibility, license, bundle output, and maintenance impact.

### Unimian

| Package | Declared version | Class and observed role |
| --- | --- | --- |
| `@jaeungkim/gantt-chart` | `1.5.1` | Runtime; Gantt view and tests. |
| `fullcalendar` | `^7.1.0` | Runtime; Calendar view plugins and CSS. |
| `preact` | `^10.29.8` | Runtime; Gantt compatibility/runtime alias and tests. |
| `temporal-polyfill` | `^1.0.5` | Runtime; package declared; direct source usage not established by this import scan. |
| `@biomejs/biome` | `2.5.14` | Dev; lint/format. |
| `@eslint/json` | `2.1.0` | Dev; ESLint JSON config support. |
| `@types/node` | `^24.13.6` | Dev; Node types. |
| `@typescript-eslint/parser` | `^8.70.0` | Dev; ESLint TypeScript parser. |
| `@vitest/coverage-v8` | `^5.0.1` | Dev; coverage provider. |
| `dotenv` | `^18.0.2` | Dev; `.env` load for local watch/deploy config. |
| `esbuild` | `^0.28.2` | Dev; plugin build/bundling. |
| `eslint` | `^10.11.0` | Dev; Obsidian-specific lint. |
| `eslint-plugin-obsidianmd` | `^0.4.2` | Dev; Obsidian rules. |
| `happy-dom` | `^20.14.5` | Dev; DOM test environment. |
| `jiti` | `^2.6.1` | Dev; declared; purpose not established by source scan. |
| `obsidian` | `1.13.1` | Dev; host API types. |
| `typescript` | `^6.0.3` | Dev; typecheck/compiler. |
| `typescript-eslint` | `^8.70.0` | Dev; declared ESLint integration package; use not established in this scan. |
| `ultracite` | `7.12.0` | Dev; declared lint preset/tool; exact invocation not established in this scan. |
| `vite` | `^8.3.0` | Dev; declared; direct script/source usage not established in this scan. |
| `vitest` | `^5.0.1` | Dev; tests and coverage. |

### Unisastra

All listed packages are under `devDependencies`; no direct `dependencies`
section is declared. CodeMirror/Obsidian imports are externalized to the host in
`scripts/lib/build.ts`, so package classification as dev dependency does not
mean the API is unused by the plugin.

| Package | Declared version | Class and observed role |
| --- | --- | --- |
| `@biomejs/biome` | `2.5.8` | Dev; lint/format. |
| `@codemirror/commands` | `^6.8.1` | Dev; host CodeMirror commands API and tests. |
| `@codemirror/language` | `^6.12.4` | Dev; host CodeMirror language API and tests. |
| `@codemirror/state` | `6.5.0` | Dev; host CodeMirror state API and tests. |
| `@codemirror/view` | `6.38.6` | Dev; host CodeMirror view API and tests. |
| `@commitlint/cli` | `^21.2.2` | Dev; local/CI commit message validation. |
| `@commitlint/config-conventional` | `^21.2.2` | Dev; Conventional Commits rules. |
| `@eslint/json` | `^0.14.0` | Dev; ESLint JSON config support. |
| `@types/codemirror` | `^5.60.18` | Dev; declared legacy CodeMirror typings; usage/necessity requires review. |
| `@types/node` | `^25.9.5` | Dev; Node types; version major is 25 while runtime is Node 24, compatibility to assess. |
| `@typescript-eslint/parser` | `^8.67.0` | Dev; ESLint TypeScript parser. |
| `builtin-modules` | `^5.3.0` | Dev; build external list. |
| `electron` | `^41.10.7` | Dev; host type references/native probe context. |
| `esbuild` | `^0.25.12` | Dev; plugin build/bundling. |
| `eslint` | `^10.9.0` | Dev; Obsidian-specific lint. |
| `eslint-plugin-obsidianmd` | `^0.4.1` | Dev; Obsidian rules. |
| `husky` | `^9.1.7` | Dev; Git hooks. |
| `obsidian` | `^1.13.1` | Dev; host API types. |
| `rumdl` | `^0.1.96` | Dev; Markdown lint. |
| `sass` | `^1.103.1` | Dev; SCSS build. |
| `stylelint` | `^17.14.1` | Dev; SCSS lint. |
| `stylelint-config-standard-scss` | `^17.0.0` | Dev; Stylelint rules. |
| `tsx` | `^4.23.12` | Dev; TypeScript script runner via `scripts/run-tsx.mjs`. |
| `typescript` | `^5.9.3` | Dev; typecheck/compiler. |
| `ultracite` | `7.2.3` | Dev; Biome preset/config dependency. |
| `vitepress` | `^1.6.4` | Dev; documentation site build/preview. |
| `vitest` | `^4.1.11` | Dev; tests. |

### Package comparison notes

- Shared declared tooling includes Biome, ESLint, Obsidian ESLint rules,
  TypeScript, Vitest, Node types, and `obsidian`; declared versions differ.
- Unimian's runtime bundle includes Calendar/Gantt libraries and `temporal-polyfill`.
  Unisastra's direct package dependencies are all development dependencies;
  its runtime imports rely on Obsidian/CodeMirror APIs and those are external in
  its build configuration.
- Unisastra additionally declares CodeMirror, commitlint/Husky, Sass/Stylelint,
  rumdl, VitePress, Electron types/runtime package, and `tsx` for its wider
  editor/docs/release workflow. Whether every declared package is necessary is
  an inventory question, not a removal recommendation.
- Version alignment is not yet a decision. Check Node/pnpm support, Obsidian's
  bundled API versions, package lock resolution, licenses, built artifact
  contents, and CI compatibility before proposing upgrades or moves between
  dependency sections.

## Follow-up register

Each follow-up is bounded. `Verified` means its audit evidence/decision record is
complete, not that an implementation or runtime gate passed. Implementation
remains behind maintainer decisions.

| ID | Related area | Follow-up and acceptance criteria | Depends on | Owner | Status | Evidence / notes |
| --- | --- | --- | --- | --- | --- | --- |
| DX-FU-01 | DX-01 | Apply the recorded policy to both manifests, local setup guides, and CI: `engines.node >=24`, `.node-version` stays at `24` until the latest LTS baseline changes, fnm is the documented Node manager, CI reads `.node-version`, and both repos pin pnpm `12.7.0`. Document a local pnpm bootstrap that works when Node is newer than 24, since Corepack is no longer bundled from Node 25; `pnpm/action-setup` may read the exact `packageManager` pin in CI. Review lockfile changes from pnpm 11→12 and preserve the no-`v` tag behavior; Unisastra's release script already writes the tag directly, so verify whether `.npmrc`'s `tag-version-prefix` should remain. Before claiming support beyond Node 24, add or record evidence on the later Node line. Complete when config/docs agree, lockfile diffs are understood, and install/gate verification is recorded for each repo. | DX-FU-02; remaining maintainer decisions before the harmonization phase | Unassigned | Not started | Maintainer decision recorded 2026-09-29. Node 24 is latest LTS while Node 26 is Current per the official release schedule; pnpm 12 is the current stable line and v12.7.0 is the latest release found on 2026-09-29. `pnpm/action-setup` reads an exact `packageManager` pin; local Node selection uses fnm, with pnpm bootstrap still to be documented. No configuration, install, or gate was changed/run. |
| DX-FU-02 | DX-02 | Record direct package inventory, roles, source/script use, runtime/build/test/lint/docs classification, shipped/bundled impact, and outstanding purpose/license/update questions. Complete when each declared package is accounted for or explicitly marked for follow-up; this is not package removal approval. | None | Unassigned | In progress | Direct manifests and source references are captured above. Resolve packages whose purpose/use is not established; inspect lockfile resolution, licenses, and bundle composition when deciding changes. |
| DX-FU-03 | DX-03, DX-04, DX-05 | Map every public package command to implementation, writes/side effects, expected output, and local vs CI contract. Complete when both developer guides describe matching shared command names accurately and keep product-specific commands clear. | DX-FU-01 | Unassigned | In progress | Core `check`/`check:ci` overlap but differ; dev/deploy behavior has been read from implementation. Commands were not executed. |
| DX-FU-04 | DX-06 | Decide common branch/commit message minimum, local hook policy, CI enforcement, bypass expectations, and branch-protection evidence. Complete when policy has maintainer rationale and remote settings are either verified or explicitly left unknown. | None | Unassigned | Needs decision | Unimian has branch naming guidance only; Unisastra has local hooks and PR commitlint. Remote branch protection is not available from checkout evidence. |
| DX-FU-05 | DX-07 | Decide docs platform parity and shared content-quality rules for Indonesian/English: Markdown/style, spelling/grammar review, link checking, examples, preview and publishing. Complete when platform choice and automated vs human checks are documented with concrete commands/workflows. | DX-FU-02, DX-FU-03 | Unassigned | Needs decision | Unisastra uses VitePress/rumdl and ignores dead links; Unimian has no docs gate found. Neither repo showed a dedicated spelling/grammar gate. |
| DX-FU-06 | DX-05, DX-08 | Map local gates to CI jobs, OS coverage, artifact retention and required-check policy. Complete when each check has an owner, trigger, platform, output and known external branch-protection setting. | DX-FU-03, DX-FU-04, DX-FU-05 | Unassigned | In progress | Workflow definitions inspected. No CI run or remote repository protection query performed. |
| DX-FU-07 | DX-01, DX-09, DX-10 | Compare version source, `.npmrc` tag-prefix effect, actual tag generation/validation, release side effects, notes, archive contents, provenance and recovery; propose shared release contract. Complete when common required metadata/artifacts and deliberate implementation differences are recorded, and the no-`v` contract is tied to the mechanism that actually enforces it. | DX-FU-01, DX-FU-02, DX-FU-06 | Unassigned | In progress | Release and artifact implementations inspected. Unisastra release script directly creates an unprefixed tag; `.npmrc` setting behavior under pnpm 12 remains unverified. No archive was built and no release action run. |
| DX-FU-08 | All | After the maintainer records decisions for DX-FU-01 through DX-FU-07, implement approved bounded slices in both repos, review diffs, and record command/runtime evidence. Complete only when each approved slice is verified and remaining exceptions are documented. | DX-FU-01 through DX-FU-07 and maintainer decisions | Unassigned | Not started | This audit does not authorize config/dependency harmonization. Preserve the pre-existing Unimian `src/views/timeline/index.ts` change. |

Allowed follow-up statuses: `Not started`, `In progress`, `Needs decision`,
`Blocked`, and `Verified`. Mark an item `Blocked` only with the exact missing
input or external condition. Never mark a follow-up `Verified` without concrete
evidence in its final column.

## Change log

| Date | Change | Evidence or decision |
| --- | --- | --- |
| 2026-09-29 | Created and refined the canonical cross-repository audit register in `obsidian-univeritas`. | Checkout status confirms `docs/` is currently untracked here; the audit path is absent in Unimian. Its existing `src/views/timeline/index.ts` change remains untouched. |
| 2026-09-29 | Rechecked both repo instructions and expanded evidence to dependency inventory, command implementations, local deploy, quality/docs gates, Git policy, CI, release and artifact behavior. | Read current manifests, relevant source/scripts/docs/config and `.github/workflows/`; no test, check, build, install, deploy, stage or commit command was run. Maintainer decisions and native acceptance remain open. |
| 2026-09-29 | Recorded the maintainer's DX-01 toolchain decision. | Node `>=24`, `.node-version` `24` for the current LTS baseline, fnm locally, CI version-file selection, and shared pnpm `12.7.0`. Verified release-channel facts against the official Node.js and pnpm pages linked in DX-01. Implementation remains pending the wider audit and explicit harmonization phase. |
