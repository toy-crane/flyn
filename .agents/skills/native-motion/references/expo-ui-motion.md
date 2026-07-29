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

## Prefer native behavior

Native Button, Toggle, List, Menu, Picker, sheet, progress, and scrolling
controls already express pressed, selected, disabled, and presentation states.
Keep those defaults unless the product requires an additional state explanation.

Do not add generic scale or opacity feedback on top of a native control merely
because the same recipe is used on an RN `Pressable`.

## App-owned SwiftUI motion

When a state change inside the subtree needs a bridge:

1. Identify the value whose change drives the animation.
2. Use a supported SwiftUI animation or transition modifier from the installed
   `@expo/ui` version.
3. Prefer platform timing or a restrained spring.
4. Keep entrance and exit paths spatially consistent.
5. Provide a Reduced Motion alternative; do not assume a custom spring is
   automatically appropriate.

Use native symbol effects only when the symbol's state change is meaningful.
Continuous or repeated symbol effects need a stronger reason than decoration.

## Verification

Test the actual `Host` subtree in the simulator. Confirm native focus,
hit-testing, Dynamic Type, dark appearance, and any RN overlay before judging
the motion complete.
