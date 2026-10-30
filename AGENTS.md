# AGENTS.md

<!-- exodia:section:overview -->
GitVault is a client-only Nuxt 4 SPA that turns the user's own private GitHub repos (prefixed `gitvault-`) into file storage: browse folders, upload, preview and download files. Users sign in with GitHub OAuth (`nuxt-auth-utils`); a thin Nitro server in `server/` proxies every GitHub REST call with the user's token. UI is Nuxt UI 4 + Tailwind 4, strings via `@nuxtjs/i18n`. Product overview for humans: `README.md`. Planned and past work plans: `plan/`.

## Commands

<!-- exodia:section:commands -->
Check `package.json` for scripts. Node version in `.nvmrc`, pnpm version in `package.json` `packageManager`.

## Context Router

<!-- exodia:section:router -->
<!-- exodia:router:start -->
Route by task type. Read the relevant L2 module, then load L3 data (`.jsonl` / `.yaml`) only when needed. **Max 2 hops.**

| Task type | Load |
| --------- | ---- |
| System shape, routing, modules, state, data flow | `context/architecture/ARCHITECTURE.md` |
| Conventions, GitHub proxy, composables, UI, validation | `context/design-patterns/DESIGN-PATTERNS.md` |
| Domain terms (vault repo, CDNFile, active repo), user journey, types | `context/glossary/GLOSSARY.md` |
| Env vars, runtime config, OAuth, deploy, i18n | `context/operations/OPERATIONS.md` |
| Local setup, something broken, known footguns | `context/debugging/DEBUGGING.md` |
<!-- exodia:router:end -->

## Behavioral Rules

<!-- exodia:section:rules -->
1. **Route first.** Use the Context Router table above before loading any data file. Do not guess; the router exists to avoid guessing.
2. **Load lazily.** Never load all L3 files at once. Max 2 hops: router → L2 narrative → (optional) L3 data. If the task is answerable from L2 alone, stop there.
3. **Append only.** `.jsonl` data files are append-only. When an entry becomes obsolete, mark it `archived`; do not delete.
4. **Rationale required.** ADRs and decisions must include *why*. An entry without a reason will rot.
5. **Read before write.** Before appending to a data file, scan it for a duplicate or near-duplicate. Update or supersede rather than create a duplicate.
6. **Existing patterns win.** Read `context/design-patterns/DESIGN-PATTERNS.md` before introducing a new convention. If an existing pattern covers the case, use it.
7. **IDs are timestamps.** All L3 entries use the format `{type}_{YYYYMMDD}_{HHMMSS}_{4hex}` where `{type}` is the target file's `_schema` value (first line of the `.jsonl`). This makes IDs sortable and collision-free.
8. **Context update as final task.** When planning work with a todo list, always add a final step: "Evaluate context update." At that step, walk the §Self-Update Rules table below and decide if any entry should be captured. If nothing qualifies, skip. Do not create entries just to fill the step.
- **Operations awareness.** Check `context/operations/OPERATIONS.md` before touching user-visible text, env variables, routing, deploy config, or anything that differs by environment/tenant/variant. When in doubt, open the file.

## Self-Update Rules

<!-- exodia:section:self-update -->
The context files are **shared, living documentation** about the codebase, not personal memory. After completing a task, check whether any codebase fact, decision, or pattern (discovered or taught) should be logged for future sessions. Write in objective, third-person terms (the team decided X because Y), not first-person recollection (I learned X). **Do not ask the user for permission; just do it.** The user can always revert via git.

### When to update

Target-file paths below are absolute, repo-rooted: a config-driven scaffold may place categories anywhere (e.g. `docs/project/architecture/`, `docs/handbook/glossary/`). Without a config, the canonical layout has every category under `context/`. The scaffolder substitutes the resolved paths into this table at emit time; do not re-derive them.

| Signal during conversation | Target file | What to write |
| -------------------------- | ----------- | ------------- |
| Codebase assumption corrected by user or by evidence | L2 `.md` file for that area | Update the incorrect section |
<!-- exodia:self-update:rows:start -->
| Architecture or design decision taken by the team | `context/architecture/decisions.jsonl` | New ADR entry |
| PR review surfaces new check (prod break, near-miss) | `context/design-patterns/reviews.jsonl` | New review entry |
| API contract changes or deprecated | `context/design-patterns/reviews.jsonl` | New entry tagged `migration` with `old_pattern` / `new_pattern` |
| Domain term clarified or new entity appears | `context/glossary/glossary.yaml` | New or updated term |
| Variant-specific behavior confirmed | `context/operations/variants.yaml` | New entry under the relevant variant |
| Reproducible behaviour worth a future debugger's time: name the symptom(s), root cause, fix. Includes recurring footguns: the footgun IS the symptom. | `context/debugging/playbooks.jsonl` | New playbook entry |
| L2 guardrail grows past ~3 lines or pattern needs nuance | `context/design-patterns/docs/<slug>.md` | Spin out a deep dive, replace the L2 section body with `See [docs/<slug>.md](docs/<slug>.md) for full details.` |
<!-- exodia:self-update:rows:end -->

