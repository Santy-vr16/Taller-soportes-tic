import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import { useAuth } from './auth/useAuth'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import { rutaInicial } from './domain/roles'
import Login from './pages/Login'
import MisSolicitudes from './pages/instructor/MisSolicitudes'
import NuevaSolicitud from './pages/instructor/NuevaSolicitud'
import SeguimientoSolicitud from './pages/instructor/SeguimientoSolicitud'
import Bandeja from './pages/lider/Bandeja'
import GestionarSolicitud from './pages/lider/GestionarSolicitud'
import Pendientes from './pages/especialista/Pendientes'
import Historial from './pages/especialista/Historial'
import AtenderSolicitud from './pages/especialista/AtenderSolicitud'
import { ReporteTecnicosPdf } from './components/ReporteTecnicosPdf'

function InicioPorRol() {
  const { rol } = useAuth()
  return <Navigate to={rutaInicial(rol)} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<InicioPorRol />} />

              {/* Ruta accesible para todos los roles autenticados */}
              <Route path="reporte-tecnicos" element={<ReporteTecnicosPdf />} />

              <Route element={<ProtectedRoute roles={['instructor']} />}>
                <Route path="instructor" element={<MisSolicitudes />} />
                <Route path="instructor/nueva" element={<NuevaSolicitud />} />
                <Route path="instructor/solicitudes/:id" element={<SeguimientoSolicitud />} />
              </Route>

              <Route element={<ProtectedRoute roles={['lider']} />}>
                <Route path="lider" element={<Bandeja />} />
                <Route path="lider/solicitudes/:id" element={<GestionarSolicitud />} />
              </Route>

              <Route element={<ProtectedRoute roles={['especialista']} />}>
                <Route path="especialista" element={<Pendientes />} />
                <Route path="especialista/historial" element={<Historial />} />
                <Route path="especialista/solicitudes/:id" element={<AtenderSolicitud />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
