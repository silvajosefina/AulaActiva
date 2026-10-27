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

export interface RegisterData {
  nombre: string
  apellido: string
  email: string
  usuario: string
  contrasena: string
  rol: RolUsuario
}

export class AuthError extends Error {}

const TOKEN_KEY = 'aulaactiva_token'
const USER_KEY = 'aulaactiva_user'

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

export async function register(datos: RegisterData): Promise<AuthUser> {
  try {
    const { data } = await api.post<{ usuario: AuthUser }>('/auth/register', datos)
    return data.usuario
  } catch (err) {
    if (axios.isAxiosError<{ message?: string }>(err)) {
      const status = err.response?.status
      if (status === 400 || status === 409) {
        throw new AuthError(err.response?.data?.message ?? 'No pudimos crear la cuenta')
      }
    }
    throw err
  }
}

export function saveSession(token: string, usuario: AuthUser, recordarme: boolean) {
  const storage = recordarme ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(usuario))
}

export function getSession(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function getSessionUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
