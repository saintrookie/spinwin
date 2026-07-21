// Hand-written schema types matching supabase/migrations/*.sql. Only the
// shapes actually queried by lib/supabase/* are declared. If you later run
// `supabase gen types typescript`, this file can be replaced by the
// generated output without changing any call sites.

export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string;
          participant_no: string;
          full_name: string;
          plate_number: string | null;
          has_won: boolean;
          import_batch_id: string | null;
          imported_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_no: string;
          full_name: string;
          plate_number?: string | null;
          has_won?: boolean;
          import_batch_id?: string | null;
          imported_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["participants"]["Insert"]>;
        Relationships: [];
      };
      prizes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          quantity: number;
          awarded_count: number;
          display_order: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          quantity?: number;
          awarded_count?: number;
          display_order?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prizes"]["Insert"]>;
        Relationships: [];
      };
      winners: {
        Row: {
          id: string;
          participant_id: string;
          prize_id: string;
          won_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          prize_id: string;
          won_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["winners"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "winners_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: true;
            referencedRelation: "participants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "winners_prize_id_fkey";
            columns: ["prize_id"];
            isOneToOne: false;
            referencedRelation: "prizes";
            referencedColumns: ["id"];
          },
        ];
      };
      draw_settings: {
        Row: {
          id: number;
          current_prize_id: string | null;
          roll_duration_ms: number;
          roll_speed_ms: number;
          sound_enabled: boolean;
          confetti_enabled: boolean;
          theme: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          current_prize_id?: string | null;
          roll_duration_ms?: number;
          roll_speed_ms?: number;
          sound_enabled?: boolean;
          confetti_enabled?: boolean;
          theme?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["draw_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      draw_winners: {
        Args: { p_prize_id: string; p_count?: number };
        Returns: {
          winner_id: string;
          participant_id: string;
          participant_no: string;
          full_name: string;
          plate_number: string | null;
          prize_id: string;
          won_at: string;
        }[];
      };
      reset_draw: {
        Args: Record<string, never>;
        Returns: void;
      };
      sample_eligible_participants: {
        Args: { p_size: number };
        Returns: {
          id: string;
          full_name: string;
          plate_number: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
