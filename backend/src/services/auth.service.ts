import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'

export class InvalidCredentialsError extends Error {}
export class DuplicateUserError extends Error {}

type Rol = 'DOCENTE' | 'ALUMNO'

interface AuthUserDTO {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
  legajo: number
}

interface LoginResult {
  token: string
  usuario: AuthUserDTO
}

export interface RegisterInput {
  nombre: string
  apellido: string
  email: string
  usuario: string
  contrasena: string
  rol: Rol
}

type UsuarioConPerfil = Prisma.UsuarioGetPayload<{ include: { docente: true; alumno: true } }>

function toDTO(usuarioDb: UsuarioConPerfil): AuthUserDTO {
  const legajo = usuarioDb.docente?.legajoDocente ?? usuarioDb.alumno?.legajoAlumno
  if (legajo === undefined) {
    throw new Error(`El usuario ${usuarioDb.usuario} no tiene un perfil de Docente ni de Alumno asociado`)
  }

  return {
    id: usuarioDb.idUsuario,
    nombre: usuarioDb.nombre,
    apellido: usuarioDb.apellido,
    email: usuarioDb.email,
    rol: usuarioDb.rol,
    legajo,
  }
}

export async function login(usuario: string, contrasena: string): Promise<LoginResult> {
  const usuarioDb = await prisma.usuario.findUnique({
    where: { usuario },
    include: { docente: true, alumno: true },
  })

  if (!usuarioDb || usuarioDb.contrasena !== contrasena) {
    throw new InvalidCredentialsError()
  }

  const token = jwt.sign({ sub: usuarioDb.idUsuario, rol: usuarioDb.rol }, env.jwtSecret, {
    expiresIn: '7d',
  })

  return { token, usuario: toDTO(usuarioDb) }
}

export async function register(datos: RegisterInput): Promise<AuthUserDTO> {
  const existente = await prisma.usuario.findFirst({
    where: { OR: [{ usuario: datos.usuario }, { email: datos.email }] },
    select: { usuario: true },
  })

  if (existente) {
    throw new DuplicateUserError(
      existente.usuario === datos.usuario
        ? 'Ese nombre de usuario ya está en uso'
        : 'Ese email ya está registrado',
    )
  }

  try {
    const creado = await prisma.usuario.create({
      data: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        usuario: datos.usuario,
        contrasena: datos.contrasena,
        rol: datos.rol,
        ...(datos.rol === 'DOCENTE' ? { docente: { create: {} } } : { alumno: { create: {} } }),
      },
      include: { docente: true, alumno: true },
    })

    return toDTO(creado)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new DuplicateUserError('El usuario o el email ya están registrados')
    }
    throw err
  }
}
