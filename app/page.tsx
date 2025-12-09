import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CISSP Exam Preparation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          Master the CISSP certification exam with comprehensive practice tests and detailed explanations
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Free Sample Quiz</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try our free 10-question quiz to get a feel for the exam format. No signup required!
            </p>
            <Link
              href="/quiz/free"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Start Free Quiz
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Premium Practice Exam</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              100 questions • 60-minute timer • Full explanations
            </p>
            <p className="text-3xl font-bold text-purple-600 mb-6">$59/year</p>
            {session ? (
              <Link
                href="/exam/premium"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Start Practice Exam
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Sign Up to Access
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">Comprehensive Question Bank</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Questions covering all CISSP domains with detailed explanations
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Real Exam Simulation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Practice with timed exams that mirror the actual test experience
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Track Your Progress</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Review your attempts and identify areas for improvement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

