
import { Router } from 'express'

import {
  asistenciasAlumnoController,
  cursosAlumnoController,
  listarEventosPersonalesController,
  crearEventoPersonalController,
  actualizarEventoPersonalController,
  eliminarEventoPersonalController,
} from '../controllers/alumno.controller'

import {
  requireAuth,
  requireRol,
} from '../middlewares/auth.middleware'

const router = Router()

// Todas las rutas requieren sesión y rol ALUMNO.
router.use(requireAuth, requireRol('ALUMNO'))

// Cursos del alumno autenticado.
router.get('/cursos', cursosAlumnoController)

// Asistencias del alumno autenticado.
router.get('/asistencias', asistenciasAlumnoController)

// Agenda personal del alumno autenticado.
router.get('/agenda-personal', listarEventosPersonalesController)

router.post('/agenda-personal', crearEventoPersonalController)

router.put(
  '/agenda-personal/:idEvento',
  actualizarEventoPersonalController,
)

router.delete(
  '/agenda-personal/:idEvento',
  eliminarEventoPersonalController,
)

export default router
