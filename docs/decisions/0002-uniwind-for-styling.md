---
status: accepted
---

# 스타일링 라이브러리로 Uniwind (Free 티어) 채택

Expo 앱의 스타일링에 NativeWind 대신 **Uniwind**(Unistyles 제작팀의 Tailwind-for-React-Native)를 쓴다. **Free(OSS/MIT) 티어로 시작**하고, Pro는 실제로 측정된 리렌더 병목이나 className 기반 애니메이션 요구가 생길 때 **조건부로 드롭인 승급**한다. 채택 근거: Tailwind v4 1급 지원, Babel 없이 Metro 플러그인만(콜드 빌드 이점), ThemeProvider/Context 불필요(CSS `@theme`), Bun/Expo Go와 마찰 0(Free는 네이티브 모듈 없음), 그리고 **NativeWind와 양방향 드롭인 마이그레이션**이라 되돌리기 비용이 낮아 젊은 라이브러리 채택 리스크가 작다.

## Considered Options

- **NativeWind (v5)** — 성숙도·생태계·예제 최강이자 사실상 기본값(Expo 공식 tailwind 스킬 기준). 그러나 성능/re-render 오버헤드 불만(v4가 StyleSheet 대비 ~400% 느린 벤치, reanimated 버그발 "everything animated" 우회), Babel 플러그인 필요, 사실상 단독 메인테이너. v5가 성능을 개선 중이라 격차는 좁혀지는 표적.
- **Uniwind Pro (처음부터)** — C++ 엔진 zero-re-render + Reanimated4 애니메이션이 강력하나, 유료 구독(≈$99/인·년부터) + dev build 강제(Expo Go 상실) + 인증 게이트 다운로드(월 쿼터·postinstall) 부담. 측정된 병목 전에는 과투자로 판단.

## Consequences

- **Tailwind v4 사용**(v3 아님). 테마는 `@theme`로 CSS에 정의.
- **설정:** `metro.config.js`에서 `withUniwindConfig`가 최외곽 래퍼여야 하고, `cssEntryFile` 경로가 Tailwind 스캔의 app root를 결정. Babel 프리셋 불필요.
- **모노레포:** 심링크 워크스페이스라 자동 스캔이 안 되므로, `global.css`에 `@source '../packages/<ui>'`로 공유 UI 패키지 경로를 명시해야 className이 스캔된다.
- **Pro 승급 시 추가 부담(ADR 0001과 맞물림):** `react-native-nitro-modules`·`react-native-reanimated@>=4`·worklets 네이티브 모듈 → **dev build 필수**, Bun의 `trustedDependencies`에 `uniwind-pro` 추가 필요(postinstall 인증·다운로드), EAS에 `UNIWIND_AUTH_TOKEN` 시크릿, 월 다운로드 쿼터(개인 300 / CI 1,000) 유의. RN 0.81–0.86 · Expo SDK 54–57 호환.
- **성능 기대치:** Free의 우위는 소폭이며 극적 배수(2~3.2x)는 Pro의 C++ 엔진 기준. NativeWind v5가 성능 격차를 좁히는 중임을 감안한다.
