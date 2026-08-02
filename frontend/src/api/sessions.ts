import axios from 'axios'
import { apiClient } from './client'
import type { SpeechSession, SpeechSessionSummary } from '../types/session'
import { filenameForBlob } from '../utils/audioMime'

export type UploadProgressHandler = (loaded: number, total?: number) => void

export async function createSession(
  blob: Blob,
  duration: number,
  onUploadProgress?: UploadProgressHandler,
): Promise<SpeechSession> {
  const formData = new FormData()
  formData.append('audio', blob, filenameForBlob(blob))
  formData.append('duration', String(duration))

  const { data } = await apiClient.post<SpeechSession>('/sessions', formData, {
    timeout: 300_000,
    onUploadProgress: (event) => {
      onUploadProgress?.(event.loaded, event.total)
    },
  })

  if (data.status === 'failed') {
    throw new Error(data.pipeline_error ?? 'Speech processing failed. Please try again.')
  }

  return data
}

export async function fetchSessions(): Promise<SpeechSessionSummary[]> {
  const { data } = await apiClient.get<SpeechSessionSummary[]>('/sessions')
  return data
}

export async function fetchSession(sessionId: string): Promise<SpeechSession> {
  const { data } = await apiClient.get<SpeechSession>(`/sessions/${sessionId}`)
  return data
}

export async function fetchSessionAudioUrl(sessionId: string): Promise<{ url: string }> {
  const { data } = await apiClient.get<{ url: string }>(`/sessions/${sessionId}/audio-url`)
  return data
}

export function getSessionErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return 'Session not found or you do not have access to it.'
    }
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item) {
            const field = Array.isArray(item.loc)
              ? item.loc.filter((part: string | number) => part !== 'body').join('.')
              : ''
            return field ? `${field}: ${item.msg}` : String(item.msg)
          }
          return String(item)
        })
        .join(', ')
    }
    if (error.message) return error.message
  }

  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
