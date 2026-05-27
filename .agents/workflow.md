# Home Governance Workflow

This workflow applies to any future NextDream home redesign, public home copy
change, public home image change, or public home journey change.

## Required Flow

1. PO/PM, Medical Reviewer, and Project Manager align direction.
2. Project Manager creates all required tasks.
3. Front-end executes prioritized tasks.
4. QA validates each delivery.
5. When QA rejects or approves with reservations, Project Manager creates or
   reopens adjustment tasks.
6. PO/PM performs final product review after QA approval.
7. When PO/PM requests adjustments, Project Manager creates or reopens tasks.
8. When Medical Reviewer identifies ethical, emotional, or communication risk,
   Project Manager creates a blocking task.
9. The cycle repeats until no critical pending items remain.
10. Project Manager marks a task `Pronta` only after QA and PO/PM approval and
    no unresolved medical/ethical blocker.

## Core Rule

Implemented does not mean ready.

Ready means:

- Code changed.
- Acceptance criteria met.
- QA approved.
- PO/PM approved.
- No medical or ethical pending item.
- No visual, functional, responsive, or accessibility blocker.
- The control board was updated.

## Required Control Board

The Project Manager must maintain a board with these columns:

| Task | Origin | Priority | Status | Front-end | QA | PO/PM | Medical | Blockers | Next action |
|---|---|---|---|---|---|---|---|---|---|

## Task Status Lifecycle

Recommended lifecycle:

1. `A criar`
2. `Criada`
3. `Em execução`
4. `Em revisão QA`
5. `Aguardando review PO/PM`
6. `Pronta`

Failure or adjustment paths:

- `Reprovada pelo QA`
- `Ajuste solicitado`
- `Reprovada pelo PO/PM`
- `Bloqueada por revisão médica`

## QA Feedback Handling

If QA rejects or approves with reservations, Project Manager must decide and
record one of:

- Reopen original task.
- Create a new adjustment task.
- Create a blocking task.
- Convert to future improvement.
- Ask PO/PM for decision.
- Ask Medical Reviewer for decision.

If the reservation affects safety, clarity, accessibility, mobile usability, or
medical/ethical risk, it is blocking unless PO/PM and Medical Reviewer
explicitly decide otherwise.

## PO/PM Feedback Handling

If PO/PM rejects or requests adjustment, Project Manager must create or reopen a
task with:

- Origin: Review PO/PM.
- Product problem.
- Journey impact.
- Required adjustment.
- Priority.
- Responsible agent.
- Required validation.
- Whether QA rerun is required.

## Medical Feedback Handling

If Medical Reviewer identifies risk, Project Manager must create a blocking task
with:

- Origin: Medical/ethical review.
- Risk identified.
- Possible patient, family, supporter, or institution impact.
- Affected copy, image, CTA, alt text, or flow.
- Required correction.
- Priority.
- Responsible agent.
- Required validation: Medical Reviewer, QA, and PO/PM.

## Front-end Technical Feedback Handling

If Front-end identifies technical limitation or implementation debt that affects
criteria, Project Manager must create or update a task with:

- Origin: Front-end.
- Technical issue.
- Delivery impact.
- Affected files/components.
- Proposed solution.
- Priority.
- Required validation.
