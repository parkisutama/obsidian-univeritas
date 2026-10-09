---
title: "Obsidian Plugin Engineering Standard"
created: "2026-10-09T00:00:00+07:00"
tags:
  - engineering
  - obsidian-plugin
  - profile
status: draft
authority: normative
owner: "Parkis Utama"
related:
  - "implementation-plan.md"
  - "developer-experience-audit.md"
---

# Obsidian Plugin Engineering Standard

This is the single engineering standard for every Obsidian plugin in this workspace:
`obsidian-unimian`, `obsidian-unisastra`, `obsidian-unistoria`, and any new plugin.
It binds the universal rules of the Development Playbook (`D:\repos\development-playbook`) to the Obsidian plugin stack.
In Playbook terms it is a combined application profile (Obsidian community plugin) and toolchain profile (TypeScript, pnpm, esbuild).

Status is `draft`: the maintainer approved the script contract, the vault deploy rule, the minimum Obsidian version, and the Release PR direction on 2026-10-09.
Nothing in [Migration backlog](#migration-backlog) is applied yet; the [implementation plan](implementation-plan.md) sequences that work, and [Open decisions](#open-decisions) lists what still needs a decision.

Precedence: a rule set by Obsidian (release tag format, release assets, manifest files, plugin guidelines) always wins. Where Obsidian is silent, release-please and the Playbook decide.

## How this relates to the Playbook

The Playbook states outcomes; this standard states the commands and files that deliver them.
Where the two conflict, the Playbook wins unless an adaptation is listed here.

| Playbook rule | Source | Binding in this standard |
| --- | --- | --- |
| Capability contract with an aggregate `verify` entry point | TASK-015, option I-A | [Script contract](#script-contract) |
| CI runs the same aggregate entry point as local development | TASK-015, option CI-A | [Continuous integration](#continuous-integration) |
| Conventional Commits with local types, atomic commits | `change-management.md` | [Change management](#change-management) |
| Conventional Comments for review | `change-management.md` | [Change management](#change-management) |
| Trunk-based, short-lived branches | `development-workflow.md` | [Change management](#change-management) |
| Keep a Changelog, Semantic Versioning, Release Gate G3 | `release-management.md` | [Versioning and release](#versioning-and-release) |
| Evidence ladder; CI green is not native acceptance | `testing.md` | [Verification evidence](#verification-evidence) |
| Secrets never committed; configuration separate from code | `runtime.md` | [Security baseline](#security-baseline) |
| Canonical documents in English, frontmatter metadata | `documentation.md` | [Repository layout](#repository-layout) |

### Adaptations

These differ from the Playbook on purpose.
Each one is an explicit exception, as the Playbook's profile rules require.

| Playbook default | Adaptation | Reason |
| --- | --- | --- |
| Tag and release record named `vX.Y.Z` | Tag and record named `X.Y.Z`, no `v` | Obsidian matches the GitHub release tag against `manifest.json` `version` exactly. |
| `CHANGELOG.md` keeps an `Unreleased` section edited by hand | The open Release PR is the unreleased view; the changelog is generated from commits and edited by a human in that PR | Automates the changelog while keeping a human gate. |
| Release owner determines the version | The Release PR proposes the version from commits; the owner accepts it or overrides it before merging | Same authority, less manual work. |
| A release record for every release candidate | A release record for minor and major releases; a patch release uses the Release PR description | Native acceptance evidence matters most when behavior is added or broken. |

## Toolchain

| Item | Standard | Notes |
| --- | --- | --- |
| Node.js | `.node-version` contains `24`; `engines.node` is `>=24` | CI reads `.node-version`. |
| Package manager | pnpm, pinned exactly in `packageManager` | One version across all plugins. |
| Lockfile | `pnpm-lock.yaml` committed; CI installs with `--frozen-lockfile` | No other lockfile may exist. |
| Language | TypeScript, `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `target` ES2022 | |
| Bundler | esbuild, output to `dist/`, format `cjs` | Obsidian, Electron, CodeMirror, and Lezer packages are external. |
| Lint and format | Biome, `recommended` preset | Warnings do not fail; errors do. |
| Obsidian lint | ESLint with `eslint-plugin-obsidianmd` only | Includes `no-unsupported-api`. |
| Markdown lint | rumdl | |
| Tests | Vitest with v8 coverage and a ratcheted threshold | |

Exact tool versions and the dependency allowlist are not yet standardized; see [Open decisions](#open-decisions).

### Minimum Obsidian version

- `manifest.json` `minAppVersion` is the single source of truth. Current value for all plugins: `1.14.4`.
- The `obsidian` dev dependency is pinned to the exact same version, so an API newer than the minimum fails at compile time.
- A feature that needs a newer host is gated at runtime with `requireApiVersion` and degrades with a notice.
- `versions.json` maps every released plugin version to the `minAppVersion` it shipped with. Entries for released versions are never edited.

## Script contract

Every plugin has these `package.json` scripts with these meanings.
The first column is the Playbook capability the script delivers.

| Capability | Script | Meaning | Writes to |
| --- | --- | --- | --- |
| — | `dev` | Watch, build to `dist/`, copy to the vault after each successful build. Skips the copy when the vault path is unset. | `dist/`, vault |
| `build` | `build` | Production build. Never touches the vault. | `dist/` |
| — | `deploy` | Run `build`, then copy `dist/` to the vault once. Fails when the vault path is unset. | `dist/`, vault |
| `typecheck` | `typecheck` | `tsc --noEmit` over `src/` and `tests/`. | nothing |
| `lint`, `format` (check) | `lint` | `biome check`. | nothing |
| `lint` | `lint:obsidian` | ESLint Obsidian rules over `src/`, `manifest.json`, `LICENSE`. | nothing |
| `docs-check` | `lint:md` | `rumdl check .` | nothing |
| `format` (write) | `fix` | Every automatic fix: Biome, rumdl, and repository-specific linters. | source files |
| `test` | `test` | `vitest run`. | nothing |
| `test` | `test:coverage` | `vitest run --coverage` with thresholds. | `coverage/` |
| — | `verify:artifacts` | Check `dist/`: three artifacts exist and are non-empty, license banners present, versions consistent across `package.json`, `manifest.json`, `versions.json`. | nothing |
| — | `conformance` | Run `conformance/standard.test.mjs`, the executable form of this standard. | nothing |
| — | `check` | Fast local subset: `typecheck`, `lint`, `lint:obsidian`, `lint:md`, `test`. Used by the pre-commit hook. | nothing |
| `verify` | `verify` | The aggregate: `typecheck`, `lint`, `lint:obsidian`, `lint:md`, `test:coverage`, `build`, `verify:artifacts`, `conformance`. Used by CI and before every push. | `dist/`, `coverage/` |
| — | `version:sync <x.y.z>` | Write the version to `package.json`, `manifest.json`, `versions.json`. No commit, no tag. | three files |

Rules:

1. A script name from this table MUST NOT be reused for another meaning.
2. Only `dev` and `deploy` may write outside the repository.
3. `verify` and `check` may gain repository-specific steps but MUST NOT lose a step listed here.
4. A plugin may add its own scripts; they are listed in that plugin's `CONTRIBUTING.md`.

`verify` replaces the earlier name `check:ci`, so that local and CI runs use the Playbook's entry-point name.

### Repository-specific scripts in use

| Plugin | Scripts | Reason |
| --- | --- | --- |
| Unisastra | `lint:styles`, `fix:styles` | Only plugin with SCSS and Stylelint. |
| Unisastra | `docs:dev`, `docs:build`, `docs:preview` | Only plugin with a VitePress site. |
| Unisastra | `debug` | `dev` without stripping `console.log` and `console.debug`. |
| Unisastra | `prepare` | Installs Husky hooks. |
| Unistoria | `native` | Runs acceptance scripts inside a running Obsidian. |

### Vault deploy contract

- The destination is `OBSIDIAN_VAULT_PLUGIN_PATH` in `.env`. `.env` is ignored by git; `.env.example` is committed.
- Copied files: `main.js`, `manifest.json`, `styles.css` from `dist/`.
- The copy is refused, and nothing is written, unless all of these hold:
    - the destination folder name equals `manifest.json` `id`;
    - the parent `plugins` folder already exists;
    - all three artifacts exist in `dist/`.
- Point the path at a test vault, not a working vault.

## Repository layout

A new plugin starts with these files.

| Path | Purpose |
| --- | --- |
| `manifest.json`, `versions.json`, `package.json` | Plugin identity and versions. |
| `src/main.ts`, `src/styles/` | Entry points for the two bundles. |
| `tests/`, `tests/fixtures/obsidian.ts` | Unit tests and the Obsidian test double. |
| `scripts/` | Build helpers: vault copy, artifact verification, version sync, license banner. |
| `esbuild.config.mjs`, `tsconfig.json`, `biome.jsonc`, `eslint.config.mjs`, `vitest.config.mts`, `.rumdl.toml` | Tool configuration. |
| `.node-version`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example`, `pnpm-workspace.yaml` | Environment and repository hygiene. |
| `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/dependabot.yml` | Automation. |
| `AGENTS.md`, `CLAUDE.md` | AI contract; `CLAUDE.md` only routes to `AGENTS.md`. |
| `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md` | Root documents. |
| `docs/`, `docs/releases/` | Durable documentation and release records. |

Rules:

- Generated files (`dist/`, `coverage/`, `main.js`, built `styles.css`) are ignored by git.
- Text files use LF. `.gitattributes` contains `* text=auto eol=lf`.
- Canonical documents are written in English and carry the Playbook frontmatter. An Indonesian companion sets `lang: id` and links to the English text.
- `package.json` sets `"private": true`; plugins are not published to npm.

## Change management

- Commits follow Conventional Commits with the Playbook's types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`, `revert`.
- A security fix uses `fix(security): …` or a `Security:` footer.
- A breaking change uses `!` or a `BREAKING CHANGE:` footer and states the migration.
- commitlint enforces the format in a `commit-msg` hook and in CI for every pull request commit.
- The pre-commit hook runs `pnpm run check`.
- Work happens on a short-lived branch and reaches `main` through a pull request merged by squash, so one pull request becomes one Conventional Commit.
- Review comments use Conventional Comments labels (`issue`, `suggestion`, `question`, `thought`, `praise`, `nitpick`) with `(blocking)` or `(non-blocking)` where priority is unclear.

## Continuous integration

`ci.yml` runs on every branch push and on pull requests to `main`.

| Job | Runner | Steps |
| --- | --- | --- |
| `verify` | `ubuntu-latest` | Frozen install, `pnpm audit --prod`, `pnpm run verify`, upload `coverage/`. |
| `test-windows` | `windows-latest` | Frozen install, `pnpm run test`. |
| `commitlint` | `ubuntu-latest` | Pull requests only: validate every commit in the range. |

Rules:

- CI runs `pnpm run verify`, the same command a developer runs locally.
- Workflows declare `permissions: contents: read` at the top level; a job that needs more asks for it itself.
- Every action is pinned to a full commit SHA with the version in a trailing comment. Dependabot updates the pins.
- Node comes from `.node-version`; pnpm comes from `packageManager`.
- Workflows set `concurrency` so a newer push cancels an older run.
- No `${{ github.* }}` expression is interpolated into a `run:` script. Pass the value through `env:` and quote it.

## Versioning and release

### Public contract

Semantic Versioning applies to this contract. A change that breaks any item is a breaking change.

- plugin `id`, command IDs, and view type IDs;
- the shape of saved settings (`data.json`) without a migration;
- frontmatter keys, file names, and file formats the plugin writes into a vault;
- `minAppVersion` and `isDesktopOnly`;
- documented CSS classes and CSS variables.

Before `1.0.0` the contract may change in any release.
During `0.y.z`, a `feat` raises the patch number and a breaking change raises the minor number.
Each plugin's `README.md` states this.

### Release flow

1. Pull requests merge into `main` with Conventional Commit messages.
2. The release workflow opens or updates one Release PR. It contains the proposed version, the generated `CHANGELOG.md` section, and the synchronized `package.json`, `manifest.json`, and `versions.json`.
3. **Human gate (G3).** The maintainer edits the changelog into consumer-facing wording under Keep a Changelog categories, overrides the version when the commits understate or overstate the impact, adds the release record `docs/releases/X.Y.Z.md` for a minor or major release, and merges. No merge means no release.
4. After the merge the workflow creates the tag `X.Y.Z`, runs `pnpm run verify`, attests build provenance, and publishes a GitHub release with `main.js`, `manifest.json`, and `styles.css`.

Rules:

- The tag equals `manifest.json` `version`, has no `v` prefix, and matches `[0-9]+.[0-9]+.[0-9]+`.
- Version, tag, artifacts, and changelog describe the same commit.
- The job that builds and tests has `contents: read`; only the publishing job has `contents: write`, `id-token: write`, and `attestations: write`.
- The release record carries the Playbook gate record with `Gate: G3`, the evidence summary, and the native acceptance status. An AI agent may draft it from `docs/releases/TEMPLATE.md` following the Release section of `AGENTS.md`; the decision stays `pending` until the maintainer sets it.
- A failed release is fixed forward with a new version. A published tag is never moved or reused.

## Licensing

- Every source file under `src/`, `scripts/`, and `tests/` starts with an `SPDX-License-Identifier` line, followed by copyright lines. A file derived from another project also names the upstream repository, file, and copyright holder.
- License texts live in `LICENSES/<SPDX-ID>.txt`; `LICENSE` at the root holds the project license. `REUSE.toml` covers files that cannot carry a header.
- The project license must be compatible with every upstream the code derives from. Code derived from a GPL work makes the plugin GPL; MPL-2.0 files keep MPL-2.0 at file level.
- Code is never taken from a repository that declares no license.
- Every bundled runtime dependency and every adapted upstream is listed in `THIRD_PARTY_NOTICES.md` and in the banner of `main.js`.

## Verification evidence

- `verify` passing proves static checks, unit tests, and a well-formed build. It does not prove the plugin works in Obsidian.
- Native acceptance is done in a real vault on the declared `minAppVersion`, in the main window and a popout window, and on mobile when `isDesktopOnly` is `false`.
- The release record states what was accepted natively, on which Obsidian version and platform, and what was not tested.
- Coverage thresholds sit just below the measured value and are only ever raised.
- A bug fix includes a regression test that fails before the fix.

## Security baseline

### Threat model

| Element | For an Obsidian plugin |
| --- | --- |
| Untrusted input | Note bodies, frontmatter, property values, file and folder names, `.base` files, pasted text, `data.json`. A vault may be synced, shared, or downloaded. |
| Assets | The user's notes, files outside the vault on desktop, and the user's privacy. |
| Trust boundary | Vault data becoming DOM, a vault path, a CSS value, or a regular expression input. |
| Supply chain | Dependencies bundled into `main.js`, build tools, and the release workflow that publishes artifacts users install. |

### Code rules

- No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, or `new Function`. Build DOM with `createEl`, `createDiv`, and `setText`; render Markdown with `MarkdownRenderer.render` and an owning `Component`.
- No network request without a disclosure in `README.md`. Use `requestUrl`, never `fetch`. No telemetry.
- No Node or Electron API unless `isDesktopOnly` is `true` or the call is guarded with `Platform.isDesktopApp`.
- Every vault path built from user data goes through one helper that calls `normalizePath` and rejects empty segments, `..` segments, and absolute paths.
- File names built from user text replace the characters `\ / : * ? " < > |`.
- Frontmatter is written with `fileManager.processFrontMatter` or `stringifyYaml`, never by string concatenation.
- Files are removed with `fileManager.trashFile`, never `vault.delete`.
- Values written into CSS come from a validated set: a hex color pattern, a number with a unit, or a known identifier.
- Data read from `data.json` or a migration file is validated against the expected shape before use.
- Vault write APIs are called from one directory, enforced by an architecture test.

### Repository and supply-chain rules

- `.env` holds only local paths and is ignored; no secret is committed. A secret that reaches a remote is rotated, not just deleted.
- Install scripts are blocked by default. `pnpm-workspace.yaml` `allowBuilds` lists each allowed package with a comment giving the reason.
- pnpm's minimum release age stays enabled. An entry in `minimumReleaseAgeExclude` names an exact version and is removed once that version is old enough.
- A new dependency is reviewed for ownership, maintenance, license, install scripts, and transitive graph before it is added. A runtime dependency also needs an entry in `THIRD_PARTY_NOTICES.md`.
- `pnpm audit --prod` runs in CI and blocks on a reachable high or critical finding. Development-only findings are tracked and fixed in regular updates.
- Dependabot is configured for npm and GitHub Actions, grouped, weekly.
- `SECURITY.md` names GitHub private vulnerability reporting as the channel.
- On GitHub: secret scanning and push protection enabled, default workflow permission `read`, `main` protected with required checks, and a tag ruleset that restricts who can create release tags.
- Dev scripts that execute code inside a running Obsidian are run only against a disposable vault.

## New plugin checklist

1. Run the Playbook route first: Product Brief, PRD, and Product Gate before choosing scope; this standard applies from Engineering Inception onward.
2. Copy the layout in [Repository layout](#repository-layout) from the newest conforming plugin (currently `obsidian-unistoria`).
3. Set `id`, `name`, `description`, `author`, `isDesktopOnly`, and `minAppVersion` in `manifest.json`; pin `obsidian` to the same version.
4. Set the version to `0.0.1` in `package.json`, `manifest.json`, and `versions.json`.
5. Confirm every script in [Script contract](#script-contract) exists and `pnpm run verify` passes.
6. Add `SECURITY.md`, `.github/dependabot.yml`, and the two workflows; pin actions to SHAs.
7. On GitHub: enable squash merge only, branch protection, the tag ruleset, secret scanning, and private vulnerability reporting.
8. Write the threat-model notes for the plugin's own inputs in `docs/`.
9. State pre-1.0 stability and any network use in `README.md`.
10. Deploy to a test vault with `pnpm run deploy` and record the first native acceptance.

## Migration backlog

Not applied yet. Each row is work for one plugin.

| Plugin | Change |
| --- | --- |
| All | Rename `check:ci` to `verify`; point CI at it. |
| All | Reset versions to `0.0.1`, delete old tags and GitHub releases, empty `versions.json` and `CHANGELOG.md`, and explain the reset in `README.md`. |
| All | Add the Release PR workflow, `SECURITY.md`, `.github/dependabot.yml`, SHA-pinned actions, split release permissions, `pnpm audit --prod` in CI. |
| All | Add branch protection and a tag ruleset on GitHub. |
| All | Add SPDX headers, `LICENSES/`, and `REUSE.toml`. |
| Unimian | Build to `dist/` and stop tracking `styles.css`; update `verify:artifacts` and the release workflow. |
| Unimian | Add `deploy` with the vault guard; `lint` becomes `biome check`; `lint:fix` becomes `fix`; add `lint:md`; `version` becomes `version:sync`. |
| Unimian | Add commitlint and Husky; add `CLAUDE.md` and `CHANGELOG.md`. |
| Unimian | Write frontmatter through `processFrontMatter`; add the vault path helper; remove the unused `ultracite` dependency and the stale `LpcHost.ts` exclusion in `tsconfig.json`. |
| Unimian | Disclose remote cover images in `README.md`. |
| Unisastra | `deploy` runs `build` first; `check` gains `test`; remove `typecheck:fast` and `typecheck:ci`; add `test:coverage`, `version:sync`, `.env.example`. |
| Unisastra | Replace `release`, `ci`, and `validate:release-tag` with the Release PR workflow. |
| Unisastra | Pass `github.ref_name` through `env:` in `release.yml`; update `pnpm/action-setup`; read Node from `.node-version`; add the Windows job and `concurrency`. |
| Unisastra | Remove or replace the `electron` dev dependency; review the five `allowBuilds` entries. |
| Unisastra | Validate the migrated cursor-position data before storing it. |
| Unistoria | `build` stops copying to the vault; add `deploy`. |
| Unistoria | Add commitlint and Husky; add `CHANGELOG.md`; add provenance attestation to the release. |

## Open decisions

- **Exact tool versions.** The implementation plan proposes a target table; it becomes part of this standard once confirmed.
- **Vitest wrappers.** `scripts/run-vitest.mjs` (Unimian) and `scripts/test.mjs` (Unisastra) are removed only after `vitest run` is shown to work on Windows without them.
Decided on 2026-10-09: this standard stays in this repository, all three repositories are public, all three use `GPL-3.0-only`, and indentation is tabs.
