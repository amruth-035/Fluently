import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  createSession,
  fetchSession,
  fetchSessionAudioUrl,
  fetchSessions,
  reprocessSession,
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
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useSessionAudioUrl(sessionId: string | undefined, enabled: boolean) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['sessionAudioUrl', sessionId, session?.access_token],
    queryFn: () => fetchSessionAudioUrl(sessionId!),
    enabled: !!session?.access_token && !!sessionId && enabled,
    staleTime: 30 * 60 * 1000,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ blob, duration, onUploadProgress }: CreateSessionInput) =>
      createSession(blob, duration, onUploadProgress),
    onSuccess: (createdSession) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.setQueryData(['session', createdSession.id], createdSession)
    },
  })
}

export function useReprocessSession(sessionId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => reprocessSession(sessionId!),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['session', updatedSession.id], updatedSession)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
