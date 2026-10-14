import type { Request, Response } from 'express'
import { InvalidCredentialsError, login } from '../services/auth.service'

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
