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
