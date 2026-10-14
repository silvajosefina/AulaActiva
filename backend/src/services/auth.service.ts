import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'

export class InvalidCredentialsError extends Error {}

interface AuthUserDTO {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: 'DOCENTE' | 'ALUMNO'
  legajo: number
}

interface LoginResult {
  token: string
  usuario: AuthUserDTO
}

export async function login(usuario: string, contrasena: string): Promise<LoginResult> {
  const usuarioDb = await prisma.usuario.findUnique({
    where: { usuario },
    include: { docente: true, alumno: true },
  })

  if (!usuarioDb || usuarioDb.contrasena !== contrasena) {
    throw new InvalidCredentialsError()
  }

  const legajo = usuarioDb.docente?.legajoDocente ?? usuarioDb.alumno?.legajoAlumno
  if (legajo === undefined) {
    throw new Error(`El usuario ${usuario} no tiene un perfil de Docente ni de Alumno asociado`)
  }

  const token = jwt.sign({ sub: usuarioDb.idUsuario, rol: usuarioDb.rol }, env.jwtSecret, {
    expiresIn: '7d',
  })

  return {
    token,
    usuario: {
      id: usuarioDb.idUsuario,
      nombre: usuarioDb.nombre,
      apellido: usuarioDb.apellido,
      email: usuarioDb.email,
      rol: usuarioDb.rol,
      legajo,
    },
  }
}
