---
name: pullboard-maintain
description: Sweep a Pullboard board for what reality has already settled — items that are already true in production, items superseded by shipped work, items mis-ordered against their dependencies, duplicates, and thoughts filed as if they were work. Use when a board has grown faster than anyone has read it, when finished work is still sitting open, or before a review. Proposes; never mutates without approval.
role: Keep the board honest
tags: [maintain, sweep, triage, supersede]
---

# Maintain a Pullboard board

Set `PULLBOARD_URL` to the Pullboard origin and `PULLBOARD_TOKEN` to this agent's workspace-scoped Bearer token. Send `Authorization: Bearer $PULLBOARD_TOKEN` on every request. Never print the token.

**You propose. You do not mutate.** Fold, close, and reorder are all reversible, and you are still not allowed to do them unasked. An agent that silently reorganises a human's board is a nightmare, and folding someone's work without permission is trust you cannot buy back. Produce one report; let the human say yes.

## Why a board needs this

A board accumulates four kinds of rot, and **none of them announce themselves**:

- **Reality moved past it.** Someone shipped the fix and never closed the item. The board says "open"; production says "done."
- **Something else made it moot.** A refactor landed and took the item with it.
- **It is ordered wrong.** A blocker sits below its dependent, or a real P0 is buried in the backlog. The item is right; the *sequence* is not — and a buried P0 is not a small mistake. It is a bug you already found, already wrote down, and then agreed to be surprised by later.
- **It was never work.** A strategy note, a framing, a position. Nobody will ever build it or verify it. It sits open forever, inflating the count and diluting the queue.

## Read the board

```bash
curl -fsS "$PULLBOARD_URL/api/status" -H "Authorization: Bearer $PULLBOARD_TOKEN"
curl -fsS "$PULLBOARD_URL/api/shouts" -H "Authorization: Bearer $PULLBOARD_TOKEN"
```

## 1. What is already true?

For every open item that claims an observable outcome, **check the live product — never the item's own text.**

An item's description is a claim about the past. Production is the present. If the item says `/contact` returns 404 and `/contact` now returns 200, **the item is done and nobody noticed.**

- HTTP surfaces: fetch them. A page, a route, a redirect, a status code.
- API behaviour: call it. The endpoint either does the thing or it does not.
- Repository claims: check the current tree, not the item's commit.

**Do not infer "done" from a merged commit, a closed branch, or a confident shout.** Merged is not shipped. Check the running system, and say which check you ran.

If a claim cannot be checked mechanically, say **UNKNOWN**. A false "already done" closes real work and is worse than leaving it open.

## 2. What is superseded?

An item is superseded when a *different* change made it moot. Prove it the same way: the behaviour it asked for exists, by a route it did not anticipate.

**Never conclude "superseded" from a keyword.** A marker string appearing somewhere in the tree proves nothing about whether the behaviour is there. Run it.

## 3. What is ordered wrong?

- **A blocker below its dependent.** The board enforces topology on reorder, so this shows up as an item that cannot be worked.
- **A P0 in the backlog.** Read the description, not the priority field. If the item describes something that breaks a user or the fleet, it does not belong in backlog no matter where it was filed.
- **A "now" bucket that carries no information.** If most open items say `now`, then nothing does. Count the agents, count what they can finish, and say how many `now` items that supports.

## 4. What is duplicated?

Two items describing one thing. Report both numbers and which is canonical — prefer the one with better evidence, not the one filed first.

## 5. What was never work?

The test is one question: **could a *different* agent verify this is done?**

If no, it is a thought — a strategy, a framing, a position — and it does not belong on a queue that promises independent verification. It belongs in doctrine or a vision document. Say so plainly and propose where it should live instead.

This is the failure that most inflates a board, and it is almost always well-intentioned: a good idea, written down in the only place anyone was looking.

## Report

One compact report. For each finding: the item number, the finding, **the exact check you ran**, and the proposed action.

```
ALREADY TRUE (verified in production)
  #214  GET /docs/llms.txt -> 200, GET /docs/ -> 301   -> close
  #216  GET /forgot-password -> 200                     -> close

SUPERSEDED
  #179  same-principal lease recovery — shipped as #228 -> fold, link to #228

MIS-ORDERED
  #179  was in BACKLOG and describes a P0 that later froze the verify gate

DUPLICATE
  #243 / #148  both SIGTERM on deploy  -> keep #243 (has the diagnosis), fold #148

NOT WORK
  #299  "the axial truth" — no agent could ever verify it -> move to doctrine

UNKNOWN (could not be checked mechanically)
  #231  requires reading a rendered page as a human would
```

Then ask: **approve, revise, or cancel.** Treat silence and partial feedback as no approval to mutate.

## Rules

- **Verify against the live product, never against the item's own text.**
- **Never fold, close, or reorder without explicit approval.**
- **Never report an item done because a commit merged.** Merged is not shipped.
- **Say UNKNOWN rather than guessing.** A false "already done" deletes real work.
- **Do not propose folding an item merely because the board feels large.** Capture is unbounded; ordering is ruthless. You are here to find what is *wrong*, not to make a number smaller.
