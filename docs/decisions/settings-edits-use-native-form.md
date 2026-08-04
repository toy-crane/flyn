# 설정 값 편집은 전체 높이 네이티브 Form 시트다

## Decisions

- 설정에서 값을 고치는 작업은 라우트나 하단 CTA가 아니라 `@expo/ui`의 전체 높이
  `BottomSheet`로 연다. 설정 화면이 열림 상태를 소유하고 시트와 `Form`은 하나의
  `Host` subtree에 둔다.
- 시트에는 grouped `Form`과 위쪽 양끝의 `xmark`·`checkmark` 원형 유리 버튼을
  둔다. 닫기와 끌어내리기는 저장하지 않고 입력을 버리며, 저장 성공 때만 닫는다.
- 하단 CTA는 온보딩·로그인처럼 앞으로 진행하는 흐름에만 쓴다. 설정 편집과
  온보딩은 검증·정규화 순수 함수만 공유하고 입력 컴포넌트는 공유하지 않는다.
- 닉네임과 아이디는 각각 다른 시트다. 닉네임에는 규칙 footer만 두고, 아이디에는
  trailing 가용성 신호와 중복일 때만 danger 오류 및 숫자형 추천 3개를 둔다.
- 규칙 위반은 저장만 잠그고 빨간 오류를 보이지 않는다. 중복만 danger로 표시하며,
  유니크 저장 충돌도 일반 실패 대신 중복 상태로 되돌린다.
- 저장 중에는 `checkmark` 자리를 같은 크기의 `ProgressView`로 바꾸고 입력과 추천을
  잠근다. 일반 저장 실패는 입력을 보존한 채 시트 위 alert로 알린다.
- sheet와 `Form`의 기본 grouped background와 material은 iOS에 맡긴다.
  `presentationBackground(app.background)`와
  `scrollContentBackground('hidden')`으로 앱 배경에 맞추지 않으며,
  `ScrollView`로 감싸지 않는다.
- 설정 헤더는 닉네임과 `@아이디`를 보여주고 이메일은 읽기 전용 행에 둔다.

## Why

진행은 다음 단계로 가는 일이고 설정 편집은 값 하나를 고치는 닫힌 작업이다. 같은
하단 CTA를 쓰면 가벼운 편집이 온보딩처럼 보인다. 네이티브 `Form`은 규칙 footer,
trailing 상태, 추천 section처럼 검증 화면에 필요한 자리를 이미 제공한다.

전체 높이는 규칙과 추천이 나타나도 시트 높이와 키보드 위치를 안정적으로 유지한다.
컴포넌트 `BottomSheet`를 쓰면 불필요한 URL과 별도 `Host` 없이 설정 화면이 편집
수명을 직접 소유한다.

## Boundaries

- 저장할 것이 없거나 값이 유효하지 않거나 저장 중이면 저장 버튼을 비활성화한다.
- 현재 아이디는 자기에게 사용 가능으로 판정하고, 바뀐 값이 없으면 저장 없이
  닫는다.
- 값 하나에 검증과 서버 왕복이 모두 없다면 설정 목록에서 직접 편집할 수 있다.
- 시트 header의 가운데 정렬과 safe area는 앱이 책임진다.
- 제품 상태인 가용성·중복은 앱의 success·danger 의미를 쓰되, `Form`의 기본
  background·label·separator는 native 기본값을 유지한다.
- 아이디 변경 빈도와 이전 아이디 경고는 검색 표면이 생길 때까지 두지 않는다.
- 구현 세부와 확인하지 않은 경로는
  [온보딩 스펙](../specs/onboarding-nickname-and-id/spec.md)이 소유한다.

## Reconsider when

`@expo/ui`가 라우트 기반 시트에서 같은 네이티브 Form·toolbar·배경 동작을 더
안정적으로 제공하거나, 값 편집이 여러 필드를 함께 저장하는 작업으로 커지면
presentation과 컴포넌트 공유 경계를 다시 정한다.

## Still-rejected alternatives

- 설정 편집을 push navigation이나 Expo Router modal route로 만들기.
- 내용에 따라 높이가 바뀌는 부분 detent를 쓰기.
- 저장 결과를 확인할 수 없는 자동 저장이나 닫을 때 저장을 쓰기.
- 검증과 서버 왕복이 필요한 값을 설정 목록에서 바로 편집하기.
- 온보딩의 filled field와 하단 CTA 컴포넌트를 설정 Form에 재사용하기.
- `FieldGroup`을 `ScrollView`로 감싸기.
- native grouped background를 앱 background와 픽셀 단위로 맞추기.

## Evidence worth preserving

- iOS 26.5 시뮬레이터에서 full `BottomSheet` 안의 `FieldGroup`, footer, 원형 glass
  button, disabled 상태와 키보드 안정성을 확인했다.
- `presentationBackground`는 시트 배경을 앱 색으로 바꿨지만 `Host`의 배경색만으로는
  바뀌지 않았다. 이 modifier가 동작한다는 사실과 별개로, 앱 색에 맞추는 사용은
  native surface를 iOS에 맡기는 현재 경계에서 채택하지 않는다.
- `FieldGroup`을 `ScrollView`로 감싸면 중첩 scroll container의 높이가 0이 되어
  접근성 트리에서 form 행이 사라졌다.
- 중복 상태에서 trailing 경고, danger footer, 추천 section이 한 Form 안에서 함께
  동작하고 추천을 탭하면 가용성과 저장 상태가 함께 갱신됐다.
