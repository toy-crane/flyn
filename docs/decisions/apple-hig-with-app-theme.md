# 네이티브 표현은 Apple HIG를 따르되 앱 테마는 소유한다

이 기록은 [apple-hig-not-a-design-system](apple-hig-not-a-design-system.md)을
대체한다. 시스템 컴포넌트·내비게이션·상호작용 패턴을 우선하고 커스텀 컴포넌트
디자인 시스템을 만들지 않는 방향은 유지한다. 다만 색까지 OS에 전부 위임하면
RN의 주 스타일링 도구인 Uniwind에서 시맨틱 `className`을 쓸 수 없으므로,
light/dark 색 역할은 앱이 소유한다.

앱 테마는 Apple 시스템 색의 현재 숫자를 복제하는 표가 아니다. 역할 이름과
충분한 대비를 유지하는 작은 커스텀 팔레트다. `@expo/ui`의 네이티브 기본 표현과
Liquid Glass는 계속 시스템에 맡기고, 앱이 명시적으로 칠하는 면과 글자만 이
테마를 쓴다. Apple·Google처럼 외부 브랜드가 규격을 소유한 표면은 예외다.

이 선택으로 React Native `PlatformColor`가 제공하던 iOS 릴리스별 미세 조정과
Increase Contrast 자동 대응은 앱 소유 색에서 포기한다. 기본 light/dark 대비는
직접 검증하고, 접근성 테마가 제품 요구가 되면 별도 theme variant로 추가한다.
