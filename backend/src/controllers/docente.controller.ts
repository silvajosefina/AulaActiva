import type { Request, Response } from 'express'
import {
  DocenteNoEncontradoError,
  listarCursosDelDocente,
  listarMateriasDelDocente,
} from '../services/docente.service'

function responderError(res: Response, err: unknown) {
  if (err instanceof DocenteNoEncontradoError) {
    res.status(404).json({ message: 'No encontramos el perfil de docente de este usuario' })
    return
  }
  console.error(err)
  res.status(500).json({ message: 'Error interno del servidor' })
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
