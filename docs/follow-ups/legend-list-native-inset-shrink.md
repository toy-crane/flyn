# 교정을 접을 때 인셋 반영보다 목록 높이가 먼저 줄어든다

**Symptom**: 질문 뒤 빈 공간이 있는 대화에서 교정을 접으면 원문이 아래로 이동했다.

**Observed evidence**: Legend List 3.3.5와 Keyboard Controller 1.22.3, Expo SDK 57의 실제 앱에서 재현했다. Android에서 자동 추적과 크기 보정을 모두 꺼도 3,362→3,133으로 이동했다. 현재 패치를 적용하고 기존 설정을 복원한 뒤에는 Android 270, iOS 886.33으로 펼침 전·접기 후 위치가 같았다. 녹화와 좌표 로그는 `/Users/toycrane/.codex/visualizations/2026/09/15/conversation-ui-completion/`에 있다. 비슷한 상위 라이브러리 보고는 [Legend List #475](https://github.com/LegendApp/legend-list/issues/475)다.

**Suspected cause**: 행 크기 감소와 하단 인셋 증가가 별도로 반영돼 네이티브 스크롤 뷰가 이전 인셋의 끝으로 위치를 제한한다. 인셋을 먼저 계산하는 것만으로는 해결되지 않았고, 인셋 보고 뒤 다음 프레임에 목록 높이를 반영하면 위치가 유지됐다.

**What was tried**: `patches/@legendapp%2Flist@3.3.5.patch`가 인셋을 먼저 계산하고 반영 신호를 기다린다. 고정 500ms 지연 시험은 제거했다. 목록의 기존 자동 추적 설정과 교정 전환을 유지한다. 상위 라이브러리에는 아직 이 저장소의 패치를 제출하지 않았다.

**Proposed next step**: 상위 라이브러리 수정 버전에서 짧은 질문과 긴 질문, 늦은 교정, 빠른 펼침·접기, 키보드·글자 크기 변경, 화면 종료를 두 플랫폼에서 재현한다. 원문 위치와 빈 공간이 유지되면 로컬 패치를 제거한다.
