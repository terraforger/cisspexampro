import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// Admin client with service role key (for admin operations)
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Question {
  id: number
  question_text: string
  choice_a: string
  choice_b: string
  choice_c: string
  choice_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  domain: string | null
  created_at: string
  updated_at: string
}

export interface UserAttempt {
  id: number
  user_id: string
  quiz_type: 'free' | 'premium'
  started_at: string
  finished_at: string | null
  score: number | null
  question_ids: number[]
}

export interface UserAnswer {
  id: number
  attempt_id: number
  question_id: number
  selected_choice: 'A' | 'B' | 'C' | 'D' | null
  is_correct: boolean | null
}

export interface Subscription {
  id: number
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

