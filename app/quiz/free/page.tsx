'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { selectQuestions, shuffleArray } from '@/lib/utils'
import type { Question } from '@/lib/supabase'
import Link from 'next/link'

export default function FreeQuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(10)

      if (error) throw error

      if (data && data.length > 0) {
        const selected = selectQuestions(data, 10)
        setQuestions(selected)
      } else {
        setError('No questions available. Please contact support.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load questions')
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

  const handleSubmit = async () => {
    let correctCount = 0
    const currentQuestion = questions[currentQuestionIndex]

    // Calculate score for all questions
    questions.forEach((q) => {
      const selected = selectedAnswers[q.id]
      if (selected === q.correct_answer) {
        correctCount++
      }
    })

    setScore(correctCount)
    setShowResults(true)

    // Save attempt (optional, since it's free and no login required)
    // We could save with a guest identifier if needed
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl">Loading questions...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Return to Home
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
            <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
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
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Free Sample Quiz</h1>
            <span className="text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h2>

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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

