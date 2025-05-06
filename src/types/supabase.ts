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
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          date: string
          description?: string
          type: string
          origin: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          date: string
          description?: string
          type: string
          origin: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          date?: string
          description?: string
          type?: string
          origin?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string
          created_at: string
          description?: string
          category: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string
          created_at?: string
          description?: string
          category: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string
          created_at?: string
          description?: string
          category?: string
        }
      }
      weekly_budget: {
        Row: {
          id: string
          user_id: string
          amount: number
          date: string
          notes?: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          date: string
          notes?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          date?: string
          notes?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
