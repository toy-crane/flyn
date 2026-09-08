# iOS 18에서 대화 본문과 상단 제목이 겹쳐 보인다

**Symptom**: 대화 완료 화면에서 위로 스크롤된 메시지가 상단 제목과 상태 표시줄 뒤에 겹쳐 보인다.

**Observed evidence**: 2026-09-07에 USB iPhone 14, iOS 18.7.7, Development Build `com.odd.flyn` 1.0.0 (1)로 확인했다. `df4b/flyn` worktree의 Metro 8122에 LAN으로 연결해 이메일 로그인 후 2화 대화를 완료했다. [당시 화면](evidence/ios18-header-overlap-iphone14.png)에 Owen의 앞선 메시지와 `계산이 꼬인 아침` 제목이 겹쳐 있다. [Android 15 대화 화면](evidence/ios18-header-overlap-samsung.png)에서는 같은 형태의 겹침이 보이지 않았다. 두 화면은 서로 다른 화이므로 플랫폼 차이의 원인으로 단정하지 않는다.

**Suspected cause**: iOS 네이티브 헤더의 배경 또는 스크롤 본문의 상단 처리와 관련됐을 가능성이 있다. 원인은 확인하지 않았다.

**What was tried**: 실제 대화 응답과 완료 상태를 확인하고 화면을 저장했다. LAN 연결 검증 범위에서 관련 없는 화면 변경을 하지 않았으며, 레이아웃 우회도 적용하지 않았다.

**Proposed next step**: 같은 2화 완료 상태를 iOS 18과 최신 iOS에서 다시 열어 스크롤할 때 재현되는지 확인한다. 재현되면 네이티브 헤더 배경과 본문의 상단 여백·잘림 처리를 확인하고, 입력 중·답변 중·완료 후 상태를 함께 검증한다.
