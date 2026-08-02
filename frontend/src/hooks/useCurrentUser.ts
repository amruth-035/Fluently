import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from '../api/users'
import { useAuth } from '../contexts/AuthContext'

export function useCurrentUser() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: !!user,
  })
}
