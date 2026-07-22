# flyn

Expo SDK 57 + Expo Router + NativeWind 5 (Tailwind CSS 4) 유니버설 앱. 패키지 매니저는 **bun**.

## 폴더 구조와 import 방향

`src/` 레이어는 아래 순서를 가지며, 파일은 **자기 층과 아래 층만 import할 수 있다** (위 방향 금지, feature 간 금지). Metro는 순환 import를 빌드 에러로 잡아주지 않으므로 이 규칙이 유일한 방어선이다.

```
src/
├── app/          # ① 라우트 전용(Expo Router). 라우트 아닌 파일 금지. default export는 여기서만
├── screens/      # ② 화면 본문 — 라우트 파일은 <Home /> 렌더만 하는 얇은 래퍼
├── features/     # ③ (독립 도메인이 2개 이상 생기면 도입) 자기완결 도메인 모듈
├── components/   # ④ 공유 UI
├── hooks/        # ④ 공유 훅
├── lib/          # ⑤ 외부 서비스 클라이언트 (supabase.ts 등)
├── utils/        # ⑤ 순수 헬퍼 — 테스트는 옆에 *.test.ts로 콜로케이션
├── tw/           # ⑤ NativeWind 프리미티브 — import { View, Text } from "@/tw"
├── types/        # ⑤ 공유 타입
└── server/       # 서버 전용(비밀 env 접근). src/app/api/*+api.ts만 import 가능, UI 층 import 금지
```

폴더는 미리 만들지 않는다 — 해당 층의 첫 파일이 생길 때 만든다.

## 규칙

- **barrel 파일 금지**: 재export만 하는 `index.ts`를 만들지 말 것. 소스 모듈을 직접 import한다 (`@/components/button` O, `@/components` X). 구현 자체를 담는 진입점(`screens/home/index.tsx`)은 barrel이 아니므로 허용.
- 폴더 경계를 넘는 import는 `@/` 별칭, 상대경로는 같은 모듈 폴더 안에서만. `../`가 나오면 구조를 의심할 것.
- 파일명은 kebab-case. 컴포넌트는 named export 1개, default export는 라우트 파일에서만.
- 타입만 필요하면 `import type`으로 가져온다 (컴파일 시 소거되어 순환을 만들지 않음).
- 새 화면 추가: `src/screens/<name>/index.tsx`에 본문을 만들고 라우트는 얇게. 화면 전용 컴포넌트는 `src/screens/<name>/components/`에.
- 기존 파일(`src/tw/`, 현재 라우트)을 이 규칙에 맞춰 재배치하지 말 것 — 새 코드부터 적용한다.
