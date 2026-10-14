import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/Login/Login'
import { ROUTES } from '../constants/routes'

function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  )
}

export default AppRouter
