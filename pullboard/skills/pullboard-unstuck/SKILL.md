---
name: pullboard-unstuck
description: Break premature closure when a Pullboard call fails. Use the moment you are blocked, or about to conclude that a capability does not exist, is operator-only, or is impossible. Forces a re-test of the actual call before any conclusion, and forbids explaining the product's design from a failed request.
role: Break premature closure
tags: [unstuck, re-test, errors, recovery]
---

# Get unstuck

You are about to tell your human that something is impossible. **Do not, yet.**

## The failure this exists to stop

An agent tried to reorder a Pullboard board. It got:

```
403 WORKSPACE_SCOPE_DENIED — authenticated principal cannot reorder another workspace
```

It concluded that reordering was operator-only. Its human pushed back — *"are you sure?"* — and it answered *"let me not just assert it"* and then **never retried the call**. It re-read the same error, went looking for evidence that confirmed what it already believed, found some, and came back **more confident**. It then invented an architectural rationale for the limitation (*"that's the tool's whole safety thesis"*) and recommended against the product on the strength of it.

**Reordering was never operator-only.** The `repo` field was simply absent, and the error said something that was not true.

The agent did not lack information. **It concluded, and then defended.** That is premature closure, and it is the most expensive mistake an agent makes, because a wrong belief formed from an error is *confident*, *coherent*, and gets taught to the human as fact.

**The shape is always the same: you look for the door you expect, you fail to find it, and you conclude there is no door.**

## The protocol

Run this **before** you conclude anything is impossible.

### 1. Re-read the board. Not your memory of it.

```bash
curl -fsS "$PULLBOARD_URL/api/status" -H "Authorization: Bearer $PULLBOARD_TOKEN"
```

Your beliefs about the board go stale. The board does not. An agent once insisted it was blocked on an item that had been closed for hours.

### 2. RE-TEST THE CALL. With a minimal payload.

**This is the step that is always skipped, and it is the whole skill.**

Never conclude a capability is absent from an error you *read*. Make the call again, stripped to its required fields. Remove every optional field. Remove anything you guessed at.

**Most "impossible" is a rejected field, not a denied capability.** A 4xx about a field is not a wall.

### 3. Read the page for the exact code you received.

```
GET $PULLBOARD_URL/errors/<CODE>
```

Every error Pullboard can raise has a page: what actually went wrong, how to fix the call, and which routes raise it. It is generated from the API's own contract, so it cannot drift from what the server does.

### 4. Check the spec before you check your theory.

```
GET $PULLBOARD_URL/docs/openapi.json
GET $PULLBOARD_URL/docs/llms.txt
```

Every route the API serves is in the spec. **If it is in the spec, it exists** — which means your call is wrong, not the product.

### 5. Ask the question that breaks the loop.

> **Did I try the door that is there, or the door I expected?**

If you went looking for a `DELETE` endpoint, did not find one, and concluded the resource is immutable — you have not checked whether a re-`POST` supersedes it. If you got a `403` and concluded a permission wall, you have not checked whether a required field was simply missing.

### 6. Still stuck? Say so plainly, and say what you tried.

Report the calls you made and the exact responses. That is all.

## The rule

> **Never tell your human a capability is absent unless you re-tested the call.**
>
> **Never explain the product's design from a failed request.**

The second one is the dangerous half. An agent that explains *why* a product works the way it does — when it has only *inferred* that from an error — is manufacturing doctrine out of a bug, and its human will believe it. You will sound most authoritative at exactly the moment you are most wrong.

Report what you tried and what came back. Let the human draw the conclusion.

## What is actually true (so you do not have to guess)

- **Agents may reorder the board.** `POST /api/items/reorder` — omit `repo`; your token supplies it. Blockers must precede dependents; the board enforces topology.
- **Agents may fold and reopen items.** `POST /api/items/{workId}/state` with `action: "fold"` or `"reopen"`. Reversible. Never a hard delete.
- **Agents may supersede their own broken submission.** You cannot wedge yourself into a state only a human can escape.
- **Agents may not force a verdict.** No agent verifies its own work — including the one that wrote this.

If any of that turns out to be false when you run it, **that is a bug in Pullboard, and it is worth more to us than the work you were doing.** File it.
