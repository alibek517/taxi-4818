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
      drivers: {
        Row: {
          auth_status: Database["public"]["Enums"]["auth_status"]
          balance: number
          car_color: string
          car_model: string
          car_plate: string
          completed_today: number
          created_at: string
          current_status: Database["public"]["Enums"]["driver_status"]
          full_name: string
          id: string
          is_blocked: boolean
          is_online: boolean
          phone: string
          rating: number
          updated_at: string
        }
        Insert: {
          auth_status?: Database["public"]["Enums"]["auth_status"]
          balance?: number
          car_color?: string
          car_model: string
          car_plate: string
          completed_today?: number
          created_at?: string
          current_status?: Database["public"]["Enums"]["driver_status"]
          full_name: string
          id: string
          is_blocked?: boolean
          is_online?: boolean
          phone: string
          rating?: number
          updated_at?: string
        }
        Update: {
          auth_status?: Database["public"]["Enums"]["auth_status"]
          balance?: number
          car_color?: string
          car_model?: string
          car_plate?: string
          completed_today?: number
          created_at?: string
          current_status?: Database["public"]["Enums"]["driver_status"]
          full_name?: string
          id?: string
          is_blocked?: boolean
          is_online?: boolean
          phone?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          accepted_by_driver_id: string | null
          bonus_used: number
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          delivery_description: string | null
          dispatch_state: Database["public"]["Enums"]["dispatch_state"]
          drop_zone: string | null
          estimated_km: number
          id: string
          km_price: number
          operator_add: number
          order_type: Database["public"]["Enums"]["order_type"]
          passenger_name: string | null
          passenger_phone: string
          pickup_zone: string
          start_price: number
          status: Database["public"]["Enums"]["order_status"]
          targeted_driver_id: string | null
          total_price: number
        }
        Insert: {
          accepted_by_driver_id?: string | null
          bonus_used?: number
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivery_description?: string | null
          dispatch_state?: Database["public"]["Enums"]["dispatch_state"]
          drop_zone?: string | null
          estimated_km?: number
          id?: string
          km_price?: number
          operator_add?: number
          order_type?: Database["public"]["Enums"]["order_type"]
          passenger_name?: string | null
          passenger_phone: string
          pickup_zone: string
          start_price?: number
          status?: Database["public"]["Enums"]["order_status"]
          targeted_driver_id?: string | null
          total_price?: number
        }
        Update: {
          accepted_by_driver_id?: string | null
          bonus_used?: number
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivery_description?: string | null
          dispatch_state?: Database["public"]["Enums"]["dispatch_state"]
          drop_zone?: string | null
          estimated_km?: number
          id?: string
          km_price?: number
          operator_add?: number
          order_type?: Database["public"]["Enums"]["order_type"]
          passenger_name?: string | null
          passenger_phone?: string
          pickup_zone?: string
          start_price?: number
          status?: Database["public"]["Enums"]["order_status"]
          targeted_driver_id?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_accepted_by_driver_id_fkey"
            columns: ["accepted_by_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_targeted_driver_id_fkey"
            columns: ["targeted_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          decline_cooldown_seconds: number
          driver_bonus_mode: string
          driver_bonus_per_order: number
          green_after_seconds: number
          id: string
          km_price: number
          max_targeted_attempts: number
          offer_expires_seconds: number
          passenger_bonus_percent: number
          start_price: number
          updated_at: string
          w_cancel: number
          w_distance: number
          w_idle: number
          w_queue: number
          w_recent: number
          waiting_price_per_minute: number
        }
        Insert: {
          decline_cooldown_seconds?: number
          driver_bonus_mode?: string
          driver_bonus_per_order?: number
          green_after_seconds?: number
          id?: string
          km_price?: number
          max_targeted_attempts?: number
          offer_expires_seconds?: number
          passenger_bonus_percent?: number
          start_price?: number
          updated_at?: string
          w_cancel?: number
          w_distance?: number
          w_idle?: number
          w_queue?: number
          w_recent?: number
          waiting_price_per_minute?: number
        }
        Update: {
          decline_cooldown_seconds?: number
          driver_bonus_mode?: string
          driver_bonus_per_order?: number
          green_after_seconds?: number
          id?: string
          km_price?: number
          max_targeted_attempts?: number
          offer_expires_seconds?: number
          passenger_bonus_percent?: number
          start_price?: number
          updated_at?: string
          w_cancel?: number
          w_distance?: number
          w_idle?: number
          w_queue?: number
          w_recent?: number
          waiting_price_per_minute?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_uz: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_uz: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_uz?: string
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
      app_role: "admin" | "operator" | "driver" | "passenger"
      auth_status: "pending" | "approved" | "rejected"
      dispatch_state: "RED_TARGETED" | "GREEN_PUBLIC"
      driver_status: "FREE" | "BUSY" | "IN_TRIP" | "OFFLINE"
      order_status:
        | "CREATED"
        | "OFFERED"
        | "ACCEPTED"
        | "ARRIVED"
        | "WAITING"
        | "IN_TRIP"
        | "COMPLETED"
        | "CANCELLED"
      order_type: "TAXI" | "DELIVERY"
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
      app_role: ["admin", "operator", "driver", "passenger"],
      auth_status: ["pending", "approved", "rejected"],
      dispatch_state: ["RED_TARGETED", "GREEN_PUBLIC"],
      driver_status: ["FREE", "BUSY", "IN_TRIP", "OFFLINE"],
      order_status: [
        "CREATED",
        "OFFERED",
        "ACCEPTED",
        "ARRIVED",
        "WAITING",
        "IN_TRIP",
        "COMPLETED",
        "CANCELLED",
      ],
      order_type: ["TAXI", "DELIVERY"],
    },
  },
} as const
