import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Server-side Supabase client (only use in Server Components)
export const createSupabaseServerClient = () => {
  return createServerComponentClient({ cookies })
}

