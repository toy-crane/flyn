# Apple HIG 디자인 언어로 전환 (토스 스타일 폐기)

MVP 스펙은 토스 스타일 비주얼(단일 브랜드 블루 #3182f6, 흰 배경 위 회색 필 카드,
블록형 풀폭 CTA, 고정 hex 토큰)을 채택했고 S0에서 그대로 구현됐다. 2026-07-23,
비주얼 언어를 Apple HIG 표준으로 전환하기로 결정했다: 액센트는 브랜드 블루 대신
**systemBlue**(순정), 배경은 grouped 체계(회색 배경 + 흰 셀), 버튼은 캡슐,
컬러는 iOS 시맨틱 팔레트 미러링 — 그 결과 사실상 무료가 되는 **다크 모드도 보류를
뒤집어 범위에 포함**한다. 이유: 네이티브 크롬(백 버튼·링크·토글)과 자동으로
일치하고, 다크·고대비 변형을 OS가 관리하며, 토스 블루와 systemBlue의 차이가
미묘해 브랜드 효용이 낮았다. 브랜드는 닫힌 예외 목록(세리프 책의 목소리, 장르
북커버 4색, 앱 마크, iMessage형 버블)으로만 남는다. 규칙 전문은
[design-guidelines.md](../design-guidelines.md), 마이그레이션 범위는
[specs/apple-hig-design-language/spec.md](../specs/apple-hig-design-language/spec.md).
