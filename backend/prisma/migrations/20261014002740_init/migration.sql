-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('DOCENTE', 'ALUMNO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" "rol_usuario" NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "docentes" (
    "legajo_docente" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("legajo_docente")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "legajo_alumno" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("legajo_alumno")
);

-- CreateTable
CREATE TABLE "materias" (
    "id_materia" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id_materia")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id_curso" SERIAL NOT NULL,
    "id_materia" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "comision" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "curso_docente" (
    "id_curso_docente" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "legajo_docente" INTEGER NOT NULL,

    CONSTRAINT "curso_docente_pkey" PRIMARY KEY ("id_curso_docente")
);

-- CreateTable
CREATE TABLE "curso_alumno" (
    "id_curso_alumno" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "legajo_alumno" INTEGER NOT NULL,

    CONSTRAINT "curso_alumno_pkey" PRIMARY KEY ("id_curso_alumno")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id_asistencia" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_curso_alumno" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id_asistencia")
);

-- CreateTable
CREATE TABLE "horarios" (
    "id_horario" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "dia" TEXT NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,

    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id_horario")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_id_usuario_key" ON "docentes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_id_usuario_key" ON "alumnos"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "curso_docente_id_curso_legajo_docente_key" ON "curso_docente"("id_curso", "legajo_docente");

-- CreateIndex
CREATE UNIQUE INDEX "curso_alumno_id_curso_legajo_alumno_key" ON "curso_alumno"("id_curso", "legajo_alumno");

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnos" ADD CONSTRAINT "alumnos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_id_materia_fkey" FOREIGN KEY ("id_materia") REFERENCES "materias"("id_materia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_docente" ADD CONSTRAINT "curso_docente_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_docente" ADD CONSTRAINT "curso_docente_legajo_docente_fkey" FOREIGN KEY ("legajo_docente") REFERENCES "docentes"("legajo_docente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_alumno" ADD CONSTRAINT "curso_alumno_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso_alumno" ADD CONSTRAINT "curso_alumno_legajo_alumno_fkey" FOREIGN KEY ("legajo_alumno") REFERENCES "alumnos"("legajo_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_id_curso_alumno_fkey" FOREIGN KEY ("id_curso_alumno") REFERENCES "curso_alumno"("id_curso_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;
