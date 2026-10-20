import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession, getSessionUser, type RolUsuario } from '../services/auth'
import { ROUTES } from '../constants/routes'

interface ProtectedRouteProps {
  rolRequerido?: RolUsuario
  children: ReactNode
}

function ProtectedRoute({ rolRequerido, children }: ProtectedRouteProps) {
  const token = getSession()
  const usuario = getSessionUser()

  if (!token || !usuario) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
