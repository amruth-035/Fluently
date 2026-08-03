import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { AnalysisCard } from '../components/AnalysisCard'
import { LessonCard } from '../components/LessonCard'
import { SessionAudioPlayer } from '../components/SessionAudioPlayer'
import { TranscriptCard } from '../components/TranscriptCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Spinner } from '../components/ui/Spinner'
import { getSessionErrorMessage } from '../api/sessions'
import { useReprocessSession, useSession } from '../hooks/useSessions'
import { formatDuration } from '../utils/formatDuration'

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: session, isLoading, isError, error, refetch } = useSession(sessionId)
  const reprocess = useReprocessSession(sessionId)

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
  const canReprocess = isFailed && session.failed_step !== 'upload'

  function handleReprocess() {
    reprocess.mutate(undefined, {
      onSuccess: () => {
        refetch()
      },
    })
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

      {isFailed && (
        <Card title="Processing incomplete">
          <p className="text-sm text-red-700">
            {session.pipeline_error ?? 'Something went wrong while processing this session.'}
          </p>
          {session.failed_step && (
            <p className="mt-1 text-xs text-slate-500">Failed at: {session.failed_step}</p>
          )}
          {reprocess.isError && (
            <div className="mt-3">
              <ErrorMessage message={getSessionErrorMessage(reprocess.error)} />
            </div>
          )}
          {canReprocess && (
            <div className="mt-4">
              <Button onClick={handleReprocess} disabled={reprocess.isPending}>
                {reprocess.isPending ? 'Reprocessing…' : 'Retry processing'}
              </Button>
            </div>
          )}
          {session.failed_step === 'upload' && (
            <p className="mt-3 text-sm text-slate-600">
              Upload failed — please make a{' '}
              <Link to="/record" className="font-medium text-indigo-600 hover:text-indigo-700">
                new recording
              </Link>
              .
            </p>
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
