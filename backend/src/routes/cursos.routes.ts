import { Router } from 'express'
import {
  guardarAsistencia,
  obtenerAlumnosPorCurso,
  obtenerAsistenciasPorFecha,
} from '../controllers/cursos.controller'
import { requireAuth, requireRol } from '../middlewares/auth.middleware'

const router = Router()

router.use(requireAuth, requireRol('DOCENTE'))

router.get('/:id/alumnos', obtenerAlumnosPorCurso)
router.get('/:id/asistencias', obtenerAsistenciasPorFecha)
router.post('/:id/asistencias', guardarAsistencia)

export default router