import { Router } from 'express'
import { cursosController, materiasController } from '../controllers/docente.controller'
import { requireAuth, requireRol } from '../middlewares/auth.middleware'

const router = Router()

router.use(requireAuth, requireRol('DOCENTE'))

router.get('/cursos', cursosController)
router.get('/materias', materiasController)

export default router
