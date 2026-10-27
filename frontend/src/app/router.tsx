import { Navigate, Route, Routes } from 'react-router-dom'
import Inicio from '../pages/Inicio/Inicio'
import Login from '../pages/Login/Login'
import CargaAsistencia from '../pages/CargaAsistencia'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from '../constants/routes'

function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.INICIO} element={<Inicio />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route
        path={ROUTES.PROFESOR_ASISTENCIA}
        element={
          <ProtectedRoute rolRequerido="DOCENTE">
            <CargaAsistencia />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.INICIO} replace />} />
    </Routes>
  )
}

export default AppRouter
