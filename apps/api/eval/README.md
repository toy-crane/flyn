# 프롬프트 평가

API의 `.env.local`에 설정한 `AI_GATEWAY_MODEL`과 `AI_GATEWAY_API_KEY`를 사용한다.
실제 모델을 호출하므로 CI와 `bun run test`에는 포함하지 않는다.

```sh
bun run --cwd apps/api eval:ask
bun run --cwd apps/api eval:correction
bun run --cwd apps/api eval:scene
bun run --cwd apps/api eval:multi-cast
```

장면 평가는 환승 체크인의 첫 요청, 한국어 요청, 종료와 두 인물 대화를 세 번씩
실행한다. 운영과 같은 구조화 스트림과 part 변환을 쓰며, 화자, 한국어 혼입,
대표적인 행동 서술과 결말 시점을 검사한다. 첫 글자까지의 시간, 텍스트 델타,
프롬프트와 응답 전문을 기록한다. 행동 서술 검사는 일부 표현만 찾으므로 전문도
읽어야 한다. `eval:story-play`의 현재 후보도 같은 구조화 경로로 다음 화의 기억
반영을 확인한다. 이 명령의 `--baseline`은 고정된 이전 커밋의 텍스트 호출을 쓴다.

여러 인물 평가는 두 명과 세 명의 상황을 각각 세 번 실행한다. 실제 앞 응답을
다음 입력 기록에 넣어, 여러 사람 지목, 한 사람 지목, 의견 조율의 세 턴을 확인한다.
같은 구조화 스트림과 기계 검사를 쓰고 대사 전문을 남긴다. 기계 검사는 발화 수,
대사의 자연스러움, 누구에게 말하는지까지 판정하지 않으므로 전문을 따로 읽는다.

표현 확인 평가는 같은 21개 문장을 세 번 확인한다. 표기와 채팅 말투를 그대로
두는지, 철자와 문법 오류는 고치는지, 고친 문장과 항목에 표기 수정이 섞이지
않는지 검사한다. 한국어 안내도 확인한다. 하나라도 실패하거나 답을 받지 못하면
명령이 실패한다. 모델, 실행 시각, 프롬프트와 출력 전문은 `results`에 기록한다.

`--baseline`은 현재 프롬프트로 실행한 기록의 파일 이름에 baseline을 붙인다.
이전 프롬프트로 자동 전환하는 옵션은 아니다. 변경 전 실행에만 사용한다.

이 작업에서 보존한 비교 기록:

- [변경 전](results/correction-baseline-1789226591539.json): 16문장 × 3회,
  48개 중 29개 실패. 프롬프트를 바꾸기 전에 기록했다.
- [변경 후](results/correction-candidate-1789226729500.json): 예시에 없는 문장을
  포함한 19문장 × 3회, 57개 모두 통과.
- [문맥 보완 후](results/correction-candidate-1789227906436.json): 대화 문맥이 있는
  문장까지 20문장 × 3회, 60개 모두 통과. iOS에서 맞는 요청 문장을 더 공손하게
  고치는 일이 나타나 판정 대상과 예절 교정 제외를 명시했다. 추가한 문장은 보완 전
  평가에서도 통과했으므로 이 한 사례가 간헐적인 문제를 항상 재현한다고 보지는 않는다.
- [최종 변경 후](results/correction-candidate-1789228066622.json): 두 문장의 오타를
  고칠 때 문장 끝 부호를 보존하는 문맥 사례까지 21문장 × 3회, 63개 모두 통과.

자동 테스트는 변경 전의 실제 대소문자 교정 답 세 개가 검사에 실패하는지도
확인한다. 평가를 다시 실행해 생긴 다른 기록은 기본적으로 Git에서 제외한다.


## 사람과 일정을 구분하는 평가

`eval:role-ownership`은 카페의 13개 고정 장면에서 이전 프롬프트와 후보를 다섯 번씩 비교한다.
후보는 [role-ownership-candidate.ts](role-ownership-candidate.ts)에 둔다.
아직 품질 관문을 통과하지 못해 운영 프롬프트에는 적용하지 않는다.
처음에는 `prepare`로 입력과 프롬프트를 저장하고, `run`에서 실제 Luna를 호출한다.
서버 모델 설정이 Luna가 아니면 중단한다.

```sh
role_scratch=$(mktemp -d /tmp/flyn-role-ownership.XXXXXX)
bun run --cwd apps/api eval:role-ownership prepare "$role_scratch"
bun run --cwd apps/api eval:role-ownership run "$role_scratch"
```

[실제 오답 예시](fixtures/role-ownership-regressions.json) 7개를 다음 입력에 연결했다.
입력은 이미 있던 장면이므로 같은 입력을 복제해 호출 수를 늘리지는 않는다.
`prepare`가 저장하는 각 장면의 `regressionCases`에서 오답의 출처와 확인 항목을 볼 수 있다.

| 입력 | 고정한 실제 오답 | 개수 |
| --- | --- | ---: |
| o4-renamed-train | Noah의 기차를 사용자 일정으로 바꿈, 없는 출근 일정 추가, 기대 결말 누락 | 3 |
| o6-user-required | 사용자의 회의를 말한 뒤 다음 일정을 모르겠다고 답함 | 1 |
| o8-two-schedules | 상대 전환 표시 없이 같은 you로 두 사람의 일정을 말함, 발화 두 개 상한 초과 | 3 |

실제 eval과 자동 테스트는 같은 `roleOwnershipProblems` 검사를 사용한다.
`bun test`는 저장한 오답 7개를 떨어뜨리고 수정 예시를 통과시키는지 확인하며,
모델을 호출하지 않는다. 수정 예시는 검사 확인을 위해 작성한 것으로 새로운
Luna 응답이나 프롬프트 개선 결과가 아니다. 원문 오답의 결말과 기록도 보존한다.

추가한 상대 전환 검사는 이름을 부른 뒤 `your meeting, and you ... your train`처럼
두 일정을 연결하는 관찰된 표현만 찾는다. 다음 일정을 모른다는 검사도 알려진
일정을 답해야 하는 장면에만 적용한다. 모든 대명사나 말뜻을 판정하는 검사는
아니므로 실제 eval에서는 계속 출력 전문을 읽어야 한다. 기록 문구와 말투 검사는
이 일곱 예시의 통과 기준에 포함하지 않는다.

[130회 비교 원본](../../../docs/specs/episode-prompt-load-evaluation/simple-rules/results.md)은
실행 당시 검사 결과를 보존한다. 이번에 검사를 보강했다고 과거 결과를 덮어쓰지 않는다.
