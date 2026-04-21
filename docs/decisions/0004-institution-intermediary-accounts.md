# ADR 0004: Institution Intermediary Accounts

## Status
Accepted

## Context
The product previously modeled only two operational roles around a dream:
- `paciente`, who both represented the beneficiary and operated the case;
- `apoiador`, who discovered dreams, sent proposals, and chatted after acceptance.

That model does not fit hospitals, NGOs, and similar organizations that need to intermediate the journey on behalf of real patients. Reusing ordinary patient accounts for those institutions would blur identity, ownership, and auditability by mixing the beneficiary with the operator.

## Decision
Introduce a first-class institutional account model.

- Add a new authenticated role: `instituicao`.
- Keep authenticated identities in `User`.
- Introduce a separate managed beneficiary entity, `ManagedPatient`, owned by an institution account.
- Store institutional and managed-patient location as structured `state + city`, exposing a formatted label for UI reads.
- For institutional dreams, store the operator as the institution user and the real beneficiary as `managedPatientId`.
- Keep proposals and conversations attached to the dream flow, but treat the institution as the patient-side operator in v1.
- Require manual admin approval before an institution can operate patients, dreams, proposals, and conversations.
- Keep the institutional console aligned with the patient shell pattern so navigation, notifications, and operational affordances remain consistent across personas.

## Consequences
Positive:
- hospitals and NGOs can operate multiple beneficiaries without creating fake patient logins;
- the system now separates who the beneficiary is from who is operating the case;
- admin approval adds a basic trust gate before institutional accounts become active;
- the model is ready for a future handoff where a managed patient can later receive their own login.

Tradeoffs:
- dream and conversation ownership semantics become more complex because operator and beneficiary can differ;
- admin tooling and frontend navigation must explicitly support a third operational role;
- a future self-service multi-operator institution model will still require additional work.
