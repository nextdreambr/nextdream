# ADR 0005: Managed Patient Access Linking

## Status
Accepted

## Context
Institution-operated cases need a way to invite the real patient into the platform without transferring operation of the case away from the institution. The patient must be able to see dreams, proposals, and conversations related to their own case, while supporters must continue to understand that the beneficiary is the patient and the operator is the institution.

Without an explicit linking model, two bad outcomes follow:
- the institution would have to create and manage fake patient credentials;
- the patient would either remain fully outside the product or would incorrectly gain direct operator privileges over proposals and conversations already being mediated by the institution.

## Decision
Introduce a first-class invite-and-link flow for managed patients.

- Add `PatientInvite` as a dedicated entity for institution-issued patient access invites.
- Let the institution invite a managed patient by email from the patient detail page.
- When the invite is accepted, create or link a real `User` with role `paciente` and persist the association through `ManagedPatient.linkedUserId`.
- Expose `accessStatus`, pending invite metadata, and linked user metadata in institutional patient reads.
- Allow linked patients to see all dreams, proposals, notifications, and conversations tied to their managed case.
- Keep institution-operated conversations read-only for the linked patient while the institution remains the operator.
- Enrich dream, proposal, and conversation payloads with beneficiary and institution-operator context so both the institution UI and supporter UI can render the relationship explicitly.

## Consequences
Positive:
- institutions can onboard the real patient without breaking the mediated flow;
- patients gain transparent visibility into their own case;
- supporters see clearer context about who benefits from the case and who is operating it;
- auditability improves because invites, linkage, and operator boundaries are explicit.

Tradeoffs:
- access semantics become more nuanced because visibility and mutation rights now differ inside the same case;
- auth, conversation, and dream queries must account for linked managed-patient visibility;
- invite lifecycle management becomes part of the domain and seed/test coverage.
