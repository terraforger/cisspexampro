'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { hasActiveSubscription } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/login')
      return
    }

    setSession(session)

    // Load subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    setSubscription(subData)

    // Load recent attempts
    const { data: attemptsData } = await supabase
      .from('user_attempts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false })
      .limit(10)

    setAttempts(attemptsData || [])
    setLoading(false)
  }

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId })
      } else {
        throw new Error('Stripe not initialized or no session ID')
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Failed to open customer portal. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  const isActive = subscription?.status === 'active' && 
    subscription?.current_period_end && 
    new Date(subscription.current_period_end) > new Date()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>User ID:</strong> {session?.user?.id}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription Status</h2>
          {isActive ? (
            <div>
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-semibold">
                  Active
                </span>
              </div>
              {subscription.current_period_end && (
                <p className="mb-4">
                  <strong>Renewal Date:</strong>{' '}
                  {format(new Date(subscription.current_period_end), 'MMMM dd, yyyy')}
                </p>
              )}
              <button
                onClick={handleManageSubscription}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-semibold">
                  No Active Subscription
                </span>
              </div>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Subscribe to access premium practice exams with 100 questions and detailed explanations.
              </p>
              <button
                onClick={handleSubscribe}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Subscribe for $59/year
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Attempts</h2>
          {attempts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No attempts yet.</p>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold capitalize">{attempt.quiz_type} {attempt.quiz_type === 'premium' ? 'Exam' : 'Quiz'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Started: {format(new Date(attempt.started_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {attempt.finished_at && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Finished: {format(new Date(attempt.finished_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                    {attempt.score !== null && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {attempt.score}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {attempt.question_ids?.length || 0} questions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isActive && (
          <div className="text-center">
            <Link
              href="/exam/premium"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Start Practice Exam
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

