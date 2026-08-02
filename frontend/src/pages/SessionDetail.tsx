import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Spinner } from '../components/ui/Spinner'
import { useSession } from '../hooks/useSessions'
import { formatDuration } from '../utils/formatDuration'

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: session, isLoading, isError, error } = useSession(sessionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-slate-600">
        <Spinner />
        <span>Loading session…</span>
      </div>
    )
  }

  if (isError || !session) {
    return (
      <div className="space-y-4">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Could not load this session.'}
        />
        <Link to="/record" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to record
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/record" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to record
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Session</h1>
        <p className="mt-1 text-sm text-slate-500">
          Recorded {new Date(session.created_at).toLocaleString()} ·{' '}
          {formatDuration(Math.round(session.duration))}
        </p>
      </div>

      <Card title="Status">
        <p className="text-sm capitalize text-slate-700">Status: {session.status}</p>
        {session.pipeline_error && (
          <p className="mt-2 text-sm text-red-600">{session.pipeline_error}</p>
        )}
      </Card>

      <Card title="Transcript">
        <p className="whitespace-pre-wrap text-sm text-slate-700">
          {session.transcript || 'No transcript available.'}
        </p>
      </Card>

      {session.analysis && (
        <Card title="Analysis">
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-slate-700">Fluency score</dt>
              <dd className="text-slate-600">{session.analysis.fluency_score}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Speaking rate</dt>
              <dd className="text-slate-600">{session.analysis.speaking_rate} wpm</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Pauses</dt>
              <dd className="text-slate-600">{session.analysis.pause_count}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Full analysis and lesson views coming in a later phase.
          </p>
        </Card>
      )}

      {session.lesson && (
        <Card title="Practice lesson">
          <p className="text-sm font-medium text-slate-800">
            {session.lesson.generated_lesson.difficulty} ·{' '}
            {session.lesson.generated_lesson.estimated_time}
          </p>
          <p className="mt-2 text-sm text-slate-600">{session.lesson.generated_lesson.objective}</p>
        </Card>
      )}
    </div>
  )
}
