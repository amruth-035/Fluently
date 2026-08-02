import { apiClient } from './client'
import { supabase } from './supabase'

export function setupApiInterceptors() {
  apiClient.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}
