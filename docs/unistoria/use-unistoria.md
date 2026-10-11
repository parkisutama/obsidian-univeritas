# Use Unistoria

Unistoria adds folder-scoped threaded conversations to Obsidian.
Every message and reply is its own Markdown file, linked to its topic and parent with relative Markdown links, so the vault stays the source of truth.

Unistoria is desktop only and pre-release: before 1.0.0 anything may change between releases, including the files it writes into a vault. The plugin's [changelog](https://github.com/parkisutama/obsidian-unistoria/blob/main/CHANGELOG.md) says when it does.

## Install

1. Open the latest [release](https://github.com/parkisutama/obsidian-unistoria/releases) and download `main.js`, `manifest.json`, and `styles.css`.
2. Put the three files in `<vault>/.obsidian/plugins/unistoria/`.
3. In Obsidian, open **Settings → Community plugins**, reload the list if needed, and enable **Unistoria**.

## Start a conversation

1. Run **Create space** and choose or type a folder. A space is an ordinary folder that will hold topics.
2. Run **Create topic**, pick the space, and give the topic a title.
   Unistoria creates the topic folder, a Folder Note with the same name, a `messages/` folder, and a first draft.
3. Write the draft in the editor pane that opens next to the conversation. It is Obsidian's normal editor, with all your plugins and hotkeys.
   Then choose **Publish** in the bar under the conversation.
   **Settings → Unistoria → Editor** can embed the editor below the conversation instead.

Open the topic list with the **Open topics** command or the ribbon icon.

## Read and reply

The topic page lists the messages that start a thread.
Use **Reply** on one, or its thread control (the reply count, or **Open thread**), to read it with its replies in a panel on the right.
The panel can be expanded to the whole view for focused reading, and closed again.

A reply is a new file whose `parent` links to the message it answers.
You can also **Reply** to a reply: it stays in the same flat list, with a one-line quote of the message it answers that jumps there when selected.
Replies do not start threads of their own.

Messages are rendered like reading view: callouts, quotes, code, embeds, and math work.
Links open (hold Ctrl for a new tab), hovering a link with Ctrl previews it, clicking a tag searches for it, and you can tick task checkboxes in a message or the topic context.

Long messages and long topic context show an excerpt with a **Read more** button, and **Show less** to fold it again.
The cut is by height, not by character count, so lists, callouts, and images are handled alike, and your choice is kept while you work.

## Edit, remove, and restore

- **Edit** changes a published message in place.
- **Remove** hides a message and everything below it without deleting any file.
- **Restore and publish** brings a removed message back.
- **Show removed and unpublished** reveals hidden messages for recovery.

Drafts you close stay under **Drafts** and can be opened again. A draft is unpublished, not private.

The data problems panel lists broken links, missing parents, and duplicate ids, each with an **Open file** link.

Everything is a Markdown file you can read, move, and edit without the plugin.

## Compatibility notes

- Other plugins can change message files.
  Formatters such as Obsidian Linter may add a `title` property and a first heading, and may shorten timestamps, when a message opens in the editor.
  Exclude your space folders from such plugins' rules.
- Unistoria keeps other properties on status changes, but Obsidian's frontmatter API may rewrite YAML comments and list or quote style. See [ADR-005](https://github.com/parkisutama/obsidian-unistoria/blob/main/docs/decisions/ADR-005-mutation-and-preservation.md).
- Titles and file names cannot contain `#`, `^`, `[`, `]`, or `|`; those characters are removed when a topic is created.
