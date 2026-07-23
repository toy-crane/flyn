# Apple HIG 디자인 언어 전환

토스 스타일 비주얼을 Apple HIG 표준으로 전환한다. 규칙 전문은
[design-guidelines.md](../../design-guidelines.md)(이 spec보다 우선),
배경은 [ADR 0001](../../decisions/0001-apple-hig-design-language.md).

## 확정 결정

- **액센트 = systemBlue** (#007aff / 다크 #0a84ff). 브랜드 블루 #3182f6 폐기.
  A/B 시안 비교 후 사용자 확정 (2026-07-23).
- **다크 모드 포함** — 기존 MVP spec의 '보류'를 뒤집음. 시맨틱 컬러 전환으로
  한계 비용이 낮아진 것이 근거. 사용자 확정 (2026-07-23).
- 컬러는 iOS 시맨틱 팔레트 미러링(라이트/다크 쌍), NativeWind CSS 변수 유지.
- 배경 체계: grouped(회색 배경 + 흰 셀) / 캔버스형은 background. 토스 역전
  배치(흰 배경 + 회색 필 카드) 금지.
- 버튼·칩·입력 필드 캡슐, 카드·그룹 20pt continuous. 눌림·비활성 상태 규정.
- 선택은 체크마크/틴트 필 — 연한 틴트 배경만으로 선택 표시 금지.
- 탭 루트 3개는 네이티브 라지 타이틀. 헤더 기본값 복원(17pt·헤어라인).
- 시트는 네이티브 formSheet 프레젠테이션 + 시스템 그래버.
- 유지(브랜드 예외, 닫힌 목록): 세리프 책의 목소리, 장르 북커버 4색+폴백,
  앱 마크, iMessage형 채팅 버블.
- 유지(이미 표준): 네이티브 스택·NativeTabs·SF Symbols·44pt 타깃·시스템 폰트·
  접근성 라벨 — 재작업 금지.

## 수정 범위 (감사 결과 기반)

토큰·설정:
- [ ] `src/global.css` — 시맨틱 토큰 표로 교체 + `prefers-color-scheme` 다크 쌍
- [ ] `app.json` — `userInterfaceStyle: "automatic"`, 스플래시 배경 다크 대응
- [ ] `src/app/_layout.tsx` — ThemeProvider 라이트 고정 해제, hex 제거,
      `headerShadowVisible`·`headerTitleStyle` 오버라이드 제거
- [ ] `src/app/(tabs)/_layout.tsx` — `tintColor="#3182f6"` 제거(시스템 기본)
- [ ] `src/app/(tabs)/(library)/_layout.tsx` 등 중복 헤더 hex 제거

컴포넌트:
- [ ] `cta-button` / `cta-bar` — 캡슐 filled/tinted, 눌림 0.75, 비활성
      fill+tertiary(opacity 금지)
- [ ] `grouped-list` — grouped 체계, 인셋 구분선, tertiary 셰브론, 로그아웃
      왼쪽 정렬
- [ ] `chip` / `badge` / `tag` / `choice-card` — 캡슐 + 선택은 체크마크/틴트 필
- [ ] `bottom-sheet` + `(story)/create` 라우트 — 네이티브 formSheet로 전환,
      커스텀 그랩 핸들 제거
- [ ] `input-bar` — 전송 버튼 SF Symbol(`arrow.up.circle.fill`), 필드 캡슐,
      placeholder `tertiary`
- [ ] `chat-bubble` — 학습자 `tint`/AI `fill` 시맨틱, 교정 밑줄 컬러 토큰화
- [ ] `headings` — 커스텀 23px 화면 제목 폐기(라지 타이틀로 대체)
- [ ] `scenario-card` / `list-row` / `stat-tile` / `empty-state` /
      `screen-scroll` — cell/grouped 체계 적용

화면·프로토타입:
- [ ] 탭 루트 3개 라지 타이틀 + grouped/배경 체계 적용, 나머지 화면 배경 매핑
- [ ] `docs/specs/story-roleplay-mvp/prototype.html` — `:root` 토큰·버튼·리스트
      패턴을 가이드라인과 동기화

## 남은 리스크

- NativeWind 정적 변수는 시스템 컬러의 고대비·elevated 변형까지는 못 따라간다
  — 크롬은 네이티브 기본값/Color API로 보완하고, 본문은 미러링으로 충분한지
  실기기에서 확인.
- iOS 26 Liquid Glass 환경에서 라운드 수치(그룹 20pt)와 탭 바 주변 여백은
  실기기 확인 후 조정 여지.
- Dynamic Type 확대 시 고정 높이 레이아웃(CTA 50, 행 44, 타일) 검수 필요.
- 온보딩 장르 8종 vs 커버 4색 미결 — 기존 MVP spec 리스크 그대로 유지.
- 다크 모드에서 `tint-soft`·장르 커버 대비 실측 필요.
