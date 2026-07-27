# 로그인 화면 — iOS 네이티브

동작하는 로그인(Apple·Google·이메일 OTP)을 iOS 네이티브 룩앤필로 다시 만든다.
**인증 로직은 건드리지 않는다** — `src/lib/auth/*` 헬퍼와 그 규약(성공은 `null`,
실패만 `{ error }`)은 그대로다. 바뀌는 것은 화면 구성·라우트·표현이다.

테크 스택 결정은 [../tech-stack/spec.md](../tech-stack/spec.md), 특히 §2의
"디자인은 Apple HIG 준수가 중심"이 이 스펙의 상위 근거다.

## 지금 무엇이 문제인가 (시뮬레이터 실측, iPhone 17 / iOS 26.5)

가장 큰 문제는 팔레트가 아니라 **소셜 버튼 두 개가 서로 다른 디자인 시스템**
이라는 것이다. Apple 버튼은 312×48에 코너 4, Google 버튼은
`GoogleSigninButton`의 구형 파란 타일 에셋이라 너비·높이·코너·파랑·그림자가 전부
다르다. 두 벤더 모두 "다른 로그인 수단과 동등 이상으로 노출하라"고 요구하므로
이건 미감 문제이기 전에 가이드라인 위반이다.

그 밖에: Tailwind slate/sky 팔레트라 iOS 시스템 색이 아니고, 타이포가 Dynamic
Type이 아니며, 세이프 에어리어 대신 `py-16` 하드코딩이고, 코드 입력이 같은 화면을
제자리에서 갈아끼우며, 카피가 개발 스캐폴딩("walking skeleton", "세션을 얻는다")이다.

## 확정 결정

### 1. 화면 구성 — 소셜 우선

세 안(소셜 우선 / 설정앱식 그룹 폼 / 현재 구조 리스킨)을 렌더해 비교했고
**소셜 우선**을 골랐다. iOS 앱 첫 화면의 지배적 패턴이고 화면이 가장 조용하다.

- 상단: flyn 워드마크(large title) + 중립적인 한 줄. **아이콘 없음.**
- 중단: Apple 버튼 → Google 버튼. 둘이 한 세트로 보여야 한다.
- 하단: `이메일로 계속하기` 텍스트 버튼 한 줄.
- 가운데 `또는` 구분선은 없앤다 — 소셜과 이메일이 대등하지 않게 됐으므로.

대가: 이메일 경로가 탭 하나 멀어진다. 이메일은 유일한 **자동 검증 경로**이므로
(근거: [../../auth-verification.md](../../auth-verification.md)) 개발 중 손이
한 번 더 간다. 감수한다.

### 2. 라우트 — 코드 입력은 push된 화면

제자리 교체를 없애고 네이티브 스택 전환으로 바꾼다.

| 경로 | 파일 | 헤더 |
| --- | --- | --- |
| `/sign-in` | `src/app/sign-in/index.tsx` | 없음 |
| `/sign-in/email` | `src/app/sign-in/email.tsx` | 네이티브 헤더 + 뒤로가기 |
| `/sign-in/code` | `src/app/sign-in/code.tsx` | 네이티브 헤더 + 뒤로가기 |

- 셋 다 `_layout.tsx`의 `Stack.Protected guard={auth.kind === "signedOut"}` 안.
  현재 `headerShown: false`는 스택 전체에 걸려 있으므로 하위 두 화면만 켠다.
- 이메일 주소는 `/sign-in/code`에 라우트 파라미터로 넘긴다.
- **`다른 이메일로 받기` 버튼은 삭제한다.** 헤더의 뒤로가기가 그 역할을 한다.
- 로그인이 성공하면 `onAuthStateChange`가 가드를 뒤집어 스택째 벗어난다 —
  화면들은 지금처럼 실패만 표시한다.

### 3. 소셜 버튼 — 두 개를 한 세트로

같은 높이 **50pt**(HIG 최소 44), 같은 코너 **12**(`borderCurve: 'continuous'`),
같은 너비(컨테이너를 채운다 — 312 하드코딩 제거). **Apple을 위에** 둔다.

- **Apple**: `AppleAuthenticationButton` 유지. `buttonType`은 `SIGN_IN`이 아니라
  **`CONTINUE`** — Google 쪽 문구를 "계속하기"로 맞추므로. `buttonStyle`은
  라이트 `BLACK` / 다크 `WHITE`(현행 유지).
