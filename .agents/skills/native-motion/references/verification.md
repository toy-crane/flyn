# Verify native motion

Do not claim a visible or interactive motion change complete from typechecking
or screenshots alone.

## Mechanical checks

Run the repository's focused tests, typecheck, and lint. Add render or behavior
tests for state selection, accessibility props, and configuration, but do not
pretend snapshot timing proves feel.

## Runtime checks

Use the repository's `agent-device` skill and its version-matched help.

1. Build and launch the current worktree's app.
2. Take a fresh accessibility snapshot before using element refs.
3. Exercise every changed state and both directions of a transition.
4. For interruptible motion, reverse or repeat it before it settles.
5. For gestures, test slow drag, quick flick, cancel, boundary resistance, and
   nested scrolling where relevant.
6. Record a short video when timing, continuity, or gesture handoff is material.
7. Confirm there are no runtime warnings or stale-build mismatches.

## Accessibility matrix

Verify the applicable combinations:

- Reduce Motion on and off;
- light and dark appearance;
- larger Dynamic Type;
- increased contrast or reduced transparency for affected materials;
- VoiceOver focus and labels when the moving view is interactive.

Reduced Motion must preserve understandable state feedback. Record whether it
becomes immediate, crossfades, or uses a smaller non-vestibular change.

## Ownership checks

- System: native gesture and transition remain interactive.
- `@expo/ui`: focus, hit-testing, layout, and native control feedback still work
  inside the `Host`.
- RN: repeated input does not jump, and continuous motion stays off avoidable
  JS-thread state updates.
- Mixed: the RN wrapper or overlay does not fight SwiftUI layout or animate
  through the boundary.

Restore simulator appearance and accessibility settings after verification.
