# Motion inside `@expo/ui`

Use this reference only for a self-contained `Host` subtree. Read the installed
`@expo/ui` version and current official `expo-ui` guidance before naming a
modifier or animation preset.

## Preserve the boundary

- Keep SwiftUI layout, controls, and their motion together inside one complete
  `Host` subtree.
- An RN wrapper or overlay may sit beside the subtree, but it owns its own
  motion.
- Do not drive a SwiftUI leaf with a Reanimated style or reach through the
  boundary to animate RN and SwiftUI as one view hierarchy.
- Do not introduce another `Host` for each animated control.

## Inspect the installed capability surface

`@expo/ui` is configurable, not merely a collection of fixed native defaults.
Inspect the installed package exports and current official documentation before
deciding that a state change cannot or should not animate.

In Expo SDK 57's SwiftUI surface, relevant capability families include:

- `animation(Animation.*, value)` for value-driven implicit SwiftUI animation;
- `withAnimation` for `useNativeState` mutations that must run in one native
  animation transaction;
- `contentTransition` for supported text-content changes;
- `matchedGeometryEffect` with a `Namespace` for a real shared visual identity
  inside one SwiftUI subtree;
- `symbolEffect` for meaningful SF Symbol state changes;
- animatable modifiers such as frame, opacity, scale, rotation, and offset when
  driven by a supported animation API;
- native component configuration for tabs, sheets, detents, progress,
  scrolling, and control styles.

This list is a routing aid, not a timeless API inventory. Confirm every exact
export, platform minimum, and limitation against the installed `@expo/ui`
version. Do not name a generic SwiftUI `transition` API unless that version
actually exposes it.

## Prefer native behavior, then configure it

Native Button, Toggle, List, Menu, Picker, sheet, progress, and scrolling
controls already express pressed, selected, disabled, and presentation states.
Inspect their configuration and modifiers, then keep the defaults unless the
product requires a different relationship or additional state explanation.

Do not add generic scale or opacity feedback on top of a native control merely
because the same recipe is used on an RN `Pressable`.

## App-owned SwiftUI motion

When a state change inside the subtree needs a bridge:

1. Identify the value whose change drives the animation.
2. Choose the smallest supported control option, modifier, content transition,
   matched geometry effect, symbol effect, or animation transaction from the
   installed `@expo/ui` version.
3. Prefer platform timing or a restrained spring.
4. Keep entrance and exit paths spatially consistent.
5. Provide a Reduced Motion alternative. If the installed `@expo/ui` surface
   does not expose the required accessibility environment directly, drive the
   alternative from React state or keep native default behavior rather than
   assuming a custom spring is acceptable.

Use native symbol effects only when the symbol's state change is meaningful.
Continuous or repeated symbol effects need a stronger reason than decoration.

## Verification

Test the actual `Host` subtree in the simulator. Confirm native focus,
hit-testing, Dynamic Type, dark appearance, and any RN overlay before judging
the motion complete.
