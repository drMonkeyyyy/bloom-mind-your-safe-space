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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          bank_account_holder: string
          bank_account_number: string
          bank_name: string
          crisis_disclaimer: string
          free_chat_limit: number
          id: number
          maintenance_mode: boolean
          premium_price: number
          updated_at: string
        }
        Insert: {
          bank_account_holder?: string
          bank_account_number?: string
          bank_name?: string
          crisis_disclaimer?: string
          free_chat_limit?: number
          id?: number
          maintenance_mode?: boolean
          premium_price?: number
          updated_at?: string
        }
        Update: {
          bank_account_holder?: string
          bank_account_number?: string
          bank_name?: string
          crisis_disclaimer?: string
          free_chat_limit?: number
          id?: number
          maintenance_mode?: boolean
          premium_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          companion_key: Database["public"]["Enums"]["companion_key"]
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          companion_key?: Database["public"]["Enums"]["companion_key"]
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          companion_key?: Database["public"]["Enums"]["companion_key"]
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companions: {
        Row: {
          created_at: string
          description: string
          emoji: string | null
          is_premium_only: boolean
          key: Database["public"]["Enums"]["companion_key"]
          name: string
          system_prompt: string
          tone: string
        }
        Insert: {
          created_at?: string
          description: string
          emoji?: string | null
          is_premium_only?: boolean
          key: Database["public"]["Enums"]["companion_key"]
          name: string
          system_prompt: string
          tone: string
        }
        Update: {
          created_at?: string
          description?: string
          emoji?: string | null
          is_premium_only?: boolean
          key?: Database["public"]["Enums"]["companion_key"]
          name?: string
          system_prompt?: string
          tone?: string
        }
        Relationships: []
      }
      daily_chat_usage: {
        Row: {
          ai_reply_count: number
          date: string
          user_id: string
        }
        Insert: {
          ai_reply_count?: number
          date?: string
          user_id: string
        }
        Update: {
          ai_reply_count?: number
          date?: string
          user_id?: string
        }
        Relationships: []
      }
      emotional_eating_logs: {
        Row: {
          ai_insight: string | null
          craving_food: string | null
          created_at: string
          date: string
          emotion: string | null
          hunger_type: Database["public"]["Enums"]["hunger_type"] | null
          id: string
          suggested_action: string | null
          trigger: string | null
          user_id: string
        }
        Insert: {
          ai_insight?: string | null
          craving_food?: string | null
          created_at?: string
          date?: string
          emotion?: string | null
          hunger_type?: Database["public"]["Enums"]["hunger_type"] | null
          id?: string
          suggested_action?: string | null
          trigger?: string | null
          user_id: string
        }
        Update: {
          ai_insight?: string | null
          craving_food?: string | null
          created_at?: string
          date?: string
          emotion?: string | null
          hunger_type?: Database["public"]["Enums"]["hunger_type"] | null
          id?: string
          suggested_action?: string | null
          trigger?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          best_moment: string | null
          created_at: string
          date: string
          gratitude1: string | null
          gratitude2: string | null
          gratitude3: string | null
          id: string
          lesson: string | null
          user_id: string
        }
        Insert: {
          best_moment?: string | null
          created_at?: string
          date?: string
          gratitude1?: string | null
          gratitude2?: string | null
          gratitude3?: string | null
          id?: string
          lesson?: string | null
          user_id: string
        }
        Update: {
          best_moment?: string | null
          created_at?: string
          date?: string
          gratitude1?: string | null
          gratitude2?: string | null
          gratitude3?: string | null
          id?: string
          lesson?: string | null
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          target_frequency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_frequency?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_frequency?: string
          user_id?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          created_at: string
          date: string
          gratitude: string | null
          id: string
          lesson: string | null
          main_emotion: string | null
          main_trigger: string | null
          source: string
          summary: string | null
          tomorrow_focus: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          gratitude?: string | null
          id?: string
          lesson?: string | null
          main_emotion?: string | null
          main_trigger?: string | null
          source?: string
          summary?: string | null
          tomorrow_focus?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          gratitude?: string | null
          id?: string
          lesson?: string | null
          main_emotion?: string | null
          main_trigger?: string | null
          source?: string
          summary?: string | null
          tomorrow_focus?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_checkins: {
        Row: {
          created_at: string
          date: string
          energy_score: number
          id: string
          mood: Database["public"]["Enums"]["mood_label"]
          mood_score: number
          note: string | null
          stress_score: number
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          energy_score: number
          id?: string
          mood: Database["public"]["Enums"]["mood_label"]
          mood_score: number
          note?: string | null
          stress_score: number
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_score?: number
          id?: string
          mood?: Database["public"]["Enums"]["mood_label"]
          mood_score?: number
          note?: string | null
          stress_score?: number
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          order_number: string
          package_name: string
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          transfer_proof_url: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          order_number: string
          package_name?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transfer_proof_url?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          order_number?: string
          package_name?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transfer_proof_url?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          communication_style: Database["public"]["Enums"]["comm_style"] | null
          created_at: string
          email: string | null
          goals: string[] | null
          id: string
          name: string | null
          onboarding_completed: boolean
          phone: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          premium_end_date: string | null
          premium_start_date: string | null
          selected_companion:
            | Database["public"]["Enums"]["companion_key"]
            | null
          suspended: boolean
          updated_at: string
        }
        Insert: {
          age?: number | null
          communication_style?: Database["public"]["Enums"]["comm_style"] | null
          created_at?: string
          email?: string | null
          goals?: string[] | null
          id: string
          name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          premium_end_date?: string | null
          premium_start_date?: string | null
          selected_companion?:
            | Database["public"]["Enums"]["companion_key"]
            | null
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          age?: number | null
          communication_style?: Database["public"]["Enums"]["comm_style"] | null
          created_at?: string
          email?: string | null
          goals?: string[] | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          premium_end_date?: string | null
          premium_start_date?: string | null
          selected_companion?:
            | Database["public"]["Enums"]["companion_key"]
            | null
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      comm_style: "lembut" | "rasional" | "tegas" | "santai" | "supportive"
      companion_key:
        | "ibu"
        | "ayah"
        | "kakak_perempuan"
        | "kakak_laki"
        | "sahabat"
        | "partner"
        | "coach"
      hunger_type:
        | "lapar_fisik"
        | "lapar_emosional"
        | "craving"
        | "stress_eating"
        | "mindless_eating"
      message_role: "user" | "assistant" | "system"
      mood_label:
        | "bahagia"
        | "tenang"
        | "sedih"
        | "cemas"
        | "marah"
        | "kesepian"
        | "burnout"
        | "stres"
        | "lelah"
      payment_status:
        | "menunggu_pembayaran"
        | "menunggu_verifikasi"
        | "disetujui"
        | "ditolak"
      plan_type: "free" | "premium"
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
      app_role: ["user", "admin"],
      comm_style: ["lembut", "rasional", "tegas", "santai", "supportive"],
      companion_key: [
        "ibu",
        "ayah",
        "kakak_perempuan",
        "kakak_laki",
        "sahabat",
        "partner",
        "coach",
      ],
      hunger_type: [
        "lapar_fisik",
        "lapar_emosional",
        "craving",
        "stress_eating",
        "mindless_eating",
      ],
      message_role: ["user", "assistant", "system"],
      mood_label: [
        "bahagia",
        "tenang",
        "sedih",
        "cemas",
        "marah",
        "kesepian",
        "burnout",
        "stres",
        "lelah",
      ],
      payment_status: [
        "menunggu_pembayaran",
        "menunggu_verifikasi",
        "disetujui",
        "ditolak",
      ],
      plan_type: ["free", "premium"],
    },
  },
} as const
