---
name: native-motion
description: Design, review, audit, and implement motion in Expo apps that mix Expo Router system transitions, @expo/ui Host subtrees, and React Native surfaces. Inspect renderer-owned configuration, SwiftUI modifiers and animation transactions, or Reanimated and React Native Gesture Handler before choosing custom motion. Use for animations, gestures, press feedback, transitions, native feel, motion performance, reduced motion, or motion-focused code review.
---

# Native Motion

Assign motion to the renderer that owns the surface before judging or changing
it. Ownership is not a veto: it identifies the first configuration, modifier,
or API surface to inspect. Expo Router, `@expo/ui`, and React Native are peers
with different motion mechanisms; React Native is not a fallback hidden behind
`@expo/ui`.

## Start from project evidence

Before the first recommendation or edit:

1. Read `GLOSSARY.md`, `docs/decisions/README.md`, and the motion-relevant
   decision records.
2. Inspect the route, component, tests, installed versions, and existing motion
   dependencies. Do not infer the renderer from the file extension.
3. Use current official Expo and library guidance for version-sensitive APIs.
   Prefer installed vendor skills such as `expo-router`, `expo-ui`, and
   `expo-native-ui` when available.
4. Inspect the running surface when the request depends on feel. Code alone
   cannot establish whether timing, interruption, or gesture handoff feels
   correct.

In flyn, preserve the standing decisions that the app is iOS-only, native
interaction follows Apple HIG, universal `@expo/ui` is the default renderer for
self-contained native subtrees, and RN owns surfaces whose layout or
interaction crosses that boundary.

## Choose the task lane

Follow the user's requested scope:

- **Design or implement**: settle ownership and behavior, then edit and verify.
- **Review**: inspect only the requested diff or component and return findings;
  do not edit.
- **Audit or improve**: inventory the relevant surfaces, prioritize problems,
  and implement only when the user requested changes.
- **Find opportunities**: propose only motion that survives the gate below and
  show the rejected candidates too.
- **Diagnose**: determine why motion is wrong or janky; do not fix unless asked.

All lanes share the same ownership map and gate.

## Map motion ownership

Classify every affected surface before selecting an API:

| Owner | Typical evidence | Default action |
| --- | --- | --- |
| System | Expo Router native stack, back gesture, system sheet, alert, vendor control | Inspect supported transition, gesture, and presentation configuration; keep or tune the native behavior |
| `@expo/ui` | One self-contained `Host` subtree rendering SwiftUI controls and layout | Inspect control configuration and supported SwiftUI modifiers; keep motion inside the subtree |
| React Native | RN primitives, custom composition, virtualized list, bespoke input, app-owned gesture | Use `Pressable`, Reanimated, RNGH, and existing native-aware libraries |
| Mixed boundary | RN wrapper or overlay beside a complete `Host` subtree | Assign each motion to its owner; never animate through the boundary as if it were one renderer |

Read only the references needed for the identified owner:

- Always read [principles.md](references/principles.md).
- Read [system-motion.md](references/system-motion.md) for platform-owned
  navigation, sheets, menus, alerts, and vendor controls.
- Read [expo-ui-motion.md](references/expo-ui-motion.md) for a `Host` subtree.
- Read [react-native-motion.md](references/react-native-motion.md) for RN,
  Reanimated, RNGH, keyboard, or virtualized-list work.
- Read [review-and-opportunities.md](references/review-and-opportunities.md)
  for review, audit, or opportunity-finding output.
- Read [verification.md](references/verification.md) before claiming a
  visible or interactive motion change complete.

## Inspect the owner's capability surface

For every candidate, compare these levels in order:

1. **Existing behavior**: identify the feedback or transition the owner already
   supplies.
2. **Supported configuration**: inspect current route options, component
   properties, native presentation settings, and exported modifiers.
3. **Owner-local custom motion**: use Reanimated only for RN, and supported
   SwiftUI animation APIs only inside an `@expo/ui` subtree.
4. **Ownership change**: consider replacing or crossing a renderer only when a
   documented capability gap is more important than the boundary cost.

Do not reject a system or `@expo/ui` opportunity merely because the owner
already animates something. First determine whether its supported
configuration can better express the intended relationship. Conversely, the
existence of an option or modifier is not sufficient reason to use it.

## Pass the motion gate

Reject or revise a candidate unless all applicable questions have concrete
answers:

1. **Ownership**: Which platform, control, SwiftUI, or RN surface owns the
   behavior, and what configuration does that owner expose?
2. **Purpose**: Does motion provide feedback, spatial continuity, state
   indication, explanation, or protection from a jarring change?
3. **Frequency**: Will repetition make the motion feel slow or ornamental?
4. **Directness**: Does feedback begin with the causal input and, for gestures,
   track it continuously?
5. **Interruptibility**: Can a rapidly repeated or gesture-driven transition
   reverse from its visible state without jumping?
6. **Accessibility**: What happens under Reduce Motion, larger text, increased
   contrast, and reduced transparency where relevant?
7. **Performance**: Does the motion stay on the native/UI path without forcing
   avoidable JS-thread work, list churn, or per-frame layout?
8. **Boundary**: Does it keep each `Host` subtree self-contained rather than
   crossing RN and SwiftUI repeatedly?

Do not add scale feedback to every pressable, impose one duration on system
navigation, or treat `transform` and `opacity` as absolute rules for native
layout engines. Those are useful RN defaults, not cross-renderer laws. Do not
equate "native-owned" with "not configurable."

## Execute at the owner's layer

- Preserve platform defaults when they already express the intended
  relationship; otherwise use the owner's documented option before adding
  another animation layer.
- Prefer the existing native control and its configuration over a hand-built
  imitation.
- Keep `@expo/ui` animation and state inside its complete `Host` subtree, using
  supported modifiers or native animation transactions from the installed
  version.
- Keep app-owned continuous gestures and custom transitions in RN with
  Reanimated and RNGH.
- Reuse project motion conventions before creating new timing or spring
  constants.
- Coordinate visual, haptic, and state changes at the causal event. Haptics
  must remain sparse enough to carry meaning.
- Treat official values and current package APIs as version-sensitive; verify
  them instead of copying web-oriented constants.

## Report the decision

For design, review, and audit work, make ownership visible:

| Surface | Owner | Capability surface | Evidence | Decision | Verification |
| --- | --- | --- | --- | --- | --- |

For opportunity-finding, follow the output and rejection requirements in
[review-and-opportunities.md](references/review-and-opportunities.md). For
implementation, summarize the resulting behavior and the device evidence rather
than narrating every edit.
