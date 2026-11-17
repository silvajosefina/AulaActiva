
import axios from 'axios'
import { getSession } from './auth'

// Instancia de Axios para las consultas que requieren autenticación.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
})

// Antes de cada petición, incorporamos el token de la sesión actual.
api.interceptors.request.use((config) => {
  const token = getSession()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
