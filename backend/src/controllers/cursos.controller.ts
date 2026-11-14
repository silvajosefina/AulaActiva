import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const ESTADOS_VALIDOS = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADA', 'SUSPENDIDA'] as const

type EstadoAsistencia = (typeof ESTADOS_VALIDOS)[number]

interface RegistroAsistencia {
  legajoAlumno: number
  estado: EstadoAsistencia
}

class ErrorDePedido extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function leerIdCurso(req: Request): number {
  const idCurso = Number(req.params.id)
  if (!Number.isInteger(idCurso) || idCurso <= 0) {
    throw new ErrorDePedido(400, 'El curso no es válido')
  }
  return idCurso
}

function leerFecha(valor: unknown): Date {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErrorDePedido(400, 'La fecha tiene que tener el formato AAAA-MM-DD')
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`)
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw new ErrorDePedido(400, 'La fecha no es válida')
  }
  return fecha
}

function leerRegistros(valor: unknown): RegistroAsistencia[] {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new ErrorDePedido(400, 'Tenés que enviar al menos un registro de asistencia')
  }

  const registros = valor.map((item: unknown) => {
    const registro = (item ?? {}) as { legajoAlumno?: unknown; estado?: unknown }
    const legajoAlumno = Number(registro.legajoAlumno)

    if (!Number.isInteger(legajoAlumno) || legajoAlumno <= 0) {
      throw new ErrorDePedido(400, 'Hay un registro con un legajo inválido')
    }
    if (!ESTADOS_VALIDOS.includes(registro.estado as EstadoAsistencia)) {
      throw new ErrorDePedido(400, `Estado de asistencia inválido: ${String(registro.estado)}`)
    }

    return { legajoAlumno, estado: registro.estado as EstadoAsistencia }
  })

  if (new Set(registros.map((r) => r.legajoAlumno)).size !== registros.length) {
    throw new ErrorDePedido(400, 'Hay legajos repetidos en los registros')
  }

  return registros
}

async function verificarCursoDelDocente(req: Request, idCurso: number) {
  const docente = await prisma.docente.findUnique({
    where: { idUsuario: req.usuario!.idUsuario },
    select: { legajoDocente: true },
  })

  const asignado = docente
    ? await prisma.cursoDocente.findUnique({
        where: { idCurso_legajoDocente: { idCurso, legajoDocente: docente.legajoDocente } },
        select: { idCursoDocente: true },
      })
    : null

  if (!asignado) {
    throw new ErrorDePedido(403, 'No tenés asignado este curso')
  }
}

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorDePedido) {
    res.status(error.status).json({ message: error.message })
    return
  }
  console.error(error)
  res.status(500).json({ message: 'Error interno del servidor' })
}

export async function obtenerAlumnosPorCurso(req: Request, res: Response) {
  try {
    const idCurso = leerIdCurso(req)
    await verificarCursoDelDocente(req, idCurso)

    const inscripciones = await prisma.cursoAlumno.findMany({
      where: { idCurso },
      include: { alumno: { include: { usuario: true } } },
      orderBy: [{ alumno: { usuario: { apellido: 'asc' } } }, { alumno: { usuario: { nombre: 'asc' } } }],
    })

    const alumnos = inscripciones.map((inscripcion) => ({
      legajoAlumno: inscripcion.alumno.legajoAlumno,
      idCursoAlumno: inscripcion.idCursoAlumno,
      nombre: inscripcion.alumno.usuario.nombre,
      apellido: inscripcion.alumno.usuario.apellido,
      email: inscripcion.alumno.usuario.email,
    }))

    res.status(200).json({ alumnos })
  } catch (error) {
    responderError(res, error)
  }
}

export async function obtenerAsistenciasPorFecha(req: Request, res: Response) {
  try {
    const idCurso = leerIdCurso(req)
    const fecha = leerFecha(req.query.fecha)
    await verificarCursoDelDocente(req, idCurso)

    const asistencias = await prisma.asistencia.findMany({
      where: { idCurso, fecha },
      include: { cursoAlumno: { select: { legajoAlumno: true } } },
    })

    res.status(200).json({
      fecha: req.query.fecha,
      asistencias: asistencias.map((asistencia) => ({
        legajoAlumno: asistencia.cursoAlumno.legajoAlumno,
        idCursoAlumno: asistencia.idCursoAlumno,
        estado: asistencia.estado,
      })),
    })
  } catch (error) {
    responderError(res, error)
  }
}

export async function guardarAsistencia(req: Request, res: Response) {
  try {
    const idCurso = leerIdCurso(req)
    const body = (req.body ?? {}) as { fecha?: unknown; registros?: unknown }
    const fecha = leerFecha(body.fecha)
    const registros = leerRegistros(body.registros)
    await verificarCursoDelDocente(req, idCurso)

    const legajos = registros.map((r) => r.legajoAlumno)
    const inscripciones = await prisma.cursoAlumno.findMany({
      where: { idCurso, legajoAlumno: { in: legajos } },
      select: { idCursoAlumno: true, legajoAlumno: true },
    })

    const idCursoAlumnoPorLegajo = new Map(inscripciones.map((i) => [i.legajoAlumno, i.idCursoAlumno]))
    const legajosAjenos = legajos.filter((legajo) => !idCursoAlumnoPorLegajo.has(legajo))
    if (legajosAjenos.length > 0) {
      throw new ErrorDePedido(400, `Estos legajos no pertenecen al curso: ${legajosAjenos.join(', ')}`)
    }

    const existentes = await prisma.asistencia.findMany({
      where: { idCurso, fecha, idCursoAlumno: { in: [...idCursoAlumnoPorLegajo.values()] } },
      select: { idCursoAlumno: true },
    })
    const yaCargados = new Set(existentes.map((a) => a.idCursoAlumno))

    const actualizarPorEstado = new Map<EstadoAsistencia, number[]>()
    const nuevos: { idCurso: number; idCursoAlumno: number; fecha: Date; estado: EstadoAsistencia }[] = []

    for (const registro of registros) {
      const idCursoAlumno = idCursoAlumnoPorLegajo.get(registro.legajoAlumno)!
      if (yaCargados.has(idCursoAlumno)) {
        actualizarPorEstado.set(registro.estado, [...(actualizarPorEstado.get(registro.estado) ?? []), idCursoAlumno])
      } else {
        nuevos.push({ idCurso, idCursoAlumno, fecha, estado: registro.estado })
      }
    }

    await prisma.$transaction([
      ...[...actualizarPorEstado.entries()].map(([estado, ids]) =>
        prisma.asistencia.updateMany({
          where: { idCurso, fecha, idCursoAlumno: { in: ids } },
          data: { estado },
        }),
      ),
      prisma.asistencia.createMany({ data: nuevos }),
    ])

    res.status(200).json({ message: 'Asistencia guardada correctamente', guardados: registros.length })
  } catch (error) {
    responderError(res, error)
  }
}