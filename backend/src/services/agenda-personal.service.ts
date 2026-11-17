
import { prisma } from '../lib/prisma'

// Tipos de eventos permitidos en la agenda personal.
export const TIPOS_EVENTO_PERSONAL = [
  'Parcial',
  'Final',
  'Entrega de TP',
  'Reunión',
  'Recordatorio',
  'Otro',
] as const

export type TipoEventoPersonal =
  (typeof TIPOS_EVENTO_PERSONAL)[number]

// Datos que recibe el servicio desde el frontend.
export interface EventoPersonalInput {
  titulo: string
  tipo: TipoEventoPersonal
  fecha: string
  horaInicio?: string | null
  horaFin?: string | null
  idCurso?: number | null
  notas?: string | null
}

// Datos que devuelve el backend al frontend.
export interface EventoPersonalDTO {
  id: string
  titulo: string
  tipo: TipoEventoPersonal
  fecha: string
  horaInicio?: string
  horaFin?: string
  idCurso?: number
  notas?: string
}

// Errores específicos del servicio.
export class AlumnoNoEncontradoError extends Error {}
export class EventoPersonalNoEncontradoError extends Error {}
export class CursoNoInscriptoError extends Error {}
export class DatosEventoPersonalInvalidosError extends Error {}

// Busca el legajo correspondiente al usuario autenticado.
async function obtenerLegajoAlumno(
  idUsuario: number,
): Promise<number> {
  const alumno = await prisma.alumno.findUnique({
    where: { idUsuario },
    select: { legajoAlumno: true },
  })

  if (!alumno) {
    throw new AlumnoNoEncontradoError()
  }

  return alumno.legajoAlumno
}

// Comprueba que el contenido recibido sea un objeto.
function validarObjeto(datos: unknown): Record<string, unknown> {
  if (
    typeof datos !== 'object' ||
    datos === null ||
    Array.isArray(datos)
  ) {
    throw new DatosEventoPersonalInvalidosError(
      'Los datos del evento no son válidos',
    )
  }

  return datos as Record<string, unknown>
}

// Valida y normaliza un texto obligatorio.
function validarTitulo(valor: unknown): string {
  if (typeof valor !== 'string') {
    throw new DatosEventoPersonalInvalidosError(
      'El título es obligatorio',
    )
  }

  const titulo = valor.trim()

  if (!titulo || titulo.length > 120) {
    throw new DatosEventoPersonalInvalidosError(
      'El título debe tener entre 1 y 120 caracteres',
    )
  }

  return titulo
}

// Valida el tipo de evento.
function validarTipo(valor: unknown): TipoEventoPersonal {
  if (
    typeof valor !== 'string' ||
    !TIPOS_EVENTO_PERSONAL.includes(
      valor as TipoEventoPersonal,
    )
  ) {
    throw new DatosEventoPersonalInvalidosError(
      'El tipo de evento no es válido',
    )
  }

  return valor as TipoEventoPersonal
}

