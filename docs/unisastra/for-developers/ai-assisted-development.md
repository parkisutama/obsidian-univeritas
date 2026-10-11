# AI assisted development

Give the agent the active documentation as context before asking it to write code.
[AGENTS.md](https://github.com/parkisutama/obsidian-unisastra/blob/main/AGENTS.md) holds the shared instructions; `CLAUDE.md` routes Claude to the same file.

## Reading order

1. [Development status](https://github.com/parkisutama/obsidian-unisastra/blob/main/docs/en/development-status.md): gates and work not yet validated.
2. [Current state](https://github.com/parkisutama/obsidian-unisastra/blob/main/docs/en/current-state.md): what is implemented, and the compatibility identifiers.
3. [Architecture baseline](https://github.com/parkisutama/obsidian-unisastra/blob/main/docs/en/reference/code-architecture-baseline.md): what each module is responsible for.
4. [ADR-001](https://github.com/parkisutama/obsidian-unisastra/blob/main/docs/en/reference/decisions/ADR-001-ai-development-context-and-gates.md) and any other decision record the change relates to.
5. The user guide, the related specification, the source, and the tests for the area being touched.

Choose context by task. Outliner work uses the outliner specification and `src/cm6/outliner/`; release work uses the [development workflow](../../plugin-development-workflow.md) and `scripts/lib/`.
Archived documents explain history; verify them against the source before relying on them.

## Development loop

1. Check the git status and keep work that is already there.
2. For a new product need, use the PM skill; for an unclear requirement, use `interview-me`. Confirm the intent and the definition of success.
3. Create a branch before the first planning artifact. Continue an existing task branch; keep local work.
4. Follow `SPECIFY → PLAN → TASKS → IMPLEMENT`, with human validation between the planning phases. Authorization already given explicitly is not asked for again. Record a decision record before changing the architecture or a compatibility contract.
5. Split the task into vertical slices with `planning-and-task-breakdown`; use `incremental-implementation` to finish one slice with its tests and documentation before the next.
6. Run the targeted checks, then `pnpm run check`, then `pnpm run verify`.
7. Update the affected documentation and record the automated results and the manual acceptance.
8. Review the diff and make atomic Conventional Commits within the scope the user gave.

## Strategy, skills, and artifacts

`AGENTS.md` decides which skill applies in which situation, the outcome each must produce, and the rules before a refactor or a release.
Read the `SKILL.md` of a skill before using it; a list of skills in a guide does not install or invoke them.

Strategy starts from the positioning in the README and from how people use Unisastra.
Compare benefit, regression risk, compatibility, effort, and dependencies before recommending a priority to the maintainer.
Keep apart what is implemented, what is partial, what does not exist, and which gates are really enforced.

For newly planned work, the artifact convention is `docs/specs/<slug>/{spec,plan,tasks}.md` in the plugin repository, created when the task needs them.
Existing active task documents stay in use. Link acceptance to tests, QA, and decision records; after shipping, archive finished artifacts and update the links.
Current state records the implementation; development status records the evidence of readiness.

Example prompt:

```text
Read AGENTS.md and the active documentation related to the outliner.
Inspect the implementation and the tests before changing them.
Goal: [the behavior wanted]. Acceptance: [scenarios and results].
Keep the command IDs, the settings, and local work that already exists.
Implement the change, run QA, update the docs, then report
what passed, what failed, and what was not tested in Obsidian.
```

## Local hooks and CI

`pnpm install` enables Husky through `prepare`.
In an old checkout, run `pnpm run prepare` and check `git config --get core.hooksPath`; the expected value is `.husky/_`.

- Pre-commit: `pnpm run check`, with no autofix and no automatic staging.
- Commit-msg: commitlint, for example `docs(ai): document development context`.
- CI `Verify`: `pnpm run verify`, which adds coverage, build, artifact verification, and conformance.
- CI `Commit messages`: the pull request title and every commit in the pull request.

Run `pnpm run fix` explicitly when needed and review the diff.
Hooks can be skipped, so a local hook result is not evidence of a CI result.
Conventional Commits checks the message format; whether a commit is atomic is for a person to judge.

The Markdown lint checks structure and relative links, not whether the content is true.
Documentation accuracy and acceptance in Obsidian on desktop, mobile, and popout windows are separate gates and must be recorded honestly.
