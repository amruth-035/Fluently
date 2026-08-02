import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { ErrorMessage } from './ui/ErrorMessage'
import { Spinner } from './ui/Spinner'
import { useRecorder } from '../hooks/useRecorder'
import { formatDuration } from '../utils/formatDuration'

export interface RecordingPayload {
  blob: Blob
  duration: number
}

interface AudioRecorderProps {
  onUseRecording?: (recording: RecordingPayload) => void
}

const statusCopy = {
  idle: { label: 'Ready to record', dotClass: 'bg-slate-400' },
  requesting_permission: { label: 'Requesting microphone…', dotClass: 'bg-amber-400' },
  recording: { label: 'Recording', dotClass: 'bg-red-500 animate-pulse' },
  stopped: { label: 'Recording saved', dotClass: 'bg-green-500' },
} as const

export function AudioRecorder({ onUseRecording }: AudioRecorderProps) {
  const {
    state,
    error,
    elapsedSeconds,
    recording,
    playbackUrl,
    startRecording,
    stopRecording,
    deleteRecording,
  } = useRecorder()

  const status = statusCopy[state]
  const isBusy = state === 'requesting_permission'

  return (
    <Card title="Record your speech">
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            {state === 'requesting_permission' ? (
              <Spinner size="sm" />
            ) : (
              <span className={`inline-block h-3 w-3 rounded-full ${status.dotClass}`} />
            )}
            <span className="text-sm font-medium text-slate-700">{status.label}</span>
          </div>
          <span className="font-mono text-lg tabular-nums text-slate-900">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex flex-wrap gap-3">
          {state === 'idle' && (
            <Button onClick={startRecording} disabled={isBusy}>
              Start recording
            </Button>
          )}

          {state === 'recording' && (
            <Button
              variant="secondary"
              onClick={stopRecording}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Stop recording
            </Button>
          )}

          {state === 'stopped' && playbackUrl && (
            <>
              <audio controls src={playbackUrl} className="w-full" playsInline>
                Your browser does not support audio playback.
              </audio>

              <div className="flex w-full flex-wrap gap-3">
                <Button variant="secondary" onClick={deleteRecording}>
                  Delete
                </Button>
                {onUseRecording && recording && (
                  <Button onClick={() => onUseRecording(recording)}>Use this recording</Button>
                )}
              </div>
            </>
          )}
        </div>

        {state === 'idle' && !error && (
          <p className="text-sm text-slate-500">
            Tap start and speak naturally. Your browser will ask for microphone permission.
          </p>
        )}
      </div>
    </Card>
  )
}