- **Google**: `GoogleSigninButton`을 **버린다.** Google 브랜딩 가이드라인대로
  직접 그린다. `GoogleSignin` 모듈 자체와 `signInWithGoogle()` 헬퍼는 그대로.
  - 라이트 `#FFFFFF` 배경 + `#747775` 1px 내부 스트로크
  - 다크 `#131314` 배경 + `#8E918F` 1px 내부 스트로크
  - 표준 컬러 "G" 로고를 **흰 배경 위에** 놓는다. 리사이즈·리컬러 금지,
    모노크롬 버전 금지, 로고 단독 사용 금지.
  - iOS 패딩: 로고 왼쪽 16 · 로고 오른쪽 12 · 텍스트 뒤 16
  - 문구 "Google로 계속하기"
  - 로고 에셋(PNG @1x/@2x/@3x)을 `apps/mobile/assets/`에 새로 넣어야 한다.
    현재 이 디렉터리 자체가 없다.

### 4. 색 — iOS 시맨틱 색으로 전면 교체

`expo-router`의 `Color` API를 쓴다(`expo-router@57.0.8`에 실재함을 확인:
`build/color/index.d.ts`의 `export declare const Color: ColorType`). 이것은
`PlatformColor`의 타입 안전 래퍼라 라이트/다크는 물론 **손쉬운 접근성 설정
(대비 증가 등)까지 OS가 알아서 반영**한다.

`apps/mobile/src/theme/colors.ts` 한 곳에 모으고 전부 거기서 import 한다.

| 쓰임 | 토큰 |
| --- | --- |
| 화면 배경 | `systemBackground` |
| 제목·본문 | `label` |
| 보조 문구 | `secondaryLabel` |
| 비활성 라벨 | `tertiaryLabel` |
| 채운 버튼 | `systemBlue` / 비활성 `systemGray5` |
| 입력 필드 배경 | `secondarySystemBackground` |
| 플레이스홀더 | `placeholderText` |
| 구분선 | `separator` |
| 에러 | `systemRed` |

- 배경은 `systemGroupedBackground`(연회색)가 아니라 **`systemBackground`**(흰/검)다.
  inset grouped 행이 하나도 없는 화면이라 회색 캔버스를 쓸 근거가 없고, 흰 Google
  버튼이 흰 배경 위에서 `#747775` 헤어라인으로 떠오르는 것이 Google 스펙의 의도다.
  *(변이 비교 목업에는 회색으로 그렸다 — 구성이 쟁점이라 배경은 세 안 공통이었다.)*
- **색에는 더 이상 `dark:` 변형을 쓰지 않는다.** 시맨틱 색이 스스로 뒤집는다.
  Uniwind의 `dark:`는 색이 아닌 용도에만 남는다.
- Uniwind와의 공존은 확인됨: className 스타일이 먼저, `props.style`이 나중에
  붙으므로 `style`이 이긴다.

### 5. 타이포·레이아웃

- 크기를 임의 지정하지 않고 iOS 텍스트 스타일 계열을 따른다: 워드마크는
  large title, 본문 17, 보조 15, 각주 13. `allowFontScaling` 기본값을 유지해
  **Dynamic Type이 실제로 동작하게** 둔다. 폰트 배율 상한(`maxFontSizeMultiplier`)은
  걸지 않는다 — 스크롤 뷰라 커져도 잘리지 않는다.
- 세이프 에어리어는 `ScrollView contentInsetAdjustmentBehavior="automatic"`으로
  잡는다. `py-16` 하드코딩과 `justify-center`를 걷어낸다.
- 패딩·간격은 `contentContainerClassName`에. Uniwind는 레이아웃·간격·타이포만 맡는다.
- 둥근 모서리에는 `borderCurve: 'continuous'`.
- `uppercase tracking-[3px]` 아이브로우("WALKING SKELETON")는 삭제한다.

### 6. 상태 표현

- **에러**: 화면 맨 아래 빨간 문장 대신, 버튼 묶음 **바로 아래 각주**로
  `systemRed`. `<Text selectable>`를 붙인다. `ERR_REQUEST_CANCELED`는 지금처럼
  조용히 무시한다.
- **진행 중**: 라벨을 "확인 중…"으로 갈아끼우지 않는다. 라벨은 두고
  `ActivityIndicator`를 얹는다.
- **비활성**: `opacity-40`은 iOS 관용이 아니다. 채운 버튼의 비활성은
  `systemGray5` 배경 + `tertiaryLabel` 라벨.
- 재진입 방지(`busy` ref)와 `IGNORED` 심볼 구분은 **그대로 유지한다.**
  둘 다 실패에서 배운 장치다.

### 7. 코드 입력

- 6칸 분리 박스가 아니라 **단일 필드**를 유지한다. `textContentType="oneTimeCode"`
  자동완성이 이 경로의 핵심이고, 칸을 쪼개면 그게 깨진다.
