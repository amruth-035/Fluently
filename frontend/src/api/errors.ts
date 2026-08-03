import axios from 'axios'

interface ApiErrorBody {
  detail?: string
  code?: string
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Network error. Check your connection and try again.'
    }

    if (error.response.status === 401) {
      return 'Your session expired. Please log in again.'
    }

    if (error.response.status === 404) {
      return 'Session not found or you do not have access to it.'
    }

    const data = error.response.data as ApiErrorBody | string | undefined

    if (typeof data === 'string') {
      return data
    }

    if (data?.detail) {
      return data.detail
    }

    if (Array.isArray(data)) {
      return data
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

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export function getApiErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null
  const data = error.response?.data as ApiErrorBody | undefined
  return data?.code ?? null
}
