import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CARRERA = 'Ingeniería en Sistemas de Información'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const ALUMNOS = [
  { nombre: 'Lucía', apellido: 'Gómez', usuario: 'lgomez' },
  { nombre: 'Martín', apellido: 'Pereyra', usuario: 'mpereyra' },
  { nombre: 'Camila', apellido: 'Ruiz', usuario: 'cruiz' },
  { nombre: 'Tomás', apellido: 'Fernández', usuario: 'tfernandez' },
  { nombre: 'Valentina', apellido: 'López', usuario: 'vlopez' },
  { nombre: 'Joaquín', apellido: 'Díaz', usuario: 'jdiaz' },
  { nombre: 'Sofía', apellido: 'Martínez', usuario: 'smartinez' },
]

const MATERIAS = [
  {
    nombre: 'Bases de Datos',
    cursos: [
      {
        anio: 3,
        comision: '3K1',
        periodo: '2º cuatrimestre 2026',
        horarios: [
          { dia: 'Lunes', inicio: '18:00', fin: '21:00' },
          { dia: 'Miércoles', inicio: '18:00', fin: '21:00' },
        ],
        alumnos: ['alumno', 'lgomez', 'mpereyra', 'cruiz', 'tfernandez'],
      },
      {
        anio: 3,
        comision: '3K3',
        periodo: '2º cuatrimestre 2026',
        horarios: [{ dia: 'Viernes', inicio: '18:00', fin: '22:00' }],
        alumnos: ['vlopez', 'jdiaz', 'smartinez'],
      },
    ],
  },
  {
    nombre: 'Programación Web',
    cursos: [
      {
        anio: 3,
        comision: '3K2',
        periodo: '2º cuatrimestre 2026',
        horarios: [
          { dia: 'Martes', inicio: '14:00', fin: '17:00' },
          { dia: 'Jueves', inicio: '14:00', fin: '17:00' },
        ],
        alumnos: ['alumno', 'cruiz', 'vlopez', 'jdiaz', 'smartinez', 'lgomez'],
      },
    ],
  },
  {
    nombre: 'Matemática Discreta',
    cursos: [
      {
        anio: 1,
        comision: '1K1',
        periodo: 'Anual 2026',
        horarios: [{ dia: 'Jueves', inicio: '08:00', fin: '11:00' }],
        alumnos: ['alumno', 'mpereyra', 'tfernandez', 'smartinez'],
      },
    ],
  },
]

const SEMANAS_DE_HISTORIAL = 4

function hora(valor: string) {
  return new Date(`1970-01-01T${valor}:00.000Z`)
}

function fechasPasadas(dias: string[]): Date[] {
  const hoy = new Date()
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const fechas: Date[] = []

  for (let atras = 1; atras <= SEMANAS_DE_HISTORIAL * 7; atras++) {
    const fecha = new Date(base - atras * 86400000)
    if (dias.includes(DIAS_SEMANA[fecha.getUTCDay()])) fechas.push(fecha)
  }

  return fechas.reverse()
}

function estadoDePrueba(indiceAlumno: number, indiceClase: number) {
  const valor = (indiceAlumno * 7 + indiceClase * 3) % 10
  if (valor < 7) return 'PRESENTE'
  if (valor === 7) return 'TARDANZA'
  if (valor === 8) return 'AUSENTE'
  return 'JUSTIFICADA'
}

async function crearUsuariosDePrueba() {
  const contrasena = await bcrypt.hash('123456', 10)

  await prisma.usuario.upsert({
    where: { usuario: 'alumno' },
    update: {},
    create: {
      nombre: 'Ana',
      apellido: 'Alumna',
      email: 'alumno@aulaactiva.test',
      usuario: 'alumno',
      contrasena,
      rol: 'ALUMNO',
      alumno: { create: {} },
    },
  })

  await prisma.usuario.upsert({
    where: { usuario: 'docente' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Docente',
      email: 'docente@aulaactiva.test',
      usuario: 'docente',
      contrasena,
      rol: 'DOCENTE',
      docente: { create: {} },
    },
  })

  for (const alumno of ALUMNOS) {
    await prisma.usuario.upsert({
      where: { usuario: alumno.usuario },
      update: {},
      create: {
        ...alumno,
        email: `${alumno.usuario}@aulaactiva.test`,
        contrasena,
        rol: 'ALUMNO',
        alumno: { create: {} },
      },
    })
  }
}

async function crearDatosAcademicos() {
  if ((await prisma.materia.count()) > 0) {
    console.log('Ya hay materias cargadas, no se crean datos académicos de prueba')
    return
  }

  const docente = await prisma.docente.findFirstOrThrow({ where: { usuario: { usuario: 'docente' } } })
  const alumnos = await prisma.alumno.findMany({ include: { usuario: { select: { usuario: true } } } })
  const legajoDe = new Map(alumnos.map((a) => [a.usuario.usuario, a.legajoAlumno]))

  for (const materia of MATERIAS) {
    const materiaDb = await prisma.materia.create({ data: { nombre: materia.nombre, carrera: CARRERA } })

    for (const curso of materia.cursos) {
      const cursoDb = await prisma.curso.create({
        data: {
          idMateria: materiaDb.idMateria,
          anio: curso.anio,
          comision: curso.comision,
          periodo: curso.periodo,
          horarios: {
            create: curso.horarios.map((h) => ({ dia: h.dia, horaInicio: hora(h.inicio), horaFin: hora(h.fin) })),
          },
          cursosDocente: { create: { legajoDocente: docente.legajoDocente } },
        },
      })

      const fechas = fechasPasadas(curso.horarios.map((h) => h.dia))

      for (const [indiceAlumno, usuario] of curso.alumnos.entries()) {
        const legajoAlumno = legajoDe.get(usuario)
        if (legajoAlumno === undefined) throw new Error(`No existe el alumno de prueba ${usuario}`)

        const inscripcion = await prisma.cursoAlumno.create({
          data: { idCurso: cursoDb.idCurso, legajoAlumno },
        })

        await prisma.asistencia.createMany({
          data: fechas.map((fecha, indiceClase) => ({
            idCurso: cursoDb.idCurso,
            idCursoAlumno: inscripcion.idCursoAlumno,
            fecha,
            estado: estadoDePrueba(indiceAlumno, indiceClase),
          })),
        })
      }
    }
  }

  console.log('Datos académicos de prueba creados')
}

async function main() {
  await crearUsuariosDePrueba()
  await crearDatosAcademicos()
  console.log('Seed terminado')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
