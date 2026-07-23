# flyn 디자인 가이드라인

Apple HIG 기반. 앱·프로토타입·이후 추가되는 모든 화면에 적용된다.
전환 배경: [ADR 0001](decisions/0001-apple-hig-design-language.md)

## 원칙

1. **네이티브가 기본값** — OS가 주는 것을 다시 만들지 않는다.
2. **컬러·크기는 시맨틱으로** — 컴포넌트·화면에 고정 hex를 직접 쓰지 않는다.
3. **브랜드는 예외 목록에만 산다** — 아래 [브랜드 예외](#브랜드-예외-닫힌-목록)가 전부다. 늘리려면 이 문서에 등재부터.
4. **모든 화면은 라이트·다크 두 벌** — 화면 완료 정의에 다크 모드 확인이 포함된다.

## 커스텀 재현 금지 (네이티브 사용)

- 스택 헤더·백 버튼(expo-router `Stack`), 탭 바(`NativeTabs`), 시트(라우트의
  `formSheet` 프레젠테이션 + 시스템 그래버), Sign in with Apple 공식 버튼,
  `Switch`·`Alert`·액션 시트·컨텍스트 메뉴, 세이프 에어리어 처리.
- 헤더는 기본값을 존중한다: 타이틀 17pt(fontSize 오버라이드 금지), 헤어라인
  유지(`headerShadowVisible: false` 금지). 탭 루트 3개(홈·서재·프로필)는
  네이티브 라지 타이틀 — 본문에 커스텀 화면 제목 텍스트를 두지 않는다.

## 컬러 토큰

토큰만 사용한다. 새 색이 필요하면 이 표에 먼저 추가한다.

| 토큰 | iOS 시맨틱 | 라이트 | 다크 | 용도 |
|---|---|---|---|---|
| `background` | systemBackground | `#ffffff` | `#000000` | 캔버스형 화면 배경 |
| `grouped` | systemGroupedBackground | `#f2f2f7` | `#000000` | 리스트·폼형 화면 배경 |
| `cell` | secondarySystemGroupedBackground | `#ffffff` | `#1c1c1e` | 카드·그룹 리스트 셀 |
| `label` | label | `#000000` | `#ffffff` | 본문 텍스트 |
| `secondary` | secondaryLabel | `rgba(60,60,67,.6)` | `rgba(235,235,245,.6)` | 보조 텍스트 |
| `tertiary` | tertiaryLabel | `rgba(60,60,67,.3)` | `rgba(235,235,245,.3)` | 플레이스홀더·셰브론·장식 |
| `separator` | separator | `rgba(60,60,67,.29)` | `rgba(84,84,88,.65)` | 구분선 |
| `fill` | tertiarySystemFill | `rgba(118,118,128,.12)` | `rgba(118,118,128,.24)` | 칩 기본·AI 버블·행 눌림 |
| `tint` | systemBlue | `#007aff` | `#0a84ff` | 액센트 전부 (단일) |
| `tint-soft` | systemBlue 15/25% | `rgba(0,122,255,.15)` | `rgba(10,132,255,.25)` | tinted 버튼·선택 배경 |
| `danger` | systemRed | `#ff3b30` | `#ff453a` | 파괴적 동작·오류 |

- 의미를 전달하는 텍스트는 `label`/`secondary`까지. `tertiary`는 장식·플레이스홀더 전용.
- 장르 북커버 4색(`genre-*`)은 브랜드 예외 — 라이트/다크 동일 값.

## 타이포그래피

iOS 텍스트 스타일 스케일만 쓴다. 임의 px(예: 23) 금지.

| 스타일 | 크기/굵기 | flyn에서의 역할 |
|---|---|---|
| Large Title | 34/700 | 탭 루트 화면 제목 (네이티브 헤더가 렌더) |
| Title2 | 22/700 | 시트·결과 헤드라인 |
| Title3 | 20/600 | 카드 제목, 결말 타이틀 |
| Headline | 17/600 | 강조 본문, 행 제목 |
| Body | 17/400 | **읽는 텍스트 전부** — 내레이션·대사·교정문·입력바 |
| Callout | 16/400 | 카드 소개문, 교정 설명 |
| Subheadline | 15/400 | 보조 설명 |
| Footnote | 13/400 | 훑는 정보 — 메타·라벨·섹션 헤더 |
| Caption1/2 | 12·11/400 | 배지·타임스탬프 |

- 굵기는 semibold(600) 우선. bold(700)는 라지 타이틀·헤드라인·수치 강조만.
- `allowFontScaling`을 끄지 않는다(Dynamic Type). 레이아웃이 깨지는 곳만
  `maxFontSizeMultiplier`로 상한을 둔다.
- 카운터·통계 수치는 `fontVariant: tabular-nums`.

## 셰이프

- 버튼·칩·배지·태그·입력바 필드: **캡슐**(`rounded-full`).
- 카드·그룹 리스트: **20pt** + `borderCurve: 'continuous'`.
- 채팅 버블: 18pt + 꼬리 4pt (브랜드 예외).
- 시트 라운드는 시스템에 위임한다.

## 화면 배경 체계

- **리스트·폼·카드 중심** 화면 → `grouped` 배경 + `cell` 카드: 홈, 프로필,
  온보딩, 상황 만들기, 결과.
- **캔버스 중심** 화면 → `background`: 스토리 세션, 책 상세, 서재 그리드, 로그인.
- 카드·셀은 `cell` 색 면으로만 구분 — 테두리·그림자 없음. **흰 배경 위 회색 필
  카드(토스 역전 배치)는 쓰지 않는다.**

## 컨트롤

- **주 CTA**: 캡슐 filled(`tint` 배경 + 흰 17/600), 높이 50, 화면당 1개.
  하단 고정 배치(CtaBar)는 유지한다 — Apple 온보딩 문법과 동일.
- **보조 버튼**: tinted 캡슐(`tint-soft` 배경 + `tint` 텍스트).
- **텍스트 버튼**: plain `tint` 텍스트.
- **눌림 상태 필수**: filled/tinted는 `opacity 0.75`, plain 텍스트는
  `opacity 0.4`, 리스트 행은 `fill` 배경 하이라이트.
- **비활성**: `fill` 배경 + `tertiary` 텍스트. 전체 opacity 낮추기 금지.
- **선택 표시**: 단일 선택은 체크마크(`checkmark` SF Symbol, `tint`).
  다중 선택 칩은 선택 시 `tint` 필 + 흰 텍스트. 틴트 연한 배경만으로
  선택을 표시하지 않는다.
- **파괴적 동작**: `danger` plain 텍스트, 리스트 행은 왼쪽 정렬.
  확인은 네이티브 Alert/액션 시트.

## 리스트

inset grouped 문법: `cell` 배경, 그룹 라운드 20, **구분선은 라벨 시작선부터
인셋**, 셰브론은 `tertiary`, 행 최소 높이 44, 섹션 헤더는 Footnote `secondary`.

## 아이콘

SF Symbols만 쓴다(`expo-symbols` / 바 버튼은 `Stack.Toolbar.Button`).
텍스트 글리프(`➤` `→` `＋`)·이모지를 UI 아이콘으로 쓰지 않는다.
Android는 `md=` 폴백을 함께 지정한다.

## 상호작용

- 터치 타깃 44×44pt 이상.
- 완료 순간(결말 도달, 목표 달성)에 가벼운 햅틱(`expo-haptics`, iOS 한정).
- 나타나고 사라지는 상태 변화에 entering/exiting 애니메이션.

## 브랜드 예외 (닫힌 목록)

1. **책의 목소리**: 내레이션·북커버 제목·"The End" = 세리프(`ui-serif`, New York) 이탤릭.
2. **장르 북커버 4색** + 폴백 네이비 — 라이트/다크 동일(표지는 인쇄물 은유).
3. **앱 마크·앱 아이콘** (파랑 배경 + 말풍선 모티프).
4. **채팅 버블**: iMessage 문법 — 학습자 `tint` 필 우측 꼬리, AI `fill` 좌측 꼬리.

## 프로토타입

`prototype.html`의 `:root` 토큰과 패턴은 이 문서와 동기화한다.
새 화면 프로토타이핑도 이 문서를 따른다.

## 구현 메모

- 토큰은 NativeWind CSS 변수로 유지하되 값은 위 표를 따르고, 다크는
  `prefers-color-scheme`로 전환한다. 네이티브 크롬 prop(헤더·탭 tint 등)에는
  가능하면 시스템 기본값을 그대로 두거나 `Color` API(expo-router)를 쓴다.
- `app.json`의 `userInterfaceStyle`은 `automatic`, 루트 `ThemeProvider`의
  라이트 고정을 해제한다.
