import { Link } from 'react-router-dom'
import { Card } from './ui/Card'
import type { SpeechSessionSummary } from '../types/session'
import { formatDuration } from '../utils/formatDuration'

interface SessionHistoryProps {
  sessions: SpeechSessionSummary[]
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (!sessions.length) {
    return null
  }

  return (
    <Card title="Session history">
      <ul className="divide-y divide-slate-100">
        {sessions.map((session) => (
          <li key={session.id}>
            <Link
              to={`/sessions/${session.id}`}
              className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(session.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDuration(Math.round(session.duration))}
                  {session.status === 'failed' && ' · Processing failed'}
                </p>
              </div>
              <div className="text-right">
                {session.fluency_score != null ? (
                  <p className="text-sm font-semibold text-indigo-700">
                    {Math.round(session.fluency_score)}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">—</p>
                )}
                <p className="text-xs text-slate-400">fluency</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
