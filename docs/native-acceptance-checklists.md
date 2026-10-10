---
title: "Native Acceptance Checklists"
created: "2026-10-10T00:00:00+07:00"
tags:
  - engineering
  - obsidian-plugin
  - testing
status: active
authority: descriptive
owner: "Parkis Utama"
related:
  - "open-items.md"
  - "obsidian-plugin-engineering-standard.md"
---

# Native Acceptance Checklists

What to check inside Obsidian before releasing 0.0.1 of each plugin.
The automated gates passed for everything changed during the standardization; none of it has been run in Obsidian.
Each checklist starts with the items that cover those changes, because they carry the risk, and ends with a short regression pass.

Record the result in the Release PR description, or in the release record for a minor or major release.
Write down the Obsidian version, the platform, and anything left unchecked.

## Before you start

1. Use a test vault, not a working vault. Set `OBSIDIAN_VAULT_PLUGIN_PATH` in the plugin's `.env` to `<TestVault>/.obsidian/plugins/<plugin id>`. The `plugins` folder must already exist.
2. In the plugin repository: `git switch main`, `git pull`, `pnpm install`, then `pnpm run deploy`.
3. In Obsidian 1.14.4 or later, enable the plugin and open the developer console (Ctrl+Shift+I). Keep it open; a red error at any step is a finding.
4. This also checks the deploy command itself (open item VER-12): confirm the three files in the plugin folder have a fresh timestamp.

## Unimian

Highest risk: the bundle target moved to es2022, the build moved to `dist/`, about 170 files were reformatted, and new notes get their frontmatter from a different serializer.

### Changed during the standardization

| # | Check | Expect | Covers |
| --- | --- | --- | --- |
| U1 | Enable the plugin on desktop. | No console error; the settings tab opens. | VER-11, VER-14 |
| U2 | Open a Base and switch to Calendar, Swimlane, Gantt, Timeline, and Sticky note in turn. | Each view renders with its styles; no unstyled or broken layout. | VER-11, styles from `dist/` |
| U3 | In Gantt, draw a range to create a task, with no template configured. | A note is created. Open it in source mode: the frontmatter is valid YAML and the Properties panel shows the start and end as dates. | VER-15, DEC-01 |
| U4 | Reload the Base after U3. | The new note appears on the chart at the dates you drew. Drag its bar; the dates in the note update. | VER-15, Gantt write-back |
| U5 | In Calendar, create an event note without a template, then with a template (Templater or core Templates if you use one). | Both notes are created with correct properties; the template content is applied once. | VER-15 |
| U6 | Give a property a name that contains a colon, for example `due: soon`, map it as Gantt start, and create a task. | The note's frontmatter is still valid; no extra property appears. | The defect fixed in phase 4 |
| U7 | In a Calendar view, set the target folder option to `../Outside` and create a note. | A notice says the path leaves the vault; no folder or file appears outside the vault or inside it. | VER-06, VER-16, DEC-02 |
| U8 | Set the target folder to `/Projects/New` (leading slash). | The note is created in `Projects/New`. | DEC-02 |
| U9 | In Swimlane, drag a card to a column that maps to a folder. | The note moves to that folder. | Path guard on `moveToFolder` |
| U10 | Put an `http(s)` image address in a note's cover property and show covers. | The image loads. This is the one network request the README describes. | README privacy text |
| U11 | Run `pnpm run dev`, change a line in `src/`, save. | The build reruns and the plugin folder is updated; reload shows the change. | VER-04 |
| U12 | On a phone or tablet, enable the plugin and open each view. | Views render and scroll; no console error if you can attach a debugger. | VER-11 on mobile |

### Regression pass

- Quick preview opens from a card or event and edits save.
- Periodic notes: clicking a day, week, or month title opens or creates the note.
- Gantt dependencies: a blocked task shows as blocked; cyclic links produce one notice.
- Switch between a light and a dark theme: colours follow the theme.
- Open a view in a popout window.

## Unisastra

Medium risk: TypeScript 6, esbuild 0.28, and Vitest 5 arrived together, 296 files were reformatted, the license changed, and the Electron types are now declared locally.

