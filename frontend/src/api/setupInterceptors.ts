import axios from 'axios'
import { apiClient } from './client'
import { supabase } from './supabase'

let handlingUnauthorized = false

export function setupApiInterceptors() {
  apiClient.interceptors.request.use(async (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    const { data: sessionData } = await supabase.auth.getSession()
    let token = sessionData.session?.access_token

    if (!token) {
      const { data: refreshed } = await supabase.auth.refreshSession()
      token = refreshed.session?.access_token
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        !handlingUnauthorized
      ) {
        handlingUnauthorized = true
        try {
          await supabase.auth.signOut()
        } finally {
          const isLoginPage = window.location.pathname.startsWith('/login')
          if (!isLoginPage) {
            window.location.assign('/login?expired=1')
          }
          handlingUnauthorized = false
        }
      }

      return Promise.reject(error)
    },
  )
}
