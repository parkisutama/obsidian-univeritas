# Manual QA checklist

What to try in Obsidian before a Unisastra change is merged or released.
`pnpm run verify` covers the automated checks; this page covers what it cannot see.
The release-level script is in the [native acceptance checklists](../../native-acceptance-checklists.md) (S1 to S12).

Run these in `test-vault/`, which `pnpm run dev` prepares.

## Main features

Try the areas the change touches:

- typewriter scroll;
- keep lines above and below;
- dimming;
- current line highlight;
- show whitespace;
- outliner focus;
- writing focus;
- restore cursor position;
- block ID and fold persistence, when the change touches them.

## Floaty Toolbar and callouts

This area has not been verified at runtime in any development environment so far.
See the [current state](https://github.com/parkisutama/obsidian-unisastra/blob/main/docs/en/current-state.md#floaty-toolbar-acceptance-criteria-status) for the status of each acceptance criterion and the [task ledger](https://github.com/parkisutama/obsidian-unisastra/blob/main/docs/en/specs/floaty-toolbar/tasks.md#runtime-acceptance-ledger) for the detailed scenarios.
Before marking a change here as done at runtime, check at least:

- the floating toolbar appears near the selection in Source and Live Preview on desktop, and is not mounted on mobile;
- every button and dropdown (bold, italic, strikethrough, code, highlight, link, heading, callout) gives the right result and undoes in one step;
- the command palette shows the 16 `floaty-*` commands plus `manage-callouts`, and the `floaty-*` commands do not appear on mobile;
- a long press on a toolbar item (about 0.5 seconds) starts a drag; releasing over another item swaps the two and the order is saved; Escape cancels with no console error;
- reordering from the Toolbar settings tab (up and down arrows) shows in the toolbar;
- in the Callouts tab, the compact preview header shows the real icon, color, and label, and expanding or collapsing neither repeats the form nor loses a draft;
- inserting or changing a callout always writes an uppercase marker, and the GitHub compatibility label shows only in the Callouts tab, not in the toolbar;
- dock and pin, the timer HUD, and popout windows behave as before.

## General regression

- The plugin loads with no unexpected error notice.
- The settings tab opens.
- The command palette still lists the plugin's commands.
- SCSS changes do not break the editor layout.
- Command changes do not conflict with basic editor behavior.
- Mobile and desktop behavior stays consistent with `isDesktopOnly`.

## When the vault does not get the new build

`pnpm run dev` builds, prepares `test-vault/`, and copies to the vault named in `.env` when that is set.

- Run `pnpm run build`, then `pnpm run verify:artifacts`, to confirm `dist/main.js`, `dist/manifest.json`, and `dist/styles.css` are valid.
- Run `pnpm run dev` again to copy the files into `test-vault/`.
- Check that `test-vault/.obsidian/plugins/unisastra` holds the three files.
- Check that `unisastra` is listed in `test-vault/.obsidian/community-plugins.json`.
- For a vault outside `test-vault/`, run `pnpm run deploy` and follow the path error it prints.

## When QA is enough

- The automated checks pass.
- The scenarios the change touches were tried by hand.
- No known blocker for users remains.

Record what was tried, on which Obsidian version and platform, and what was not tested.
