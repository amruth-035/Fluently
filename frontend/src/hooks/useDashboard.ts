import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '../api/dashboard'
import { useAuth } from '../contexts/AuthContext'

export function useDashboard() {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['dashboard', session?.access_token],
    queryFn: fetchDashboard,
    enabled: !!session?.access_token,
  })
}
