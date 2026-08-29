import type { UIMessage } from "ai";
import type { MergeDeep } from "type-fest";

import type { Database as GeneratedDatabase } from "./database.types";

export type { CompositeTypes, Enums, Json } from "./database.types";

/**
 * 생성 타입 위에 좁힌 타입을 얹는다.
 *
 * `supabase gen types`는 jsonb 열을 `Json`으로 내놓는다. 데이터베이스가 이 열에
 * 무엇을 담는지 아는 사실이 타입에서 사라지므로, 저장과 조회 양쪽에서 타입을
 * 강제로 바꿔치기하게 된다. Supabase 공식 문서가 권하는 방식은 생성 파일을
 * 고치는 대신 그 위에 좁힌 타입을 병합하는 것이다. 그러면 `bun run db:types`를
 * 다시 돌려도 이 파일이 살아남는다.
 *
 * part 구조를 데이터베이스에서 JSON 스키마로 검증하지는 않는다. 그 스키마는 AI
 * SDK가 판올림마다 바꾸는 계약이고, 런타임 검증은 이미 SDK가 같은 버전으로
 * 한다. 여기서 하는 것은 타입 수준의 약속뿐이다.
 */
export type Database = MergeDeep<
  GeneratedDatabase,
  {
    public: {
      Tables: {
        episode_messages: {
          Insert: { parts: UIMessage["parts"] };
          Row: { parts: UIMessage["parts"] };
          Update: { parts?: UIMessage["parts"] };
        };
      };
    };
  }
>;

type PublicTable = keyof Database["public"]["Tables"];

/**
 * 행 타입 헬퍼는 병합한 `Database` 위에서 다시 정의한다.
 *
 * 생성 파일이 내보내는 같은 이름의 헬퍼는 그 파일 안의 `Database`를 직접
 * 가리키므로 위의 병합을 지나가지 않는다. 그대로 재수출하면
 * `TablesInsert<"episode_messages">["parts"]`가 다시 `Json`이 되어, 좁힌 타입이
 * `createClient<Database>()` 경로에만 살아 있고 헬퍼 경로에서는 조용히 사라진다.
 *
 * 생성 파일의 헬퍼가 다루는 뷰와 다른 스키마는 여기서 뺐다. 이 데이터베이스는
 * `public`의 테이블만 쓴다.
 */
export type Tables<T extends PublicTable> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends PublicTable> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends PublicTable> =
  Database["public"]["Tables"][T]["Update"];
