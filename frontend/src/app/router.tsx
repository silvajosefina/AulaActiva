import { Navigate, Route, Routes } from 'react-router-dom'
import Inicio from '../pages/Inicio/Inicio'
import Login from '../pages/Login/Login'
import Registro from '../pages/Registro/Registro'
import RecuperarContrasena from '../pages/RecuperarContrasena/RecuperarContrasena'
import CargaAsistencia from '../pages/CargaAsistencia'
import InicioProfesor from '../pages/InicioProfesor'
import MisCursos from "../pages/MisCursos"
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from '../constants/routes'

function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.INICIO} element={<Inicio />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTRO} element={<Registro />} />
      <Route path={ROUTES.RECUPERAR_CONTRASENA} element={<RecuperarContrasena />} />
      <Route
        path={ROUTES.PROFESOR_INICIO}
        element={
          <ProtectedRoute rolRequerido="DOCENTE">
            <InicioProfesor />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFESOR_ASISTENCIA}
        element={
          <ProtectedRoute rolRequerido="DOCENTE">
            <CargaAsistencia />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.PROFESOR_CURSOS} element={<MisCursos />} />
      <Route path="*" element={<Navigate to={ROUTES.INICIO} replace />} />
    </Routes>
  )
}

export default AppRouter
