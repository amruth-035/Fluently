export interface AnalysisResult {
  id: string
  session_id: string
  fluency_score: number
  speaking_rate: number
  pause_count: number
  repetitions: unknown[]
  filler_words: unknown[]
  strengths: unknown[]
  recommendations: unknown[]
  created_at: string
}

export interface PracticeLesson {
  id: string
  session_id: string
  generated_lesson: {
    difficulty: string
    estimated_time: string
    objective: string
    exercises: {
      word_drills: string[]
      phrase_drills: string[]
      sentence_drills: string[]
      paragraph: string
    }
    coaching_tips: string[]
  }
  created_at: string
}

export interface SpeechSessionSummary {
  id: string
  user_id: string
  transcript: string | null
  audio_path: string
  duration: number
  status: 'processing' | 'completed' | 'failed' | string
  failed_step: string | null
  pipeline_error: string | null
  created_at: string
}

export interface SpeechSession extends SpeechSessionSummary {
  analysis: AnalysisResult | null
  lesson: PracticeLesson | null
}
