import { Card } from './ui/Card'
import type { PracticeLesson } from '../types/session'

interface LessonCardProps {
  lesson: PracticeLesson
}

function ExerciseList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      <ul className="list-inside list-decimal space-y-1 text-sm text-slate-700">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function LessonCard({ lesson }: LessonCardProps) {
  const content = lesson.generated_lesson

  return (
    <Card title="Practice lesson">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
          {content.difficulty}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {content.estimated_time}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-800">{content.objective}</p>

      <div className="mt-5 space-y-5">
        <ExerciseList title="Word drills" items={content.exercises.word_drills} />
        <ExerciseList title="Phrase drills" items={content.exercises.phrase_drills} />
        <ExerciseList title="Sentence drills" items={content.exercises.sentence_drills} />

        {content.exercises.paragraph && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Paragraph practice</h3>
            <p className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {content.exercises.paragraph}
            </p>
          </section>
        )}

        {content.coaching_tips.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Coaching tips</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
              {content.coaching_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Card>
  )
}
