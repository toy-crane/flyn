// @flyn/supabase — 생성 타입 공용 진입점. mobile·api 양쪽이 여기서 타입을 가져간다.

export type { Database, Json } from "./database.types";

import type { Database } from "./database.types";

type PublicSchema = Database["public"];

// 편의 alias: 테이블 Row/Insert/Update를 이름으로 뽑는다.
//   Tables<"scratch_notes">        → 조회 행
//   TablesInsert<"scratch_notes">  → insert 페이로드
//   TablesUpdate<"scratch_notes">  → update 페이로드
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
