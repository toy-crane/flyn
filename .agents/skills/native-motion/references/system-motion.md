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

## Default decision

Preserve the system behavior. Prefer supported Expo Router or component
configuration over wrapping the surface in Reanimated.

Do not:

- add a second RN transition around a native-stack transition;
- disable an interactive back gesture to protect a decorative animation;
- reproduce a native sheet with an absolute RN view merely to control timing;
- reskin or animate inside a vendor control whose appearance and behavior the
  vendor owns;
- apply a web timing rule to platform navigation.

## When customization is justified

Customize only when there is concrete product evidence that the default fails
the intended relationship, accessibility requirement, or state explanation.
Before changing it:

1. Check the installed Expo Router and component version.
2. Read the current official option or modifier documentation.
3. Verify that the behavior is configurable at the current owner.
4. If not, reconsider the surface ownership rather than layering an
   uncontrolled animation over it.

## Review evidence

A system-owned finding must cite the route or configuration that selects the
native behavior. The absence of Reanimated code is not a missing animation when
the platform already supplies it.
