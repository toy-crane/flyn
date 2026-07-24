// Metro가 CSS 엔트리(global.css)를 사이드이펙트 임포트로 처리한다.
// Expo가 생성하는 expo-env.d.ts는 gitignore 대상이라 새 클론에서 사라지므로
// 타입 선언만 저장소에 직접 둔다.
declare module "*.css";
