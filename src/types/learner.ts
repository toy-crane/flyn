/**
 * Learner Profile (학습자 프로필) — the five onboarding answers.
 * Personalizes scenario generation, output difficulty, and correction strength.
 * Deliberately carries no identity data (no name, age, job, location).
 */

/** Self-diagnosed English level (온보딩 1 — 영어 수준). */
export type EnglishLevel = "beginner" | "intermediate" | "advanced";

/** What the learner wants English for (온보딩 2 — 학습 목적). Weights story subject matter. */
export type LearningGoal =
  "travel" | "living-abroad" | "business" | "exam" | "media" | "fun";

/** Story genre (온보딩 3 — 장르 취향). A preference weight, not a strict filter. */
export type Genre =
  | "mystery"
  | "thriller"
  | "scifi"
  | "fantasy"
  | "romance"
  | "daily"
  | "comedy"
  | "history";

/** Everyday interests (온보딩 4 — 관심사). Woven into stories as subject matter. */
export type Interest =
  | "travel"
  | "food"
  | "film"
  | "music"
  | "games"
  | "sports"
  | "books"
  | "science"
  | "animals"
  | "fashion"
  | "history"
  | "art";

export type LearnerProfile = {
  englishLevel: EnglishLevel;
  learningGoals: LearningGoal[];
  genrePreferences: Genre[];
  interests: Interest[];
  /** Optional — the learner's name inside stories. Skippable in onboarding. */
  nickname: string | null;
};

/** Retention surface: streak + lifetime totals shown on the profile tab. */
export type LearnerStats = {
  /** Consecutive days with a completed story session. */
  streakDays: number;
  completedStories: number;
  totalTurns: number;
  totalCorrections: number;
  /** Days since the learner joined — profile header ("함께한 지 32일"). */
  daysSinceJoined: number;
  /** Monday-first, seven entries — the profile's weekly dot row. */
  weeklyActivity: DayActivity[];
};

export type DayActivity = {
  /** Monday-first weekday label as shown in the dot row. */
  weekday: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  studied: boolean;
  isToday: boolean;
};

export const ENGLISH_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const satisfies readonly EnglishLevel[];

export const LEARNING_GOALS = [
  "travel",
  "living-abroad",
  "business",
  "exam",
  "media",
  "fun",
] as const satisfies readonly LearningGoal[];

export const GENRES = [
  "mystery",
  "thriller",
  "scifi",
  "fantasy",
  "romance",
  "daily",
  "comedy",
  "history",
] as const satisfies readonly Genre[];

export const INTERESTS = [
  "travel",
  "food",
  "film",
  "music",
  "games",
  "sports",
  "books",
  "science",
  "animals",
  "fashion",
  "history",
  "art",
] as const satisfies readonly Interest[];

/** Onboarding copy — the option itself and the line under it (프로토타입 ① 1/5). */
export const ENGLISH_LEVEL_COPY: Record<
  EnglishLevel,
  { title: string; detail: string; short: string }
> = {
  beginner: {
    title: "단어와 짧은 문장으로 말해요",
    detail: "기초 표현 위주로 또박또박 시작해요",
    short: "초급",
  },
  intermediate: {
    title: "하고 싶은 말을 대충 전달할 수 있어요",
    detail: "문장은 만들지만 중간중간 막혀요",
    short: "중급",
  },
  advanced: {
    title: "대화는 되는데 자연스럽지가 않아요",
    detail: "뉘앙스와 표현을 다듬고 싶어요",
    short: "고급",
  },
};

export const LEARNING_GOAL_LABEL: Record<LearningGoal, string> = {
  travel: "여행",
  "living-abroad": "해외 생활·취업",
  business: "일·비즈니스",
  exam: "시험 대비",
  media: "영화·드라마 즐기기",
  fun: "그냥 재미로",
};

export const GENRE_LABEL: Record<Genre, string> = {
  mystery: "미스터리",
  thriller: "스릴러",
  scifi: "SF",
  fantasy: "판타지",
  romance: "로맨스",
  daily: "일상",
  comedy: "코미디",
  history: "역사",
};

export const INTEREST_LABEL: Record<Interest, string> = {
  travel: "여행",
  food: "음식·요리",
  film: "영화·드라마",
  music: "음악",
  games: "게임",
  sports: "스포츠",
  books: "책",
  science: "과학·우주",
  animals: "동물",
  fashion: "패션",
  history: "역사",
  art: "미술",
};
