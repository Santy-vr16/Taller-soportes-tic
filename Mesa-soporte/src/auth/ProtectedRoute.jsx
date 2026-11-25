import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { rutaInicial } from '../domain/roles'
import { Cargando } from '../components/Feedback'

// Sin `roles`: exige sesión iniciada. Con `roles`: además exige uno de esos roles.
export default function ProtectedRoute({ roles }) {
  const { session, rol, cargando, errorPerfil, cuentaInactiva, cerrarSesion } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Cargando texto="Verificando tu sesión" />
  if (!session) return <Navigate to="/login" state={{ desde: ubicacion }} replace />

  if (errorPerfil || cuentaInactiva) {
    return (
      <main className="pagina-aviso">
        <h1>No se puede acceder</h1>
        <p>{cuentaInactiva ? 'Tu cuenta está desactivada. Habla con el líder de soporte.' : errorPerfil}</p>
        <button className="boton secundario" onClick={cerrarSesion}>Cerrar sesión</button>
      </main>
    )
  }

  if (roles && !roles.includes(rol)) return <Navigate to={rutaInicial(rol)} replace />
  return <Outlet />
}