### How to update

1. **Read the target file first**: check for duplicates or entries that should be updated instead of duplicated.
2. **Branch-scoped dedup.** Check the current branch (`git branch --show-current`). If an entry on the same topic was added on the **current branch** (check with `git diff <default-branch> -- <file>`), **replace it in-place** instead of appending. A branch is a unit of work; it should produce one entry per topic, not one per iteration or conversation. Once an entry is merged, it is settled and should not be overwritten; only superseded by a new entry on a new branch if the understanding changes.
3. **Use the existing schema**: every `.jsonl` file starts with a `_schema` line (JSON object with `_schema`, `_version`, `_description`, `_fields`). Read `_fields` to know which keys an entry must carry. Match field names exactly. Do not invent fields. If the schema must evolve, bump `_version` in the first line before adding entries with the new shape.
4. **Generate the ID**: format `{type}_{YYYYMMDD}_{HHMMSS}_{4hex}` using the current date/time. When replacing an entry per rule 2, keep the original ID.
5. **Append, don't rewrite**: add new lines at the end of `.jsonl` files. For `.md` and `.yaml` files, edit the relevant section. Exception: see rule 2; entries added on the current branch are mutable until merged.
6. **Archive, don't delete.** When a `.jsonl` entry becomes obsolete (playbook fix no longer applies, runbook replaced, experiment failed), set `status: archived` on the entry instead of removing the line. Preserves history for retrospectives. The `status` field is part of every appendable schema's `_fields` (ADR schemas use `status: superseded` for the same purpose, with `supersedes: <id>` pointing at the replacement).
7. **Keep entries atomic**: one insight per entry. Don't bundle multiple findings into one.
8. **Be concise**: write for a developer who will read this months later without the conversation context.
9. **Point, don't hardcode**: never copy values that already live in source files (versions, ports, config). Reference the file instead.

### What NOT to capture

- Anything already in the context files (check first).
- Ephemeral debugging steps that only apply to this session.
- User preferences about agent behavior (those belong in `.claude/` or equivalent settings, not here).
- Information that can be derived from reading the code or git history.

### What NOT to capture (codebase-specific)

These rot fast; pointer only, never hardcode:

- Dependency versions, ports, env-var values, API endpoints, hostnames: reference the source file (`see package.json`, `defined in .env.example`).
- Function signatures, type definitions, class hierarchies, DB schemas: derivable by reading code.
- Git-derivable facts (commit author, date, PR number, blame line): use `git log` / `git blame`.
- Patterns already obvious from `package.json` / lockfile / `pyproject.toml` dependencies ("we use Redux" when `redux` is in deps).
- Test names, file counts, directory listings: rerun the command.
- One-session workarounds that will be gone next branch, unless the fix teaches a durable rule.

## Quick Action Table

<!-- exodia:section:quick-actions -->
| Developer says | Action sequence |
| -------------- | --------------- |
| "Add a GitHub API call / server route" | `context/design-patterns/docs/github-api.md` → mirror an existing handler in `server/routes/` |
| "Add a page or change navigation" | `context/architecture/ARCHITECTURE.md` § Entry Points & Routing → set `definePageMeta` middleware |
| "Support a new file type in preview" | `context/design-patterns/DESIGN-PATTERNS.md` § File previews |
| "Add or change UI text" | `context/operations/OPERATIONS.md` § i18n → edit `src/locales/en-US.json` |
| "Add an env var / change OAuth config" | `context/operations/OPERATIONS.md` § Configuration System → update `.env.example` |
| "Something is broken" | `context/debugging/DEBUGGING.md` → search `context/debugging/playbooks.jsonl` |

## Context Structure

<!-- exodia:section:structure -->
```text
context/
├── architecture/
│   ├── ARCHITECTURE.md
│   └── decisions.jsonl
├── design-patterns/
│   ├── DESIGN-PATTERNS.md
│   ├── reviews.jsonl
│   └── docs/
│       └── github-api.md
├── glossary/
│   ├── GLOSSARY.md
│   └── glossary.yaml
├── operations/
│   ├── OPERATIONS.md
│   └── variants.yaml
└── debugging/
    ├── DEBUGGING.md
    └── playbooks.jsonl
```
