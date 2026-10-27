import type { Request, Response } from 'express'
import { DuplicateUserError, InvalidCredentialsError, login, register } from '../services/auth.service'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function loginController(req: Request, res: Response) {
  const { usuario, contrasena } = req.body as { usuario?: string; contrasena?: string }

  if (!usuario || !contrasena) {
    res.status(400).json({ message: 'Usuario y contraseña son requeridos' })
    return
  }

  try {
    const resultado = await login(usuario, contrasena)
    res.status(200).json(resultado)
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
      return
    }
    console.error(err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export async function registerController(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, unknown>
  const texto = (campo: string) => {
    const valor = body[campo]
    return typeof valor === 'string' ? valor.trim() : ''
  }

  const nombre = texto('nombre')
  const apellido = texto('apellido')
  const email = texto('email').toLowerCase()
  const usuario = texto('usuario')
  const contrasena = typeof body.contrasena === 'string' ? body.contrasena : ''
  const rol = body.rol === 'DOCENTE' || body.rol === 'ALUMNO' ? body.rol : null

  if (!nombre || !apellido || !email || !usuario || !contrasena) {
    res.status(400).json({ message: 'Completá todos los campos' })
    return
  }
  if (!rol) {
    res.status(400).json({ message: 'El rol tiene que ser Docente o Alumno' })
    return
  }
  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ message: 'El email no es válido' })
    return
  }
  if (/\s/.test(usuario)) {
    res.status(400).json({ message: 'El nombre de usuario no puede tener espacios' })
    return
  }
  if (contrasena.length < 6) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
    return
  }

  try {
    const creado = await register({ nombre, apellido, email, usuario, contrasena, rol })
    res.status(201).json({ usuario: creado })
  } catch (err) {
    if (err instanceof DuplicateUserError) {
      res.status(409).json({ message: err.message })
      return
    }
    console.error(err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
