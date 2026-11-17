import type { Request, Response } from 'express'
import {
  DuplicateUserError,
  InvalidCredentialsError,
  login,
  register,
  restablecerContrasena,
  RolIncorrectoError,
  solicitarRecuperacion,
  TokenRecuperacionInvalidoError,
} from '../services/auth.service'
import { MailNoConfiguradoError } from '../services/mail.service'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function loginController(req: Request, res: Response) {
  const { usuario, contrasena, rol } = (req.body ?? {}) as { usuario?: unknown; contrasena?: unknown; rol?: unknown }

  if (typeof usuario !== 'string' || typeof contrasena !== 'string' || !usuario || !contrasena) {
    res.status(400).json({ message: 'Usuario y contraseña son requeridos' })
    return
  }
  if (rol !== 'DOCENTE' && rol !== 'ALUMNO') {
    res.status(400).json({ message: 'Elegí si ingresás como Docente o Alumno' })
    return
  }

  try {
    const resultado = await login(usuario, contrasena, rol)
    res.status(200).json(resultado)
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
      return
    }
    if (err instanceof RolIncorrectoError) {
      res.status(403).json({ message: err.message })
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

export async function recuperarContrasenaController(req: Request, res: Response) {
  const { email } = (req.body ?? {}) as { email?: unknown }
  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (!EMAIL_REGEX.test(emailNormalizado)) {
    res.status(400).json({ message: 'Ingresá un email válido' })
    return
  }

  try {
    await solicitarRecuperacion(emailNormalizado)
    res.status(200).json({
      message: 'Si el email está registrado, te enviamos un link para restablecer la contraseña',
    })
  } catch (err) {
    if (err instanceof MailNoConfiguradoError) {
      res.status(503).json({ message: 'El envío de mails no está disponible en este momento' })
      return
    }
    console.error(err)
    res.status(500).json({ message: 'No pudimos enviar el mail. Intentá de nuevo más tarde' })
  }
}

export async function restablecerContrasenaController(req: Request, res: Response) {
  const { token, nueva } = (req.body ?? {}) as { token?: unknown; nueva?: unknown }

  if (typeof token !== 'string' || !token) {
    res.status(400).json({ message: 'El link de recuperación no es válido' })
    return
  }
  if (typeof nueva !== 'string' || nueva.length < 6) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
    return
  }

  try {
    await restablecerContrasena(token, nueva)
    res.status(200).json({ message: 'Tu contraseña se actualizó correctamente' })
  } catch (err) {
    if (err instanceof TokenRecuperacionInvalidoError) {
      res.status(400).json({ message: 'El link venció o ya fue usado. Pedí uno nuevo' })
      return
    }
    console.error(err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
