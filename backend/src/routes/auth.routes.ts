import { Router } from 'express'
import {
  loginController,
  recuperarContrasenaController,
  registerController,
  restablecerContrasenaController,
} from '../controllers/auth.controller'

const router = Router()

router.post('/login', loginController)
router.post('/register', registerController)
router.post('/recuperar-contrasena', recuperarContrasenaController)
router.post('/restablecer-contrasena', restablecerContrasenaController)

export default router
