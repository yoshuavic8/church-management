export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          address: string | null
          date_of_birth: string | null
          gender: string | null
          marital_status: string | null
          join_date: string
          baptism_date: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          notes: string | null
          status: string
          role: string
          role_level: number
          role_context: Json | null
          cell_group_id: string | null
          district_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          address?: string | null
          date_of_birth?: string | null
          gender?: string | null
          marital_status?: string | null
          join_date?: string
          baptism_date?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          status?: string
          role?: string
          role_level?: number
          role_context?: Json | null
          cell_group_id?: string | null
          district_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          address?: string | null
          date_of_birth?: string | null
          gender?: string | null
          marital_status?: string | null
          join_date?: string
          baptism_date?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          status?: string
          role?: string
          role_level?: number
          role_context?: Json | null
          cell_group_id?: string | null
          district_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_members_cell_group"
            columns: ["cell_group_id"]
            referencedRelation: "cell_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_members_district"
            columns: ["district_id"]
            referencedRelation: "districts"
            referencedColumns: ["id"]
          }
        ]
      }
      member_tokens: {
        Row: {
          id: string
          member_id: string
          token: string
          created_at: string
          expires_at: string
          last_used_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          member_id: string
          token: string
          created_at?: string
          expires_at: string
          last_used_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          member_id?: string
          token?: string
          created_at?: string
          expires_at?: string
          last_used_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "member_tokens_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      districts: {
        Row: {
          id: string
          name: string
          description: string | null
          leader1_id: string | null
          leader2_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          leader1_id?: string | null
          leader2_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          leader1_id?: string | null
          leader2_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_leader1_id_fkey"
            columns: ["leader1_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "districts_leader2_id_fkey"
            columns: ["leader2_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      cell_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          district_id: string | null
          leader_id: string | null
          assistant_leader_id: string | null
          meeting_day: string | null
          meeting_time: string | null
          meeting_location: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          district_id?: string | null
          leader_id?: string | null
          assistant_leader_id?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          meeting_location?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          district_id?: string | null
          leader_id?: string | null
          assistant_leader_id?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          meeting_location?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cell_groups_assistant_leader_id_fkey"
            columns: ["assistant_leader_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_groups_district_id_fkey"
            columns: ["district_id"]
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_groups_leader_id_fkey"
            columns: ["leader_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_member_token: {
        Args: {
          token_value: string
        }
        Returns: string
      }
      generate_member_token: {
        Args: {
          member_id_param: string
          days_valid?: number
        }
        Returns: string
      }
      invalidate_member_tokens: {
        Args: {
          member_id_param: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
