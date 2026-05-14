export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      go_pivot_evaluations: {
        Row: {
          confidence: number
          created_at: string
          id: string
          invalidated_at: string | null
          override: boolean
          pivot_recommendations: Json | null
          project_id: string
          reasons: Json
          verdict: string
        }
        Insert: {
          confidence: number
          created_at?: string
          id?: string
          invalidated_at?: string | null
          override?: boolean
          pivot_recommendations?: Json | null
          project_id: string
          reasons?: Json
          verdict: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          invalidated_at?: string | null
          override?: boolean
          pivot_recommendations?: Json | null
          project_id?: string
          reasons?: Json
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "go_pivot_evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_evaluations: {
        Row: {
          created_at: string
          id: string
          input_text: string | null
          input_tokens: number | null
          model_used: string | null
          output_json: Json | null
          output_tokens: number | null
          source_context: string | null
          task_id: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          input_text?: string | null
          input_tokens?: number | null
          model_used?: string | null
          output_json?: Json | null
          output_tokens?: number | null
          source_context?: string | null
          task_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          input_text?: string | null
          input_tokens?: number | null
          model_used?: string | null
          output_json?: Json | null
          output_tokens?: number | null
          source_context?: string | null
          task_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ia_evaluations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ia_evaluations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ivo_history: {
        Row: {
          id: string
          ivo_d: number | null
          ivo_e: number | null
          ivo_index: number | null
          ivo_m: number | null
          ivo_o: number | null
          ivo_score_10: number | null
          ivo_t: number | null
          ivo_v: number | null
          project_id: string
          recorded_at: string | null
        }
        Insert: {
          id?: string
          ivo_d?: number | null
          ivo_e?: number | null
          ivo_index?: number | null
          ivo_m?: number | null
          ivo_o?: number | null
          ivo_score_10?: number | null
          ivo_t?: number | null
          ivo_v?: number | null
          project_id: string
          recorded_at?: string | null
        }
        Update: {
          id?: string
          ivo_d?: number | null
          ivo_e?: number | null
          ivo_index?: number | null
          ivo_m?: number | null
          ivo_o?: number | null
          ivo_score_10?: number | null
          ivo_t?: number | null
          ivo_v?: number | null
          project_id?: string
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ivo_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_interests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          listing_id: string
          message: string | null
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          listing_id: string
          message?: string | null
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          listing_id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_interests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          listing_type: string
          owner_id: string
          project_id: string | null
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          listing_type?: string
          owner_id: string
          project_id?: string | null
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          listing_type?: string
          owner_id?: string
          project_id?: string | null
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_owner_id_profiles_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          notification_prefs: Json | null
          onboarding_answers: Json | null
          onboarding_completed: boolean
          seen_tooltips: Json
          theme_preference: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          notification_prefs?: Json | null
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          seen_tooltips?: Json
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          notification_prefs?: Json | null
          onboarding_answers?: Json | null
          onboarding_completed?: boolean
          seen_tooltips?: Json
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          project_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          project_id: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          project_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          achieved_at: string
          description: string | null
          id: string
          milestone_key: string
          project_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          achieved_at?: string
          description?: string | null
          id?: string
          milestone_key: string
          project_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          achieved_at?: string
          description?: string | null
          id?: string
          milestone_key?: string
          project_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stage_summaries: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          stage: string
          summary_json: Json
          summary_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          stage: string
          summary_json: Json
          summary_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          stage?: string
          summary_json?: Json
          summary_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stage_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          constraints: string | null
          created_at: string
          current_phase: string
          description: string | null
          generated_options: string[] | null
          id: string
          is_public: boolean | null
          ivo_d: number | null
          ivo_e: number | null
          ivo_index: number | null
          ivo_m: number | null
          ivo_o: number | null
          ivo_score_10: number | null
          ivo_t: number | null
          ivo_v: number | null
          keywords: string[] | null
          name: string
          owner_id: string
          product_structure: string | null
          progress_breakdown: Json
          region: string | null
          score: number
          slug: string | null
          target_audience: string | null
          updated_at: string
          valuation: number
        }
        Insert: {
          category?: string | null
          constraints?: string | null
          created_at?: string
          current_phase?: string
          description?: string | null
          generated_options?: string[] | null
          id?: string
          is_public?: boolean | null
          ivo_d?: number | null
          ivo_e?: number | null
          ivo_index?: number | null
          ivo_m?: number | null
          ivo_o?: number | null
          ivo_score_10?: number | null
          ivo_t?: number | null
          ivo_v?: number | null
          keywords?: string[] | null
          name: string
          owner_id: string
          product_structure?: string | null
          progress_breakdown?: Json
          region?: string | null
          score?: number
          slug?: string | null
          target_audience?: string | null
          updated_at?: string
          valuation?: number
        }
        Update: {
          category?: string | null
          constraints?: string | null
          created_at?: string
          current_phase?: string
          description?: string | null
          generated_options?: string[] | null
          id?: string
          is_public?: boolean | null
          ivo_d?: number | null
          ivo_e?: number | null
          ivo_index?: number | null
          ivo_m?: number | null
          ivo_o?: number | null
          ivo_score_10?: number | null
          ivo_t?: number | null
          ivo_v?: number | null
          keywords?: string[] | null
          name?: string
          owner_id?: string
          product_structure?: string | null
          progress_breakdown?: Json
          region?: string | null
          score?: number
          slug?: string | null
          target_audience?: string | null
          updated_at?: string
          valuation?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          evaluation_result: Json | null
          id: string
          phase: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          evaluation_result?: Json | null
          id?: string
          phase: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          evaluation_result?: Json | null
          id?: string
          phase?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_project_with_owner: {
        Args: {
          p_description: string
          p_name: string
          p_owner_id: string
          p_score: number
          p_valuation: number
        }
        Returns: string
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      merge_seen_tooltip: {
        Args: { tooltip_key: string; user_id: string }
        Returns: undefined
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

export type ProjectRow = Database['public']['Tables']['projects']['Row']
