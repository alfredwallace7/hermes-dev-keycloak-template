---
trigger: always_on
---

# Coding Practices & Standards

This document defines **mandatory, non-negotiable** coding standards for the project.
All human contributors **and autonomous AI agents** MUST comply.

Failure to follow these rules is considered a defect.

---

## 1. Hard Typing

- Strong typing is mandatory.
- Do not use untyped or loosely typed values in application logic unless they originate from a system boundary.
- Data from system boundaries MUST be validated and narrowed immediately before use.

Examples of system boundaries include:

- external APIs
- request payloads
- deserialized JSON
- message queues
- webhooks
- user input
- environment-derived configuration

Rules:

- All function and method parameters must have explicit types.
- All function and method return types must be explicit.
- Object-like structures must use named types appropriate to the language and ecosystem.
- Union-like or alias types must use the idiomatic construct provided by the language.
- Strict type-checking settings MUST remain enabled where supported.
- Untyped maps, generic catch-all objects, and unrestricted dynamic structures are forbidden in business logic.
- Type violations are considered bugs, not style issues.

Additional expectations:

- Schema validation libraries SHOULD be used for external data validation.
- Boundary types MUST be narrowed as early as possible.
- Assertions should be a last resort and must be justified.

---

## 2. File Size Limits

- **Soft limit: 300 lines**
- **Hard limit: 500 lines**

Applies only to **project source code**.

Excluded:

- external dependencies
- generated code
- build artifacts
- vendor code
- configuration files

If a file exceeds 300 lines, you MUST:

- split logic into smaller modules
- extract reusable helpers, services, or components
- move constants and utility functions into dedicated files

Files exceeding 500 lines REQUIRE:

- explicit justification in code review
- approval before merge

---

## 3. Best Practices

### General

- **DRY**: shared logic belongs in reusable modules.
- **KISS**: prefer clarity over abstraction.
- **Naming**:
  - no unnecessary abbreviations
  - no single-letter variables except trivial loops or well-known conventions
- Side effects at import or module load time are forbidden.
- Use structured logging.
- Direct console output is forbidden outside local debugging tools or tests.
- Use asynchronous patterns consistently where applicable.
- Do not mix incompatible async styles in the same code path.
- Prefer pure functions where possible.
- Keep units small and focused on one responsibility.
- Derived data should be computed, not redundantly stored, unless there is a clear performance reason.

### User Interface Code

- Use the project’s approved UI component system consistently.
- Do not reimplement components that already exist in the approved UI system.
- Components should have a single responsibility.
- Accessibility is mandatory:
  - semantic structure
  - keyboard operability
  - assistive labels where needed
- Use the project’s approved icon library.
- Error handling boundaries MUST be used for critical user-facing paths.
- Global state should be used only when strictly necessary.
- Styling should follow the project’s approved design system and utility conventions.

### Backend / API Code

- Follow established API conventions consistently.
- Transport layers should remain thin.
- Business logic must live in dedicated services or domain modules.
- Data access patterns must be explicit and justified.
- Transactions MUST be explicit where state changes occur.
- Dependencies MUST be injected rather than accessed through hidden globals.
- Always use timezone-aware datetimes.
- API behavior MUST be deterministic and idempotent where applicable.

---

## 4. Library-First Policy

- **Never implement from scratch what already exists as a well-known, maintained library unless there is a justified reason.**
- Prefer stable, widely adopted libraries over custom solutions.
- Application code should focus on **project-specific logic only**:
  - domain rules
  - workflows
  - permissions and access rules
  - integrations
  - application behavior
  - UI composition

When introducing a library:

- ensure it is actively maintained
- ensure it is widely adopted or clearly fit for purpose
- keep the surface area small
- avoid adding overlapping libraries that solve the same problem

Custom implementations require justification when a mature library already exists.

---

## 5. Testing

- **Every feature and bug fix MUST include tests**.
- Bug fixes MUST include a test that reproduces the bug.

General requirements:

- test behavior, not implementation details
- unit test business logic
- integration test critical flows and interfaces
- mock external systems and third-party integrations
- avoid brittle snapshot-heavy strategies unless justified
- tests MUST be fast and deterministic
- flaky tests are defects and must be fixed or removed

---

## 6. Security

- Secrets MUST come from secure runtime configuration, not source code.
- Never log secrets or sensitive payloads.
- All input MUST be validated.
- Error messages MUST NOT leak internal details.
- Authentication mechanisms must use short-lived credentials or clearly defined expiration rules.
- Session, token, or credential refresh behavior must be explicitly defined where applicable.
- Revocation or invalidation mechanisms must exist where applicable.
- Authorization MUST be enforced server-side.
- Rate limiting or equivalent abuse protection MUST be applied to authentication and state-changing operations.
- Audit logging is required for security-sensitive actions.

---

## 7. Enforcement

- CI MUST fail on:
  - type errors
  - lint violations
  - failing tests

Code review MUST reject:

- untyped or loosely typed business logic
- unbounded boundary data usage
- inconsistent use of approved shared libraries or systems
- oversized files without justification
- reinvention of existing library solutions without justification

AI agents are expected to refactor aggressively to comply.

These rules define the **minimum acceptable quality bar**.
