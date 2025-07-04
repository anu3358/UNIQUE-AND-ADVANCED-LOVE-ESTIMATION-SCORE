import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create client only if properly configured
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          birth_date: string | null
          zodiac_sign: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          zodiac_sign?: string | null
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          zodiac_sign?: string | null
          updated_at?: string
        }
      }
      love_calculations: {
        Row: {
          id: string
          user_id: string | null
          name1: string
          name2: string
          love_score: number
          compatibility_factors: any
          message: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          user_id?: string | null
          name1: string
          name2: string
          love_score: number
          compatibility_factors?: any
          message?: string | null
          is_public?: boolean
        }
        Update: {
          is_public?: boolean
          message?: string | null
        }
      }
    }
  }
}
