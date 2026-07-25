// Uniwind의 global.css는 Metro가 처리한다. jest는 CSS를 파싱하지 못하므로
// _layout처럼 CSS를 import하는 모듈을 테스트할 때 이 빈 모듈로 대체한다.
module.exports = {};
