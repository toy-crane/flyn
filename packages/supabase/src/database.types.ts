export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_version_policies: {
        Row: {
          created_at: string
          distribution: string
          install_url: string | null
          minimum_version: string | null
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          distribution: string
          install_url?: string | null
          minimum_version?: string | null
          platform: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          distribution?: string
          install_url?: string | null
          minimum_version?: string | null
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          content_key: string | null
          created_at: string
          id: string
          name: string
          persona: string
          position: number
          story_id: string
          updated_at: string
        }
        Insert: {
          content_key?: string | null
          created_at?: string
          id?: string
          name: string
          persona: string
          position: number
          story_id: string
          updated_at?: string
        }
        Update: {
          content_key?: string | null
          created_at?: string
          id?: string
          name?: string
          persona?: string
          position?: number
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_characters: {
        Row: {
          character_id: string
          created_at: string
          episode_id: string
          position: number
          story_id: string
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          episode_id: string
          position: number
          story_id: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          episode_id?: string
          position?: number
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_characters_character_fkey"
            columns: ["character_id", "story_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id", "story_id"]
          },
          {
            foreignKeyName: "episode_characters_episode_fkey"
            columns: ["episode_id", "story_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id", "story_id"]
          },
        ]
      }
      episode_messages: {
        Row: {
          created_at: string
          episode_play_id: string
          expression_status: string | null
          id: string
          parts: Json
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_play_id: string
          expression_status?: string | null
          id: string
          parts: Json
          role: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          episode_play_id?: string
          expression_status?: string | null
          id?: string
          parts?: Json
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_messages_episode_play_id_user_id_fkey"
            columns: ["episode_play_id", "user_id"]
            isOneToOne: false
            referencedRelation: "episode_plays"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      episode_plays: {
        Row: {
          created_at: string
          ending_kind: string | null
          ending_outcome: string | null
          episode_id: string
          finished_at: string | null
          id: string
          memory_choice: string | null
          memory_question: string | null
          memory_relationship: string | null
          started_at: string
          story_play_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ending_kind?: string | null
          ending_outcome?: string | null
          episode_id: string
          finished_at?: string | null
          id?: string
          memory_choice?: string | null
          memory_question?: string | null
          memory_relationship?: string | null
          started_at?: string
          story_play_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          ending_kind?: string | null
          ending_outcome?: string | null
          episode_id?: string
          finished_at?: string | null
          id?: string
          memory_choice?: string | null
          memory_question?: string | null
          memory_relationship?: string | null
          started_at?: string
          story_play_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_plays_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_plays_story_play_id_user_id_fkey"
            columns: ["story_play_id", "user_id"]
            isOneToOne: false
            referencedRelation: "story_plays"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "episode_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          ending_compromise: string
          ending_failure: string
          ending_success: string
          id: string
          number: number
          opening: string
          preview: string
          situation: string
          situation_emoji: string
          stage: string
          story_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ending_compromise: string
          ending_failure: string
          ending_success: string
          id?: string
          number: number
          opening: string
          preview: string
          situation: string
          situation_emoji: string
          stage: string
          story_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ending_compromise?: string
          ending_failure?: string
          ending_success?: string
          id?: string
          number?: number
          opening?: string
          preview?: string
          situation?: string
          situation_emoji?: string
          stage?: string
          story_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      expressions: {
        Row: {
          claim_token: string | null
          created_at: string
          dialogue_index: number | null
          entries: Json | null
          episode_id: string
          example: string | null
          example_meaning: string | null
          expires_at: string | null
          id: string
          kind: string
          meaning: string | null
          message_id: string | null
          original: string | null
          saved_at: string | null
          situation: string | null
          speaker: string | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          claim_token?: string | null
          created_at?: string
          dialogue_index?: number | null
          entries?: Json | null
          episode_id: string
          example?: string | null
          example_meaning?: string | null
          expires_at?: string | null
          id?: string
          kind: string
          meaning?: string | null
          message_id?: string | null
          original?: string | null
          saved_at?: string | null
          situation?: string | null
          speaker?: string | null
          text: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          claim_token?: string | null
          created_at?: string
          dialogue_index?: number | null
          entries?: Json | null
          episode_id?: string
          example?: string | null
          example_meaning?: string | null
          expires_at?: string | null
          id?: string
          kind?: string
          meaning?: string | null
          message_id?: string | null
          original?: string | null
          saved_at?: string | null
          situation?: string | null
          speaker?: string | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expressions_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expressions_message_id_user_id_fkey"
            columns: ["message_id", "user_id"]
            isOneToOne: false
            referencedRelation: "episode_messages"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "expressions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      language_levels: {
        Row: {
          created_at: string
          level: string
          observed_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          level: string
          observed_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          level?: string
          observed_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_levels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_events: {
        Row: {
          created_at: string
          kind: string
          occurred_at: string
          source_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          kind: string
          occurred_at: string
          source_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          kind?: string
          occurred_at?: string
          source_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_deletion_started_at: string | null
          avatar_chosen_by_user: boolean
          avatar_path: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
          username_changed_at: string | null
          username_locked_until: string | null
        }
        Insert: {
          account_deletion_started_at?: string | null
          avatar_chosen_by_user?: boolean
          avatar_path?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          username_changed_at?: string | null
          username_locked_until?: string | null
        }
        Update: {
          account_deletion_started_at?: string | null
          avatar_chosen_by_user?: boolean
          avatar_path?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          username_changed_at?: string | null
          username_locked_until?: string | null
        }
        Relationships: []
      }
      retired_usernames: {
        Row: {
          created_at: string
          protected_until: string
          retired_at: string
          retired_by: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          protected_until: string
          retired_at?: string
          retired_by: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          protected_until?: string
          retired_at?: string
          retired_by?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "retired_usernames_retired_by_fkey"
            columns: ["retired_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          completion_copy: string
          completion_title: string
          cover_blurhash: string | null
          cover_image_path: string | null
          created_at: string
          hook: string
          id: string
          intro: string
          owner_id: string | null
          position: number | null
          slug: string | null
          target_language: string
          title: string
          updated_at: string
        }
        Insert: {
          completion_copy: string
          completion_title: string
          cover_blurhash?: string | null
          cover_image_path?: string | null
          created_at?: string
          hook: string
          id?: string
          intro: string
          owner_id?: string | null
          position?: number | null
          slug?: string | null
          target_language: string
          title: string
          updated_at?: string
        }
        Update: {
          completion_copy?: string
          completion_title?: string
          cover_blurhash?: string | null
          cover_image_path?: string | null
          created_at?: string
          hook?: string
          id?: string
          intro?: string
          owner_id?: string | null
          position?: number | null
          slug?: string | null
          target_language?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_plays: {
        Row: {
          created_at: string
          id: string
          last_user_message_at: string | null
          started_at: string
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_user_message_at?: string | null
          started_at?: string
          story_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_user_message_at?: string | null
          started_at?: string
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_plays_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_plays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      available_usernames: { Args: { candidates: string[] }; Returns: string[] }
      claim_dialogue_expression: {
        Args: {
          p_dialogue_index: number
          p_message_id: string
          p_speaker: string
          p_text: string
          p_token: string
        }
        Returns: {
          claim_token: string | null
          created_at: string
          dialogue_index: number | null
          entries: Json | null
          episode_id: string
          example: string | null
          example_meaning: string | null
          expires_at: string | null
          id: string
          kind: string
          meaning: string | null
          message_id: string | null
          original: string | null
          saved_at: string | null
          situation: string | null
          speaker: string | null
          text: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "expressions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_dialogue_expression: {
        Args: {
          p_dialogue_index: number
          p_meaning: string
          p_message_id: string
          p_token: string
        }
        Returns: {
          claim_token: string | null
          created_at: string
          dialogue_index: number | null
          entries: Json | null
          episode_id: string
          example: string | null
          example_meaning: string | null
          expires_at: string | null
          id: string
          kind: string
          meaning: string | null
          message_id: string | null
          original: string | null
          saved_at: string | null
          situation: string | null
          speaker: string | null
          text: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "expressions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_story: {
        Args: { story: Json }
        Returns: {
          first_episode_id: string
          story_id: string
        }[]
      }
      episode_is_current: {
        Args: { target_episode: string; target_story_play: string }
        Returns: boolean
      }
      finish_episode: {
        Args: {
          episode_id: string
          kind: string
          language_level?: string
          memory_choice?: string
          memory_question?: string
          memory_relationship?: string
          outcome: string
          story_play_id: string
        }
        Returns: boolean
      }
      is_protected_username: {
        Args: { candidate: string; owner: string }
        Returns: boolean
      }
      is_reserved_username: { Args: { candidate: string }; Returns: boolean }
      save_expression_result: {
        Args: { p_content?: Json; p_message_id: string; p_status: string }
        Returns: string
      }
      set_story_cover: {
        Args: { cover_blurhash: string; cover_path: string; story_id: string }
        Returns: undefined
      }
      username_change_interval: { Args: never; Returns: string }
      username_status: { Args: { candidate: string }; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

