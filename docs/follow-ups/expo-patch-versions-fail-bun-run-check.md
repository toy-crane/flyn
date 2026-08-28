# Expo 패치 판이 뒤처져 bun run check가 실패한다

**Symptom**: `bun run check`가 `@repo/mobile`에서 멈춘다. `expo install --check`가
세 패키지의 기대 버전과 설치 버전이 다르다고 보고하고 코드 1로 끝난다.

```
expo@57.0.17 - expected version: ~57.0.18
expo-constants@57.0.15 - expected version: ~57.0.16
expo-font@57.0.1 - expected version: ~57.0.2
```

**Observed evidence**: 2026-08-28 `claude/shape-idea-episode-message-storage-e3d5d9`
브랜치에서 확인했다. `bun run --cwd apps/mobile check`가 위 세 줄을 내고 멈춘다.
`apps/mobile/package.json`의 세 버전은 `main`과 같다.

```bash
git show main:apps/mobile/package.json | grep -E '"expo"|"expo-constants"|"expo-font"'
```

즉 이 세션의 변경과 무관하다. Expo가 낸 새 패치 판을 프로젝트가 아직 안 올린
상태다. `check-types`와 `test`는 통과하므로 막히는 것은 `check` 하나뿐이다.

**Suspected cause**: `expo install --check`는 설치된 `expo` 판이 기대하는 패치
버전과 `package.json`에 적힌 범위를 비교한다. `~57.0.17`은 57.0.18을 받아들이지만
lockfile이 57.0.17에 고정돼 있어 실제 설치판이 기대와 어긋난다.

**What was tried**: 고치지 않았다. 이번 작업 단위(에피소드 메시지 단위 저장)의
검증 목록은 `db:reset`, `db:test`, `db:lint`, `check-types`, `test`이고 모두
통과한다. 버전을 올리면 네이티브 의존성이 함께 움직여 이 단위와 무관한 확인이
필요해진다. [모바일 Expo 의존성 호환](../decisions/mobile-expo-dependency-compatibility.md)이
그 절차를 소유한다.

**Proposed next step**: `bun run --cwd apps/mobile expo install --fix`로 세
패키지를 올리고, `bun run check`와 `bun run test`가 통과하는지 본 뒤 실제 기기에서
앱을 한 번 열어 확인한다. 그 확인까지가 한 작업 단위이므로 다른 변경과 섞지
않는다.
