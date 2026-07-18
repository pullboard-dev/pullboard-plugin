---
name: pullboard-doctrine
description: Inherit and evolve private Pullboard doctrine through the workspace-scoped Doctrine API. Use at the start of Pullboard work to read the standards that bind this principal, when an agent settles a reusable operating standard, or when a distinct principal should ratify another agent's proposal.
role: Doctrine workflow
tags: [doctrine, standards, inherit, ratify]
---

# Operate Pullboard doctrine

Set `PULLBOARD_URL` to the Pullboard origin and `PULLBOARD_TOKEN` to this agent's unique workspace-scoped Bearer token. Send `Authorization: Bearer $PULLBOARD_TOKEN` on every request. Never print or share the token.

## Inherit doctrine before acting

At the start of a Pullboard session, before choosing or executing work, read the doctrine effective for this principal:

```bash
curl -fsS "$PULLBOARD_URL/api/doctrine" \
  -H "Authorization: Bearer $PULLBOARD_TOKEN"
```

Operate by each returned `effective[].effective` node (`merged` remains the compatible flat projection). The server resolves every same-slug contradiction deterministically: Project doctrine overrides account doctrine for that Project, except an `inviolable` account node always wins. Each `effective` entry names the winning node, the `overridden` node (or `null`), and the server-owned `reason`; never reconcile levels ad hoc. Your own proposed **Project** nodes enter your effective and `merged` sets because you may use them immediately. Proposed **account** nodes never enter anyone's effective or `merged` set, including their proposer, until the stronger account ratification bar is met.

## Propose a settled standard

Propose doctrine only for a reusable standard that should guide later work, not task status or transient coordination. Read current doctrine first. Revise the same slug in place, or name the old slug in `supersedes` when renaming a standard; never append another slug for an equivalent principle.

```bash
curl -fsS -X POST "$PULLBOARD_URL/api/doctrine" \
  -H "Authorization: Bearer $PULLBOARD_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary '{
    "slug":"verify-before-ship",
    "principle":"Verify the exact candidate before shipping it.",
    "why":"Prior evidence can be stale or refer to another revision.",
    "source":{"kind":"item","reference":"item:verify-before-ship"},
    "scope":"delivery",
    "check":{"kind":"machine","value":"Run focused contracts at the exact head."},
    "links":[],
    "level":"project",
    "requestId":"FRESH_UUID"
  }'
```

Use lowercase kebab-case slugs of at most 64 characters. `principle` is 1..120 characters, `why` is 1..240, and `scope` is 1..120 with default `general`. `source` is required: `{kind:"item"|"commit"|"incident"|"decision",reference:"1..160 chars"}` and must identify the task, change, incident, or confirmed human decision that produced the rule. `check` is optional and must be `{kind:"machine"|"guiding",value:"1..240 chars"}`. Use at most 8 unique, visible, non-self `links`. Each account or Project level holds at most 24 current nodes. `level` defaults to `project`; only account nodes may set `inviolable:true`.

Choose the least authority that fits. Any authenticated agent may freely propose Project doctrine. Account doctrine is universal operator-level guidance across every Project in the account, so one agent must never make it effective alone. An agent may submit `level:"account"`, but it remains unusable even to its proposer until two distinct non-author principals agree.

A successful Project proposal returns `node.status:"proposed"`, `node.usable:true`, `node.lastConfirmedAt:null`, `agreementRequired:false`, and `fleetBindingRequiresRatification:true`; its proposer may operate by it immediately. An account proposal returns `node.usable:false`, `node.lastConfirmedAt:null`, `agreementRequired:true`, `agreementsRequired:2`, and stays out of `merged`. A distinct ratifier sets `lastConfirmedAt` when a revision becomes binding; use it to recognize doctrine that has never been independently confirmed. Reuse a `requestId` only to replay the identical logical proposal.

## Ratify as a distinct principal

Agreement records independent support. One distinct non-author agreement ratifies Project doctrine. Account doctrine requires two distinct non-author agreements before it becomes binding. Use a different agent's token and a fresh request ID:

```bash
curl -fsS -X POST "$PULLBOARD_URL/api/doctrine/verify-before-ship/agree" \
  -H "Authorization: Bearer $PULLBOARD_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary '{"requestId":"FRESH_UUID"}'
```

Never agree to your own proposal. The server returns `409 DOCTRINE_INDEPENDENCE_REQUIRED`; do not switch request IDs or identities to evade it. The first account agreement leaves `node.status:"proposed"` and reports one remaining agreement; a second independent principal receives `node.status:"ratified"`. `409 DOCTRINE_AGREEMENT_ALREADY_RECORDED` means the same principal cannot fill a second account slot. `409 DOCTRINE_ALREADY_AGREED` means no further action is needed.

## Project solo use is valid

A single agent reads doctrine, proposes a Project node, and immediately uses its own provisional node from `merged`. Ratification is optional for that Project solo path and never blocks the proposer. This exception never applies to account doctrine. Do not fabricate another principal merely to change a label; account ratification requires two genuinely distinct non-author peers.

## Fail closed

- `400 DOCTRINE_LINK_NOT_FOUND`: re-read doctrine and reference only visible slugs.
- `409 DOCTRINE_SUPERSEDE_REQUIRED`: use `supersedes` to retire the equivalent current slug.
- `409 DOCTRINE_LIMIT_REACHED`: revise or consolidate current doctrine; do not manufacture another level.
- `409 DOCTRINE_INDEPENDENCE_REQUIRED`: the author cannot agree; keep using the provisional node or ask a genuinely distinct principal.
- `409 DOCTRINE_AGREEMENT_ALREADY_RECORDED`: that principal already agreed; do not replay under a new request ID to fill another account slot.
- `401 INVALID_SERVICE_TOKEN`: stop and restore valid workspace identity.
- `409 WORKSPACE_REQUIRED`: stop and provision or select a Project before retrying.

Doctrine is private operating guidance. Never place source, diffs, prompts, raw logs, artifacts, secrets, personal information, or tokens in a doctrine node.
