# 라이브러리 수정

## heroui-native 1.0.9

`Menu.Content`의 진입 효과를 감싼 뷰에 `StyleSheet.absoluteFill`을 적용한다.
절대 위치의 자식만 둔 기존 뷰는 높이가 0이다. 메뉴는 보이지만 iOS와 Android의
접근성 목록에서 메뉴 항목이 빠지고, 이름으로 선택할 수도 없었다.
감싼 뷰의 영역을 확보하면 메뉴의 위치·크기·누름·진입 효과를 유지하면서 항목이 노출된다.
기본 진입 효과와 사용자 지정 Keyframe 경로의 소스와 배포 JavaScript에 같은 수정을 둔다.

`bun install --frozen-lockfile`이 고정한 버전과 패치를 함께 설치한다.
HeroUI를 갱신할 때 메뉴 항목을 접근성 이름으로 선택하고 확인창을 취소하는 흐름을
iOS·Android에서 다시 확인한다. 원본이 감싼 뷰의 영역을 확보하면 패치를 제거한다.
