// 이 파일은 보통 `supabase gen types typescript --local`이 생성한다(= bun run db:types).
// Docker 로컬 스택이 없는 환경에서 최초 작성돼, scratch_notes 스키마에 맞춰 손으로 형태를
// 맞춰 두었다. 스택이 있는 곳에서 `bun run db:types`로 재생성하면 이 파일이 덮어써진다.
// 앱·API 양쪽이 여기 한 곳을 소비하므로 플랫폼별 생성 없이 드리프트가 없다.

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
