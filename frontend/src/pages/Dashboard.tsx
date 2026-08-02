import axios from 'axios'
import { Card } from '../components/ui/Card'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Spinner } from '../components/ui/Spinner'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useHealthCheck } from '../hooks/useHealthCheck'

export function Dashboard() {
  const { data: health, isLoading: healthLoading, isError: healthError, error: healthErr } = useHealthCheck()
  const { data: profile, isLoading: profileLoading, isError: profileError, error: profileErr } = useCurrentUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">Welcome to Fluently.</p>
      </div>

      <Card title="Your Account">
        {profileLoading && (
          <div className="flex items-center gap-3 text-slate-600">
            <Spinner size="sm" />
            <span>Loading profile…</span>
          </div>
        )}

        {profileError && (
          <ErrorMessage
            message={
              axios.isAxiosError(profileErr) && profileErr.response?.data?.detail
                ? `${profileErr.response.status}: ${profileErr.response.data.detail}`
                : profileErr instanceof Error
                  ? profileErr.message
                  : 'Could not load your profile from the backend.'
            }
          />
        )}

        {profile && (
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-slate-700">Email:</dt>
              <dd className="text-slate-600">{profile.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-700">User ID:</dt>
              <dd className="font-mono text-slate-600">{profile.id}</dd>
            </div>
          </dl>
        )}
      </Card>

      <Card title="Backend Status">
        {healthLoading && (
          <div className="flex items-center gap-3 text-slate-600">
            <Spinner size="sm" />
            <span>Checking connection…</span>
          </div>
        )}

        {healthError && (
          <ErrorMessage
            message={
              healthErr instanceof Error
                ? healthErr.message
                : 'Could not reach the backend. Is it running on port 8000?'
            }
          />
        )}

        {health && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
            <span className="text-slate-700">
              Connected — backend returned{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">{health.status}</code>
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}
