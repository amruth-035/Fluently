export interface FluencyTrendPoint {
  date: string
  fluency_score: number
}

export interface DashboardData {
  session_count: number
  average_fluency_score: number | null
  fluency_trend: FluencyTrendPoint[]
}
