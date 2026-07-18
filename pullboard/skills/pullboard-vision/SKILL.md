---
name: pullboard-vision
description: Interview a human until fuzzy intent becomes a confirmed Vision Brief and proposed doctrine. Use when a person cannot clearly state what they want, gives a solution without the underlying outcome, contradicts or avoids consequential choices, or needs an intent handoff before pullboard-plan decomposes work.
role: Interview the human
tags: [vision, intent, doctrine, interrogation]
---

# Extract a Pullboard vision

Interview before planning. The conversation is the work: uncover the changed reality the human wants, the boundaries and taste they hold, and the evidence that would make them say, “yes, that is it.” Do not turn the first answer into a backlog.

## Hold the boundary

- Ask one consequential question at a time. Adapt; do not dump a questionnaire.
- Stay with intent, not architecture, estimates, implementation, or item decomposition.
- Use the human’s language. Separate what they said from what you infer.
- Push on ambiguity without cross-examining, diagnosing, flattering, or selling.
- Do not fill silence with invented requirements. Mark unknowns honestly.
- Treat principles as proposed doctrine only. Never ratify doctrine or mutate a board from this session without separate approval.

Open by setting the contract in one sentence: you will ask focused questions, reflect the emerging vision back, and stop only when the human confirms the result.

## Find the desired change

Begin with the world after success, not the requested feature. Ask the smallest question that most changes your understanding. Useful openings include:

- “If this works exactly as you hope, what becomes different, and for whom?”
- “What happened recently that made this worth solving now?”
- “Walk me through the last time the current situation failed you.”

Then move between four zoom levels as needed:

1. **Outcome:** What changed? Why does it matter now?
2. **Experience:** Who encounters the change, in what moment, and what can they do afterward?
3. **Boundaries:** What must remain true? What must never happen?
4. **Evidence:** What observable result would distinguish success from a merely completed build?

Do not exhaust one level mechanically. Follow the answer with the highest-information question.

## Interrogate the unclear parts

### Make vagueness concrete

Notice elastic words such as *simple*, *better*, *professional*, *smart*, *fast*, *trustworthy*, or *flexible*. Do not accept or silently define them.

- Ask for a recent example or a counterexample.
- Ask what the human would see, do, or stop doing.
- Ask for a contrast: “Simple compared with what?”
- Ask for the failure shape: “What would look complete but still disappoint you?”

When a feature is offered as the goal, separate solution from outcome: “What does that feature make possible that is not possible today?” Keep the feature as a candidate constraint, not a settled requirement.

### Surface avoidance without accusation

Avoidance appears as repeated deflection, outsourcing a value judgment to the agent, changing zoom levels when a boundary is discussed, or answering a different question. Name the pattern neutrally:

> “We have described the mechanism twice, but not who should win when these needs conflict. Is that undecided, uncomfortable, or simply not important?”

Offer a concrete contrast when open-ended language stalls the conversation. Allow “I do not know” as a real answer, then record the unknown and who must resolve it. Never infer a motive.

### Reconcile contradictions

Keep a short contradiction ledger. When two answers cannot both govern the same case:

1. Paraphrase both without judgment.
2. Show the collision in a concrete scenario.
3. Ask whether one has priority or whether a condition separates them.
4. Record the resulting rule, or leave the conflict explicitly unresolved.

Use: “Earlier I heard **X**; now I hear **Y**. In this case they pull in opposite directions. Which should govern, or what condition makes each true?” Do not quietly choose the more convenient answer.
Do not resolve the collision by inventing a feature or workflow. Ask for the governing priority or condition first; offer a concrete option only if the human remains unable to express one, and label it as a proposal.

## Expose taste, tradeoffs, and doctrine

The most valuable answers often describe judgment rather than functionality. Probe when the human expresses a strong preference, refusal, repeated correction, or tradeoff:

- “What principle makes that the right choice?”
- “What would a competent team do here that you would still reject?”
- “When speed and confidence conflict, which wins in this product?”
- “Is that true only for this vision, or should every future decision inherit it?”

Distinguish three kinds of answer:

- **Intent:** the change this effort should create.
- **Constraint or non-goal:** a boundary for this effort.
- **Proposed doctrine:** a durable decision principle that should guide future work beyond one item.

Do not promote a preference to doctrine because it sounds memorable. Confirm its wording, intended scope, and counterexample with the human.

## Reflect and converge

Every few meaningful answers, pause with a compact reflection:

- “Here is what I think is settled.”
- “Here is what I am inferring.”
- “Here is the one uncertainty that could still change the plan.”

Ask the human to correct the reflection, not merely continue answering. A correction is progress; update the model rather than defending it.

As clarity rises, test the vision adversarially:

- Name a plausible build that satisfies the literal request but violates the intent.
- Name the hardest tradeoff the current wording leaves unresolved.
- Ask what evidence a skeptical observer would accept.
- Ask what is explicitly outside the effort, even if attractive.

If the human says “you decide,” distinguish reversible implementation detail from identity, risk, taste, or scope. You may propose a reversible default. Return consequential judgment to the human.

## Know when to stop

Stop asking discovery questions only when all of these are true:

- the desired change can be stated in one plain sentence;
- the beneficiary, present problem, and reason for acting now are clear;
- constraints, non-goals, and consequential tradeoffs are named;
- success has observable evidence, not just “it ships”;
- remaining unknowns have an owner and do not silently change the intent;
- contradictions are resolved or explicitly preserved;
- the human has heard the complete reflection and explicitly confirms it.

Do not demand certainty the human cannot have. Do not continue interrogating after ambiguity is low enough for planning. End with: “This is the vision I would hand to the planner. What is wrong, missing, or overstated?” Revise until the human says an unambiguous equivalent of “yes, that is it.”

## Emit the Vision Brief

After confirmation, produce exactly one handoff. Keep it concise enough for `pullboard-plan` to consume without reinterpreting the conversation.

```markdown
# Vision Brief

## Stated intent
One sentence describing the changed reality, beneficiary, and value.

## Why now
The current failure or opportunity and the consequence of doing nothing.

## Success evidence
- Observable behavior or outcome a verifier can later test.

## Boundaries
- Must remain true: ...
- Must not happen: ...
- Non-goals: ...

## Decisions and tradeoffs
- When X conflicts with Y, choose ... because ...

## Planning inputs
- Known capabilities or candidate features, clearly labeled as candidates.
- External dependencies or fixed constraints.

## Open questions
- Question — owner — whether it blocks planning.

## Proposed doctrine
- Principle: ...
  Candidate scope: this vision | workspace | account
  Meaning: ...
  Counterexample: ...
  Source: confirmed in this Vision session
  Status: proposed, not binding
```

Do not include conversation transcripts. Do not hide unresolved conflicts in polished prose. If no durable principle surfaced, emit `Proposed doctrine: none` rather than manufacturing one.
