# System-owned motion

Use this reference when Expo Router, UIKit, SwiftUI presentation, or a vendor
control already owns the interaction.

## Recognize the owner

System-owned examples include:

- native-stack push, pop, and interactive back gestures;
- system sheets, presentation detents, alerts, context menus, and pickers;
- navigation headers and toolbars;
- Apple authentication controls and other vendor-complete controls;
- native scrolling, deceleration, pull-to-refresh, and keyboard presentation.

## Configure at the owner layer

System-owned does not mean fixed. Inventory the system's supported
configuration before preserving or changing the default.

For the standard Expo Router `Stack`, inspect the installed version's options:

- `animation` selects supported native push and pop styles.
- `animationDuration` adjusts only the iOS transition types documented as
  configurable; it does not retime every native transition.
- `presentation` selects card, modal, sheet, or other native presentation
  semantics. Do not change semantics merely to get a different animation.
- `gestureEnabled`, `gestureDirection`, `fullScreenGestureEnabled`, and
  `animationMatchesGesture` shape interactive dismissal on supported iOS
  versions.
- Source-linked transitions such as `Link.AppleZoom` are candidates only when
  the installed Expo Router and deployment target support them and the source
  and destination have a real visual identity relationship.

Also inspect native component configuration such as sheet detents, drag
indicators, toolbar state, context-menu behavior, and picker style where
relevant. Preserve the default after this comparison when it already expresses
the relationship.

Do not:

- add a second RN transition around a native-stack transition;
- disable an interactive back gesture to protect a decorative animation;
- reproduce a native sheet with an absolute RN view merely to control timing;
- reskin or animate inside a vendor control whose appearance and behavior the
  vendor owns;
- apply a web timing rule to platform navigation.

## Select configuration deliberately

Before changing a system-owned motion:

1. Check the installed Expo Router and component version.
2. Read the current official option or modifier documentation.
3. Name the relationship the default fails to express.
4. Compare the native configuration with the current default on device,
   including interactive dismissal and Reduce Motion.
5. If the behavior is not configurable at the current owner, reconsider the
   surface ownership rather than layering an
   uncontrolled animation over it.

## Review evidence

A system-owned finding must cite the route and the relevant configurable
surface, even when the final decision is to keep the default. The absence of
Reanimated code is not a missing animation when the platform already supplies
or configures it.
