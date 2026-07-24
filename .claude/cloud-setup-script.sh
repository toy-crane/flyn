#!/bin/bash
# Claude Code on the web 환경용 setup script 사본.
#
# 이 파일은 저장소에서 직접 실행되지 않는다. claude.ai/code → 환경 설정 →
# Setup script 필드에 아래 내용을 붙여넣어 사용한다 (버전 관리를 위한 백업).
#
# 하는 일: 클론된 저장소의 .claude/settings.json에 선언된 플러그인
# (enabledPlugins / extraKnownMarketplaces)을 Claude Code 실행 전에 설치한다.
# 특정 저장소나 플러그인에 대한 의존성이 없어 어떤 repo에도 적용된다.
# 실행 결과는 환경 스냅샷에 캐시되어 이후 세션은 즉시 시작된다.
#
# 새 플러그인을 즉시 반영하려면: settings.json 커밋 후 환경 설정에서
# setup script를 재저장(수정)해 스냅샷을 재생성한다. (약 7일 주기 자동 갱신)
command -v claude >/dev/null || exit 0
for s in /home/user/*/.claude/settings.json; do
  jq -r '.extraKnownMarketplaces[]?.source | select(.source=="github") | .repo + " " + ((.sparsePaths // []) | join(" "))' "$s" 2>/dev/null |
    while read -r repo sparse; do claude plugin marketplace add "$repo" ${sparse:+--sparse $sparse} || true; done
  jq -r '.enabledPlugins // {} | to_entries[] | select(.value) | .key' "$s" 2>/dev/null |
    while read -r p; do claude plugin install "$p" || true; done
done
exit 0