### Changed during the standardization

| # | Check | Expect | Covers |
| --- | --- | --- | --- |
| S1 | Enable the plugin on desktop. | No console error; the settings tab opens and every section renders. | VER-05 |
| S2 | Toggle writing focus on and off, with the fullscreen option enabled. | The window enters and leaves fullscreen; leaving fullscreen with the OS control also ends writing focus. | Local Electron types |
| S3 | Type in a long note with typewriter scrolling on. | The cursor line stays at the configured offset. | Toolchain upgrade |
| S4 | Turn on dimming, sentence highlight, and show whitespace, one at a time. | Each decorates the editor as before. | Toolchain upgrade |
| S5 | Use outliner focus on a list item, then unfocus. | Focus zooms to the item; unfocus restores the document. Folds persist after reopening the note. | Toolchain upgrade |
| S6 | Open the floating toolbar and apply bold, a heading, a link, and a callout. | The Markdown is inserted correctly. | Toolchain upgrade |
| S7 | Close a note with the cursor in the middle, reopen it. | The cursor returns to the same place. | Restore cursor position |
| S8 | Enable equal sidebar widths and resize one sidebar. | The other follows; disabling it restores normal behaviour. | Obsidian 1.14.4 baseline |
| S9 | In the plugin folder of the test vault, check `licenses/`. | Six notice files are present, including `typewriter-mode-MIT.txt`. | Notices shipped by the build |
| S10 | If you still have a vault with MD Writer data older than 1.2.0, copy its `cursor-positions.json` into the plugin folder and enable the plugin. | Cursor positions carry over; a damaged file is ignored without an error. | VER-17 |
| S11 | Run `pnpm run dev`. | `test-vault/` is prepared and, with `.env` set, the vault copy is updated. | VER-12 |
| S12 | On a phone or tablet, enable the plugin and type in a note. | Typewriter scrolling and the toolbar work; writing focus does not try to go fullscreen. | Mobile |

### Optional: Electron regression scripts

The five scripts under `scripts/*.cjs` are no longer backed by an installed `electron` package (VER-03).
Run one to confirm they still work, for example:

```bash
pnpm dlx electron scripts/fold-regression.cjs
```

If a script needs arguments, its header comment says which.

### Regression pass

- Each writing-mode recipe in settings applies its set of features.
- Callout style editor: change a colour and an icon; the preview and existing callouts update.
- Outline view opens and follows the active note.
- A popout window: typewriter scrolling and the toolbar work there.

## Unistoria

Lowest risk: only the path guard and file headers changed. A first pass is enough before 0.0.1.

### Changed during the standardization

| # | Check | Expect | Covers |
| --- | --- | --- | --- |
| T1 | Enable the plugin on desktop. | No console error. | VER-01 |
| T2 | Run "Create space" with the path `Spaces/Test`. | The folder is created and the space opens. | Path guard does not block normal paths |
| T3 | Run "Create space" with the path `Spaces/../../Outside`. | A notice says the space could not be created because the path leaves the vault; nothing is created. | VER-06, VER-16 |
| T4 | Run "Create topic" in the space, write a message, reply to it, publish. | One Markdown file per message appears under the topic's `messages` folder with correct frontmatter. | Creation IO |
| T5 | Run "Open topics". | The conversation view lists the topic and its thread. | Regression |

### Optional: native acceptance scripts

The scripts under `scripts/native/` now begin with two comment lines (VER-21).
Run one against the test vault to confirm the runner still accepts them:

```bash
pnpm run native -- <vault name> scripts/native/h1-rename-matrix.js
```

## After the checks

| Result | What to do |
| --- | --- |
| Everything passes | Close and reopen the Release PR so CI runs, then merge it. |
| A check fails | Do not merge the Release PR. Open an issue or tell the agent which check failed and what you saw; the fix goes in as a `fix:` pull request and the Release PR updates itself. |
| A check could not be done | Say so in the Release PR description. An untested item is acceptable for 0.0.1 when it is written down. |
