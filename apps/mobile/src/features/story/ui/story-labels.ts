/**
 * 고르고 되돌아보는 화면이 쓰는 말.
 *
 * 스토리의 제목, 한 줄 소개, 상황 설명, 끝낸 화의 결과는 여기에 없다. 콘텐츠는
 * 서버가 소유하고 앱은 받은 글을 그대로 보여 준다. 여기 남는 것은 어느
 * 스토리에서나 같은 말뿐이다.
 *
 * 성공·타협·실패도 없다. 결말의 종류는 서버 안에서만 쓰는 말이라 화면 어디에도
 * 나오지 않는다. 진행을 문장으로 세는 말("5화 중 2화 완료")과 상태 낱말
 * ("시작 전", "완료")도 두지 않는다. 진행은 분절 바 하나로만 말한다.
 */
export const storyLabels = {
  /** 탐색의 목록 제목. */
  allStories: "모든 스토리",
  /** 탐색 탭의 이름이자 그 화면의 큰 제목. */
  browseTab: "탐색",
  /** 상세가 세는 총 화 수. */
  episodeCount: (total: number) => `에피소드 ${total}개`,
  /** 상세의 에피소드 목록 제목. */
  episodeList: "에피소드 목록",
  /** 어디서나 화를 번호로 부르는 말. */
  episodeNumber: (episode: number) => `${episode}화`,
  /** 대화 기록 헤더 오른쪽의 텍스트 버튼. */
  newConversation: "새 대화",
  /** 대화가 없는 스토리 탭이 안내하는 곳. */
  recentEmptyAction: "탐색에서 스토리 고르기",
  /** 대화한 스토리가 아직 없는 스토리 탭. */
  recentEmptyTitle: "아직 나눈 대화가 없어요",
  /** 스토리 탭의 목록 제목. */
  recentHeading: "최근 대화",
  /** 상세 우측 상단 버튼. 이 스토리의 대화 기록을 연다. */
  records: "대화 기록",
  /** 이 스토리에 아직 기록이 없는 대화 기록 화면. */
  recordsEmptyTitle: "아직 나눈 대화가 없어요",
  /** 대화 기록에서 미완료 회차를 다시 여는 버튼. */
  resume: "이어서 하기",
  /** Not shown: 회차 카드에서 이 회차를 이어가는 버튼. */
  resumeRun: (startedAt: string) => `${startedAt} 대화, 이어서 하기`,
  /** Shown when the stories could not be read, as the way to ask again. */
  retry: "다시 시도하기",
  /** Not shown: 회차 카드에서 끝낸 화의 대화를 여는 행. */
  reviewEpisode: (episode: number, title: string) =>
    `${episode}화 ${title}, 대화 보기`,
  /** Not shown: 회차 카드를 펼치고 접는 자리. */
  runCard: (startedAt: string) => `${startedAt}, 대화 기록 펼치기`,
  /** 상세 하단에 고정하는 하나뿐인 주요 행동. */
  start: "대화 시작하기",
  startFailedClose: "닫기",
  startFailedRetry: "다시 시도",
  /** 대화를 시작하지 못했을 때 그 화면 위에 띄우는 알림창. */
  startFailedTitle: "대화를 시작하지 못했어요",
  /** 스토리 탭의 이름이자 그 화면의 큰 제목. */
  tab: "스토리",
  /** Shown when the stories could not be read. */
  unavailable: "이야기를 불러오지 못했어요.",
} as const;
