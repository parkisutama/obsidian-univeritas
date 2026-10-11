# Obsidian Univeritas

The shared home of three Obsidian plugins by [Parkis Utama](https://github.com/parkisutama): one engineering standard, the files that implement it, and the guides for people who use or develop the plugins.

| Plugin | What it does | Repository |
| --- | --- | --- |
| Unimian | Calendar, Swimlane, Gantt, and Timeline views for Bases | [obsidian-unimian](https://github.com/parkisutama/obsidian-unimian) |
| Unisastra | A drafting environment: typewriter scrolling, whitespace display, outliner focus | [obsidian-unisastra](https://github.com/parkisutama/obsidian-unisastra) |
| Unistoria | Folder-scoped threaded conversations, one Markdown file per message | [obsidian-unistoria](https://github.com/parkisutama/obsidian-unistoria) |

The plugin source code, specifications, and decision records live in each plugin's own repository.
This repository holds what the plugins share.

## What is here

| Path | Content |
| --- | --- |
| [docs/obsidian-plugin-engineering-standard.md](docs/obsidian-plugin-engineering-standard.md) | The engineering standard every plugin follows: toolchain, scripts, CI, releases, licensing, security. |
| [docs/plugin-development-workflow.md](docs/plugin-development-workflow.md) | How a change travels from a branch to a published release, the same in every plugin. |
| [docs/native-acceptance-checklists.md](docs/native-acceptance-checklists.md) | What to check inside Obsidian before a release. |
| [docs/implementation-plan.md](docs/implementation-plan.md) | How the three plugins were brought to the standard, phase by phase. |
| [docs/open-items.md](docs/open-items.md) | What is deferred, unverified, or still to decide. |
| [docs/obsidian-plugin-audit-prompts.md](docs/obsidian-plugin-audit-prompts.md) | An audit document and prompts for reviewing a plugin before beta testing, submission, or release. |
| [docs/unimian/](docs/unimian/README.md), [docs/unisastra/](docs/unisastra/README.md) | User and developer guides of each plugin. |
| `templates/` | The shared workflows, hooks, configuration, and conformance test, with the tools that install them in a plugin repository. |

## Starting a new plugin

Follow the "New plugin checklist" in the [engineering standard](docs/obsidian-plugin-engineering-standard.md), then install the shared files from the new repository's root:

```bash
node ../templates/tools/apply-plugin-template.mjs <github repository name> <bootstrap commit sha>
```

`pnpm run conformance` in the plugin repository reports what still differs from the standard.

## Working on the plugins together

Clone the plugin repositories next to `docs/` and `templates/`; this repository ignores those folders.

```text
obsidian-univeritas/
├── docs/
├── templates/
├── obsidian-unimian/
├── obsidian-unisastra/
└── obsidian-unistoria/
```

## License

The templates and tools are licensed under GPL-3.0-only; see [LICENSE](LICENSE).
Each plugin states its own license in its repository.
