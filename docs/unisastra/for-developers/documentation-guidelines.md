# Documentation guidelines

Where Unisastra documentation goes.
Guides live in the workspace repository (`obsidian-univeritas`, under `docs/unisastra/`); specifications, decision records, and status pages stay beside the code in `obsidian-unisastra`.

## Decide the reader first

- someone using the plugin;
- a developer contributing a change;
- the maintainer preparing a release;
- the maintainer reading technical reference.

## Place by action

In the workspace repository:

| The reader wants to | Page |
| --- | --- |
| install the plugin | `docs/unisastra/for-users/install-unisastra.md` |
| use a feature | `docs/unisastra/for-users/use-unisastra-features.md` |
| solve a problem | `docs/unisastra/for-users/troubleshooting.md` |
| set up the repository | `docs/unisastra/DEVELOPMENT.md` |
| try a change in Obsidian | `docs/unisastra/for-developers/manual-qa-checklist.md` |
| work with an AI agent | `docs/unisastra/for-developers/ai-assisted-development.md` |
| branch, commit, open a pull request, release | `docs/plugin-development-workflow.md` |
| look up a rule shared by all plugins | `docs/obsidian-plugin-engineering-standard.md` |

In `obsidian-unisastra`:

| Content | Place |
| --- | --- |
| what is implemented now | `docs/en/current-state.md` |
| status and validation evidence | `docs/en/development-status.md` |
| module structure | `docs/en/reference/code-architecture-baseline.md` |
| architecture decisions | `docs/en/reference/decisions/` |
| specification, plan, and tasks of a piece of work | `docs/specs/<slug>/` |
| release records | `docs/releases/` |
| historical documents | `docs/en/archive/` |

## Keep contexts apart

- No long development instructions in the user README.
- No user tutorial in a release checklist.
- An archived document is not an active instruction.
- Do not copy a long procedure; link to the page that has it.

## Language

Developer guides are written in English. The user guides are in Indonesian for now.

## Keep the index current

When a guide is added, moved, or removed, update the [guide index](../README.md) and any link to it from the plugin's `README.md`, `CONTRIBUTING.md`, and `AGENTS.md`.
The Markdown lint of each repository checks relative links only. Links between the two repositories are checked by `node templates/tools/check-cross-links.mjs`, run from the workspace root and in the workspace's `Docs` workflow.
