const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
]

/** Pick the first MIME type this browser can record with (Safari often needs audio/mp4). */
export function getSupportedAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    return ''
  }

  for (const mimeType of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }

  return ''
}

const MIME_TO_EXTENSION: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/webm;codecs=opus': '.webm',
  'audio/mp4': '.m4a',
  'audio/ogg': '.ogg',
  'audio/ogg;codecs=opus': '.ogg',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
}

export function filenameForBlob(blob: Blob): string {
  const extension = MIME_TO_EXTENSION[blob.type] ?? '.webm'
  return `recording${extension}`
}
