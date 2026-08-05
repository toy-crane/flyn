---
name: execute-tasks
description: Deliver an approved task breakdown one task at a time, each in its own context, through review and merge into main. Use when a spec folder already holds task files ready to implement.
user-invocable: true
---

# Execute Tasks

## Keep the work out of this context

Do not read task bodies, spec bodies, or diffs. Delegate implementation to a
worker subagent and review to a separate reviewer subagent, and keep only their
reports. The breakdown exists so each task starts from a fresh context; reading
the work here spends the budget it was meant to save.

Run from the base checkout. A worktree cannot host the loop that creates
worktrees.

## Choose the next task

Derive state from disk each iteration, never from what an earlier iteration
reported. An open pull request means the previous iteration did not finish;
complete it before starting anything new.

Task files live at `docs/specs/<slug>/tasks/`. A task is available when its
status is not done and every blocker in the same spec is done. Finish one spec
before starting another, preferring a spec that already has completed tasks.
When no spec has an available task, report what remains and why, then stop.

Never invoke `split-into-tasks` to create work. That breakdown requires the
user's approval.

## Delegate the delivery

Create a worktree, then hand the worker the task file path and nothing else; it
finds its own context. Require it to verify each acceptance criterion by running
it, to record the status change and checked criteria in the task file, and to
report evidence per criterion. Treat a report without evidence as a failure.

Keep the worker addressable. It fixes review findings with its own context
intact.

## Review before merging

Give the reviewer the diff and the task file, never the worker's report or
reasoning. It judges against the acceptance criteria, `CLAUDE.md`, the decision
contracts, and surrounding conventions.

A finding blocks only when behavior misses an acceptance criterion, a bug is
clear, a decision contract is violated, or a data or security problem is hard to
reverse. Everything else rides along in the pull request body and the code stays
untouched; following findings past the task boundary dissolves task-sized
delivery.

Return blocking findings to the worker and review once more. A second round that
still blocks is a stop.

## Stop instead of retrying

Stop on a failed verification, a merge that does not land, missing evidence,
blocking findings after one fix round, or a task definition that contradicts the
code. Record `status: blocked` with the reason in the task file, commit it, and
report. Repeating a failed attempt is not progress.

Merging leaves the worktree behind. Return to the base checkout and sync `main`
before the next iteration.

## Run until nothing is available

Return to task selection after each merge without asking whether to continue.
To hold a session across many tasks, set a goal condition that admits both
endings — no unfinished task remains, or every remaining task is recorded as
blocked — so a blocked task ends the run instead of restarting it.
