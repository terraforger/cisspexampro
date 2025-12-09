'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Question } from '@/lib/supabase'
import Papa from 'papaparse'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'questions' | 'stats'>('questions')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/auth/login?redirect=/admin')
      return
    }

    const userIsAdmin = await isAdmin(session.user.id, supabase)
    if (!userIsAdmin) {
      setError('Unauthorized. Admin access required.')
      setLoading(false)
      return
    }

    setAuthorized(true)
    loadData()
  }

  const loadData = async () => {
    const supabase = createSupabaseClient()
    
    // Load questions
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })

    setQuestions(questionsData || [])

    // Load stats
    const { data: attemptsData } = await supabase
      .from('user_attempts')
      .select('*')

    const { data: subscriptionsData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')

    setStats({
      totalQuestions: questionsData?.length || 0,
      totalAttempts: attemptsData?.length || 0,
      activeSubscribers: subscriptionsData?.length || 0,
    })

    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    const supabase = createSupabaseClient()
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Question deleted successfully')
      loadData()
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setShowAddForm(true)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const questionData = {
      question_text: formData.get('question_text') as string,
      choice_a: formData.get('choice_a') as string,
      choice_b: formData.get('choice_b') as string,
      choice_c: formData.get('choice_c') as string,
      choice_d: formData.get('choice_d') as string,
      correct_answer: formData.get('correct_answer') as 'A' | 'B' | 'C' | 'D',
      explanation: formData.get('explanation') as string,
      domain: formData.get('domain') as string || null,
    }

    const supabase = createSupabaseClient()
    let error

    if (editingQuestion) {
      const { error: updateError } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', editingQuestion.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionData)
      error = insertError
    }

    if (error) {
      setError(error.message)
    } else {
      setSuccess(editingQuestion ? 'Question updated successfully' : 'Question added successfully')
      setShowAddForm(false)
      setEditingQuestion(null)
      e.currentTarget.reset()
      loadData()
    }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return

    setError(null)
    setSuccess(null)

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const supabase = createSupabaseClient()
        const questions = results.data.map((row: any) => ({
          question_text: row.question_text || row.question,
          choice_a: row.choice_a || row.a,
          choice_b: row.choice_b || row.b,
          choice_c: row.choice_c || row.c,
          choice_d: row.choice_d || row.d,
          correct_answer: (row.correct_answer || row.correct || row.answer).toUpperCase(),
          explanation: row.explanation || '',
          domain: row.domain || null,
        }))

        const { error } = await supabase
          .from('questions')
          .insert(questions)

        if (error) {
          setError(error.message)
        } else {
          setSuccess(`Successfully imported ${questions.length} questions`)
          setCsvFile(null)
          loadData()
        }
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`)
      },
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xl">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded">
            {success}
          </div>
        )}

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'questions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Statistics
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6">Statistics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalQuestions}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Total Questions</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalAttempts}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Total Attempts</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.activeSubscribers}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Active Subscribers</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Question Management</h2>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm)
                  setEditingQuestion(null)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {showAddForm ? 'Cancel' : 'Add Question'}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question Text</label>
                    <textarea
                      name="question_text"
                      required
                      defaultValue={editingQuestion?.question_text || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={3}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Choice A</label>
                      <input
                        type="text"
                        name="choice_a"
                        required
                        defaultValue={editingQuestion?.choice_a || ''}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Choice B</label>
                      <input
                        type="text"
                        name="choice_b"
                        required
                        defaultValue={editingQuestion?.choice_b || ''}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Choice C</label>
                      <input
                        type="text"
                        name="choice_c"
                        required
                        defaultValue={editingQuestion?.choice_c || ''}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Choice D</label>
                      <input
                        type="text"
                        name="choice_d"
                        required
                        defaultValue={editingQuestion?.choice_d || ''}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Correct Answer</label>
                    <select
                      name="correct_answer"
                      required
                      defaultValue={editingQuestion?.correct_answer || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation</label>
                    <textarea
                      name="explanation"
                      required
                      defaultValue={editingQuestion?.explanation || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Domain (optional)</label>
                    <input
                      type="text"
                      name="domain"
                      defaultValue={editingQuestion?.domain || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </form>
              </div>
            )}

            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Import from CSV</h3>
              <div className="flex gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <button
                  onClick={handleCsvUpload}
                  disabled={!csvFile}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Upload CSV
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                CSV format: question_text, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, domain
              </p>
            </div>

            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{question.question_text}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p><strong>A:</strong> {question.choice_a}</p>
                        <p><strong>B:</strong> {question.choice_b}</p>
                        <p><strong>C:</strong> {question.choice_c}</p>
                        <p><strong>D:</strong> {question.choice_d}</p>
                        <p className="mt-2"><strong>Correct:</strong> {question.correct_answer}</p>
                        {question.domain && <p><strong>Domain:</strong> {question.domain}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm bg-blue-50 dark:bg-blue-900 p-3 rounded">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

