# 실기기 LAN 개발 검증

2026-09-07 기준 구현 중간 확인이다. 자동 검사와 아래에 기록한 가상 기기 경로를 확인했다. 실기기 수락 기준과 일부 회귀 검증은 아직 완료하지 않았다.

## 구현과 실행

- `bun run dev ios android --physical`은 Mac의 LAN IPv4를 자동 선택하고 현재 worktree의 API·Metro와 연결 링크를 준비한다. 실기기 빌드·설치와 기기 조작은 수행하지 않는다.
- `--host <IPv4>`로 Mac에 배정된 주소를 직접 고른다. 후보 없음, 여러 후보, 잘못된 주소는 지정 방법을 안내한다.
- 앱의 `@env`는 개발 번들을 받은 Metro URL에서 호스트를 읽는다. API와 Supabase는 worktree 개발 세션의 포트와 합친다. Storage URL도 같은 Supabase 클라이언트에서 생성한다.
- Bun과 Expo config는 React Native를 불러오지 않는 순수 환경 스키마를 사용한다. 개발 세션 포트가 없으면 일반 배포 URL을 유지한다.
- 호스트 변경은 세션 환경 fingerprint에 반영한다. 가상 기기를 추가하면 기존 LAN 설정을 유지한다. LAN 연결이 사라져도 가상 기기만 실행할 때는 기존 loopback 경로를 사용할 수 있다.
- 설치된 Expo Router 57.0.18의 `expo-router/build/getDevServer`를 사용한다. React Native 0.86.3의 실제 bundle URL을 읽는 구현을 확인했다. 이 내부 경로는 Expo 업그레이드 때 다시 확인해야 한다.

검증 worktree는 `/Users/toycrane/.codex/worktrees/df4b/flyn`, slot은 4다. 당시 Mac LAN 주소는 `192.168.45.159`, API는 3941, Metro는 8122, 공용 Supabase는 54331이었다.

```bash
bun run dev ios --physical
bun run dev ios
bun run dev android
bun run dev ios android --physical --host 192.168.45.159
bun run dev:status
```

자동 선택과 명시한 주소가 같은 세션을 사용했다. 마지막 명령에서 API·Metro PID 646·649와 두 가상 기기의 연결을 유지했다. 다른 worktree의 slot 1 API·Metro PID 19105·19106도 유지했다. Mac에서 LAN API `/health`, Metro `/status`, Supabase `/auth/v1/health` 응답을 확인했다. 이는 폰에서의 연결 성공을 뜻하지 않는다.

## 자동 검사

| 검사 | 최종 결과 |
| --- | --- |
| `bun test scripts/dev` | 133개 통과 |
| `bun run --cwd apps/mobile test --runInBand` | 74개 suite, 532개 통과 |
| `bun run --cwd apps/api test` | 98개 통과 |
| `bun run check` | 5개 작업 통과 |
| `bun run check-types` | 5개 작업 통과 |
| `bunx ultracite check scripts/dev apps/mobile/env.ts apps/mobile/env.test.ts apps/mobile/env-runtime.ts apps/mobile/env-runtime.test.ts` | 51개 파일 통과 |
| `git diff --check` | 통과 |

CLI 옵션, LAN 주소 선택, 실제 Metro 주소에 따른 API·Storage URL, 주소 변경에 따른 환경 fingerprint를 실패 테스트부터 확인했다. 서버 오류 응답 구분과 LAN 상태 저장도 검사했다. 기존 환경 테스트 fixture의 누락된 지원 이메일·웹 주소를 보완했다.

네이티브 빌드와 함께 실행한 루트 `bun run test`에서는 모바일 두 suite가 시간 초과 등으로 실패했다. 빌드를 마친 뒤 모바일 전체를 순차 실행한 최종 결과는 모두 통과했다. 동시 실행 부하가 원인일 가능성은 있지만 확정하지 않았다. 타입 검사에는 Turbo 캐시 관련 `Operation not permitted` 경고가 있었으며 검사 종료 코드는 0이었다.

## 가상 기기에서 직접 확인한 결과

