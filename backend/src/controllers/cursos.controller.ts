import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const obtenerAlumnosPorCurso = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const relacionesAlumnos = await prisma.cursoAlumno.findMany({
      where: { idCurso: Number(id) },
      include: {
        alumno: {
          include: {
            usuario: true,
          },
        },
      },
      orderBy: {
        alumno: {
          usuario: {
            apellido: 'asc',
          },
        },
      },
    });

    const alumnos = relacionesAlumnos.map((item: any) => ({
      legajoAlumno: item.alumno.legajoAlumno,
      nombre: item.alumno.usuario.nombre,
      apellido: item.alumno.usuario.apellido,
      email: item.alumno.usuario.email,
      idCursoAlumno: item.idCursoAlumno,
    }));

    return res.status(200).json({
      success: true,
      data: alumnos,
    });
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

export const obtenerAsistenciasPorFecha = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({ success: false, message: "La fecha es obligatoria" });
  }

  try {
    const asistencias = await prisma.asistencia.findMany({
      where: {
        idCurso: Number(id),
        fecha: new Date(fecha as string),
      },
      include: {
        cursoAlumno: true,
      },
    });

    return res.status(200).json({
      success: true,
      fecha,
      asistencias: asistencias.map((a: any) => ({
        legajoAlumno: a.cursoAlumno.legajoAlumno,
        estado: a.estado,
      })),
    });
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

export const guardarAsistencia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fecha, registros } = req.body; 

  if (!fecha || !registros || !Array.isArray(registros)) {
    return res.status(400).json({ success: false, message: "Datos incompletos o inválidos" });
  }

  const estadosValidos = ["PRESENTE", "AUSENTE", "TARDANZA", "JUSTIFICADA", "SUSPENDIDA"];

  for (const reg of registros) {
    if (!estadosValidos.includes(reg.estado)) {
      return res.status(400).json({ 
        success: false, 
        message: `Estado de asistencia inválido: ${reg.estado}` 
      });
    }
  }

  try {
    const fechaDate = new Date(fecha);
    const cursoIdNum = Number(id);

    for (const reg of registros) {
      const cursoAlumno = await prisma.cursoAlumno.findUnique({
        where: {
          idCurso_legajoAlumno: {
            idCurso: cursoIdNum,
            legajoAlumno: Number(reg.legajoAlumno),
          },
        },
      });

      if (!cursoAlumno) continue;

      const asistenciaExistente = await prisma.asistencia.findFirst({
        where: {
          idCurso: cursoIdNum,
          idCursoAlumno: cursoAlumno.idCursoAlumno,
          fecha: fechaDate,
        },
      });

      if (asistenciaExistente) {
        await prisma.asistencia.update({
          where: { idAsistencia: asistenciaExistente.idAsistencia },
          data: { estado: reg.estado },
        });
      } else {
        await prisma.asistencia.create({
          data: {
            idCurso: cursoIdNum,
            idCursoAlumno: cursoAlumno.idCursoAlumno,
            fecha: fechaDate,
            estado: reg.estado,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Asistencia registrada correctamente",
    });
  } catch (error) {
    console.error("Error al guardar asistencia:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};