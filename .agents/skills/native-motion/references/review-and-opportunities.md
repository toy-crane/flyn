# Review, audit, and opportunity finding

## Review a diff or component

Return one row per actionable finding:

| Severity | Location | Owner | Evidence | Finding | Target |
| --- | --- | --- | --- | --- | --- |

Use:

- **High** for broken input, motion that blocks or jumps on interruption,
  duplicated system transitions, accessibility failure, or clear jank.
- **Medium** for wrong ownership, missing state continuity, weak gesture
  handoff, or unhandled reduced motion.
- **Low** for optional cohesion and polish.

Approve explicitly when no actionable finding remains. Do not invent a motion
change to avoid an empty review.

## Audit a surface or app

1. Inventory system, `@expo/ui`, RN, and mixed surfaces.
2. Locate existing motion, gesture, haptic, keyboard, and navigation behavior.
3. Check each candidate against ownership and the motion gate.
4. Re-read every cited location before reporting it.
5. Order findings by user impact divided by implementation risk.

Separate verified code facts from feel that still requires device observation.

## Find opportunities

Report surviving candidates:

| Location | Owner | Today | Purpose | Frequency | Candidate | Reduced Motion |
| --- | --- | --- | --- | --- | --- | --- |

Then list two to five rejected candidates and the gate that rejected each one.
This section is required; it proves the task was a filter rather than an
animation wishlist.

Useful candidates include:

- a conditional error, status, or completion surface that appears abruptly;
- a control whose state changes without legible feedback;
- a spatially connected panel whose origin is unclear;
- a rare onboarding or completion moment that has no feedback;
- a custom gesture that snaps without velocity or boundary resistance.

Common rejections include:

- native stack transitions and system sheets already animated by the platform;
- native controls with complete pressed and selection behavior;
- high-frequency list navigation;
- streaming or changing content that needs visual stability;
- decorative motion on information the user is trying to read.

## Implementation requests

When the user asks to build or fix:

- keep the ownership decision visible in the handoff;
- add or update focused tests where behavior can be asserted;
- avoid broad motion-token or component refactors unless required;
- verify on a running app as described in `verification.md`.