- iOS: iPhone 17 Pro Simulator, iOS 26.5, `flyn-slot-4`, Development Build `com.odd.flyn`. 최종 native fingerprint는 `2bf28880bd0ae7ea336d819b22a31d28958a3902`다.
- Android: `flyn_dev_1`, `sdk_gphone64_arm64`, Android 15 / API 35, `emulator-5562`, Development Build `com.odd.flyn`. native fingerprint는 `0ae418a5ebc938b7d7c6cb410e935b7aa6b5f5cf`다.
- 두 기기 모두 기존 loopback Metro 연결에서 이메일 코드 요청·확인과 로그인을 완료했다. 로컬 `auth:otp`로 코드를 읽어 앱 화면에 입력했다. 세션 주입과 관리자 인증은 사용하지 않았다.
- iOS에서 첫 이야기 대화를 보내 실제 답변을 받았다. Android에서 같은 이야기 대화를 이어서 보내 답변과 1화 완료, 다음 화 안내를 확인했다. API 프로세스는 현재 worktree의 3941 포트였으나 요청별 서버 로그로 목적지를 입증하지는 못했다.
- 두 기기를 각각 LAN Metro 링크로 다시 열고 로그인 상태와 데이터 표시를 확인했다. iOS는 개발 메뉴에서도 `http://192.168.45.159:8122` 연결을 확인했다.
- 두 기기에서 스토리 표지 5개를 화면으로 확인했다. [iOS 표지](evidence/stories-ios.png), [Android 표지](evidence/stories-android.png).
- iOS에서 Simulator 기본 사진을 프로필에 선택하고 저장했다. 앱을 다시 연 뒤에도 사진이 유지됐다. Android에서도 같은 계정의 새 사진이 표시됐다. Android에서 처음 받은 사진이므로 iOS 업로드 전 캐시만으로 표시한 결과는 아니다. [iOS 재열기](evidence/avatar-ios-reopen.png), [Android 다운로드](evidence/avatar-android.png).
- 두 기기에서 실제 화면으로 로그아웃하고 각 `agent-device` 세션을 닫았다. 개발 서버는 계속 실행 중이다.

iOS 빌드 후 fingerprint가 한 번 바뀌어 기존 앱 자동 재연결을 거절했다. `bun run dev ios`로 재빌드한 뒤 두 가상 기기 연결을 정상 등록했다. 원인을 우회하거나 fingerprint 확인을 생략하지 않았다. [기존 fingerprint 후속 확인](../../follow-ups/parallel-worktree-native-fingerprint-drift.md)과 같은 원인인지는 확인하지 않았다.

## 남은 수락 기준과 재개 조건

- 사용자가 지정한 테스트 대상은 USB의 `kim의 iPhone`(iPhone 14, iOS 18.7.7)이다. USB 트리의 식별자를 Xcode와 대조했고 `transportType: wired`를 확인했다. 앞으로 이 기기 식별자로만 iPhone 검증을 수행한다.
- 대상 iPhone 14는 `developerModeStatus: disabled`, `ddiServicesAvailable: false`다. 앱 조회부터 `CoreDeviceError 10005: Developer Mode is disabled`로 실패했으므로 앱 설치 여부와 실행 성공은 아직 확인하지 못했다. 사용자가 기기에서 개발자 모드를 켜고 재시작 후 확인을 마쳐야 한다. LAN 서버의 Mac 응답 확인은 통과했다.
- 앞서 접근한 `toy-crane iphone`(iPhone 15 Pro, iOS 26.6.1)은 로컬 네트워크로 연결된 다른 기기였다. USB 대상 대조 전에 잘못 선택했다. 이 기기의 DDI 복구, `com.odd.flyn` 1.0.0 (1) 조회와 앱·LAN 링크 열기 결과를 USB iPhone 14의 검증 결과로 사용하지 않는다.
- 이전 화면 자동 검증에서 Mac의 `DevToolsSecurity`가 꺼져 있음을 확인했다. 활성화 명령은 Mac 전체에 계속 적용되는 보안 설정 변경에 대한 명시적 승인이 없다는 자동 승인 검토의 거절로 실행되지 않았다. 사용자에게 요청한 Mac 설정 변경 승인은 아직 받지 않았다. iPhone 개발자 모드와 Mac의 이 권한은 별도 설정이다.
- 실제 Android는 `adb devices -l`에 나타나지 않았다. 호환되는 Development Build가 설치된 폰을 USB로 연결하고 디버깅을 허용해야 한다.
- 두 실기기의 이메일 로그인·로그아웃, 실제 API 요청 목적지, Google 로그인, iPhone Apple 로그인, 모든 종류의 사진 다운로드·업로드·재열기는 미검증이다. 제공자 본인 확인은 사용자가 직접 진행한다.
- Android Emulator에서 새 사진 업로드는 미검증이다. 제공자가 준 프로필 사진과 이미지의 최종 요청 URL·응답도 아직 확인하지 않았다. `agent-device network dump`와 개발용 Network 이벤트 관찰에서 요청 기록을 얻지 못했다. 이미지의 화면 표시와 URL 단위 테스트를 실제 네트워크 기록으로 대체하지 않는다.
- 실제 IP 변경 후 재시작, 두 worktree의 실기기 A → B → A 전환, 한 worktree 종료 후 다른 쪽 기능 유지, 실기기와 가상 기기의 동시 기능 실행은 미검증이다.
- 생성된 iOS 설정에서 `NSAllowsLocalNetworking`과 로컬 네트워크 권한 문구를 확인했다. Android debug manifest는 HTTP를 허용했다. 배포용 설정은 바꾸지 않았다. 실제 폰의 OS 권한·대상 SDK별 동작은 남아 있다.
- `implement`의 모든 수락 기준 통과 뒤 단계인 전체 diff 자동 리뷰는 아직 실행하지 않았다. 실기기 검증과 남은 회귀 확인을 마친 실행 가능한 변경을 대상으로 Codex 표준 리뷰를 한 번 실행한다.
