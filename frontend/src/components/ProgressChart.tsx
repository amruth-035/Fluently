import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from './ui/Card'
import type { FluencyTrendPoint } from '../types/dashboard'

interface ProgressChartProps {
  data: FluencyTrendPoint[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (!data.length) {
    return (
      <Card title="Fluency trend">
        <p className="text-sm text-slate-500">
          Complete a recording to see your fluency trend over time.
        </p>
      </Card>
    )
  }

  const chartData = data.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }))

  return (
    <Card title="Fluency trend">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              formatter={(value) => [Math.round(Number(value ?? 0)), 'Fluency']}
              labelFormatter={(label) => String(label)}
            />
            <Line
              type="monotone"
              dataKey="fluency_score"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: '#4f46e5', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
