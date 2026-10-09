## Release

Releases follow the workspace engineering standard. The human release gate is merging the Release PR.

- Never merge a Release PR, create a tag, or publish a release. Never edit `version` in `package.json` or `manifest.json` by hand; the Release PR does it.
- Write pull request titles as Conventional Commits: the title becomes the commit on `main` and decides the next version and the changelog entry.
- When a Release PR for a **minor or major** version is open and the maintainer asks for the release record:
    1. Copy `docs/releases/TEMPLATE.md` to `docs/releases/X.Y.Z.md` on the Release PR branch.
    2. Fill the evidence summary from the CI run of that pull request and link the changelog section.
    3. Under native acceptance, list only what the maintainer reports having checked in Obsidian; list everything else under "Not checked". Automated checks are not native acceptance.
    4. Leave `Decision: pending`. Only the maintainer sets `approved`.
- When `minAppVersion` changes, add `"<next version>": "<new minAppVersion>"` to `versions.json` in the Release PR. `pnpm run verify` fails until it is there.
- A patch release needs no release record; the Release PR description is enough.
