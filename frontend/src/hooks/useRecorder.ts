import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupportedAudioMimeType } from '../utils/audioMime'

export type RecorderState = 'idle' | 'requesting_permission' | 'recording' | 'stopped'

export interface RecordingResult {
  blob: Blob
  duration: number
}

function permissionErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Microphone access was denied. Allow microphone permission in your browser settings, then try again.'
    }
    if (error.name === 'NotFoundError') {
      return 'No microphone was found. Connect a microphone and try again.'
    }
  }

  return error instanceof Error ? error.message : 'Could not access the microphone.'
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [recording, setRecording] = useState<RecordingResult | null>(null)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const durationRef = useRef(0)
  const mimeTypeRef = useRef('')
  const playbackUrlRef = useRef<string | null>(null)

  const stopTracks = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const revokePlaybackUrl = useCallback(() => {
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current)
      playbackUrlRef.current = null
    }
    setPlaybackUrl(null)
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setRecording(null)
    revokePlaybackUrl()
    chunksRef.current = []
    durationRef.current = 0
    setElapsedSeconds(0)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Your browser does not support audio recording.')
      return
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('MediaRecorder is not supported in this browser.')
      return
    }

    const mimeType = getSupportedAudioMimeType()
    mimeTypeRef.current = mimeType

    setState('requesting_permission')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        clearTimer()
        const blobType = mimeTypeRef.current || recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: blobType })
        const url = URL.createObjectURL(blob)
        playbackUrlRef.current = url
        setPlaybackUrl(url)
        setRecording({ blob, duration: durationRef.current })
        setState('stopped')
        stopTracks()
      }

      recorder.start(250)
      setState('recording')

      timerRef.current = window.setInterval(() => {
        durationRef.current += 1
        setElapsedSeconds(durationRef.current)
      }, 1000)
    } catch (err) {
      stopTracks()
      clearTimer()
      setError(permissionErrorMessage(err))
      setState('idle')
    }
  }, [clearTimer, revokePlaybackUrl, stopTracks])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const deleteRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    clearTimer()
    stopTracks()
    revokePlaybackUrl()
    chunksRef.current = []
    durationRef.current = 0
    setElapsedSeconds(0)
    setRecording(null)
    mediaRecorderRef.current = null
    setState('idle')
  }, [clearTimer, revokePlaybackUrl, stopTracks])

  useEffect(() => {
    return () => {
      clearTimer()
      stopTracks()
      if (playbackUrlRef.current) {
        URL.revokeObjectURL(playbackUrlRef.current)
      }
    }
  }, [clearTimer, stopTracks])

  return {
    state,
    error,
    elapsedSeconds,
    recording,
    playbackUrl,
    startRecording,
    stopRecording,
    deleteRecording,
  }
}
