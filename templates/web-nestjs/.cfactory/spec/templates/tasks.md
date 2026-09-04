# {{title}} — Tasks

Checklist syntax (required for CFactory wave scheduling):

- `[ ]` pending, `[~]` in progress, `[x]` done, `[P]` may run in parallel with siblings
- Nested checkbox items depend on their parent
- Metadata under a task: `_Depends: 1, 2.1_`, `_Requirements: FR-001_`, `_Optional_`

Task title rules: describe the **business outcome**, not the technical artifact.
Under each task, include What / Why / Acceptance as plain bullets (not checkboxes).

**Organization**: setup → foundational → user stories (P1 first).

## Phase 1: Setup

- [ ] 1. Establish project foundation and developer tooling
  - What: directories, ignore files, and task runner targets per design
  - Why: shared layout for later tasks
  - Acceptance: install/lint targets succeed on an empty baseline
  - _Requirements: FR-001_
- [P] 2. Secure application secrets and configuration
  - What: `.env.example`, config loader, fail-fast on missing vars
  - Why: prevent secret leakage; explicit onboarding
  - Acceptance: missing required env prints an actionable error

## Phase 2: Foundational

- [ ] 3. Enable versioned data schema evolution
  - What: migration tool + baseline migration
  - Why: reproducible schema for entities in design
  - Acceptance: migrate up/down is idempotent
  - _Depends: 1, 2_
- [P] 4. Secure API endpoints with identity verification
  - What: auth middleware / session validation as designed
  - Why: NFR security; shared by story endpoints
  - Acceptance: valid credentials reach handlers; invalid get 401/403

## Phase 3: User Story 1 (P1) — MVP

- [ ] 5. Deliver primary user-story outcome
  - What: concrete classes/endpoints/files
  - Why: US1 / FR-…
  - Acceptance: independent test from requirements passes
  - _Requirements: FR-001_
  - _Depends: 3, 4_
- [P] 6. Complete parallelizable follow-on for story 1
  - What: supporting surface for story 1
  - Why: US1
  - Acceptance: story 1 independent test still passes
  - _Depends: 5_

## Phase 4: User Story 2 (P2)

- [ ] 7. Deliver secondary user-story outcome
  - What: concrete artifacts for story 2
  - Why: US2
  - Acceptance: story 2 independent test passes
  - _Depends: 5_

## Phase 5: Polish

- [ ] 8. Harden observability and operator docs
  - _Optional_
  - _Depends: 7_
