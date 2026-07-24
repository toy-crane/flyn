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
