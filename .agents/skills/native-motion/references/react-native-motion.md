# React Native-owned motion

Use this reference for RN primitives, custom composition, virtualized lists,
bespoke input, and app-owned continuous gestures. Inspect installed versions
before choosing APIs.

## Choose the smallest mechanism

- Use a `Pressable` state callback for immediate static pressed feedback.
- Use Reanimated 4 for app-owned animated values, entering/exiting/layout
  changes, scroll-driven motion, and interruptible transitions.
- Use React Native Gesture Handler for continuous pan, tap, long-press, and
  composed gestures.
- Use the project's keyboard controller for interactive keyboard motion rather
  than recreating keyboard tracking.
- Keep Expo Router navigation and native presentation at the system layer.

## Press feedback

Not every pressable needs scale. First preserve existing native, brand, color,
or opacity feedback. Add a transform only when the control otherwise lacks
acknowledgement and the result remains coherent with nearby controls.

React at press-in and release quickly. Do not wait for `onPress` to show that the
touch was received.

## Reanimated

- Use shared values and animated styles for values that update per frame.
- Configure `ReduceMotion.System` unless a documented alternative is necessary.
- Use `useReducedMotion()` when the reduced version changes composition rather
  than only animation timing.
- Retarget rapidly repeated motion from the current shared value.
- Use layout animations for true layout relationships; do not force all layout
  changes into manual transforms.
- Avoid passing dynamic platform semantic color handles through unsupported
  animated color paths; confirm the installed version's support.

## Gestures

- Track the gesture continuously after intent is established.
- Preserve the starting offset so content does not jump under the finger.
- Hand release velocity into the settling spring or decay.
- Use distance and velocity together for dismiss or snap decisions.
- Add progressive resistance beyond bounds.
- Define cancellation, multi-touch, interruption, and nested-scroll behavior.

## Lists and chat

- Preserve virtualization and stable keys.
- Avoid staggering or entering animation on every recycled row.
- Animate only the local state change that needs explanation.
- Do not animate automatic chat scroll merely because new data arrived; respect
  whether the user is reading away from the bottom.
- Keep streaming text readable and stable. Decorative motion must not compete
  with content that is already changing.

## Timing

For app-owned microinteractions, responsive sub-300ms timing is a useful
starting point, not a platform law. Gestures and springs settle from physics,
while system navigation keeps its platform timing.
