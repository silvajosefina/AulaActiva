import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const alumno = await prisma.usuario.upsert({
    where: { usuario: 'alumno' },
    update: {},
    create: {
      nombre: 'Ana',
      apellido: 'Alumna',
      email: 'alumno@aulaactiva.test',
      usuario: 'alumno',
      contrasena: '123456',
      rol: 'ALUMNO',
      alumno: { create: {} },
    },
  })

  const docente = await prisma.usuario.upsert({
    where: { usuario: 'docente' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Docente',
      email: 'docente@aulaactiva.test',
      usuario: 'docente',
      contrasena: '123456',
      rol: 'DOCENTE',
      docente: { create: {} },
    },
  })

  console.log('Usuarios de prueba listos:', alumno.usuario, docente.usuario)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
