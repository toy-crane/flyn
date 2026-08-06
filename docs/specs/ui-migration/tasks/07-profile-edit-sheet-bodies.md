# 07. 프로필 편집 시트 본문이 HeroUI로 바뀐다

상태: 대기

## 전달되는 행동

설정의 닉네임·아이디 편집 시트에서 본문만 HeroUI `TextField`·`Description`·
`FieldError`(아이디는 `Chip` 추천·`Spinner` 가용성 신호)로 바뀐다. native
toolbar의 `xmark` 닫기·`checkmark` 저장, grabber, 닫으면 폐기하고 저장 성공만
닫히는 규칙, 중복일 때만 danger, 저장 중 잠금 — 편집 interaction은 전부 이전과
같다.

## 블로커

- **01** — HeroUI 본문은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [ ] 두 시트 본문이 HeroUI로 그려지고 native toolbar·grabber가 유지된다
- [ ] 닫기·system swipe는 폐기하고, 저장 성공만 programmatic back으로 닫힌다
- [ ] 규칙 위반은 저장만 잠그고, 중복만 danger + 추천 3개가 동작한다
- [ ] 저장 중 toolbar activity indicator와 입력·추천 잠금이 유지된다
- [ ] sheet background·material이 native 기본값 그대로다
- [ ] nickname·username-edit-form의 `@expo/ui` 본문이 제거됐다

## 제약

- [settings-edits-use-native-form](../../../decisions/settings-edits-use-native-form.md)의
  interaction 결정이 이 태스크의 수용 기준이다 — 본문 renderer 외에는 아무것도
  바뀌지 않아야 한다.
- Settings 화면 자체(grouped `Form`)는 건드리지 않는다.
