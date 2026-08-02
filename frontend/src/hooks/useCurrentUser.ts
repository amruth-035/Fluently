import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from '../api/users'
import { useAuth } from '../contexts/AuthContext'

export function useCurrentUser() {
  const { session } = useAuth()
  const accessToken = session?.access_token

  return useQuery({
    queryKey: ['currentUser', accessToken],
    queryFn: () => fetchCurrentUser(accessToken!),
    enabled: !!accessToken,
  })
}
