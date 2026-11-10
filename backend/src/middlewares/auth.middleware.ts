import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export type Rol = 'DOCENTE' | 'ALUMNO'

export interface UsuarioAutenticado {
  idUsuario: number
  rol: Rol
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')

  if (tipo !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Tenés que iniciar sesión' })
    return
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (typeof payload === 'string') throw new Error('Token inválido')

    const idUsuario = Number(payload.sub)
    const rol = payload.rol

    if (!Number.isInteger(idUsuario) || (rol !== 'DOCENTE' && rol !== 'ALUMNO')) {
      throw new Error('Token inválido')
    }

    req.usuario = { idUsuario, rol }
    next()
  } catch {
    res.status(401).json({ message: 'La sesión expiró o no es válida. Volvé a iniciar sesión' })
  }
}

export function requireRol(rol: Rol) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.usuario?.rol !== rol) {
      res.status(403).json({ message: 'No tenés permiso para acceder a esta sección' })
      return
    }
    next()
  }
}
