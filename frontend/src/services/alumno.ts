
import { api } from './api'

// Información de cada horario de cursada.
export interface HorarioAlumno {
  dia: string
  inicio: string
  fin: string
}

// Información de cada curso al que pertenece el alumno.
export interface CursoAlumno {
  idCurso: number
  materia: {
    idMateria: number
    nombre: string
    carrera: string
  }
  anio: number
  comision: string
  periodo: string
  docentes: string[]
  horarios: HorarioAlumno[]
}

// Estados posibles de una asistencia.
export type EstadoAsistenciaAlumno =
  | 'PRESENTE'
  | 'TARDANZA'
  | 'AUSENTE'
  | 'JUSTIFICADA'
  | 'SUSPENDIDA'

// Información de cada registro de asistencia.
export interface AsistenciaAlumno {
  idAsistencia: number
  idCurso: number
  idMateria: number
  materia: string
  fecha: string
  estado: EstadoAsistenciaAlumno
}

// Respuesta del backend al consultar los cursos.
interface RespuestaCursosAlumno {
  cursos: CursoAlumno[]
}

// Respuesta del backend al consultar las asistencias.
interface RespuestaAsistenciasAlumno {
  asistencias: AsistenciaAlumno[]
}

// Obtiene los cursos del alumno autenticado.
export async function obtenerCursosAlumno(): Promise<CursoAlumno[]> {
  const { data } = await api.get<RespuestaCursosAlumno>('/alumno/cursos')

  return data.cursos
}

// Obtiene las asistencias del alumno autenticado.
export async function obtenerAsistenciasAlumno(): Promise<AsistenciaAlumno[]> {
  const { data } = await api.get<RespuestaAsistenciasAlumno>(
    '/alumno/asistencias',
  )

  return data.asistencias
}
