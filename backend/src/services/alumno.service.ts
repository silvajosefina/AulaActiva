
import { prisma } from '../lib/prisma'

// Error específico cuando el usuario no tiene un perfil de alumno.
export class AlumnoNoEncontradoError extends Error {}

// Busca el legajo del alumno asociado al usuario autenticado.
async function obtenerLegajoAlumno(idUsuario: number): Promise<number> {
  const alumno = await prisma.alumno.findUnique({
    where: { idUsuario },
    select: { legajoAlumno: true },
  })

  if (!alumno) throw new AlumnoNoEncontradoError()

  return alumno.legajoAlumno
}

// Información de cada horario de cursada.
export interface HorarioAlumnoDTO {
  dia: string
  inicio: string
  fin: string
}

// Información de cada curso al que pertenece el alumno.
export interface CursoAlumnoDTO {
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
  horarios: HorarioAlumnoDTO[]
}

// Convierte la hora almacenada en la base de datos a formato HH:mm.
function formatearHoraAlumno(hora: Date): string {
  return hora.toISOString().slice(11, 16)
}

// Lista los cursos en los que está inscripto el alumno.
export async function listarCursosDelAlumno(
  idUsuario: number,
): Promise<CursoAlumnoDTO[]> {
  // Primero obtenemos su legajo.
  const legajoAlumno = await obtenerLegajoAlumno(idUsuario)

  // Buscamos las inscripciones de ese alumno.
  const inscripciones = await prisma.cursoAlumno.findMany({
    where: { legajoAlumno },
    include: {
      curso: {
        include: {
          materia: true,
          horarios: true,
          cursosDocente: {
            include: {
              docente: {
                include: {
                  usuario: {
                    select: {
                      nombre: true,
                      apellido: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      { curso: { materia: { nombre: 'asc' } } },
      { curso: { comision: 'asc' } },
    ],
  })

  // Transformamos los datos de Prisma al formato que espera el frontend.
  return inscripciones.map(({ curso }) => ({
    idCurso: curso.idCurso,
    materia: {
      idMateria: curso.materia.idMateria,
      nombre: curso.materia.nombre,
      carrera: curso.materia.carrera,
    },
    anio: curso.anio,
    comision: curso.comision,
    periodo: curso.periodo,
    docentes: curso.cursosDocente.map(
      ({ docente }) =>
        `${docente.usuario.nombre} ${docente.usuario.apellido}`,
    ),
    horarios: curso.horarios.map((horario) => ({
      dia: horario.dia,
      inicio: formatearHoraAlumno(horario.horaInicio),
      fin: formatearHoraAlumno(horario.horaFin),
    })),
  }))
}

// Estados posibles de una asistencia.
export type EstadoAsistenciaAlumno =
  | 'PRESENTE'
  | 'TARDANZA'
  | 'AUSENTE'
  | 'JUSTIFICADA'
  | 'SUSPENDIDA'

// Información de cada registro de asistencia.
export interface AsistenciaAlumnoDTO {
  idAsistencia: number
  idCurso: number
  idMateria: number
  materia: string
  fecha: string
  estado: EstadoAsistenciaAlumno
}

// Convierte la fecha a formato YYYY-MM-DD.
function formatearFechaAlumno(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

// Lista las asistencias del alumno autenticado.
export async function listarAsistenciasDelAlumno(
  idUsuario: number,
): Promise<AsistenciaAlumnoDTO[]> {
  // Primero obtenemos su legajo.
  const legajoAlumno = await obtenerLegajoAlumno(idUsuario)

  // Buscamos las asistencias de sus cursos.
  const asistencias = await prisma.asistencia.findMany({
    where: {
      cursoAlumno: { legajoAlumno },
    },
    include: {
      curso: {
        include: {
          materia: true,
        },
      },
    },
    orderBy: [
      { fecha: 'desc' },
      { idAsistencia: 'desc' },
    ],
  })

  // Transformamos los registros al formato que espera el frontend.
  return asistencias.map((asistencia) => ({
    idAsistencia: asistencia.idAsistencia,
    idCurso: asistencia.curso.idCurso,
    idMateria: asistencia.curso.materia.idMateria,
    materia: asistencia.curso.materia.nombre,
    fecha: formatearFechaAlumno(asistencia.fecha),
    estado: asistencia.estado as EstadoAsistenciaAlumno,
  }))
}

export interface PerfilAlumnoDTO {
  nombre: string
  apellido: string
  email: string
  usuario: string
  rol: string
  legajo: number
}

export async function obtenerPerfilDelAlumno(idUsuario: number): Promise<PerfilAlumnoDTO> {
  const alumno = await prisma.alumno.findUnique({
    where: { idUsuario },
    include: { usuario: true },
  })

  if (!alumno) throw new AlumnoNoEncontradoError()

  return {
    nombre: alumno.usuario.nombre,
    apellido: alumno.usuario.apellido,
    email: alumno.usuario.email,
    usuario: alumno.usuario.usuario,
    rol: alumno.usuario.rol,
    legajo: alumno.legajoAlumno,
  }
}
