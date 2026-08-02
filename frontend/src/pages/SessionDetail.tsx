import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { AnalysisCard } from '../components/AnalysisCard'
import { LessonCard } from '../components/LessonCard'
import { SessionAudioPlayer } from '../components/SessionAudioPlayer'
import { TranscriptCard } from '../components/TranscriptCard'
import { Card } from '../components/ui/Card'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Spinner } from '../components/ui/Spinner'
import { getSessionErrorMessage } from '../api/sessions'
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
    const isNotFound = axios.isAxiosError(error) && error.response?.status === 404

    return (
      <div className="space-y-4">
        <ErrorMessage
          message={
            isNotFound
              ? 'Session not found or you do not have access to it.'
              : getSessionErrorMessage(error)
          }
        />
        <Link to="/record" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to record
        </Link>
      </div>
    )
  }

  const hasAudio = Boolean(session.audio_path)
  const isFailed = session.status === 'failed'

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

      {isFailed && session.pipeline_error && (
        <Card title="Processing incomplete">
          <p className="text-sm text-red-700">{session.pipeline_error}</p>
          {session.failed_step && (
            <p className="mt-1 text-xs text-slate-500">Failed at: {session.failed_step}</p>
          )}
        </Card>
      )}

      {sessionId && <SessionAudioPlayer sessionId={sessionId} hasAudio={hasAudio} />}

      <TranscriptCard transcript={session.transcript} />

      {session.analysis && <AnalysisCard analysis={session.analysis} />}

      {session.lesson && <LessonCard lesson={session.lesson} />}
    </div>
  )
}
