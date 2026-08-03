import { Card } from './ui/Card'
import { ErrorMessage } from './ui/ErrorMessage'
import { Spinner } from './ui/Spinner'
import { getApiErrorMessage } from '../api/errors'
import { useSessionAudioUrl } from '../hooks/useSessions'

interface SessionAudioPlayerProps {
  sessionId: string
  hasAudio: boolean
}

export function SessionAudioPlayer({ sessionId, hasAudio }: SessionAudioPlayerProps) {
  const { data, isLoading, isError, error } = useSessionAudioUrl(sessionId, hasAudio)

  if (!hasAudio) {
    return (
      <Card title="Recording">
        <p className="text-sm text-slate-500">No audio available for this session.</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card title="Recording">
        <div className="flex items-center gap-3 text-slate-600">
          <Spinner size="sm" />
          <span className="text-sm">Loading audio…</span>
        </div>
      </Card>
    )
  }

  if (isError || !data?.url) {
    return (
      <Card title="Recording">
        <ErrorMessage
          message={getApiErrorMessage(error)}
        />
      </Card>
    )
  }

  return (
    <Card title="Recording">
      <audio controls src={data.url} className="w-full" playsInline preload="metadata">
        Your browser does not support audio playback.
      </audio>
    </Card>
  )
}
