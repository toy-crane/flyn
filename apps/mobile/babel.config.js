// Metro는 SDK 54+에서 이 파일 없이도 동작한다. 하지만 jest-expo의 플랫폼
// 프리셋(jest-expo/ios)은 babel 프리셋을 인라인으로 넘기지 않고 프로젝트의
// babel 설정에 의존한다 — 이 파일이 없으면 RN 소스의 Flow 문법에서 깨진다.
module.exports = (api) => {
  api.cache(true);

  return {
    presets: [require.resolve("expo/internal/babel-preset")],
  };
};
