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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      available_time_slots: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          slot_label: string
          slot_time: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          slot_label: string
          slot_time: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          slot_label?: string
          slot_time?: string
          sort_order?: number
        }
        Relationships: []
      }
      booking_add_ons: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_per_unit_bdt: number
          sort_order: number
          unit_label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price_per_unit_bdt: number
          sort_order?: number
          unit_label?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_per_unit_bdt?: number
          sort_order?: number
          unit_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_addon_items: {
        Row: {
          add_on_id: string
          booking_id: string
          created_at: string
          id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          add_on_id: string
          booking_id: string
          created_at?: string
          id?: string
          quantity?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          add_on_id?: string
          booking_id?: string
          created_at?: string
          id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_addon_items_add_on_id_fkey"
            columns: ["add_on_id"]
            isOneToOne: false
            referencedRelation: "booking_add_ons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addon_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_logs: {
        Row: {
          booking_id: string
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          booking_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          booking_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          access_token: string
          additional_notes: string | null
          addons_total: number
          address: string
          admin_note: string | null
          base_price: number
          booking_number: string
          created_at: string
          customer_name: string
          district: string | null
          grand_total: number
          id: string
          is_outside_dhaka: boolean
          package_id: string
          phone: string
          preferred_date: string
          preferred_time_slot_id: string
          status: string
          surcharge: number
          updated_at: string
        }
        Insert: {
          access_token?: string
          additional_notes?: string | null
          addons_total?: number
          address: string
          admin_note?: string | null
          base_price: number
          booking_number: string
          created_at?: string
          customer_name: string
          district?: string | null
          grand_total: number
          id?: string
          is_outside_dhaka?: boolean
          package_id: string
          phone: string
          preferred_date: string
          preferred_time_slot_id: string
          status?: string
          surcharge?: number
          updated_at?: string
        }
        Update: {
          access_token?: string
          additional_notes?: string | null
          addons_total?: number
          address?: string
          admin_note?: string | null
          base_price?: number
          booking_number?: string
          created_at?: string
          customer_name?: string
          district?: string | null
          grand_total?: number
          id?: string
          is_outside_dhaka?: boolean
          package_id?: string
          phone?: string
          preferred_date?: string
          preferred_time_slot_id?: string
          status?: string
          surcharge?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_preferred_time_slot_id_fkey"
            columns: ["preferred_time_slot_id"]
            isOneToOne: false
            referencedRelation: "available_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          booking_id: string
          created_at: string
          customer_name: string
          follow_up_date: string
          id: string
          notes: string | null
          phone: string
          service_date: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_name: string
          follow_up_date: string
          id?: string
          notes?: string | null
          phone: string
          service_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_name?: string
          follow_up_date?: string
          id?: string
          notes?: string | null
          phone?: string
          service_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      marquee_items: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          sort_order: number
          text: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          text: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          text?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          session_id?: string
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          base_price_bdt: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          package_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price_bdt: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          package_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price_bdt?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          package_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          category: string
          created_at: string
          customer_name: string
          id: string
          is_active: boolean
          location: string
          rating: number
          review: string
          sort_order: number
        }
        Insert: {
          category?: string
          created_at?: string
          customer_name: string
          id?: string
          is_active?: boolean
          location?: string
          rating?: number
          review: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          customer_name?: string
          id?: string
          is_active?: boolean
          location?: string
          rating?: number
          review?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking_with_addons: {
        Args: {
          p_additional_notes?: string
          p_addon_items?: Json
          p_address: string
          p_customer_name: string
          p_district?: string
          p_is_outside_dhaka?: boolean
          p_package_id?: string
          p_phone: string
          p_preferred_date?: string
          p_preferred_time_slot_id?: string
        }
        Returns: Json
      }
      get_active_viewer_count: { Args: never; Returns: number }
      get_booking_addons:
        | {
            Args: { booking_uuid: string }
            Returns: {
              addon_name: string
              quantity: number
              subtotal: number
              unit_label: string
            }[]
          }
        | {
            Args: { booking_uuid: string; p_access_token?: string }
            Returns: {
              addon_name: string
              quantity: number
              subtotal: number
              unit_label: string
            }[]
          }
      get_booking_by_id:
        | {
            Args: { booking_uuid: string }
            Returns: {
              additional_notes: string
              addons_total: number
              address: string
              base_price: number
              booking_number: string
              customer_name: string
              grand_total: number
              is_outside_dhaka: boolean
              package_name: string
              preferred_date: string
              slot_label: string
              surcharge: number
            }[]
          }
        | {
            Args: { booking_uuid: string; p_access_token?: string }
            Returns: {
              additional_notes: string
              addons_total: number
              address: string
              base_price: number
              booking_number: string
              customer_name: string
              grand_total: number
              is_outside_dhaka: boolean
              package_name: string
              preferred_date: string
              slot_label: string
              surcharge: number
            }[]
          }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      upsert_page_view: { Args: { p_session_id: string }; Returns: undefined }
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
