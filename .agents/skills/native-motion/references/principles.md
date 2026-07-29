# Native motion principles

These principles adapt the renderer-independent parts of Emil Kowalski's
[design-engineering](https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng)
and [Apple-design](https://github.com/emilkowalski/skills/tree/main/skills/apple-design)
guidance to native Expo surfaces. Use the ideas, not their web implementation
examples.

## Restraint before polish

- Name the purpose before selecting an animation.
- Remove motion that is merely decorative on a frequent or information-dense
  path.
- Let rare, high-emotion moments carry more personality than daily navigation.
- Never delay useful input or content so an entrance can finish.

## Direct response

- Show acknowledgement at the causal event, not only after an action completes.
- For a drag, keep content coupled to the finger after a short intent threshold.
- Preserve grab offset and continuous tracking; avoid snapping an object to an
  artificial anchor when the gesture begins.

## Continuity and physical behavior

- Enter and exit along a consistent spatial path.
- Anchor a menu, popover, or expansion to the control or content that caused it
  when the platform component does not already do so.
- For gesture release, carry the measured velocity into the settling behavior.
- Use progressive resistance beyond a boundary rather than an abrupt hard stop.
- Default to little or no bounce. Add visible overshoot only when momentum or
  the product's playful character justifies it.

## Interruptibility

- A rapidly repeated or gesture-driven motion must retarget from the current
  visible value.
- Do not disable otherwise valid input solely because a decorative transition
  is running.
- Test reversal midway through the motion; reaching both endpoints is not
  enough.

## Multimodal feedback

- Trigger haptic feedback on the event it represents: selection, commit,
  success, warning, error, or snap.
- Keep haptics sparse. Repetition turns a signal into noise.
- Coordinate visual and haptic feedback at the same causal transition rather
  than firing one from unrelated cleanup.

## Accessibility

- Reduce Motion keeps necessary state feedback while removing or shortening
  vestibular movement, parallax, and overshoot.
- Do not assume a smaller transform is always sufficient; a crossfade or an
  immediate state change may be the correct alternative.
- Verify large Dynamic Type and contrast settings because motion can expose
  clipping, relayout, and double-painted text that static checks miss.

## Performance and cohesion

- Prefer native and UI-thread behavior for continuous motion.
- For RN-owned microinteractions, start with transforms and opacity; use native
  layout transitions when the relationship itself is a layout change.
- Avoid animating every recycled row in a virtualized list.
- Match motion to the product: flyn should feel responsive and playful, not
  bouncy everywhere.
