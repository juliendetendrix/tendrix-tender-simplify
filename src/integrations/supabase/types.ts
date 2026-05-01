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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      beta_questionnaire_responses: {
        Row: {
          ao_experience: string
          company_name: string
          consent: boolean
          created_at: string
          email: string | null
          employees_range: string
          id: string
          phone: string | null
          sector: string
          sector_other: string | null
          source_page: string
        }
        Insert: {
          ao_experience: string
          company_name: string
          consent?: boolean
          created_at?: string
          email?: string | null
          employees_range: string
          id?: string
          phone?: string | null
          sector: string
          sector_other?: string | null
          source_page?: string
        }
        Update: {
          ao_experience?: string
          company_name?: string
          consent?: boolean
          created_at?: string
          email?: string | null
          employees_range?: string
          id?: string
          phone?: string | null
          sector?: string
          sector_other?: string | null
          source_page?: string
        }
        Relationships: []
      }
      charge_affaires_profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          phone: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          assigned_charge_affaires: string | null
          certifications: string[] | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          onboarding_completed: boolean
          owner_user_id: string
          sector: string | null
          siren: string | null
          updated_at: string
          zone: string | null
        }
        Insert: {
          assigned_charge_affaires?: string | null
          certifications?: string[] | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          onboarding_completed?: boolean
          owner_user_id: string
          sector?: string | null
          siren?: string | null
          updated_at?: string
          zone?: string | null
        }
        Update: {
          assigned_charge_affaires?: string | null
          certifications?: string[] | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          onboarding_completed?: boolean
          owner_user_id?: string
          sector?: string | null
          siren?: string | null
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json
          body: string
          created_at: string
          id: string
          request_id: string
          sender_user_id: string
        }
        Insert: {
          attachments?: Json
          body: string
          created_at?: string
          id?: string
          request_id: string
          sender_user_id: string
        }
        Update: {
          attachments?: Json
          body?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "tender_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      pme_questionnaire_responses: {
        Row: {
          ao_experience: string
          ao_frequency: string | null
          beta_interest: boolean
          city_department: string | null
          company_name: string
          company_size: string
          consent: boolean
          contact_email: string | null
          contact_name: string | null
          contact_sector: string | null
          created_at: string
          externalized_ao: boolean
          important_criteria: string[]
          main_barriers: string[]
          monthly_budget: string
          other_barrier: string | null
          other_criteria: string | null
          platform_interest: string
          sector: string
          source_page: string
        }
        Insert: {
          ao_experience: string
          ao_frequency?: string | null
          beta_interest: boolean
          city_department?: string | null
          company_name: string
          company_size: string
          consent?: boolean
          contact_email?: string | null
          contact_name?: string | null
          contact_sector?: string | null
          created_at?: string
          externalized_ao: boolean
          important_criteria?: string[]
          main_barriers?: string[]
          monthly_budget: string
          other_barrier?: string | null
          other_criteria?: string | null
          platform_interest: string
          sector: string
          source_page?: string
        }
        Update: {
          ao_experience?: string
          ao_frequency?: string | null
          beta_interest?: boolean
          city_department?: string | null
          company_name?: string
          company_size?: string
          consent?: boolean
          contact_email?: string | null
          contact_name?: string | null
          contact_sector?: string | null
          created_at?: string
          externalized_ao?: boolean
          important_criteria?: string[]
          main_barriers?: string[]
          monthly_budget?: string
          other_barrier?: string | null
          other_criteria?: string | null
          platform_interest?: string
          sector?: string
          source_page?: string
        }
        Relationships: []
      }
      tender_requests: {
        Row: {
          amount_won: number | null
          charge_affaires_id: string | null
          company_id: string
          created_at: string
          id: string
          status: string
          tender_id: string
          updated_at: string
        }
        Insert: {
          amount_won?: number | null
          charge_affaires_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          status?: string
          tender_id: string
          updated_at?: string
        }
        Update: {
          amount_won?: number | null
          charge_affaires_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          status?: string
          tender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_requests_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          budget: string | null
          cpv_codes: string[] | null
          created_at: string
          created_by: string | null
          date_publication: string | null
          deadline: string | null
          famille: string | null
          id: string
          location: string | null
          organisme: string | null
          pdf_path: string | null
          procedure: string | null
          raw: Json | null
          source: string
          source_url: string | null
          summary: string | null
          title: string
        }
        Insert: {
          budget?: string | null
          cpv_codes?: string[] | null
          created_at?: string
          created_by?: string | null
          date_publication?: string | null
          deadline?: string | null
          famille?: string | null
          id: string
          location?: string | null
          organisme?: string | null
          pdf_path?: string | null
          procedure?: string | null
          raw?: Json | null
          source?: string
          source_url?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          budget?: string | null
          cpv_codes?: string[] | null
          created_at?: string
          created_by?: string | null
          date_publication?: string | null
          deadline?: string | null
          famille?: string | null
          id?: string
          location?: string | null
          organisme?: string | null
          pdf_path?: string | null
          procedure?: string | null
          raw?: Json | null
          source?: string
          source_url?: string | null
          summary?: string | null
          title?: string
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
      can_access_request: { Args: { _request_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_owner: { Args: { _company_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "entreprise" | "charge_affaires" | "admin"
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
      app_role: ["entreprise", "charge_affaires", "admin"],
    },
  },
} as const
