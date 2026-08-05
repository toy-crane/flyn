export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      episode_goals: {
        Row: {
          achieved_at: string | null
          achieved_message_id: string | null
          episode_id: string
          position: number
          sentence: string
        }
        Insert: {
          achieved_at?: string | null
          achieved_message_id?: string | null
          episode_id: string
          position: number
          sentence: string
        }
        Update: {
          achieved_at?: string | null
          achieved_message_id?: string | null
          episode_id?: string
          position?: number
          sentence?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_goals_achieved_message_fkey"
            columns: ["episode_id", "achieved_message_id"]
            isOneToOne: false
            referencedRelation: "episode_messages"
            referencedColumns: ["episode_id", "id"]
          },
          {
            foreignKeyName: "episode_goals_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_messages: {
        Row: {
          content: string
          created_at: string
          episode_id: string
          id: string
          role: string
          status: string
        }
        Insert: {
          content: string
          created_at?: string
          episode_id: string
          id: string
          role: string
          status?: string
        }
        Update: {
          content?: string
          created_at?: string
          episode_id?: string
          id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_messages_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          id: string
          partner_role: string
          scenario_description: string
          scenario_title: string
          status: string
          summary: string | null
          turn_limit: number
          updated_at: string
          user_id: string
          user_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_role: string
          scenario_description: string
          scenario_title: string
          status?: string
          summary?: string | null
          turn_limit: number
          updated_at?: string
          user_id: string
          user_role: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_role?: string
          scenario_description?: string
          scenario_title?: string
          status?: string
          summary?: string | null
          turn_limit?: number
          updated_at?: string
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      message_feedback: {
        Row: {
          created_at: string
          episode_id: string
          improved_sentence: string | null
          message_id: string
          reasons: string[]
          source_text: string
          verdict: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          improved_sentence?: string | null
          message_id: string
          reasons?: string[]
          source_text: string
          verdict: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          improved_sentence?: string | null
          message_id?: string
          reasons?: string[]
          source_text?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_feedback_message_fkey"
            columns: ["episode_id", "message_id"]
            isOneToOne: true
            referencedRelation: "episode_messages"
            referencedColumns: ["episode_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_username_available: {
        Args: { candidate_username: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

