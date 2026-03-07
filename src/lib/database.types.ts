export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          group_id: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          group_id?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          group_id?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          admin_id: string;
          member_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          admin_id: string;
          member_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          admin_id?: string;
          member_count?: number;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      levels: {
        Row: {
          id: string;
          price: number;
          direction: 'long' | 'short';
          group_id: string;
          creator_id: string;
          likes: number;
          dislikes: number;
          score: number;
          created_at: string;
          last_interaction_at: string;
        };
        Insert: {
          id?: string;
          price: number;
          direction: 'long' | 'short';
          group_id: string;
          creator_id: string;
          likes?: number;
          dislikes?: number;
          score?: number;
          created_at?: string;
          last_interaction_at?: string;
        };
        Update: {
          id?: string;
          price?: number;
          direction?: 'long' | 'short';
          group_id?: string;
          creator_id?: string;
          likes?: number;
          dislikes?: number;
          score?: number;
          created_at?: string;
          last_interaction_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          level_id: string;
          user_id: string;
          vote_type: 'like' | 'dislike';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          user_id: string;
          vote_type: 'like' | 'dislike';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          level_id?: string;
          user_id?: string;
          vote_type?: 'like' | 'dislike';
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          created_at?: string;
        };
      };
      level_tags: {
        Row: {
          id: string;
          level_id: string;
          tag_id: string;
          count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          tag_id: string;
          count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          level_id?: string;
          tag_id?: string;
          count?: number;
          created_at?: string;
        };
      };
      archived_levels: {
        Row: {
          id: string;
          level_id: string;
          group_id: string;
          price: number;
          direction: 'long' | 'short';
          creator_id: string;
          outcome: 'tapped' | 'failed';
          likes: number;
          dislikes: number;
          score: number;
          created_at: string;
          archived_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          group_id: string;
          price: number;
          direction: 'long' | 'short';
          creator_id: string;
          outcome: 'tapped' | 'failed';
          likes?: number;
          dislikes?: number;
          score?: number;
          created_at?: string;
          archived_at?: string;
        };
        Update: {
          id?: string;
          level_id?: string;
          group_id?: string;
          price?: number;
          direction?: 'long' | 'short';
          creator_id?: string;
          outcome?: 'tapped' | 'failed';
          likes?: number;
          dislikes?: number;
          score?: number;
          created_at?: string;
          archived_at?: string;
        };
      };
      level_uploads: {
        Row: {
          id: string;
          archived_level_id: string;
          user_id: string;
          image_url: string | null;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          archived_level_id: string;
          user_id: string;
          image_url?: string | null;
          body?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          archived_level_id?: string;
          user_id?: string;
          image_url?: string | null;
          body?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
