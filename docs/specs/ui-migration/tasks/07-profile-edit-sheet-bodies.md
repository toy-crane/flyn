# 07. 프로필 편집 시트 본문이 HeroUI로 바뀐다

## 전달되는 행동

설정의 닉네임·아이디 편집 시트에서 본문만 HeroUI `TextField`·`Description`·
`FieldError`(아이디는 `Chip` 추천·`Spinner` 가용성 신호)로 바뀐다. native
toolbar의 `xmark` 닫기·`checkmark` 저장, grabber, 닫으면 폐기하고 저장 성공만
닫히는 규칙, 중복일 때만 danger, 저장 중 잠금 — 편집 interaction은 전부 이전과
같다.

## Blockers

- **01** — HeroUI 본문은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [x] 두 시트 본문이 HeroUI로 그려지고 native toolbar·grabber가 유지된다
- [x] 닫기·system swipe는 폐기하고, 저장 성공만 programmatic back으로 닫힌다
- [x] 규칙 위반은 저장만 잠그고, 중복만 danger + 추천 3개가 동작한다
- [x] 저장 중 toolbar activity indicator와 입력·추천 잠금이 유지된다
- [x] sheet background·material이 native 기본값 그대로다
- [x] nickname·username-edit-form의 `@expo/ui` 본문이 제거됐다

## 제약

- [settings-edits-use-native-form](../../../decisions/settings-edits-use-native-form.md)의
  interaction 결정이 이 태스크의 수용 기준이다 — 본문 renderer 외에는 아무것도
  바뀌지 않아야 한다.
- Settings 화면 자체(grouped `Form`)는 건드리지 않는다.

## Status

completed

## Execution

- Base commit: 46b2b7ebea59dbe9c15cba130eb149d5522d0c92
- Task checkpoint commit: d1c620ad301254e5b4a0adfd4018f276e03ba28c
- Verification: `bun run check --force` 3회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 453/453 (48 suites), lint·typecheck 통과. 두 시트를 light·dark로 촬영했고 저장 중 잠금은 `supabase_kong_flyn`을 일시정지시켜 재현했다. 시스템 스와이프 닫기는 agent-device 제스처 제약으로 재현하지 못했다 — 셸 동작이라 변경 대상이 아니고 ✕ 경로가 같은 폐기 로직을 태운다.
- Task review: 블로킹 없음, 교정 0회. 리뷰가 renderer 외 불변식을 항목별로 base와 대조했다 — toolbar·grabber·detent·폐기/저장 규칙·중복만 danger·추천 3개·저장 중 잠금 모두 동일. 본문이 떠 있는 네이티브 헤더 뒤로 그려지던 문제에 `useHeaderHeight()`를 더한 것은 react-native-screens 소스로 검증됐다: formSheet는 `isPresentedAsNativeModal`이라 RNS가 content offset을 0으로 두고(`RNSScreen.mm:143`), 같은 네이티브 함수가 계산하는 값이 곧 `useHeaderHeight`다. safe-area inset은 iOS 모달에서 0으로 강제되고, `contentInsetAdjustmentBehavior`는 계약이 금지한 scroll container를 요구하므로 대안이 없다. 아이콘 접근성은 base보다 낫다 — 이전 `@expo/ui` `Icon`은 레이블이 없어 VoiceOver가 SF Symbol 원시 이름을 읽었다. 다만 작업자가 보고한 "`resetAllMocks`가 `checkUsernameAvailability` mock을 지워 테스트가 약했다"는 **과장이었다**: 지워진 것은 사실이나 그 함수는 두 suite에서 호출되지 않아(감싸는 `createUsernameSuggestions`가 mock이다) 관측 가능한 약화는 없었다. 실제 문제는 asset registry 파손 하나뿐이다.
- Task correction rounds: 0
- Blocker: —