- 붙여넣기에서 숫자만 남기고 자르는 로직(`NON_DIGITS` → `slice`)은 **그대로 유지.**
  주석의 근거가 여전히 유효하다.
- `autoFocus`, `keyboardType="number-pad"` 유지.

## 가정 (기본값 — 반증 나오면 뒤집는다)

- **`@expo/ui`는 이 화면에 쓰지 않는다.** 능력 부족이 아니라 A안에서 이점이
  발생하지 않기 때문. 조사 결과와 근거는
  [../../decisions/0001-no-expo-ui-for-sign-in.md](../../decisions/0001-no-expo-ui-for-sign-in.md).
- **약관·개인정보처리방침 각주는 넣지 않는다.** 문서가 실제로 없기 때문이다.
  없는 곳을 가리키는 링크가 링크 없는 것보다 나쁘다. Apple 심사가 요구하는 것은
  App Store Connect의 URL이지 이 화면의 문장이 아니다. 문서가 생기면 그때 넣는다.
- **한국어 전용.** 앱의 모든 카피가 이미 하드코딩 한국어다. 다만
  `AppleAuthenticationButton`은 **기기 로케일**을 따르므로 영어 기기에서는
  "Sign in with Apple" + "Google로 계속하기"가 섞인다(아래 리스크).
- **`expo-haptics`를 새로 넣는다.** 로그인 성공·실패에 가벼운 피드백. Expo
  1st-party 패키지이고, 네이티브 감각의 상당 부분이 여기서 온다.
- SF Symbols가 필요해지면 `expo-symbols`가 아니라 **`expo-image`의 `source="sf:…"`**
  를 쓴다(Expo 공식 스킬 지침). 테크 스택 스펙 §2의 `expo-symbols` 언급은 이 점에서
  낡았다. 이 화면 자체는 심볼이 필요 없다.
- 기존 `sign-in.test.tsx`는 라우트가 셋으로 갈라지므로 파일도 갈라진다. 테스트가
  검증하던 **행동**(취소는 에러 아님 / 던져도 안 잠김 / 발송 실패 시 머무름 /
  붙여넣기 스크럽 / 6자리 게이트)은 하나도 잃지 않는다.

## 유보된 것

- **제품 카피와 아이콘.** flyn이 무엇인지가 아직 정해지지 않았다(테크 스택 스펙의
  "유보된 것"). 그래서 상단은 워드마크 + 기능적인 한 줄로 두고, 도메인 셰이핑
  이후에 태그라인과 앱 아이콘을 그 자리에 넣는다.
- **약관·개인정보처리방침 문서** 자체. 스토어 심사 전에는 반드시 필요하다.
- **로컬라이제이션.** 위 가정대로 한국어 전용으로 간다.
- **소셜 수단 추가**(카카오 등)는 여전히 채택하지 않음.

## 남은 리스크

- **Google Sans Medium을 쓸 수 없다.** Google 가이드라인은 이 독점 서체를
  요구하지만 배포 경로가 없다. 시스템 서체로 간다 — 가이드라인에서 벗어나는
  유일한 항목이고, 커스텀 버튼 자체는 명시적으로 허용된다(SDK 버튼이
  "strongly recommended"일 뿐). 문제가 되면 `GoogleSigninButton`으로 되돌아갈 수
  있으나 그러면 §3의 세트감이 다시 깨진다.
- **`AppleAuthenticationButton`의 너비.** 현재 코드가 312를 하드코딩한 것이
  네이티브 뷰 사이징 문제를 우회한 흔적일 수 있다. 컨테이너를 채우게 바꿀 때
  실제로 늘어나는지 시뮬레이터에서 먼저 확인할 것. 안 되면 `onLayout`으로 폭을
  재서 넣는다.
- **`PlatformColor`와 jest.** `Color`는 모듈 로드 시점에 `PlatformColor`를
  호출한다. jest-expo에서 렌더가 깨지지 않는지 첫 커밋에서 확인할 것. 테스트가
  색을 단언하지는 않으므로 깨진다면 목 하나로 끝날 문제다.
- **Apple 버튼 로케일 불일치.** 한국어 기기에서는 자연스럽지만 영어 기기에서는
  Apple 버튼만 영어가 된다. 로컬라이제이션을 도입하기 전까지 남는 흠이다.
- **소셜 경로는 여전히 사람이 눌러 확인해야 한다.** 이 화면을 고쳐도 자동 검증
  범위는 넓어지지 않는다. 시뮬레이터 준비물(유효한 Apple 개발 인증서, 시뮬레이터
  Apple 계정 재인증)은 [../../auth-verification.md](../../auth-verification.md)에 있다.
