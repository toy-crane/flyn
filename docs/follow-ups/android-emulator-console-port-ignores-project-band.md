# Android Emulator 콘솔 포트가 프로젝트 포트 대역을 따르지 않는다

**Symptom**: 프로젝트 포트 대역이 Supabase, API, Metro 포트만 나눈다. 개발 세션이
Android Emulator에 주는 콘솔 포트는 대역과 무관하게 `5554 + slot × 2`라서, 같은
컴퓨터의 다른 프로그램(Android Studio, 손으로 띄운 `emulator -avd`, 다른
프로젝트)이 그 포트를 쓰고 있으면 `bun run dev android`가 "Emulator 콘솔 포트
5554을(를) 다른 프로그램이 쓰고 있습니다"로 멈춘다.

**Observed evidence**: 2026-09-02 `claude/flyn-hello-97c8da`에서 코드 리뷰로
확인했다. `scripts/dev/adapters/android.ts`의 `emulatorPort(slot)`는 `band`를
받지 않고, `scripts/dev/slots.ts`의 slot 배정은 Metro와 API 포트만 비어 있는지
본다. 포트가 잡혀 있으면 `startEmulator`가 다음 빈 포트를 찾지 않고 실패한다.
dearly의 세션 스크립트는 에뮬레이터를 직접 띄우지 않고 실행 중인 serial만
붙으므로, dearly만으로는 이 충돌이 나지 않는다. 실제로 재현하지는 않았다.

**Suspected cause**: 대역을 도입할 때 Emulator 콘솔 포트를 빠뜨렸다. 다만 Android
Emulator의 `-port`는 `5554`～`5682`의 짝수 65개뿐이라, Metro·API처럼 slot 간격
안에 대역 한 자리를 넣는 방식은 slot 33개 × 대역 10개를 담지 못한다.

**What was tried**: 아무것도 바꾸지 않았다. iOS만 실제 세션으로 검증했고, 명세의
수용 기준도 iOS 세션과 Supabase·API·Metro 포트만 다룬다.

**Proposed next step**: 콘솔 포트를 고정 계산 대신 `5554`부터 짝수로 올라가며 빈
포트를 찾아 쓰고, 실행 중인 AVD는 지금처럼 serial로 다시 찾는 방식을 검토한다.
대역을 넣고 싶다면 slot 수를 줄이는 대신 `5554 + (slot × 10 + band) × 2`처럼
간격을 바꾸되 65개 한도를 넘지 않는지 먼저 계산한다.
