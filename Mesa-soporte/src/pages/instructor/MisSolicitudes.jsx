import { Link } from 'react-router-dom'
import { useSolicitudes } from '../../hooks/useSolicitudes'
import TablaSolicitudes from '../../components/TablaSolicitudes'
import { Cargando, MensajeError, Vacio } from '../../components/Feedback'

export default function MisSolicitudes() {
  const { data, error, cargando, recargar } = useSolicitudes()

  return (
    <>
      <header className="pagina-encabezado">
        <h1>Mis solicitudes</h1>
        <Link to="/instructor/nueva" className="boton primario">
          Nueva solicitud
        </Link>
      </header>

      {error && <MensajeError error={error} onReintentar={recargar} />}
      {cargando && !data && <Cargando />}
      {data && data.length === 0 && (
        <Vacio titulo="Aún no has reportado incidentes">
          <p>Cuando un equipo falle en tu ambiente, crea una solicitud y el equipo de soporte la atenderá.</p>
          <Link to="/instructor/nueva" className="boton primario">Reportar un incidente</Link>
        </Vacio>
      )}
      {data && data.length > 0 && <TablaSolicitudes solicitudes={data} rutaBase="/instructor/solicitudes" mostrarEspecialista />}
    </>
  )
}
