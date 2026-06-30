export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          major: string | null;
          year: string | null;
          study_focus: string | null;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          major?: string | null;
          year?: string | null;
          study_focus?: string | null;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          major?: string | null;
          year?: string | null;
          study_focus?: string | null;
          role?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      spots: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          area: string | null;
          lat: number | null;
          lng: number | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          area?: string | null;
          lat?: number | null;
          lng?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          area?: string | null;
          lat?: number | null;
          lng?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: number;
          name: string;
          owner_id: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          owner_id: string;
          invite_code: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          owner_id?: string;
          invite_code?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          id: number;
          group_id: number;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: number;
          group_id: number;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: number;
          group_id?: number;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          id: number;
          user_id: string;
          group_id: number | null;
          spot_id: number | null;
          title: string;
          category: string | null;
          start_time: string;
          end_time: string | null;
          status: "active" | "completed" | "canceled";
          target_duration_minutes: number;
          duration_minutes: number | null;
          distraction_free: boolean;
          goal_completed: boolean | null;
          notes: string | null;
          summary_ai: string | null;
          media_url: string | null;
          visibility: "private" | "group" | "public";
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          group_id?: number | null;
          spot_id?: number | null;
          title: string;
          category?: string | null;
          start_time: string;
          end_time?: string | null;
          status?: "active" | "completed" | "canceled";
          target_duration_minutes: number;
          duration_minutes?: number | null;
          distraction_free?: boolean;
          goal_completed?: boolean | null;
          notes?: string | null;
          summary_ai?: string | null;
          media_url?: string | null;
          visibility?: "private" | "group" | "public";
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          group_id?: number | null;
          spot_id?: number | null;
          title?: string;
          category?: string | null;
          start_time?: string;
          end_time?: string | null;
          status?: "active" | "completed" | "canceled";
          target_duration_minutes?: number;
          duration_minutes?: number | null;
          distraction_free?: boolean;
          goal_completed?: boolean | null;
          notes?: string | null;
          summary_ai?: string | null;
          media_url?: string | null;
          visibility?: "private" | "group" | "public";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: {
          id: number;
          session_id: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: number;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      deadlines: {
        Row: {
          id: number;
          user_id: string;
          course: string | null;
          title: string | null;
          due_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          course?: string | null;
          title?: string | null;
          due_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          course?: string | null;
          title?: string | null;
          due_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deadlines_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          id: number;
          user_id: string;
          friend_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          friend_id: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          friend_id?: string;
          status?: "pending" | "accepted" | "blocked";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_friend_id_fkey";
            columns: ["friend_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
