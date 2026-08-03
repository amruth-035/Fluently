import { Link } from 'react-router-dom'
import { ProgressChart } from '../components/ProgressChart'
import { SessionHistory } from '../components/SessionHistory'
import { StatCard } from '../components/StatCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Spinner } from '../components/ui/Spinner'
import { getApiErrorMessage } from '../api/errors'
import { useDashboard } from '../hooks/useDashboard'
import { useSessions } from '../hooks/useSessions'

export function Dashboard() {
  const { data: dashboard, isLoading, isError, error } = useDashboard()
  const { data: sessions = [] } = useSessions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-slate-600">
        <Spinner />
        <span>Loading dashboard…</span>
      </div>
    )
  }

  if (isError || !dashboard) {
    return (
      <ErrorMessage
        message={getApiErrorMessage(error)}
      />
    )
  }

  const hasSessions = dashboard.session_count > 0
  const averageLabel =
    dashboard.average_fluency_score != null
      ? String(Math.round(dashboard.average_fluency_score))
      : '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Track your fluency progress over time.</p>
        </div>
        <Link to="/record">
          <Button>New Recording</Button>
        </Link>
      </div>

      {!hasSessions ? (
        <Card title="Get started">
          <p className="text-sm text-slate-600">
            You haven&apos;t recorded any sessions yet. Make your first recording to see fluency
            stats and trends here.
          </p>
          <Link to="/record" className="mt-4 inline-block">
            <Button>Record your first session</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Total sessions" value={String(dashboard.session_count)} />
            <StatCard
              label="Average fluency score"
              value={averageLabel}
              hint={dashboard.average_fluency_score != null ? 'Out of 100' : 'No scored sessions yet'}
            />
          </div>

          <ProgressChart data={dashboard.fluency_trend} />
          <SessionHistory sessions={sessions} />
        </>
      )}
    </div>
  )
}
