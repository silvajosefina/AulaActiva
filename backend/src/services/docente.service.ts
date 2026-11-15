import { prisma } from '../lib/prisma'
import bcrypt from 'bcrypt'

export class DocenteNoEncontradoError extends Error {}

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'

const ORDEN_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export interface HorarioDTO {
  dia: string
  horaInicio: string
  horaFin: string
}

export interface CursoDocenteDTO {
  idCurso: number
  materia: {
    idMateria: number
    nombre: string
    carrera: string
  }
  anio: number
  comision: string
  periodo: string
  horarios: HorarioDTO[]
  cantidadAlumnos: number
  tieneClaseHoy: boolean
  asistenciaHoyCargada: boolean
}

export interface MateriaDocenteDTO {
  idMateria: number
  nombre: string
  carrera: string
  cursos: {
    idCurso: number
    anio: number
    comision: string
    periodo: string
  }[]
  horasSemanales: number
}

export interface PerfilDocenteDTO {
  nombre: string
  apellido: string
  email: string
  rol: string
  legajo: number
}

function formatearHora(hora: Date): string {
  return hora.toISOString().slice(11, 16)
}

function minutosEntre(inicio: Date, fin: Date): number {
  return Math.max(0, Math.round((fin.getTime() - inicio.getTime()) / 60000))
}

function hoyEnArgentina() {
  const partes = new Intl.DateTimeFormat('es-AR', {
    timeZone: ZONA_HORARIA,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ''
  const dia = valor('weekday')

  return {
    dia: dia.charAt(0).toUpperCase() + dia.slice(1),
    fecha: new Date(`${valor('year')}-${valor('month')}-${valor('day')}T00:00:00.000Z`),
  }
}

function ordenarHorarios(a: HorarioDTO, b: HorarioDTO) {
  return ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia) || a.horaInicio.localeCompare(b.horaInicio)
}

async function obtenerLegajoDocente(idUsuario: number): Promise<number> {
  const docente = await prisma.docente.findUnique({
    where: { idUsuario },
    select: { legajoDocente: true },
  })

  if (!docente) throw new DocenteNoEncontradoError()
  return docente.legajoDocente
}

export async function listarCursosDelDocente(idUsuario: number): Promise<CursoDocenteDTO[]> {
  const legajoDocente = await obtenerLegajoDocente(idUsuario)
  const hoy = hoyEnArgentina()

  const cursos = await prisma.curso.findMany({
    where: { cursosDocente: { some: { legajoDocente } } },
    include: {
      materia: true,
      horarios: true,
      _count: { select: { cursosAlumno: true } },
      asistencias: { where: { fecha: hoy.fecha }, select: { idAsistencia: true }, take: 1 },
    },
    orderBy: [{ materia: { nombre: 'asc' } }, { comision: 'asc' }],
  })

  return cursos.map((curso) => {
    const horarios = curso.horarios
      .map((h) => ({ dia: h.dia, horaInicio: formatearHora(h.horaInicio), horaFin: formatearHora(h.horaFin) }))
      .sort(ordenarHorarios)

    return {
      idCurso: curso.idCurso,
      materia: {
        idMateria: curso.materia.idMateria,
        nombre: curso.materia.nombre,
        carrera: curso.materia.carrera,
      },
      anio: curso.anio,
      comision: curso.comision,
      periodo: curso.periodo,
      horarios,
      cantidadAlumnos: curso._count.cursosAlumno,
      tieneClaseHoy: horarios.some((h) => h.dia === hoy.dia),
      asistenciaHoyCargada: curso.asistencias.length > 0,
    }
  })
}

export async function listarMateriasDelDocente(idUsuario: number): Promise<MateriaDocenteDTO[]> {
  const legajoDocente = await obtenerLegajoDocente(idUsuario)

  const materias = await prisma.materia.findMany({
    where: { cursos: { some: { cursosDocente: { some: { legajoDocente } } } } },
    include: {
      cursos: {
        where: { cursosDocente: { some: { legajoDocente } } },
        include: { horarios: true },
        orderBy: { comision: 'asc' },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  return materias.map((materia) => {
    const minutosPorCurso = materia.cursos.map((curso) =>
      curso.horarios.reduce((total, h) => total + minutosEntre(h.horaInicio, h.horaFin), 0),
    )

    return {
      idMateria: materia.idMateria,
      nombre: materia.nombre,
      carrera: materia.carrera,
      cursos: materia.cursos.map((curso) => ({
        idCurso: curso.idCurso,
        anio: curso.anio,
        comision: curso.comision,
        periodo: curso.periodo,
      })),
      horasSemanales: Math.round((Math.max(0, ...minutosPorCurso) / 60) * 10) / 10,
    }
  })
}

export async function obtenerPerfilDelDocente(idUsuario: number): Promise<PerfilDocenteDTO> {
  const docente = await prisma.docente.findUnique({
    where: { idUsuario },
    include: { usuario: true },
  })

  if (!docente || !docente.usuario) {
    throw new DocenteNoEncontradoError()
  }

  return {
    nombre: docente.usuario.nombre,
    apellido: docente.usuario.apellido,
    email: docente.usuario.email,
    rol: docente.usuario.rol,
    legajo: docente.legajoDocente,
  }
}

export async function actualizarPasswordDocente(idUsuario: number, actual: string, nueva: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario },
  })

  if (!usuario) {
    throw new Error('Usuario no encontrado')
  }

  const passwordValida = await bcrypt.compare(actual, usuario.contrasena)
  if (!passwordValida) {
    throw new Error('La contraseña actual es incorrecta')
  }

  const salt = await bcrypt.genSalt(10)
  const passwordHashed = await bcrypt.hash(nueva, salt)

  await prisma.usuario.update({
    where: { idUsuario },
    data: { contrasena: passwordHashed },
  })
}