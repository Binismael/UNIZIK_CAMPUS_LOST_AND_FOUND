// Generated from the Supabase schema. Regenerate after changing supabase/migrations.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      claims: {
        Row: {
          claimant_id: string;
          created_at: string;
          decided_at: string | null;
          id: string;
          item_id: string;
          proof_text: string;
          status: Database["public"]["Enums"]["claim_status"];
        };
        Insert: {
          claimant_id?: string;
          created_at?: string;
          decided_at?: string | null;
          id?: string;
          item_id: string;
          proof_text: string;
          status?: Database["public"]["Enums"]["claim_status"];
        };
        Update: {
          claimant_id?: string;
          created_at?: string;
          decided_at?: string | null;
          id?: string;
          item_id?: string;
          proof_text?: string;
          status?: Database["public"]["Enums"]["claim_status"];
        };
        Relationships: [
          {
            foreignKeyName: "claims_claimant_id_fkey";
            columns: ["claimant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
        ];
      };
      items: {
        Row: {
          brand: string;
          category: string;
          colors: string[];
          finder_id: string;
          found_at: string;
          id: string;
          location: string;
          location_lat: number | null;
          location_lng: number | null;
          marks: string;
          photo_path: string | null;
          search_text: unknown;
          status: Database["public"]["Enums"]["item_status"];
          summary: string;
          title: string;
        };
        Insert: {
          brand?: string;
          category: string;
          colors?: string[];
          finder_id?: string;
          found_at?: string;
          id?: string;
          location: string;
          location_lat?: number | null;
          location_lng?: number | null;
          marks?: string;
          photo_path?: string | null;
          search_text?: unknown;
          status?: Database["public"]["Enums"]["item_status"];
          summary?: string;
          title: string;
        };
        Update: {
          brand?: string;
          category?: string;
          colors?: string[];
          finder_id?: string;
          found_at?: string;
          id?: string;
          location?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          marks?: string;
          photo_path?: string | null;
          search_text?: unknown;
          status?: Database["public"]["Enums"]["item_status"];
          summary?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_finder_id_fkey";
            columns: ["finder_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          admission_number: string | null;
          created_at: string;
          department: string;
          email: string;
          faculty: string;
          full_name: string;
          id: string;
          level: string;
          notification_preferences: Json;
          phone: string;
          profile_complete: boolean;
          residence: string;
        };
        Insert: {
          admission_number?: string | null;
          created_at?: string;
          department?: string;
          email?: string;
          faculty?: string;
          full_name?: string;
          id: string;
          level?: string;
          notification_preferences?: Json;
          phone?: string;
          profile_complete?: boolean;
          residence?: string;
        };
        Update: {
          admission_number?: string | null;
          created_at?: string;
          department?: string;
          email?: string;
          faculty?: string;
          full_name?: string;
          id?: string;
          level?: string;
          notification_preferences?: Json;
          phone?: string;
          profile_complete?: boolean;
          residence?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          reason: string;
          reporter_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          reason: string;
          reporter_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          reason?: string;
          reporter_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      admission_number_available: { Args: { p_admission_number: string }; Returns: boolean };
      approve_claim: { Args: { p_claim_id: string }; Returns: undefined };
      get_handover_contact: {
        Args: { p_claim_id: string };
        Returns: { full_name: string; phone: string; residence: string }[];
      };
      get_item_claims: {
        Args: { p_item_id: string };
        Returns: {
          claimant_department: string;
          claimant_level: string;
          claimant_name: string;
          created_at: string;
          id: string;
          proof_text: string;
          status: Database["public"]["Enums"]["claim_status"];
        }[];
      };
      mark_returned: { Args: { p_item_id: string }; Returns: undefined };
      reject_claim: { Args: { p_claim_id: string }; Returns: undefined };
      search_found_items: {
        Args: {
          p_brand?: string;
          p_category?: string;
          p_colors?: string[];
          p_limit?: number;
          p_location?: string;
          p_marks?: string;
          p_query?: string;
        };
        Returns: {
          brand: string;
          category: string;
          colors: string[];
          finder_id: string;
          found_at: string;
          id: string;
          location: string;
          marks: string;
          photo_path: string;
          score: number;
          status: Database["public"]["Enums"]["item_status"];
          summary: string;
          title: string;
        }[];
      };
    };
    Enums: {
      claim_status: "pending" | "approved" | "rejected";
      item_status: "found" | "claimed" | "returned";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ItemRow = Database["public"]["Tables"]["items"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ClaimStatus = Database["public"]["Enums"]["claim_status"];
export type ItemStatus = Database["public"]["Enums"]["item_status"];
