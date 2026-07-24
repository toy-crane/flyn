// 보통 `bun run db:types`(supabase gen types)가 생성한다. Docker 없는 환경이라 스키마에
// 맞춰 손으로 작성했고, 스택 있는 곳에서 재생성하면 덮어써진다.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      scratch_notes: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scratch_notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

// supabase gen types가 생성 파일 끝에 함께 내보내는 헬퍼들. 재생성되면 이 블록도
// 생성기 판으로 통째로 교체되므로, 소비자는 여기서만 가져간다.
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
