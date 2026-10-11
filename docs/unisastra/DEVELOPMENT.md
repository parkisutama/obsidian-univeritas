# Development

Setup and the local development loop for Unisastra.
Commits, pull requests, and releases are described in the plugin's [CONTRIBUTING.md](https://github.com/parkisutama/obsidian-unisastra/blob/main/CONTRIBUTING.md); the rules shared by all three plugins are in the [engineering standard](../obsidian-plugin-engineering-standard.md).

## Prerequisites

1. Install [Node.js](https://nodejs.org/) 24 (see `.node-version`).
2. Enable [pnpm](https://pnpm.io/) through Corepack: `corepack enable`.

## Setup

1. Clone the repository, or your fork of it.
2. Run `pnpm install`. This also installs the Husky hooks.
3. Optional: to copy builds into a vault of your own, create `.env` with `OBSIDIAN_VAULT_PLUGIN_PATH=<vault>/.obsidian/plugins/unisastra`.
   The deploy script refuses a folder with any other name. Point it at a test vault, not the vault you write in.

## Build and try it in Obsidian

| Command | What it does |
| --- | --- |
| `pnpm run dev` | Watch build. Prepares `test-vault/`, and also copies to the vault named in `.env` when that is set. |
| `pnpm run debug` | The same, keeping `console.debug` and `console.log` calls, which other builds strip. |
| `pnpm run build` | Production build into `dist/`. Never touches a vault. |
| `pnpm run deploy` | Builds, then copies `dist/` once to the vault named in `.env`. |

Open `test-vault/` in Obsidian. After a rebuild, reload Obsidian (**Reload app without saving**) to load the new build.

## Checks

| Command | What it does |
| --- | --- |
| `pnpm run check` | Typecheck, Biome, Obsidian ESLint, Stylelint, Markdown lint, and tests. The pre-commit hook runs it. |
| `pnpm run verify` | `check` with coverage, then build, artifact verification, and conformance. CI runs it. |
| `pnpm run fix` | Applies the Biome, Stylelint, and Markdown autofixes. Review the diff before staging. |
| `pnpm run test` | Vitest only. |

The single checks are `typecheck`, `lint`, `lint:obsidian`, `lint:styles`, and `lint:md`.
The hooks never modify files; the commit-message hook checks Conventional Commits.

## Working with an AI agent

Agents read [AGENTS.md](https://github.com/parkisutama/obsidian-unisastra/blob/main/AGENTS.md); Claude reaches it through [CLAUDE.md](https://github.com/parkisutama/obsidian-unisastra/blob/main/CLAUDE.md).
See also [AI assisted development](for-developers/ai-assisted-development.md).

## More guides

The [guide index](README.md) lists the user and developer guides.