// Valida una fecha estricta en formato YYYY-MM-DD.
function validarFecha(valor: unknown): Date {
  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    throw new DatosEventoPersonalInvalidosError(
      'La fecha debe tener formato YYYY-MM-DD',
    )
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`)

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor
  ) {
    throw new DatosEventoPersonalInvalidosError(
      'La fecha ingresada no es válida',
    )
  }

  return fecha
}

// Valida una hora en formato HH:mm.
// Los valores vacíos se consideran horarios no informados.
function validarHora(
  valor: unknown,
  campo: string,
): string | null {
  if (valor === undefined || valor === null || valor === '') {
    return null
  }

  if (
    typeof valor !== 'string' ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(valor)
  ) {
    throw new DatosEventoPersonalInvalidosError(
      `El campo ${campo} debe tener formato HH:mm`,
    )
  }

  return valor
}

// Valida las notas opcionales.
function validarNotas(valor: unknown): string | null {
  if (valor === undefined || valor === null || valor === '') {
    return null
  }

  if (typeof valor !== 'string') {
    throw new DatosEventoPersonalInvalidosError(
      'Las notas deben ser un texto',
    )
  }

  const notas = valor.trim()

  if (notas.length > 2000) {
    throw new DatosEventoPersonalInvalidosError(
      'Las notas no pueden superar los 2000 caracteres',
    )
  }

  return notas || null
}

// Valida el curso opcional asociado al evento.
function validarIdCurso(valor: unknown): number | null {
  if (valor === undefined || valor === null) {
    return null
  }

  if (
    typeof valor !== 'number' ||
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw new DatosEventoPersonalInvalidosError(
      'El curso seleccionado no es válido',
    )
  }

  return valor
}

// Valida todos los datos antes de operar con Prisma.
function validarEvento(datos: unknown): EventoPersonalInput {
  const objeto = validarObjeto(datos)

  const titulo = validarTitulo(objeto.titulo)
  const tipo = validarTipo(objeto.tipo)
  const fecha = objeto.fecha as unknown

  const fechaValidada = validarFecha(fecha)

  const horaInicio = validarHora(
    objeto.horaInicio,
    'hora de inicio',
  )

  const horaFin = validarHora(
    objeto.horaFin,
    'hora de finalización',
  )

  if (
    horaInicio &&
    horaFin &&
    horaFin <= horaInicio
  ) {
    throw new DatosEventoPersonalInvalidosError(
      'La hora de finalización debe ser posterior a la de inicio',
    )
  }

  const idCurso = validarIdCurso(objeto.idCurso)
  const notas = validarNotas(objeto.notas)

  return {
    titulo,
    tipo,
    fecha: fechaValidada.toISOString().slice(0, 10),
    horaInicio,
    horaFin,
    idCurso,
    notas,
  }
}

// Comprueba que el curso pertenezca a las inscripciones del alumno.
async function validarCursoDelAlumno(
  idCurso: number | null,
  legajoAlumno: number,
): Promise<void> {
  if (idCurso === null) return

  const inscripcion = await prisma.cursoAlumno.findFirst({
    where: {
      idCurso,
      legajoAlumno,
    },
    select: {
      idCurso: true,
    },
  })

  if (!inscripcion) {
    throw new CursoNoInscriptoError(
      'El curso seleccionado no pertenece a tus inscripciones',
    )
  }
}

// Convierte el registro de Prisma al formato del frontend.
function convertirEventoDTO(evento: {
  idEvento: number
  titulo: string
  tipo: string
  fecha: Date
  horaInicio: string | null
  horaFin: string | null
  idCurso: number | null
  notas: string | null
}): EventoPersonalDTO {
  return {
    id: String(evento.idEvento),
    titulo: evento.titulo,
    tipo: validarTipo(evento.tipo),
    fecha: evento.fecha.toISOString().slice(0, 10),
    ...(evento.horaInicio
      ? { horaInicio: evento.horaInicio }
      : {}),
    ...(evento.horaFin
      ? { horaFin: evento.horaFin }
      : {}),
    ...(evento.idCurso !== null
      ? { idCurso: evento.idCurso }
      : {}),
    ...(evento.notas
      ? { notas: evento.notas }
      : {}),
  }
}

// Lista exclusivamente los eventos del alumno autenticado.
export async function listarEventosPersonales(
  idUsuario: number,
): Promise<EventoPersonalDTO[]> {
  const legajoAlumno = await obtenerLegajoAlumno(idUsuario)

  const eventos = await prisma.eventoPersonal.findMany({
    where: { legajoAlumno },
    orderBy: [
      { fecha: 'asc' },
      { horaInicio: 'asc' },
      { idEvento: 'asc' },
    ],
  })

  return eventos.map(convertirEventoDTO)
}

// Crea un nuevo evento personal.
export async function crearEventoPersonal(
  idUsuario: number,
  datos: unknown,
): Promise<EventoPersonalDTO> {
  const legajoAlumno = await obtenerLegajoAlumno(idUsuario)

  const evento = validarEvento(datos)

  await validarCursoDelAlumno(
    evento.idCurso ?? null,
    legajoAlumno,
  )

  const creado = await prisma.eventoPersonal.create({
    data: {
      titulo: evento.titulo,
      tipo: evento.tipo,
      fecha: new Date(`${evento.fecha}T00:00:00.000Z`),
      horaInicio: evento.horaInicio ?? null,
      horaFin: evento.horaFin ?? null,
      notas: evento.notas ?? null,
      legajoAlumno,
      idCurso: evento.idCurso ?? null,
    },
  })

  return convertirEventoDTO(creado)
}

// Actualiza exclusivamente un evento perteneciente al alumno.
export async function actualizarEventoPersonal(
  idUsuario: number,
  idEvento: number,
  datos: unknown,
): Promise<EventoPersonalDTO> {
  const legajoAlumno = await obtenerLegajoAlumno(idUsuario)

  if (!Number.isInteger(idEvento) || idEvento <= 0) {
    throw new DatosEventoPersonalInvalidosError(
      'El identificador del evento no es válido',
    )
  }

  const evento = validarEvento(datos)

  await validarCursoDelAlumno(
    evento.idCurso ?? null,
    legajoAlumno,
  )

  const resultado = await prisma.eventoPersonal.updateMany({
    where: {
      idEvento,
      legajoAlumno,
    },
    data: {
      titulo: evento.titulo,
      tipo: evento.tipo,
      fecha: new Date(`${evento.fecha}T00:00:00.000Z`),
      horaInicio: evento.horaInicio ?? null,
      horaFin: evento.horaFin ?? null,
      notas: evento.notas ?? null,
      idCurso: evento.idCurso ?? null,
    },
  })

  if (resultado.count === 0) {
    throw new EventoPersonalNoEncontradoError()
  }

  const actualizado = await prisma.eventoPersonal.findFirst({
    where: {
      idEvento,
      legajoAlumno,
    },
  })

  if (!actualizado) {
    throw new EventoPersonalNoEncontradoError()
  }

  return convertirEventoDTO(actualizado)
}

// Elimina exclusivamente un evento perteneciente al alumno.
export async function eliminarEventoPersonal(
  idUsuario: number,
  idEvento: number,
): Promise<void> {
  const legajoAlumno = await obtenerLegajoAlumno(idUsuario)

  if (!Number.isInteger(idEvento) || idEvento <= 0) {
    throw new DatosEventoPersonalInvalidosError(
      'El identificador del evento no es válido',
    )
  }

  const resultado = await prisma.eventoPersonal.deleteMany({
    where: {
      idEvento,
      legajoAlumno,
    },
  })

  if (resultado.count === 0) {
    throw new EventoPersonalNoEncontradoError()
  }
}
