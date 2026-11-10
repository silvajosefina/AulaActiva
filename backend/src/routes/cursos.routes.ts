import { Router } from "express";
import { 
  obtenerAlumnosPorCurso, 
  obtenerAsistenciasPorFecha, 
  guardarAsistencia 
} from "../controllers/cursos.controller.js";

const router = Router();

router.get("/:id/alumnos", obtenerAlumnosPorCurso);

router.get("/:id/asistencias", obtenerAsistenciasPorFecha);

router.post("/:id/asistencias", guardarAsistencia);

export default router;