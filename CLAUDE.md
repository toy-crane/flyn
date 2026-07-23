# flyn

Expo SDK 57 + Expo Router + NativeWind 5 (Tailwind 4). 패키지 매니저: bun.

## 구조와 import 방향

파일은 자기 층과 아래 층만 import한다. 위 방향 import 금지, feature 간 import 금지.

```
src/
├── app/          # ① 라우트 전용. default export는 여기서만
├── screens/      # ② 화면 본문 — 라우트 파일은 얇은 래퍼
├── features/     # ③ (독립 도메인 2개+ 시 도입) 도메인 모듈
├── components/   # ④ 공유 UI
├── hooks/        # ④ 공유 훅
├── lib/          # ⑤ 외부 서비스 클라이언트
├── utils/        # ⑤ 순수 헬퍼 (+ *.test.ts 콜로케이션)
├── tw/           # ⑤ NativeWind 프리미티브 — import { View, Text } from "@/tw"
├── types/        # ⑤ 공유 타입
└── server/       # 서버 전용 — src/app/api/*+api.ts만 import 가능
```

## 규칙

- 재export 전용 barrel(`index.ts`) 금지 — 소스를 직접 import (`@/components/button` O, `@/components` X). 구현을 담는 `index.tsx`는 허용.
- 폴더 경계를 넘으면 `@/` 별칭, 상대경로는 같은 폴더 안에서만.
- 파일명 kebab-case, 컴포넌트는 named export 1개.
- 타입만 필요하면 `import type`.
- 새 화면: `src/screens/<name>/index.tsx`, 전용 컴포넌트는 그 안의 `components/`.
- `src/tw/`는 재배치하지 않는다.
