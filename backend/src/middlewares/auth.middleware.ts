import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { tienePerfilDeRol } from '../services/auth.service'

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

const SESION_INVALIDA = 'La sesión expiró o no es válida. Volvé a iniciar sesión'

function leerIdUsuario(token: string): number | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (typeof payload === 'string') return null
    const idUsuario = Number(payload.sub)
    return Number.isInteger(idUsuario) ? idUsuario : null
  } catch {
    return null
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')

  if (tipo !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Tenés que iniciar sesión' })
    return
  }

  const idUsuario = leerIdUsuario(token)
  if (idUsuario === null) {
    res.status(401).json({ message: SESION_INVALIDA })
    return
  }

  try {
    const usuarioDb = await prisma.usuario.findUnique({
      where: { idUsuario },
      select: { rol: true, docente: { select: { legajoDocente: true } }, alumno: { select: { legajoAlumno: true } } },
    })

    if (!usuarioDb || !tienePerfilDeRol(usuarioDb, usuarioDb.rol)) {
      res.status(401).json({ message: SESION_INVALIDA })
      return
    }

    req.usuario = { idUsuario, rol: usuarioDb.rol }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error interno del servidor' })
    return
  }

  next()
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
