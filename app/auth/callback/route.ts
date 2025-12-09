import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    try {
      const supabase = createServerComponentClient({ cookies })
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      // Success - redirect to profile
      return NextResponse.redirect(new URL('/profile', requestUrl.origin))
    } catch (err: any) {
      console.error('Callback error:', err)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(err.message || 'Verification failed')}`, requestUrl.origin)
      )
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/auth/login?error=no_code', requestUrl.origin))
}

