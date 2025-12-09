// Utility function to check if user has active subscription
export async function hasActiveSubscription(userId: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  if (data.status !== 'active') {
    return false
  }

  // Check if subscription is still within current period
  if (data.current_period_end) {
    const periodEnd = new Date(data.current_period_end)
    return periodEnd > new Date()
  }

  return false
}

// Utility function to check if user is admin
export async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !error && !!data
}

// Randomize array using Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Select questions based on bank size rules
export function selectQuestions(questions: any[], count: number = 100): any[] {
  if (questions.length === 0) {
    return []
  }

  if (questions.length < count) {
    // Bank < 100: allow repeats to reach 100
    const selected: any[] = []
    const shuffled = shuffleArray(questions)
    
    while (selected.length < count) {
      selected.push(...shuffled)
    }
    
    return selected.slice(0, count)
  } else {
    // Bank >= 100: no repeats
    return shuffleArray(questions).slice(0, count)
  }
}

// Format time remaining
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

