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
          active_time_slots: string[]
          closed_message: string
          id: number
          updated_at: string
          waitlist_open: boolean
        }
        Insert: {
          active_time_slots?: string[]
          closed_message?: string
          id?: number
          updated_at?: string
          waitlist_open?: boolean
        }
        Update: {
          active_time_slots?: string[]
          closed_message?: string
          id?: number
          updated_at?: string
          waitlist_open?: boolean
        }
        Relationships: []
      }
      booking_window_slots: {
        Row: {
          capacity: number
          created_at: string
          id: string
          slot_time: string
          window_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          slot_time: string
          window_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          slot_time?: string
          window_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_window_slots_window_id_fkey"
            columns: ["window_id"]
            isOneToOne: false
            referencedRelation: "booking_windows"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_windows: {
        Row: {
          audience: Database["public"]["Enums"]["booking_audience"]
          audience_tags: Database["public"]["Enums"]["waitlist_tag"][]
          created_at: string
          date: string
          id: string
          is_open: boolean
          message: string | null
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["booking_audience"]
          audience_tags?: Database["public"]["Enums"]["waitlist_tag"][]
          created_at?: string
          date: string
          id?: string
          is_open?: boolean
          message?: string | null
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["booking_audience"]
          audience_tags?: Database["public"]["Enums"]["waitlist_tag"][]
          created_at?: string
          date?: string
          id?: string
          is_open?: boolean
          message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          id: string
          player_id: string | null
          slot_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id?: string | null
          slot_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string | null
          slot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "booking_window_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      fixed_players: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string
          slot_day: string
          slot_time: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          slot_day?: string
          slot_time: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          slot_day?: string
          slot_time?: string
        }
        Relationships: []
      }
      fixed_sunday_slots: {
        Row: {
          active: boolean
          created_at: string
          duration_minutes: number
          id: string
          player_id: string
          slot_time: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          player_id: string
          slot_time: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          player_id?: string
          slot_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_sunday_slots_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          subject_id: string
          subject_type: Database["public"]["Enums"]["note_subject"]
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          subject_id: string
          subject_type: Database["public"]["Enums"]["note_subject"]
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          subject_id?: string
          subject_type?: Database["public"]["Enums"]["note_subject"]
        }
        Relationships: []
      }
      players: {
        Row: {
          birthdate: string | null
          club: string | null
          created_at: string
          email: string | null
          id: string
          level: Database["public"]["Enums"]["player_level"] | null
          notes: string | null
          parent_name: string | null
          parent_user_id: string | null
          phone: string | null
          player_name: string
          position: string | null
          team: string | null
          training_type: Database["public"]["Enums"]["training_type"] | null
          updated_at: string
        }
        Insert: {
          birthdate?: string | null
          club?: string | null
          created_at?: string
          email?: string | null
          id?: string
          level?: Database["public"]["Enums"]["player_level"] | null
          notes?: string | null
          parent_name?: string | null
          parent_user_id?: string | null
          phone?: string | null
          player_name: string
          position?: string | null
          team?: string | null
          training_type?: Database["public"]["Enums"]["training_type"] | null
          updated_at?: string
        }
        Update: {
          birthdate?: string | null
          club?: string | null
          created_at?: string
          email?: string | null
          id?: string
          level?: Database["public"]["Enums"]["player_level"] | null
          notes?: string | null
          parent_name?: string | null
          parent_user_id?: string | null
          phone?: string | null
          player_name?: string
          position?: string | null
          team?: string | null
          training_type?: Database["public"]["Enums"]["training_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      waitlist: {
        Row: {
          age: number | null
          club: string | null
          created_at: string
          id: string
          level: string | null
          name: string
          other_availability: string | null
          phone: string
          preferred_slots: string[]
          status: string
        }
        Insert: {
          age?: number | null
          club?: string | null
          created_at?: string
          id?: string
          level?: string | null
          name: string
          other_availability?: string | null
          phone: string
          preferred_slots?: string[]
          status?: string
        }
        Update: {
          age?: number | null
          club?: string | null
          created_at?: string
          id?: string
          level?: string | null
          name?: string
          other_availability?: string | null
          phone?: string
          preferred_slots?: string[]
          status?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          available_days: string[]
          available_times: string | null
          birthdate: string | null
          club: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_at: string | null
          level: Database["public"]["Enums"]["player_level"] | null
          notes: string | null
          parent_name: string | null
          phone: string
          player_name: string
          position: string | null
          status: Database["public"]["Enums"]["waitlist_status"]
          team: string | null
          training_type: Database["public"]["Enums"]["training_type"] | null
          updated_at: string
        }
        Insert: {
          available_days?: string[]
          available_times?: string | null
          birthdate?: string | null
          club?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          level?: Database["public"]["Enums"]["player_level"] | null
          notes?: string | null
          parent_name?: string | null
          phone: string
          player_name: string
          position?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          team?: string | null
          training_type?: Database["public"]["Enums"]["training_type"] | null
          updated_at?: string
        }
        Update: {
          available_days?: string[]
          available_times?: string | null
          birthdate?: string | null
          club?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          level?: Database["public"]["Enums"]["player_level"] | null
          notes?: string | null
          parent_name?: string | null
          phone?: string
          player_name?: string
          position?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          team?: string | null
          training_type?: Database["public"]["Enums"]["training_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_entry_tags: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          tag: Database["public"]["Enums"]["waitlist_tag"]
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          tag: Database["public"]["Enums"]["waitlist_tag"]
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          tag?: Database["public"]["Enums"]["waitlist_tag"]
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entry_tags_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "waitlist_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_attendance: {
        Row: {
          available_from: string | null
          available_to: string | null
          created_at: string
          fixed_player_id: string
          id: string
          session_date: string
          status: string
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          created_at?: string
          fixed_player_id: string
          id?: string
          session_date: string
          status: string
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          created_at?: string
          fixed_player_id?: string
          id?: string
          session_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_attendance_fixed_player_id_fkey"
            columns: ["fixed_player_id"]
            isOneToOne: false
            referencedRelation: "fixed_players"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_confirmations: {
        Row: {
          alt_from: string | null
          alt_to: string | null
          created_at: string
          id: string
          locked: boolean
          note: string | null
          player_id: string
          responded_by: string | null
          session_date: string
          status: Database["public"]["Enums"]["confirmation_status"]
          updated_at: string
        }
        Insert: {
          alt_from?: string | null
          alt_to?: string | null
          created_at?: string
          id?: string
          locked?: boolean
          note?: string | null
          player_id: string
          responded_by?: string | null
          session_date: string
          status: Database["public"]["Enums"]["confirmation_status"]
          updated_at?: string
        }
        Update: {
          alt_from?: string | null
          alt_to?: string | null
          created_at?: string
          id?: string
          locked?: boolean
          note?: string | null
          player_id?: string
          responded_by?: string | null
          session_date?: string
          status?: Database["public"]["Enums"]["confirmation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_confirmations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_audience: "everyone" | "waitlist_only" | "tagged_only"
      confirmation_status: "attending" | "not_attending" | "different_time"
      note_subject: "player" | "waitlist_entry"
      player_level:
        | "BVO"
        | "Divisie"
        | "Hoofdklasse"
        | "Eerste klasse"
        | "Recreatief"
      training_type: "1-on-1" | "Duo" | "Group"
      waitlist_status:
        | "new"
        | "contacted"
        | "trial_scheduled"
        | "placed"
        | "removed"
      waitlist_tag:
        | "high_priority"
        | "call_back"
        | "trial_training"
        | "not_suitable"
        | "offered_fixed_spot"
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
      app_role: ["admin", "user"],
      booking_audience: ["everyone", "waitlist_only", "tagged_only"],
      confirmation_status: ["attending", "not_attending", "different_time"],
      note_subject: ["player", "waitlist_entry"],
      player_level: [
        "BVO",
        "Divisie",
        "Hoofdklasse",
        "Eerste klasse",
        "Recreatief",
      ],
      training_type: ["1-on-1", "Duo", "Group"],
      waitlist_status: [
        "new",
        "contacted",
        "trial_scheduled",
        "placed",
        "removed",
      ],
      waitlist_tag: [
        "high_priority",
        "call_back",
        "trial_training",
        "not_suitable",
        "offered_fixed_spot",
      ],
    },
  },
} as const
