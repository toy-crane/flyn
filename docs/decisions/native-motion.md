# 네이티브 모션과 상태 피드백

## Decisions

- 모션은 상태·공간 관계를 설명할 때만 사용하고 화면 전체 장식이나 대기 시간을
  만들지 않는다. action은 애니메이션 종료를 기다리지 않고 즉시 사용할 수 있다.
- 빠른 인증 완료에는 launch progress를 번쩍이지 않는다. 실제 대기가 생길 때만
  launch 화면 안에서 progress를 표시하고, native stack 전환을 덮지 않는다.
- 직접 입력한 OTP slot은 짧은 opacity/scale 피드백을 주되, 연속 입력은 현재
  상태에서 이어지고 AutoFill·붙여넣기는 최종 값을 즉시 표시한다.
- 채팅 맨 아래 action과 오류 배너는 composer와의 공간 관계를 유지하며 나타나고
  사라진다. 빠르게 반전돼도 bounce·깜빡임·입력 차단이 없어야 한다.
- SwiftUI 모션은 해당 `Host` subtree가, RN 모션은 Reanimated UI thread가,
  navigation은 시스템이 각각 소유한다.
- HeroUI 컴포넌트에 내장된 모션과 press 피드백은 라이브러리가 소유한다. 같은
  컴포넌트에 화면이 자체 모션을 겹치거나 재구현하지 않는다.
- Reduce Motion에서는 scale과 이동을 제거하고 즉시 변화나 짧은 opacity로 의미를
  유지한다.

## Why

인증 handoff, OTP 입력, 채팅 복귀와 오류는 출처나 상태 변화가 순간적으로
헷갈릴 수 있다. 소유 renderer 안의 작은 모션은 관계를 설명하지만, renderer와
navigation 경계를 가로지르는 모션은 gesture·keyboard·scroll 소유권과 경쟁한다.

## Boundaries

- OTP 오류는 기존 문구·danger 상태·haptic으로 충분하며 전체 slot shake를
  추가하지 않는다.
- native button, vendor 로그인, Settings form, streaming text와 메시지 행에는
  반복 애니메이션을 붙이지 않는다.
- 전역 duration이나 motion token 체계를 만들지 않는다.

## Reconsider when

새 모션이 반복되는 제품 언어가 되거나 renderer별 timing 불일치가 실제 문제로
재현되면 공통 motion 체계를 별도 결정한다.

## Still-rejected alternatives

- progress를 보이기 위해 작업을 일부러 늦추거나 최소 노출 시간을 두기.
- native stack push/pop 위에 앱 전환을 겹치기.
- send/stop, streaming text 또는 countdown을 계속 bounce·pulse시키기.

## Evidence worth preserving

Reanimated layout transition과 keyboard-aware composer는 같은 frame을 바꿀 수
있다. 오류 배너와 keyboard가 동시에 변하는 상태, Reduce Motion on/off, 빠른 OTP
입력과 AutoFill은 회귀 검증 대상으로 남긴다.

HeroUI `Spinner`의 회전은 `withRepeat`에 `reduceMotion`을 주지 않아 Reanimated
기본값 `ReduceMotion.System`을 따른다 — Reduce Motion을 켜면 회전이 즉시 끝나
멈춘 그림으로 선다(`heroui-native/src/components/spinner/spinner.animation.ts`).
`animation` prop은 `rotation.speed`와 `rotation.easing`만 받아 이 값을 바꿀 길이
없고, 고치려면 `isAnimatedStyleActive={false}`로 라이브러리 모션을 끄고 회전을
직접 다시 만들어야 한다. 라이브러리가 자기 모션을 소유한다는 결정을 지켜 그대로
두고, 무엇이 진행 중인지는 accessibility label(`응답 생성 중`, `대화 불러오는
중`, `지난 내용 불러오는 중`)과 composer의 중단 action이 나른다. 멈춘 스피너가
"멈춘 화면"으로 읽히는 일이 실제로 보고되면 자작 회전이 아니라 라이브러리에
`reduceMotion`을 여는 것이 먼저다.
