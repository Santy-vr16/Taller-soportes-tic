import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ETIQUETA_ROL, NAVEGACION } from '../domain/roles'

export default function Layout() {
  const { perfil, rol, cerrarSesion } = useAuth()

  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera__interior">
          <span className="marca">
            <span className="marca__sello" aria-hidden="true">M</span>
            Mesa de soporte
          </span>
          <nav className="nav" aria-label="Principal">
            {NAVEGACION[rol]?.map((item) => (
              <NavLink key={item.a} to={item.a} end={item.exacta}>
                {item.texto}
              </NavLink>
            ))}
          </nav>
          <div className="usuario">
            <div className="usuario__id">
              <span className="avatar" aria-hidden="true">{perfil?.nombre?.[0]?.toUpperCase()}</span>
              <span>
                <strong>{perfil?.nombre}</strong>
                <small>{ETIQUETA_ROL[rol]}</small>
              </span>
            </div>
            <button className="boton fantasma" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}
