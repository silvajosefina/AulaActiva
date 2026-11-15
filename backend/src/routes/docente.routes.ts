import { Router } from 'express'
import { 
  cursosController, 
  materiasController, 
  perfilController, 
  actualizarPasswordController 
} from '../controllers/docente.controller'
import { requireAuth, requireRol } from '../middlewares/auth.middleware'

const router = Router()

// Middleware global para todas las rutas de este archivo
router.use(requireAuth, requireRol('DOCENTE'))

router.get('/cursos', cursosController)
router.get('/materias', materiasController)
router.get('/perfil', perfilController)
router.put('/perfil/password', actualizarPasswordController)

export default router
