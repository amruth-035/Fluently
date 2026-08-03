import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AudioRecorder, type RecordingPayload } from '../components/AudioRecorder'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Spinner } from '../components/ui/Spinner'
import { getSessionErrorMessage } from '../api/sessions'
import { useCreateSession } from '../hooks/useSessions'

type UploadPhase = 'uploading' | 'analyzing'

export function Record() {
  const navigate = useNavigate()
  const createSession = useCreateSession()
  const [pendingRecording, setPendingRecording] = useState<RecordingPayload | null>(null)
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('uploading')
  const [clientError, setClientError] = useState<string | null>(null)

  const isUploading = createSession.isPending

  function handleUseRecording(recording: RecordingPayload) {
    if (recording.blob.size < 1000 || recording.duration < 1) {
      setClientError(
        'Recording is too short or empty. Speak for at least a second, then try again.',
      )
      return
    }

    setClientError(null)
    setPendingRecording(recording)
    setUploadPhase('uploading')
    createSession.reset()

    const switchToAnalyzing = window.setTimeout(() => {
      setUploadPhase('analyzing')
    }, 1500)

    createSession.mutate(
      {
        blob: recording.blob,
        duration: recording.duration,
        onUploadProgress: (loaded, total) => {
          if (total && loaded >= total) {
            window.clearTimeout(switchToAnalyzing)
            setUploadPhase('analyzing')
          }
        },
      },
      {
        onSuccess: (session) => {
          window.clearTimeout(switchToAnalyzing)
          setPendingRecording(null)
          navigate(`/sessions/${session.id}`)
        },
        onError: () => {
          window.clearTimeout(switchToAnalyzing)
        },
      },
    )
  }

  function handleRetry() {
    if (!pendingRecording) return
    createSession.reset()
    setUploadPhase('uploading')
    handleUseRecording(pendingRecording)
  }

  const loadingMessage =
    uploadPhase === 'uploading' ? 'Uploading…' : 'Analyzing your speech…'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record</h1>
        <p className="mt-1 text-slate-600">
          Record your speech, then we&apos;ll upload and analyze it for you.
        </p>
      </div>

      {isUploading && (
        <Card title="Processing">
          <div className="flex items-center gap-3 text-slate-700">
            <Spinner size="sm" />
            <span className="text-sm font-medium">{loadingMessage}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            This can take up to a minute while we transcribe and analyze your recording.
          </p>
        </Card>
      )}

      {clientError && <ErrorMessage message={clientError} />}

      {createSession.isError && (
        <div className="space-y-3">
          <ErrorMessage message={getSessionErrorMessage(createSession.error)} />
          {pendingRecording && (
            <Button onClick={handleRetry}>Retry upload</Button>
          )}
        </div>
      )}

      <AudioRecorder
        onUseRecording={handleUseRecording}
        disabled={isUploading}
      />
    </div>
  )
}
