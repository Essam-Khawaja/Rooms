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
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: string | null;
          company: string | null;
          interests: string[];
          looking_for: string | null;
          can_help_with: string | null;
          account_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          company?: string | null;
          interests?: string[];
          looking_for?: string | null;
          can_help_with?: string | null;
          account_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      rooms: {
        Row: {
          id: string;
          slug: string;
          name: string;
          organizer_name: string | null;
          organizer_id: string | null;
          description: string | null;
          status: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          organizer_name?: string | null;
          organizer_id?: string | null;
          description?: string | null;
          status?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Insert"]>;
      };
      attendees: {
        Row: {
          id: string;
          room_id: string;
          profile_id: string | null;
          username: string | null;
          claimed_by: string | null;
          session_token: string | null;
          name: string;
          email: string | null;
          role: string | null;
          company: string | null;
          interests: string[];
          looking_for: string | null;
          can_help_with: string | null;
          cluster: string | null;
          avatar_url: string | null;
          is_guest: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          profile_id?: string | null;
          username?: string | null;
          claimed_by?: string | null;
          session_token?: string | null;
          name: string;
          email?: string | null;
          role?: string | null;
          company?: string | null;
          interests?: string[];
          looking_for?: string | null;
          can_help_with?: string | null;
          cluster?: string | null;
          avatar_url?: string | null;
          is_guest?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attendees"]["Insert"]>;
      };
      connections: {
        Row: {
          id: string;
          room_id: string;
          from_attendee_id: string;
          to_attendee_id: string;
          note: string | null;
          tags: string[];
          follow_up: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          from_attendee_id: string;
          to_attendee_id: string;
          note?: string | null;
          tags?: string[];
          follow_up?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["connections"]["Insert"]>;
      };
      saved_people: {
        Row: {
          id: string;
          room_id: string;
          from_attendee_id: string;
          saved_attendee_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          from_attendee_id: string;
          saved_attendee_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_people"]["Insert"]>;
      };
    };
    Functions: {
      get_room_metrics: {
        Args: { room_slug: string };
        Returns: Json;
      };
    };
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
export type AttendeeRow = Database["public"]["Tables"]["attendees"]["Row"];
export type ConnectionRow = Database["public"]["Tables"]["connections"]["Row"];
export type SavedPersonRow = Database["public"]["Tables"]["saved_people"]["Row"];
