
import type { Request, Response } from 'express'

import {
  AlumnoNoEncontradoError,
  listarAsistenciasDelAlumno,
  listarCursosDelAlumno,
  obtenerPerfilDelAlumno,
} from '../services/alumno.service'

import { cambiarContrasena, ContrasenaActualIncorrectaError } from '../services/auth.service'

import {
  AlumnoNoEncontradoError as AgendaAlumnoNoEncontradoError,
  EventoPersonalNoEncontradoError,
  CursoNoInscriptoError,
  DatosEventoPersonalInvalidosError,
  listarEventosPersonales,
  crearEventoPersonal,
  actualizarEventoPersonal,
  eliminarEventoPersonal,
} from '../services/agenda-personal.service'

// Centraliza el manejo de errores de los endpoints del alumno.
function responderError(res: Response, err: unknown) {
  // El usuario no tiene un perfil de alumno asociado.
  if (
    err instanceof AlumnoNoEncontradoError ||
    err instanceof AgendaAlumnoNoEncontradoError
  ) {
    res.status(404).json({
      message: 'No encontramos el perfil de alumno de este usuario',
    })
    return
  }

  // El evento solicitado no existe o no pertenece al alumno.
  if (err instanceof EventoPersonalNoEncontradoError) {
    res.status(404).json({
      message: 'No encontramos el evento personal solicitado',
    })
    return
  }

  // El curso seleccionado no pertenece a las inscripciones del alumno.
  if (err instanceof CursoNoInscriptoError) {
    res.status(400).json({
      message: err.message,
    })
    return
  }

  // Los datos enviados no cumplen las validaciones.
  if (err instanceof DatosEventoPersonalInvalidosError) {
    res.status(400).json({
      message: err.message,
    })
    return
  }

  console.error(err)
  res.status(500).json({
    message: 'Error interno del servidor',
  })
}

// Devuelve los cursos del alumno que inició sesión.
export async function cursosAlumnoController(
  req: Request,
  res: Response,
) {
  try {
    const cursos = await listarCursosDelAlumno(
      req.usuario!.idUsuario,
    )

    res.status(200).json({ cursos })
  } catch (err) {
    responderError(res, err)
  }
}

// Devuelve las asistencias del alumno que inició sesión.
export async function asistenciasAlumnoController(
  req: Request,
  res: Response,
) {
  try {
    const asistencias = await listarAsistenciasDelAlumno(
      req.usuario!.idUsuario,
    )

    res.status(200).json({ asistencias })
  } catch (err) {
    responderError(res, err)
  }
}

// Devuelve los eventos personales del alumno autenticado.
export async function listarEventosPersonalesController(
  req: Request,
  res: Response,
) {
  try {
    const eventos = await listarEventosPersonales(
      req.usuario!.idUsuario,
    )

    res.status(200).json({ eventos })
  } catch (err) {
    responderError(res, err)
  }
}

// Crea un evento en la agenda personal del alumno.
export async function crearEventoPersonalController(
  req: Request,
  res: Response,
) {
  try {
    const evento = await crearEventoPersonal(
      req.usuario!.idUsuario,
      req.body,
    )

    res.status(201).json({ evento })
  } catch (err) {
    responderError(res, err)
  }
}

// Actualiza un evento de la agenda personal del alumno.
export async function actualizarEventoPersonalController(
  req: Request,
  res: Response,
) {
  try {
    const idEvento = Number(req.params.idEvento)

    const evento = await actualizarEventoPersonal(
      req.usuario!.idUsuario,
      idEvento,
      req.body,
    )

    res.status(200).json({ evento })
  } catch (err) {
    responderError(res, err)
  }
}

// Elimina un evento de la agenda personal del alumno.
export async function eliminarEventoPersonalController(
  req: Request,
  res: Response,
) {
  try {
    const idEvento = Number(req.params.idEvento)

    await eliminarEventoPersonal(
      req.usuario!.idUsuario,
      idEvento,
    )

    res.status(204).send()
  } catch (err) {
    responderError(res, err)
  }
}

export async function perfilAlumnoController(req: Request, res: Response) {
  try {
    const perfil = await obtenerPerfilDelAlumno(req.usuario!.idUsuario)
    res.status(200).json(perfil)
  } catch (err) {
    responderError(res, err)
  }
}

export async function actualizarPasswordAlumnoController(req: Request, res: Response) {
  const { actual, nueva } = (req.body ?? {}) as { actual?: unknown; nueva?: unknown }

  if (typeof actual !== 'string' || typeof nueva !== 'string' || !actual || !nueva) {
    res.status(400).json({ message: 'La contraseña actual y la nueva son obligatorias' })
    return
  }
  if (nueva.length < 6) {
    res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' })
    return
  }
  if (nueva === actual) {
    res.status(400).json({ message: 'La nueva contraseña tiene que ser distinta de la actual' })
    return
  }

  try {
    await cambiarContrasena(req.usuario!.idUsuario, actual, nueva)
    res.status(200).json({ message: 'Contraseña actualizada con éxito' })
  } catch (err) {
    if (err instanceof ContrasenaActualIncorrectaError) {
      res.status(400).json({ message: 'La contraseña actual es incorrecta' })
      return
    }
    responderError(res, err)
  }
}
