import { useState } from 'react'
import { AudioRecorder, type RecordingPayload } from '../components/AudioRecorder'
import { Card } from '../components/ui/Card'
import { formatDuration } from '../utils/formatDuration'

export function Record() {
  const [acceptedRecording, setAcceptedRecording] = useState<RecordingPayload | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record</h1>
        <p className="mt-1 text-slate-600">
          Practice speaking in your browser. Uploading comes in the next phase.
        </p>
      </div>

      <AudioRecorder onUseRecording={setAcceptedRecording} />

      {acceptedRecording && (
        <Card title="Recording ready">
          <p className="text-sm text-slate-600">
            Duration: {formatDuration(acceptedRecording.duration)} · Size:{' '}
            {(acceptedRecording.blob.size / 1024).toFixed(1)} KB · Type:{' '}
            {acceptedRecording.blob.type || 'unknown'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            This preview confirms the parent received your recording. Upload will be wired up in
            Phase 4.
          </p>
        </Card>
      )}
    </div>
  )
}
