import { Card } from './ui/Card'
import type { AnalysisResult } from '../types/session'

interface AnalysisCardProps {
  analysis: AnalysisResult
}

function renderListItem(item: unknown): string {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>
    if (typeof record.text === 'string') {
      return record.note ? `${record.text} — ${record.note}` : record.text
    }
    if (typeof record.word === 'string') {
      const count = record.count
      return typeof count === 'number' ? `${record.word} (${count}×)` : record.word
    }
  }
  return JSON.stringify(item)
}

function BulletList({ items, emptyLabel }: { items: unknown[]; emptyLabel: string }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
      {items.map((item, index) => (
        <li key={index}>{renderListItem(item)}</li>
      ))}
    </ul>
  )
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <Card title="Analysis">
      <dl className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-indigo-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            Fluency score
          </dt>
          <dd className="mt-1 text-2xl font-bold text-indigo-900">
            {Math.round(analysis.fluency_score)}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Speaking rate
          </dt>
          <dd className="mt-1 text-2xl font-bold text-slate-900">
            {Math.round(analysis.speaking_rate)}
            <span className="ml-1 text-sm font-normal text-slate-500">wpm</span>
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Long pauses
          </dt>
          <dd className="mt-1 text-2xl font-bold text-slate-900">{analysis.pause_count}</dd>
        </div>
      </dl>

      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Repetitions</h3>
          <BulletList items={analysis.repetitions} emptyLabel="No repetitions detected." />
        </section>
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Filler words</h3>
          <BulletList items={analysis.filler_words} emptyLabel="No filler words detected." />
        </section>
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Strengths</h3>
          <BulletList items={analysis.strengths} emptyLabel="No strengths noted." />
        </section>
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Recommendations</h3>
          <BulletList items={analysis.recommendations} emptyLabel="No recommendations yet." />
        </section>
      </div>
    </Card>
  )
}
