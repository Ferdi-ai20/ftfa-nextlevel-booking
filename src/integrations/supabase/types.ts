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
          calendly_url_1on1: string | null
          calendly_url_duo: string | null
          calendly_url_group: string | null
          calendly_url_trial: string | null
          closed_message: string
          id: number
          updated_at: string
          waitlist_open: boolean
        }
        Insert: {
          active_time_slots?: string[]
          calendly_url_1on1?: string | null
          calendly_url_duo?: string | null
          calendly_url_group?: string | null
          calendly_url_trial?: string | null
          closed_message?: string
          id?: number
          updated_at?: string
          waitlist_open?: boolean
        }
        Update: {
          active_time_slots?: string[]
          calendly_url_1on1?: string | null
          calendly_url_duo?: string | null
          calendly_url_group?: string | null
          calendly_url_trial?: string | null
          closed_message?: string
          id?: number
          updated_at?: string
          waitlist_open?: boolean
        }
        Relationships: []
      }
      applications: {
        Row: {
          birth_year: number | null
          club: string | null
          created_at: string
          dob: string | null
          email: string
          goal: string | null
          id: string
          notes: string | null
          parent_name: string
          phone: string | null
          player_name: string
          position: string | null
          status: Database["public"]["Enums"]["application_status"]
          team: string | null
          updated_at: string
        }
        Insert: {
          birth_year?: number | null
          club?: string | null
          created_at?: string
          dob?: string | null
          email: string
          goal?: string | null
          id?: string
          notes?: string | null
          parent_name: string
          phone?: string | null
          player_name: string
          position?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          team?: string | null
          updated_at?: string
        }
        Update: {
          birth_year?: number | null
          club?: string | null
          created_at?: string
          dob?: string | null
          email?: string
          goal?: string | null
          id?: string
          notes?: string | null
          parent_name?: string
          phone?: string | null
          player_name?: string
          position?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          team?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          guest_birth_year: number | null
          guest_club: string | null
          guest_dob: string | null
          guest_email: string | null
          guest_goal: string | null
          guest_name: string | null
          guest_notes: string | null
          guest_parent_name: string | null
          guest_phone: string | null
          guest_position: string | null
          guest_team: string | null
          id: string
          player_id: string | null
          profile_id: string | null
          reminder_sent: boolean
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          guest_birth_year?: number | null
          guest_club?: string | null
          guest_dob?: string | null
          guest_email?: string | null
          guest_goal?: string | null
          guest_name?: string | null
          guest_notes?: string | null
          guest_parent_name?: string | null
          guest_phone?: string | null
          guest_position?: string | null
          guest_team?: string | null
          id?: string
          player_id?: string | null
          profile_id?: string | null
          reminder_sent?: boolean
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          guest_birth_year?: number | null
          guest_club?: string | null
          guest_dob?: string | null
          guest_email?: string | null
          guest_goal?: string | null
          guest_name?: string | null
          guest_notes?: string | null
          guest_parent_name?: string | null
          guest_phone?: string | null
          guest_position?: string | null
          guest_team?: string | null
          id?: string
          player_id?: string | null
          profile_id?: string | null
          reminder_sent?: boolean
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
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
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "training_slots"
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
      feedback: {
        Row: {
          created_at: string
          created_by: string | null
          development_points: string | null
          feedback_text: string | null
          id: string
          player_id: string
          slot_id: string | null
          strengths: string | null
          updated_at: string
          visible_to_player: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          development_points?: string | null
          feedback_text?: string | null
          id?: string
          player_id: string
          slot_id?: string | null
          strengths?: string | null
          updated_at?: string
          visible_to_player?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          development_points?: string | null
          feedback_text?: string | null
          id?: string
          player_id?: string
          slot_id?: string | null
          strengths?: string | null
          updated_at?: string
          visible_to_player?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "feedback_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "training_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      ical_tokens: {
        Row: {
          created_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          archived: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
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
      player_coach_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_coach_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_goals: {
        Row: {
          created_at: string
          description: string
          id: string
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_goals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_homework: {
        Row: {
          assigned_at: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          profile_id: string
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          profile_id: string
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          assigned_at?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          profile_id?: string
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_homework_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          birth_year: number | null
          club: string | null
          created_at: string
          id: string
          notes: string | null
          parent_profile_id: string
          player_name: string
          position: string | null
          status: Database["public"]["Enums"]["player_status"]
          team: string | null
          updated_at: string
        }
        Insert: {
          birth_year?: number | null
          club?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          parent_profile_id: string
          player_name: string
          position?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          team?: string | null
          updated_at?: string
        }
        Update: {
          birth_year?: number | null
          club?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          parent_profile_id?: string
          player_name?: string
          position?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          team?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["profile_status"]
          sticky_note: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          sticky_note?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          sticky_note?: string | null
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
      training_slots: {
        Row: {
          admin_note: string | null
          created_at: string
          created_by: string | null
          date: string
          end_time: string
          id: string
          location: string | null
          location_id: string | null
          max_players: number
          player_note: string | null
          price_per_player: number | null
          recurrence: string | null
          recurrence_end_date: string | null
          recurrence_group_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["slot_status"]
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["slot_visibility"]
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          end_time: string
          id?: string
          location?: string | null
          location_id?: string | null
          max_players?: number
          player_note?: string | null
          price_per_player?: number | null
          recurrence?: string | null
          recurrence_end_date?: string | null
          recurrence_group_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["slot_status"]
          training_type: Database["public"]["Enums"]["training_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["slot_visibility"]
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          end_time?: string
          id?: string
          location?: string | null
          location_id?: string | null
          max_players?: number
          player_note?: string | null
          price_per_player?: number | null
          recurrence?: string | null
          recurrence_end_date?: string | null
          recurrence_group_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["slot_status"]
          training_type?: Database["public"]["Enums"]["training_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["slot_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "training_slots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
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
      admin_set_slot_price: {
        Args: { _price: number; _slot_id: string }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_application_for_guest: {
        Args: {
          _club: string
          _dob: string
          _email: string
          _notes: string
          _parent_name: string
          _phone: string
          _player_name: string
          _position: string
          _team: string
        }
        Returns: undefined
      }
      get_slot_price: { Args: { _slot_id: string }; Returns: number }
      guest_booking_email_count_24h: {
        Args: { _email: string }
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
      application_status: "pending" | "approved" | "rejected"
      booking_audience: "everyone" | "waitlist_only" | "tagged_only"
      booking_status: "confirmed" | "cancelled"
      confirmation_status: "attending" | "not_attending" | "different_time"
      note_subject: "player" | "waitlist_entry"
      player_level:
        | "BVO"
        | "Divisie"
        | "Hoofdklasse"
        | "Eerste klasse"
        | "Recreatief"
      player_status: "active" | "inactive"
      profile_status: "pending" | "active" | "archived"
      slot_status: "open" | "full" | "cancelled"
      slot_visibility: "private" | "public" | "hidden"
      training_type: "one_on_one" | "duo" | "small_group"
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
      application_status: ["pending", "approved", "rejected"],
      booking_audience: ["everyone", "waitlist_only", "tagged_only"],
      booking_status: ["confirmed", "cancelled"],
      confirmation_status: ["attending", "not_attending", "different_time"],
      note_subject: ["player", "waitlist_entry"],
      player_level: [
        "BVO",
        "Divisie",
        "Hoofdklasse",
        "Eerste klasse",
        "Recreatief",
      ],
      player_status: ["active", "inactive"],
      profile_status: ["pending", "active", "archived"],
      slot_status: ["open", "full", "cancelled"],
      slot_visibility: ["private", "public", "hidden"],
      training_type: ["one_on_one", "duo", "small_group"],
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
