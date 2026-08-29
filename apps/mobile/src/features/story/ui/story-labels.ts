/**
 * 고르고 잇는 화면이 쓰는 말.
 *
 * 스토리의 제목, 한 줄 소개, 예고, 끝낸 화의 결과는 여기에 없다. 콘텐츠는
 * 서버가 소유하고 앱은 받은 글을 그대로 보여 준다. 여기 남는 것은 어느
 * 스토리에서나 같은 말뿐이다.
 *
 * 성공·타협·실패도 없다. 결말의 종류는 서버 안에서만 쓰는 말이라 화면 어디에도
 * 나오지 않는다. 진행을 문장으로 세는 말("5화 중 2화 완료")과 상태 낱말
 * ("시작 전", "완료")도 두지 않는다. 진행은 분절 바 하나로만 말한다.
 */
export const storyLabels = {
  /** 스토리를 모두 끝낸 홈이 안내하는 곳. */
  allDoneAction: "스토리 보러 가기",
  allDoneCopy: "끝낸 이야기는 스토리 탭에서 언제든 다시 읽을 수 있어요.",
  allDoneTitle: "모든 스토리를 끝냈어요",
  /** 스토리 탭의 목록 제목. */
  allStories: "모든 스토리",
  /** 홈의 이어 하기 섹션 제목. */
  continueHeading: "이어 하기",
  /** 상세가 세는 총 화 수. 시작하기 전의 스토리에만 쓴다. */
  episodeCount: (total: number) => `에피소드 ${total}개`,
  /** 상세의 에피소드 목록 제목. */
  episodeList: "에피소드 목록",
  /** 어디서나 화를 번호로 부르는 말. */
  episodeNumber: (episode: number) => `${episode}화`,
  /** 처음 온 사용자의 홈에서 이어 하기 자리를 대신하는 제목. */
  firstHeading: "첫 이야기",
  /** 이어 하기 카드 말고 더 진행 중인 스토리의 섹션 제목. */
  inProgressHeading: "진행 중인 스토리",
  /** Not shown: 아직 열 수 없는 화. */
  lockedEpisode: (episode: number, title: string) =>
    `${episode}화 ${title}, 아직 열리지 않았어요`,
  /** Not shown: 상세의 목록에서 다음 화를 여는 행. 같은 화면의 버튼과 구분한다. */
  nextEpisode: (episode: number, title: string) =>
    `${episode}화 ${title}, 시작하기`,
  /** 진행하다 만 화를 다시 여는 버튼. */
  resume: "이어서 하기",
  /** 진행하다 만 화의 카드가 다음 줄에 두는 말. */
  resumeCopy: "진행하던 장면부터 이어가요.",
  /** Shown when the stories could not be read, as the way to ask again. */
  retry: "다시 시도하기",
  /** 고르는 탭의 이름이자 그 화면의 큰 제목. */
  tab: "스토리",
  /** Shown when the stories could not be read. */
  unavailable: "이야기를 불러오지 못했어요.",
} as const;
