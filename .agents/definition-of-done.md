# Definition of Done

This Definition of Done applies to home redesign and public home communication
tasks.

## Task-Level Definition of Done

A task can be considered `Pronta` only when:

1. It has clear scope.
2. It has objective acceptance criteria.
3. It was executed by Front-end when implementation is required.
4. It was validated by QA.
5. It was reviewed and approved by PO/PM.
6. It has no medical or ethical pending item.
7. It has no blocking reservation.
8. It was registered in the control board.
9. Mobile and desktop were considered.
10. Basic accessibility was verified.

## Required Evidence

Each completed implementation task must provide:

- Files changed.
- Summary of what changed.
- Acceptance criteria evidence.
- QA result.
- PO/PM result.
- Medical result when required.
- Commands executed.
- Screenshots or responsive evidence when UI changed.
- Accessibility checks performed.
- Known risks or limitations.

## Required Quality Gates

Before concluding a task in this repository, run from the repository root:

```bash
rtk npm run lint
rtk npm run typecheck
rtk npm run test
```

If a command fails:

- Record the command.
- Record the error.
- Identify whether the failure is related to the task.
- Fix task-related failures.
- Escalate unrelated failures without hiding them.

## Medical/Ethical Done Criteria

For any home task involving copy, image, CTA, story framing, consent, privacy, or
vulnerable groups:

- Medical Reviewer approval is required.
- Any medical/ethical concern blocks `Pronta`.
- Copy must not create false hope.
- Visuals must not exploit suffering.
- Consent and privacy must be preserved.

## Accessibility Done Criteria

At minimum:

- Links and buttons have clear names.
- Keyboard focus is visible.
- Text contrast is acceptable.
- Text is readable on mobile.
- Heading order is coherent.
- Relevant images have meaningful alt text.

## Not Done

A task is not done if:

- It is only implemented.
- QA has not approved it.
- PO/PM has not approved it.
- Medical/ethical risk is unresolved.
- Mobile was not considered.
- Accessibility was not considered.
- Acceptance criteria are vague or unmet.
- A blocking reservation remains open.
