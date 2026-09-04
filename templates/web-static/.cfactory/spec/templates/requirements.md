# {{title}}

## Business Proposition *(mandatory)*

<!--
  WHAT the feature delivers to the business and its users — NOT how it is built.
  This is the source of truth for summaries across design, tasks, issues, and PRs.

  Rules:
  - Write 2–4 sentences from the end-user or stakeholder perspective
  - Focus on: who benefits, what they can do, and why it matters
  - Do NOT mention frameworks, libraries, SDKs, protocols, databases, queues, or architecture
  - Use domain language a non-technical stakeholder would understand
-->

[2–4 sentences: who benefits, what they can do, and why it matters — no technical implementation details]

## User Scenarios & Testing *(mandatory)*

<!--
  Prioritize user stories as independently testable journeys (P1, P2, P3…).
  Each story should be developable, testable, deployable, and demoable on its own.
  Write stories in business language. Acceptance scenarios use Gherkin with observable outcomes.
-->

### User Story 1 - [Brief Title] (Priority: P1)

**As a** [business actor / user profile]
**I want** [business capability / objective]
**So that** [business value / expected outcome]

[1–2 short paragraphs describing the journey in business language]

**Why this priority**: [Value and why this priority]

**Independent Test**: [How this story can be verified alone]

**Acceptance Scenarios**:

```gherkin
Scenario: [Happy path title]
  Given [initial business context]
  When [business action]
  Then [expected business outcome]

Scenario: [Alternative or rule variation]
  Given [initial business context]
  And [additional condition]
  When [business action]
  Then [expected business outcome]
```

---

### User Story 2 - [Brief Title] (Priority: P2)

**As a** [business actor / user profile]
**I want** [business capability / objective]
**So that** [business value / expected outcome]

[1–2 short paragraphs]

**Why this priority**:

**Independent Test**:

**Acceptance Scenarios**:

```gherkin
Scenario: [Main scenario title]
  Given [initial business context]
  When [business action]
  Then [expected business outcome]
```

---

### Edge Cases

- What happens when [boundary condition]?
- How does the system handle [error scenario]?
- What if [concurrency / offline / timeout] occurs?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]

*Mark unclear items explicitly:*

- **FR-004**: System MUST [NEEDS CLARIFICATION: what is unclear]

### Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | NFR-001: [e.g. p95 latency under load] |
| Scalability | NFR-002: |
| Availability | NFR-003: |
| Security | NFR-004: |
| Observability | NFR-005: |

### Key Entities *(if the feature involves data)*

- **[Entity 1]**: [What it represents; key attributes without implementation]
- **[Entity 2]**: [Relationships to other entities]

## Architectural Considerations *(mandatory)*

<!--
  Evaluate whether each concern is needed. Do NOT add infrastructure by default — justify each YES.
-->

### Caching

- **Needed?** [YES / NO / EVALUATE LATER]
- **Justification**:
- **What to cache** / **Invalidation**:

### Message Queues / Async Processing

- **Needed?** [YES / NO / EVALUATE LATER]
- **Justification** / **Use cases** / **Failure handling**:

### Event Streaming

- **Needed?** [YES / NO / EVALUATE LATER]
- **Justification** / **Use cases**:

### Background Jobs / Scheduled Tasks

- **Needed?** [YES / NO / EVALUATE LATER]
- **Use cases**:

## Success Criteria *(mandatory)*

- **SC-001**: [Measurable outcome]
- **SC-002**: [User or business metric]

## Out of Scope

-
