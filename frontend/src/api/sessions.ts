import { apiClient } from './client'
import { getApiErrorMessage } from './errors'
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

export async function reprocessSession(sessionId: string): Promise<SpeechSession> {
  const { data } = await apiClient.post<SpeechSession>(`/sessions/${sessionId}/reprocess`)
  return data
}

export { getApiErrorMessage as getSessionErrorMessage }
