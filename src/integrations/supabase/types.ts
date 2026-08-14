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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      form_events: {
        Row: {
          actor_id: string | null
          created_at: string
          detail: Json | null
          event_type: string
          id: number
          submission_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          event_type: string
          id?: number
          submission_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          event_type?: string
          id?: number
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_events_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          closer_id: string
          created_at: string
          disposed_at: string | null
          disposed_by: string | null
          disposition: Database["public"]["Enums"]["disposition_t"] | null
          id: string
          last_timeout_by: string | null
          payload: Json
          status: Database["public"]["Enums"]["sub_status"]
          timeout_count: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          claimed_at?: string | null
          closer_id: string
          created_at?: string
          disposed_at?: string | null
          disposed_by?: string | null
          disposition?: Database["public"]["Enums"]["disposition_t"] | null
          id?: string
          last_timeout_by?: string | null
          payload: Json
          status?: Database["public"]["Enums"]["sub_status"]
          timeout_count?: number
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          claimed_at?: string | null
          closer_id?: string
          created_at?: string
          disposed_at?: string | null
          disposed_by?: string | null
          disposition?: Database["public"]["Enums"]["disposition_t"] | null
          id?: string
          last_timeout_by?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["sub_status"]
          timeout_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_closer_id_fkey"
            columns: ["closer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_disposed_by_fkey"
            columns: ["disposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_last_timeout_by_fkey"
            columns: ["last_timeout_by"]
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
      assign_to_validator: {
        Args: { p_sub: string; p_validator: string }
        Returns: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          closer_id: string
          created_at: string
          disposed_at: string | null
          disposed_by: string | null
          disposition: Database["public"]["Enums"]["disposition_t"] | null
          id: string
          last_timeout_by: string | null
          payload: Json
          status: Database["public"]["Enums"]["sub_status"]
          timeout_count: number
        }
        SetofOptions: {
          from: "*"
          to: "submissions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_submission: {
        Args: { p_sub: string }
        Returns: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          closer_id: string
          created_at: string
          disposed_at: string | null
          disposed_by: string | null
          disposition: Database["public"]["Enums"]["disposition_t"] | null
          id: string
          last_timeout_by: string | null
          payload: Json
          status: Database["public"]["Enums"]["sub_status"]
          timeout_count: number
        }
        SetofOptions: {
          from: "*"
          to: "submissions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      dispose_submission: {
        Args: {
          p_disposition: Database["public"]["Enums"]["disposition_t"]
          p_sub: string
        }
        Returns: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          closer_id: string
          created_at: string
          disposed_at: string | null
          disposed_by: string | null
          disposition: Database["public"]["Enums"]["disposition_t"] | null
          id: string
          last_timeout_by: string | null
          payload: Json
          status: Database["public"]["Enums"]["sub_status"]
          timeout_count: number
        }
        SetofOptions: {
          from: "*"
          to: "submissions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_stale_reviews: { Args: never; Returns: number }
      my_role: { Args: never; Returns: Database["public"]["Enums"]["app_role"] }
      submit_form: {
        Args: { p_payload: Json }
        Returns: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          closer_id: string
          created_at: string
          disposed_at: string | null
          disposed_by: string | null
          disposition: Database["public"]["Enums"]["disposition_t"] | null
          id: string
          last_timeout_by: string | null
          payload: Json
          status: Database["public"]["Enums"]["sub_status"]
          timeout_count: number
        }
        SetofOptions: {
          from: "*"
          to: "submissions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "closer" | "manager" | "validator"
      disposition_t: "accepted" | "declined"
      sub_status:
        | "pending_manager"
        | "assigned"
        | "in_review"
        | "returned_timeout"
        | "closed"
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
    Enums: {
      app_role: ["admin", "closer", "manager", "validator"],
      disposition_t: ["accepted", "declined"],
      sub_status: [
        "pending_manager",
        "assigned",
        "in_review",
        "returned_timeout",
        "closed",
      ],
    },
  },
} as const
