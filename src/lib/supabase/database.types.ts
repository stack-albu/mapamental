export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      mind_maps: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          status: "draft" | "active" | "archived";
          is_favorite: boolean;
          tags: string[];
          nodes: Json;
          edges: Json;
          viewport?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          status?: "draft" | "active" | "archived";
          is_favorite?: boolean;
          tags?: string[];
          nodes?: Json;
          edges?: Json;
          viewport?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: "draft" | "active" | "archived";
          is_favorite?: boolean;
          tags?: string[];
          nodes?: Json;
          edges?: Json;
          viewport?: Json;
          updated_at?: string;
        };
      };
      mind_map_nodes: {
        Row: {
          id: string;
          mind_map_id: string;
          user_id: string;
          client_id: string;
          parent_client_id: string | null;
          label: string;
          note: string;
          color: string;
          position_x: number;
          position_y: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mind_map_id: string;
          user_id: string;
          client_id: string;
          parent_client_id?: string | null;
          label: string;
          note?: string;
          color?: string;
          position_x?: number;
          position_y?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mind_map_nodes"]["Insert"]>;
      };
      mind_map_edges: {
        Row: {
          id: string;
          mind_map_id: string;
          user_id: string;
          client_id: string;
          source_client_id: string;
          target_client_id: string;
          label: string;
          animated: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mind_map_id: string;
          user_id: string;
          client_id: string;
          source_client_id: string;
          target_client_id: string;
          label?: string;
          animated?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mind_map_edges"]["Insert"]>;
      };
      mind_map_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
      };
      mind_map_shares: {
        Row: {
          id: string;
          mind_map_id: string;
          owner_id: string;
          shared_with: string | null;
          role: "viewer" | "editor";
          invite_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          mind_map_id: string;
          owner_id: string;
          shared_with?: string | null;
          role?: "viewer" | "editor";
          invite_email?: string | null;
          created_at?: string;
        };
        Update: {
          shared_with?: string | null;
          role?: "viewer" | "editor";
          invite_email?: string | null;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: "light" | "dark";
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: "light" | "dark";
          updated_at?: string;
        };
        Update: {
          theme?: "light" | "dark";
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
