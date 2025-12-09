'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { selectQuestions, formatTimeRemaining, hasActiveSubscription } from '@/lib/utils'
import type { Question } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const EXAM_DURATION_SECONDS = 60 * 60 // 60 minutes

export default function PremiumExamPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION_SECONDS)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (startedAt && !showResults) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startedAt.getTime()) / 1000)
        const remaining = EXAM_DURATION_SECONDS - elapsed

        if (remaining <= 0) {
          clearInterval(interval)
          handleTimeUp()
        } else {
          setTimeRemaining(remaining)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startedAt, showResults])

  const checkAccess = async () => {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/login?redirect=/exam/premium')
      return
    }

    const hasAccess = await hasActiveSubscription(session.user.id, supabase)
    if (!hasAccess) {
      setError('You need an active subscription to access premium practice exams.')
      setLoading(false)
      return
    }

    loadQuestions(session.user.id)
  }

  const loadQuestions = async (userId: string) => {
    try {
      const supabase = createSupabaseClient()
      
      // Create attempt record
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_attempts')
        .insert({
          user_id: userId,
          quiz_type: 'premium',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (attemptError) throw attemptError

      setAttemptId(attemptData.id)
      setStartedAt(new Date())

      // Load questions
      const { data, error } = await supabase
        .from('questions')
        .select('*')

      if (error) throw error

      if (data && data.length > 0) {
        const selected = selectQuestions(data, 100)
        setQuestions(selected)

        // Update attempt with question IDs
        await supabase
          .from('user_attempts')
          .update({ question_ids: selected.map(q => q.id) })
          .eq('id', attemptData.id)
      } else {
        setError('No questions available. Please contact support.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load exam')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number, choice: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: choice,
    })
  }

  const handleTimeUp = async () => {
    await handleSubmit(true)
  }

  const handleSubmit = async (timeUp: boolean = false) => {
    if (!attemptId) return

    let correctCount = 0
    const supabase = createSupabaseClient()

    // Calculate score and save answers
    const answersToSave = questions.map((q) => {
      const selected = selectedAnswers[q.id]
      const isCorrect = selected === q.correct_answer
      if (isCorrect) correctCount++

      return {
        attempt_id: attemptId,
        question_id: q.id,
        selected_choice: selected || null,
        is_correct: isCorrect,
      }
    })

    // Save all answers
    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(answersToSave)

    if (answersError) {
      console.error('Error saving answers:', answersError)
    }

    // Update attempt with score and finished time
    const { error: updateError } = await supabase
      .from('user_attempts')
      .update({
        finished_at: new Date().toISOString(),
        score: correctCount,
      })
      .eq('id', attemptId)

    if (updateError) {
      console.error('Error updating attempt:', updateError)
    }

    setScore(correctCount)
    setShowResults(true)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl">Loading exam...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Link href="/profile" className="text-blue-600 dark:text-blue-400 hover:underline">
            Go to Profile
          </Link>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl mb-4">No questions available</div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h1 className="text-3xl font-bold mb-4">Exam Results</h1>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {score} / {questions.length}
            </div>
            <div className="text-xl text-gray-600 dark:text-gray-400">
              {Math.round((score / questions.length) * 100)}% Correct
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const selected = selectedAnswers[question.id]
              const isCorrect = selected === question.correct_answer
              
              return (
                <div
                  key={question.id}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow border ${
                    isCorrect
                      ? 'border-green-500 dark:border-green-700'
                      : 'border-red-500 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1}: {question.question_text}
                    </h3>
                    {isCorrect ? (
                      <span className="text-green-600 dark:text-green-400 font-bold">✓ Correct</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-bold">✗ Incorrect</span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                      const choiceText = question[`choice_${choice.toLowerCase()}` as keyof Question] as string
                      const isSelected = selected === choice
                      const isCorrectAnswer = question.correct_answer === choice
                      
                      let bgColor = 'bg-gray-100 dark:bg-gray-700'
                      if (isCorrectAnswer) {
                        bgColor = 'bg-green-100 dark:bg-green-900 border-green-500'
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'bg-red-100 dark:bg-red-900 border-red-500'
                      }

                      return (
                        <div
                          key={choice}
                          className={`p-3 rounded border ${bgColor} ${
                            isSelected ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <strong>{choice}.</strong> {choiceText}
                          {isCorrectAnswer && <span className="ml-2 text-green-600 dark:text-green-400">✓</span>}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/profile"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Return to Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(selectedAnswers).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">Premium Practice Exam</h1>
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {formatTimeRemaining(timeRemaining)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {answeredCount} / {questions.length} answered
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-6">
                Question {currentQuestionIndex + 1}: {currentQuestion.question_text}
              </h2>

              <div className="space-y-3 mb-8">
                {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                  const choiceText = currentQuestion[`choice_${choice.toLowerCase()}` as keyof Question] as string
                  const isSelected = selectedAnswers[currentQuestion.id] === choice

                  return (
                    <button
                      key={choice}
                      onClick={() => handleAnswerSelect(currentQuestion.id, choice)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <strong>{choice}.</strong> {choiceText}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 sticky top-4">
              <h3 className="font-semibold mb-4">Question Navigator</h3>
              <div className="grid grid-cols-10 gap-2 mb-4 max-h-96 overflow-y-auto">
                {questions.map((q, index) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionClick(index)}
                      className={`w-8 h-8 rounded text-sm ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
                    handleSubmit()
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

