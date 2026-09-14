/**
 * 고르고 되돌아보는 화면이 쓰는 말.
 *
 * 스토리의 제목, 한 줄 소개, 상황 설명, 끝낸 화의 결과는 여기에 없다. 콘텐츠는
 * 서버가 소유하고 앱은 받은 글을 그대로 보여 준다. 여기 남는 것은 어느
 * 스토리에서나 같은 말뿐이다.
 *
 * 성공·타협·실패도 없다. 결말의 종류는 서버 안에서만 쓰는 말이라 화면 어디에도
 * 나오지 않는다. 진행은 분절 바와 `현재 위치 · 화 제목`으로 짧게 말한다.
 */
export const storyLabels = {
  addEpisode: "에피소드 추가하기",
  /** 카드 뒤에 플린이 덧붙이는 말. 문구가 늘 같아 모델이 쓰지 않는다. */
  afterCard: "바꾸고 싶은 부분이 있으면 말해 주세요.",
  /** 탐색의 필터 칩. 공식 스토리와 내가 만든 것을 함께 보여 준다. */
  allStories: "전체",
  /** 탐색 탭의 이름이자 그 화면의 큰 제목. */
  browseTab: "탐색",
  cancel: "취소",
  /** 만들기에 실패했을 때 그 화면 위에 띄우는 알림창. */
  createFailedTitle: "스토리를 만들지 못했어요",
  /** 만들기 대화의 빈 입력창. */
  createPlaceholder: "메시지를 입력하세요",
  /** Not shown: 탐색 헤더 오른쪽의 아이콘 버튼과 빈 상태의 버튼. */
  createStory: "스토리 만들기",
  /** 만들기 대화 화면의 제목. */
  createTitle: "스토리 만들기",
  creationProgress: {
    cover: "표지를 그리고 있어요",
    saving: "거의 다 됐어요",
    script: "대본을 쓰고 있어요",
  },
  deleteRun: "삭제",
  deleteRunDescription:
    "이 회차의 모든 화에서 나눈 대화와 결말이 사라집니다. 되돌릴 수 없습니다.",
  deleteRunFailed: "삭제하지 못했어요. 다시 시도해 주세요.",
  deleteRunTitle: "이 회차를 삭제할까요?",
  episodeLimit: "에피소드는 최대 5화까지 넣을 수 있어요",
  /** 상세의 에피소드 목록 제목. */
  episodeList: "에피소드",
  /** 어디서나 화를 번호로 부르는 말. */
  episodeNumber: (episode: number) => `${episode}화`,
  /** 아직 만든 스토리가 없을 때 `내 스토리` 칩이 보여 주는 안내. */
  mineEmptyTitle: "아직 내 스토리가 없어요",
  /** 탐색의 필터 칩. 내가 만든 스토리만 보여 준다. */
  myStories: "내 스토리",
  /** 대화 기록 헤더 오른쪽의 텍스트 버튼. */
  newConversation: "새 대화",
  /** 스토리 카드에서 인물 목록 위에 붙는 이름. */
  outlineCast: "인물",
  /** 대화가 없는 스토리 탭이 안내하는 곳. */
  recentEmptyAction: "스토리 둘러보기",
  /** 대화한 스토리가 아직 없는 스토리 탭. */
  recentEmptyTitle: "아직 대화한 스토리가 없어요",
  /** 스토리 탭과 대화 기록의 목록 제목. */
  recentHeading: "최근 대화",
  /** 상세 우측 상단 버튼. 이 스토리의 대화 기록을 연다. */
  records: "대화 기록",
  /** 이 스토리에 아직 기록이 없는 대화 기록 화면. */
  recordsEmptyTitle: "아직 나눈 대화가 없어요",
  /** 대화 기록에서 미완료 회차를 다시 여는 버튼. */
  resume: "이어서 하기",
  /** Not shown: 회차 카드에서 이 회차를 이어가는 버튼. */
  resumeRun: (startedAt: string) => `${startedAt} 대화, 이어서 하기`,
  /** Not shown: 회차 카드에서 끝낸 화의 대화를 여는 행. */
  reviewEpisode: (episode: number, title: string, outcome: string) =>
    `${episode}화 ${title}, ${outcome}, 대화 보기`,
  /** Not shown: 회차 카드를 펼치고 접는 자리. */
  runCard: (startedAt: string, progress: string) =>
    `${startedAt}, ${progress}, 화 선택하기`,
  runMenu: (startedAt: string) => `${startedAt} 대화 관리`,
  /** 회차 카드에서 진행 바 아래에 보이는 현재 위치. */
  runProgress: (
    finished: number,
    total: number,
    next: { number: number; title: string } | null
  ) =>
    next
      ? `${next.number}/${total}화 · ${next.title}`
      : `${finished}/${total}화 · 완료`,
  /** 상세 하단에 고정하는 하나뿐인 주요 행동. */
  start: "대화 시작하기",
  startEpisode: "시작하기",
  startFailedClose: "닫기",
  startFailedRetry: "다시 시도",
  /** 대화를 시작하지 못했을 때 그 화면 위에 띄우는 알림창. */
  startFailedTitle: "대화를 시작하지 못했어요",
  /** 스토리 탭의 이름이자 그 화면의 큰 제목. */
  tab: "스토리",
  /** Shown when the stories could not be read. */
  unavailable: "이야기를 불러오지 못했어요",
} as const;
