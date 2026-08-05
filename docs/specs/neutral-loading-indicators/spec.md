# 중립 로딩 indicator

## 원하는 결과

로딩은 진행 중인 상태를 조용히 알리고, 사용 가능한 action처럼 보이지 않는다.
라이트·다크와 접근성 appearance에 맞춰 변하는 시스템 회색을 사용하며 React
Native와 Expo UI surface가 같은 의미를 유지한다.

## 확정된 결정

- 화면에 독립적으로 나타나는 수동형 로딩 indicator는 중립 회색을 사용한다.
- 색 원본은 스타일 파운데이션의 `loadingIndicator` 의미 역할이다. iOS는 동적
  system gray, Android는 중립적인 Material on-surface variant에 연결한다.
- RN과 Expo UI는 같은 의미 색을 소비하지만 renderer 경계를 합치지 않는다.
  RN indicator와 완결된 native `Host` indicator를 각각 재사용한다.
- native indicator의 회색은 해당 indicator subtree에만 적용한다. 앱 전체
  `Host`나 action tint를 회색으로 바꾸지 않는다.
- 버튼 안의 진행 표시는 버튼의 전경색을 따른다. filled primary action 안에서는
  흰색을 유지하며, 로딩 indicator의 중립 색을 강제하지 않는다.
- pull-to-refresh처럼 renderer가 직접 만드는 수동형 진행 표시도 가능한 공식
  color surface에서 같은 `loadingIndicator` 역할을 사용한다.

## 적용 범위

- launch session 확인
- 채팅 목록·상세의 최초 조회
- 로그인·계정 삭제처럼 화면을 막는 진행 overlay
- 실제 text가 오기 전 AI 응답 대기
- 사용자가 직접 당긴 pull-to-refresh

## 컴포넌트 경계

- 공통 컴포넌트는 renderer와 의미 색, 기본 크기만 소유한다.
- 화면은 로딩 여부, 표시 지연, overlay와 정렬, 문맥에 맞는 접근성 이름을
  계속 소유한다.
- action 안의 spinner와 수동형 indicator를 하나의 variant 집합으로 묶지 않는다.
  서로 다른 foreground 소유권을 가진다.
- RN과 Expo UI를 하나의 renderer로 위장하거나 control마다 `Host` 경계를
  왕복하지 않는다.

## 하지 않는 것

- 제품 accent나 navigation tint를 회색으로 바꾸기
- 고정 gray hex를 화면마다 복사하기
- 로딩 상태·지연·overlay layout을 공통 indicator 안으로 옮기기
- spinner의 크기나 animation을 새로 디자인하기
- 버튼 안의 흰 spinner를 회색으로 바꾸기

## 완료 조건

- 수동형 indicator에 파란 system action tint가 남지 않는다.
- 같은 의미 색이 RN과 Expo UI indicator에 적용된다.
- 라이트·다크에서 indicator가 배경과 구분되면서 action보다 낮은 위계로 보인다.
- 기존 로딩 시점, 200ms launch 표시 지연, overlay interaction 차단과 접근성 이름이
  유지된다.
- theme, component, screen test와 typecheck·lint가 통과한다.

## 남은 위험

- 시스템 gray의 실제 대비와 위계는 simulator에서 봐야 확정할 수 있다. 표준
  라이트·다크에서 너무 흐리거나 강하면 의미 역할은 유지한 채 플랫폼 mapping만
  조정한다.
