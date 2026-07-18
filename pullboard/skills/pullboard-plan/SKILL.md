---
name: pullboard-plan
description: Turn a stated product intent, Pullboard Vision output, or an existing repository and messy backlog into an approved Pullboard board with independently completable items, observable criteria, dependency edges, and a topologically sound priority chain. Use when a board is empty, the human has a goal but has not decomposed it, or existing work needs to be converted into an executable plan before builders claim it.
role: Plan the real board
tags: [plan, decompose, dependencies, approval]
---

# Plan work into Pullboard

Set `PULLBOARD_URL` to the Pullboard origin and `PULLBOARD_TOKEN` to this agent's workspace-scoped Bearer token. Send `Authorization: Bearer $PULLBOARD_TOKEN` on every request. Never print the token or place it in a plan, item, shout, file, or command output.

Produce a proposed plan first. Do not create or reorder board items until the human explicitly approves the complete preview.

## Establish the planning source

Accept either source:

- **Stated intent:** Use the human's outcome, constraints, non-goals, and success evidence. If the intent is still ambiguous, run `pullboard-vision` or ask only the questions whose answers materially change the plan.
- **Existing mess:** Inspect the repository's governing instructions, current architecture, tests, active failures, and relevant backlog. Summarize outcomes and boundaries; never copy source, diffs, prompts, raw logs, artifacts, secrets, or private research into Pullboard.

Do not invent requirements to make the plan look complete. Mark consequential assumptions and resolve them with the human before approval.

## Read shared state before drafting

Read shouts first, then status:

```bash
curl -fsS "$PULLBOARD_URL/api/shouts" \
  -H "Authorization: Bearer $PULLBOARD_TOKEN"
curl -fsS "$PULLBOARD_URL/api/status" \
  -H "Authorization: Bearer $PULLBOARD_TOKEN"
```

Use the server-owned items, order, dependencies, and `orderVersion`. Reconcile the proposed work against existing items. Reuse the canonical item when work already exists; never create a near-duplicate to escape `WORK_EXISTS`.

## Decompose into executable items

Create the smallest honest graph that can deliver and verify the outcome. For each item:

1. Generate a stable unique `workId` before previewing the plan; keep it unchanged through approval and creation.
2. State one concrete outcome in the title and description.
3. Add observable acceptance criteria that a different agent can verify without guessing intent.
4. Keep the item independently claimable and bounded. Split umbrella work whose children can complete separately.
5. Assign only real blocker edges. A blocker must produce something the dependent actually needs.
6. Put blockers before dependents. Keep parallel siblings adjacent and free of artificial edges.
7. Use `now`, `next`, and `backlog` to express product priority without violating dependency order.

Keep titles at most 160 characters, descriptions at most 4,000 characters, and each item's criteria to at most 20 rows of 500 characters each.

Reject these plan defects before showing the preview:

- a cycle, self-edge, duplicate item, or blocker placed after its dependent;
- a criterion that only says "implemented", "works", or "tests pass" without an observable behavior;
- an operator-only decision disguised as build work;
- seeded, demo, canary, or speculative work presented as real inventory;
- more than 50 new items in one batch. Split a larger plan into separately approved batches.

## Obtain approval before mutation

Show one compact preview containing:

- the intended outcome and non-goals;
- every proposed item with its stable `workId`, title, criteria, priority, and blocker IDs;
- the resulting topological order;
- assumptions or decisions still owned by the human;
- existing items that will remain, move, or be reused.

Ask the human to **approve, revise, or cancel** the plan. Treat silence, partial feedback, and approval of only the goal as no approval to mutate. If the board changes materially after approval, re-read it and obtain approval for the revised graph.

## Create the approved graph atomically

Use one fresh UUID as `requestId` and one `POST /api/items/batch`. Omit `repo`; the authenticated workspace supplies it. Relations may reference stable IDs in the same batch.

```json
{
  "items": [
    {
      "workId": "STABLE_ID_A",
      "title": "Define the observable contract",
      "description": "Record the behavior builders and verifiers must share.",
      "criteria": ["The contract names inputs, outputs, and fail-closed behavior with executable examples."],
      "track": "product",
      "priority": "now",
      "blockerIds": []
    },
    {
      "workId": "STABLE_ID_B",
      "title": "Implement the approved contract",
      "description": "Build only after the contract item closes.",
      "criteria": ["The public behavior matches every approved contract example."],
      "track": "product",
      "priority": "next",
      "blockerIds": ["STABLE_ID_A"]
    }
  ],
  "requestId": "FRESH_UUID"
}
```

Post the approved JSON from a local temporary file so shell interpolation cannot corrupt it:

```bash
curl -fsS -X POST "$PULLBOARD_URL/api/items/batch" \
  -H "Authorization: Bearer $PULLBOARD_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @approved-plan.json
```

The batch is atomic. On a network retry, send the identical body and `requestId`. On `IDEMPOTENCY_MISMATCH`, `WORK_EXISTS`, a cycle, or an invalid relation, re-read the board; do not improvise replacement IDs or create items one by one.

## Install the approved priority chain

Re-read `GET /api/status` after batch creation. Build the full ordered list for the target repo, including every pre-existing and new item exactly once. Preserve approved relative order, keep every blocker before its dependents, and use the latest `orderVersion` as `expectedVersion`.

```json
{
  "repo": "WORKSPACE_REPO_FROM_STATUS",
  "workIds": ["BLOCKER_ID", "DEPENDENT_ID", "OTHER_EXISTING_ID"],
  "expectedVersion": 42,
  "requestId": "ANOTHER_FRESH_UUID"
}
```

POST this body to `/api/items/reorder`. On `ORDER_VERSION_MISMATCH`, re-read status and reconcile; never overwrite concurrent planning blindly. On a topology error, repair the proposed order or dependencies and obtain human approval if the meaning changes.

## Confirm the board exists

Read status again and verify post-state instead of trusting successful responses:

- every approved item exists exactly once;
- criteria and dependency edges match the approved preview;
- every blocker precedes its dependents;
- the complete repo order contains no missing or extra IDs;
- the highest-priority unblocked item is the honest next claim.

Post one concise shout that the approved plan landed and name the next unblocked outcome. Keep it under 900 characters and omit source, diffs, logs, prompts, artifacts, and secrets. If confirmation fails, report the exact mismatch and stop; never claim the board was populated successfully.
