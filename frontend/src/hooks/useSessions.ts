import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSession,
  fetchSession,
  fetchSessions,
  type UploadProgressHandler,
} from '../api/sessions'
import { useAuth } from '../contexts/AuthContext'

interface CreateSessionInput {
  blob: Blob
  duration: number
  onUploadProgress?: UploadProgressHandler
}

export function useSessions() {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['sessions', session?.access_token],
    queryFn: fetchSessions,
    enabled: !!session?.access_token,
  })
}

export function useSession(sessionId: string | undefined) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['session', sessionId, session?.access_token],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!session?.access_token && !!sessionId,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ blob, duration, onUploadProgress }: CreateSessionInput) =>
      createSession(blob, duration, onUploadProgress),
    onSuccess: (createdSession) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.setQueryData(['session', createdSession.id], createdSession)
    },
  })
}
