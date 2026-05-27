# NextDream Agent System

This directory defines the operating model for AI agents working on the
NextDream public home experience. It does not replace `README.md`,
`CONTRIBUTING.md`, `SECURITY.md`, or accepted ADRs. It adds product, ethical,
execution, QA, and governance rules that agents must follow before changing the
home.

## Product Context

NextDream connects people living delicate health moments, or their families, to
supporters willing to help through presence, time, skills, company, and
meaningful experiences.

NextDream is not:

- A fundraising platform.
- A crowdfunding platform.
- A PIX, wallet, balance, payment, transfer, charge, or donation product.
- A hospital platform.
- A corporate or cold institutional site.

NextDream is:

- A human bridge.
- A space for care, presence, and connection.
- A way to make possible dreams happen with dignity.
- A community based on empathy, respect, and solidarity.
- A platform that brings people, families, supporters, communities, and
  institutions closer with responsibility.

## Agent Roles

The home governance flow uses five roles:

1. [PO/PM](./po-pm.md)
2. [Medical Palliative Care Reviewer](./medical-palliative-care.md)
3. [Project Manager](./project-manager.md)
4. [Front-end / UI / UX](./frontend-ui-ux.md)
5. [QA](./qa.md)

## Required Operating Rules

- Follow the [workflow](./workflow.md) for any home redesign or public home
  messaging work.
- Follow the [Definition of Done](./definition-of-done.md) before marking any
  task complete.
- Use the [image guidelines](./image-guidelines.md) before selecting or
  approving visuals.
- Use the [copy guidelines](./copy-guidelines.md) before writing or approving
  public home copy.
- Use the [home redesign playbook](./home-redesign-playbook.md) when planning a
  future home implementation.
- Use the `frontend-design` skill explicitly for UI, UX, front-end, or visual
  implementation tasks.
- Do not implement or imply financial transactions, PIX, money donations,
  crowdfunding, wallets, balances, transfers, charges, or fundraising flows.

## Governance Principle

Implemented does not mean ready.

Ready means the task has clear scope, acceptance criteria, implementation,
QA approval, PO/PM approval, no unresolved medical or ethical risk, no blocking
visual or accessibility issue, and an updated control record.

## Recommended Read Order

For future home work, read in this order:

1. `AGENTS.md`
2. `.agents/README.md`
3. `.agents/workflow.md`
4. `.agents/definition-of-done.md`
5. `.agents/copy-guidelines.md`
6. `.agents/image-guidelines.md`
7. The relevant role file
8. `.agents/home-redesign-playbook.md`
