import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  console.warn('VITE_API_URL is not set — API calls will fail.')
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})
