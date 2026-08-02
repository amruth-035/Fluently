import { apiClient } from './client'
import { supabase } from './supabase'

export function setupApiInterceptors() {
  apiClient.interceptors.request.use(async (config) => {
    const { data: sessionData } = await supabase.auth.getSession()
    let token = sessionData.session?.access_token

    // Refresh if the access token is close to expiring or missing
    if (!token) {
      const { data: refreshed } = await supabase.auth.refreshSession()
      token = refreshed.session?.access_token
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}
