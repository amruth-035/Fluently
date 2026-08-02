import { Card } from './ui/Card'

interface TranscriptCardProps {
  transcript: string | null
}

export function TranscriptCard({ transcript }: TranscriptCardProps) {
  return (
    <Card title="Transcript">
      {transcript ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{transcript}</p>
      ) : (
        <p className="text-sm text-slate-500">No transcript available for this session.</p>
      )}
    </Card>
  )
}
