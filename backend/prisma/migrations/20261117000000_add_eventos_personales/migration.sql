-- CreateTable
CREATE TABLE "eventos_personales" (
    "id_evento" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TEXT,
    "hora_fin" TEXT,
    "notas" TEXT,
    "legajo_alumno" INTEGER NOT NULL,
    "id_curso" INTEGER,

    CONSTRAINT "eventos_personales_pkey" PRIMARY KEY ("id_evento")
);

-- AddForeignKey
ALTER TABLE "eventos_personales" ADD CONSTRAINT "eventos_personales_legajo_alumno_fkey" FOREIGN KEY ("legajo_alumno") REFERENCES "alumnos"("legajo_alumno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_personales" ADD CONSTRAINT "eventos_personales_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;
