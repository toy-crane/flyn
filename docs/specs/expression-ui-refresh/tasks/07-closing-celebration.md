# 07 — 결말을 Lottie 마크로 축하한다

## Outcome

에피소드가 끝나면 결말 카드에서 파란 원이 튀어나오고 안에서 체크가 그려지며 원 둘레로 고리가 한 번 퍼진 뒤, 그 뒤에서 파랑·보라·청록 조각이 터지고 `해냈어요!`와 결과 문장이 순서대로 나타난다. 마크와 조각은 프로젝트가 소유하는 Lottie 애니메이션 파일이고, 이모지와 앱의 시스템 아이콘은 축하에 쓰이지 않는다.

## Blockers

None.

## Acceptance criteria

- [x] 결말이 나면 카드, 마크, 체크, 고리, 조각, `해냈어요!`, 결과 문장이 순서대로 나타난다. 마크가 튀는 박자에 햅틱이 한 번 온다.
- [x] 연출이 시작될 때부터 `표현 돌아보기`를 누를 수 있다.
- [x] 목표를 이루지 못한 결말은 `해냈어요!`와 고리 없이 마크와 결과 문장만 조용히 나타나고 조각은 절반이다.
- [x] 동작 줄이기를 켜면 마크의 마지막 프레임이 정지 상태로 보인다.
- [x] 밝은 화면과 어두운 화면에서 마크와 조각의 색이 그 화면의 강조색과 채널 색을 따른다. 어느 쪽에서도 마크가 떠 보이지 않는다.
- [x] 종료 때 한 번만 재생하고 기록에서 다시 열면 정지 상태다.
- [x] 반짝임 아이콘과 이모지가 축하 카드에 없다.
- [x] `lottie-react-native`가 Expo SDK 57 공식 문서에서 확인한 버전으로 더해지고 `bun run check`의 의존성 검사가 통과한다.
- [x] [에피소드 종료와 표현 돌아보기 스펙](../../episode-expression-review/spec.md)의 축하 연출 기본값이 이 연출로 바뀌고, [모바일 아이콘 렌더링](../../../decisions/mobile-icon-rendering.md)이 마크와 조각을 프로젝트 소유 애니메이션 파일로 반영한다.

## Constraints

- 순서와 박자는 [시안](../prototypes/closing.html)과 같다. 시각 값(마크 지름, 조각 개수와 색, 각 요소의 지연과 길이)은 시안을 기본으로 하되 기기에서 조정할 수 있다.
- `lottie-react-native`는 새 네이티브 의존성이다. [모바일 Expo 의존성 호환](../../../decisions/mobile-expo-dependency-compatibility.md)에 따라 SDK가 묶어 주는 버전을 쓰고, [모바일 개발 런타임](../../../decisions/mobile-development-runtime.md)대로 Development Build를 다시 만든다. 버전은 `https://docs.expo.dev/llms.txt`에서 찾은 공식 문서를 원문으로 읽어 확인한다.
- Lottie 파일은 사서 쓰거나 만들며, 색은 [모바일 색상 시맨틱](../../../decisions/mobile-color-semantics.md)의 강조색과 채널 색을 실행 시점에 입힐 수 있어야 한다.
- Rive, 마스코트, 소리는 만들지 않는다.

## Verification

- `bun run test`가 성공 결말과 타협 결말의 요소 구성, 동작 줄이기의 정지 상태, 한 번만 재생하는 규칙을 확인하는 테스트를 포함해 통과한다.
- `bun run check`가 통과한다. 의존성 검사가 새 패키지를 받아들인다.
- iOS와 Android Development Build를 다시 만들어 `agent-device` 한 세션씩에서 성공 결말과 타협 결말의 연출, 연출 중 `표현 돌아보기` 누르기, 동작 줄이기, 밝은 화면과 어두운 화면을 확인한다.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `bun run check`, `bun run test`(모바일 553개, scripts, api), `bun run check-types`가 통과한다. iOS(flyn-slot-1, 새 Development Build)에서 밝은 화면 성공, 밝은 화면 타협, 어두운 화면 성공, 동작 줄이기(어두운 화면) 결말을 실제 대화로 만들어 확인했고, Android(flyn_dev_1, 새 Development Build)에서 밝은 화면 성공, 어두운 화면 타협, 어두운 화면 성공, 동작 줄이기 결말을 확인했다. 두 플랫폼 모두 30fps 녹화 프레임으로 카드, 마크, 체크, 고리, 조각, `해냈어요!`, 결과 문장의 순서를 봤고, 타협 결말은 `해냈어요!`와 고리 없이 절반 조각만, 동작 줄이기는 튀는 장면과 조각 없이 마지막 프레임만 나타났다. 기록에서 다시 열거나 돌아오면 정지 상태였다. 햅틱은 시뮬레이터에서 볼 수 없어 테스트(재생 때 한 번, 정지 때 없음)로 확인했다. `표현 돌아보기`는 비활성 상태가 없어 카드가 뜬 직후 눌러 이동을 확인했고, 연출 중간의 탭은 기기에서 시간을 맞추지 못해 테스트(재생 상태에서 누르면 이동)로 확인했다.
- Blocker: —
- Revision: Expo SDK 57 문서에 `lottie-react-native` 페이지가 없어(`/versions/v57.0.0/sdk/lottie/`, `/versions/latest/sdk/lottie/` 404) 설치된 `expo/bundledNativeModules.json`의 `~7.3.8`로 버전을 정했다. 의존성 검사가 같은 파일을 기준으로 삼으므로 계약은 그대로다. Lottie 파일은 사지 않고 `scripts/closing-celebration`의 생성기로 만들어 저장소가 소유한다. 마크 파일(원과 체크)과 효과 파일(고리와 조각) 둘로 나눴다. 고리는 원의 1.9배까지 커져 마크 상자를 넘으므로 카드에 절대 배치하는 효과 파일에 두고, 목표를 이루지 못한 결말의 효과 파일에는 고리를 넣지 않는다. 시안 `closing.html`은 그 결말에도 고리를 그리지만 스펙의 "고리 없이"를 따랐고, 조각은 시안의 값(10조각, 0.6배, 파랑과 청록)을 썼다. 조각은 시안의 z-index와 달리 마크와 글 뒤에 깔린다(스펙의 "그 뒤에서"). 문구와 버튼의 연출은 CSS 애니메이션이 아니라 Reanimated entering으로 만들었다. Android가 CSS 애니메이션이 붙은 뷰의 스타일을 두세 프레임 늦게 적용해 지연 중인 문구가 비쳤기 때문이다. entering의 동작 줄이기 기본값은 앱 실행 때의 설정이라 끄고, 이 컴포넌트가 읽는 현재 값만 따른다. iOS는 Lottie를 메인 스레드 엔진으로 그린다. Core Animation 엔진이 색을 입힐 때마다 레이어를 다시 만드는 동안 마크의 시계가 먼저 가서 튀는 장면을 건너뛰었다. lottie-android는 도형 객체에서 `ty`보다 앞의 키를 버리므로 생성기가 `ty`를 맨 앞에 두고, 생성 파일은 `.gen.json`이라 Biome이 키를 정렬하지 않는다. Android는 prop이 바뀔 때마다 `autoPlay`가 켜진 애니메이션을 처음부터 다시 돌리므로 다 재생한 뒤 `autoPlay`를 내려 화면 모드가 바뀌어도 되풀이하지 않는다. Android는 파일을 비동기로 읽어 정지 상태의 마크가 카드보다 300ms쯤 늦게 나타날 수 있다. scripts의 check가 생성 파일을 입력으로 삼도록 turbo 설정을 더했다.
