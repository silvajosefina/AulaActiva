import type { Request, Response } from 'express'
import {
  DocenteNoEncontradoError,
  listarCursosDelDocente,
  listarMateriasDelDocente,
  obtenerInicioDelDocente,
  obtenerPerfilDelDocente,
  actualizarPasswordDocente,
  listarAlumnosDelDocente,
} from '../services/docente.service'

function responderError(res: Response, err: unknown) {
  if (err instanceof DocenteNoEncontradoError) {
    res.status(404).json({ message: 'No encontramos el perfil de docente de este usuario' })
    return
  }
  console.error(err)
  res.status(500).json({ message: 'Error interno del servidor' })
}

export async function inicioController(req: Request, res: Response) {
  try {
    const inicio = await obtenerInicioDelDocente(req.usuario!.idUsuario)
    res.status(200).json(inicio)
  } catch (err) {
    responderError(res, err)
  }
}

export async function cursosController(req: Request, res: Response) {
  try {
    const cursos = await listarCursosDelDocente(req.usuario!.idUsuario)
    res.status(200).json({ cursos })
  } catch (err) {
    responderError(res, err)
  }
}

export async function materiasController(req: Request, res: Response) {
  try {
    const materias = await listarMateriasDelDocente(req.usuario!.idUsuario)
    res.status(200).json({ materias })
  } catch (err) {
    responderError(res, err)
  }
}

export async function perfilController(req: Request, res: Response) {
  try {
    const perfil = await obtenerPerfilDelDocente(req.usuario!.idUsuario)
    res.status(200).json(perfil)
  } catch (err) {
    responderError(res, err)
  }
}

export async function actualizarPasswordController(req: Request, res: Response) {
  try {
    const { actual, nueva } = req.body

    if (!actual || !nueva) {
      return res.status(400).json({ message: 'La contraseña actual y la nueva son obligatorias' })
    }

    await actualizarPasswordDocente(req.usuario!.idUsuario, actual, nueva)
    res.status(200).json({ message: 'Contraseña actualizada con éxito' })
  } catch (err: any) {
    if (err.message === 'La contraseña actual es incorrecta') {
      return res.status(400).json({ message: err.message })
    }
    responderError(res, err)
  }
}

export async function alumnosController(req: Request, res: Response) {
  try {
    const alumnos = await listarAlumnosDelDocente(req.usuario!.idUsuario)
    res.status(200).json({ alumnos })
  } catch (err) {
    responderError(res, err)
  }
}