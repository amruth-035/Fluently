import { apiClient } from './client'
import type { User } from '../types/user'

export async function fetchCurrentUser(accessToken: string): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return data
}
