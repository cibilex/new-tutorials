# Purpose

This repo is a personal knowledge notebook, not a codebase. It holds notes from conversations where the user is learning a topic by talking to an AI. There is no build/test/run workflow to maintain here — the job is capturing and organizing notes.

# Structure

- Flat topic files at root: `<topic>.md` (e.g. `bullmq.md`, `graphql.md`, `zustand.md`, `oop.md`).
- Topic folders for subjects with multiple notes: e.g. `ing/` (English learning: grammar points, one file per point), `react/`, `database/`, `docker/`, `aws/`, `CI-CD/`.
- `notes.md` and `general-culture/notes.md` are loose/misc notes that don't fit a dedicated topic yet.
- `bookmarks.md`, `courses.md` track external resources.

# Workflow: saving a learning

When the user says something like "note this down", "let's save what we learned", "write this to md", or otherwise signals the topic/conversation reached a point worth keeping:

1. Identify the topic. If a matching file/folder already exists, append to it. Otherwise create a new `<topic>.md` at root, or a new file inside the relevant topic folder if one exists (e.g. a new grammar point goes in `ing/<point>.md`).
2. Write a **short** summary of what was learned — not a transcript. Capture the concept, the key insight/gotcha, and a minimal code/example snippet if relevant. Skip preamble and filler.
3. Use plain Markdown: a heading for the subtopic, short bullets or a few sentences, code blocks where useful.
4. Match the terseness of the existing files in that topic — some are dense reference dumps (`nest.md`, `bullmq.md`), some are short bullet lists (`css.md`, `mongodb.md`). Follow the existing file's style when appending; default to short when creating new.
5. Don't ask for confirmation before writing the note — just write it and say where it went.

# Style notes

- No fluff, no restating the whole conversation. The note should be useful as a future reference, not a log.
- Prefer bullets and short code snippets over prose paragraphs.
- Don't add headers/sections the topic doesn't need — a two-line note is fine as two lines.



## Git Workflow

Every code change goes through a branch and a PR. **Never commit or push directly to `main`.**

> **⚠️ Always get explicit confirmation before running `git commit`.** Branching and staging
> are fine without asking — stop at the commit step.

1. **Branch off up-to-date `main`:**
   ```bash
   git checkout main && git pull
   git checkout -b feature/<short-name>   # new features
   git checkout -b bugfix/<short-name>    # bug fixes
   ```
   Use kebab-case names.
   clean — this is what CI gates on.
2. **Open a PR to `main`:**
   ```bash
   git push -u origin <branch>
   gh pr create --base main --title "<title>" --body "<summary>"
   ```
3. **Merge and sync:**
   ```bash
   gh pr merge --squash --delete-branch
   git checkout main && git pull
   ```



### Shortcut: "cici"

When the user says **"cici"**, run the full Git Workflow above end-to-end without re-explaining
each step:

1. Stage the relevant files, show the diff and drafted commit message, **stop and wait for
   explicit confirmation** — the always-confirm-before-commit rule above still applies, "cici"
   does not skip it.
2. Once confirmed: `git commit`, `git push -u origin <branch>`, `gh pr create`.
3. `gh pr checks --watch` until CI passes.
4. `gh pr merge --squash --delete-branch`, then `git checkout main && git pull`.

If no branch exists yet for the current change, branch off up-to-date `main` first (step 1 of
the Git Workflow above). If CI fails, fix and push a new commit (still confirming first) rather
than force-pushing or skipping hooks.

