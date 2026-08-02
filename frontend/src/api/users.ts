import { apiClient } from './client'
import type { User } from '../types/user'

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me')
  return data
}
