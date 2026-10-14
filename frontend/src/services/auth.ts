import axios from 'axios'

export type RolUsuario = 'DOCENTE' | 'ALUMNO'

export interface AuthUser {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: RolUsuario
  legajo: number
}

export interface LoginResult {
  token: string
  usuario: AuthUser
}

export class AuthError extends Error {}

const TOKEN_KEY = 'aulaactiva_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
})

export async function login(usuario: string, contrasena: string): Promise<LoginResult> {
  try {
    const { data } = await api.post<LoginResult>('/auth/login', { usuario, contrasena })
    return data
  } catch (err) {
    if (axios.isAxiosError<{ message?: string }>(err) && err.response?.status === 401) {
      throw new AuthError(err.response.data?.message ?? 'Usuario o contraseña incorrectos')
    }
    throw err
  }
}

export function saveSession(token: string, recordarme: boolean) {
  const storage = recordarme ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export function getSession(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}
