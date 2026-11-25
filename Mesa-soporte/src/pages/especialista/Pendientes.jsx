import { useSolicitudes } from '../../hooks/useSolicitudes'
import TablaSolicitudes from '../../components/TablaSolicitudes'
import { Cargando, MensajeError, Vacio } from '../../components/Feedback'
import { ESTADO } from '../../domain/estados'

export default function Pendientes() {
  const { data, error, cargando, recargar } = useSolicitudes()
  const pendientes = data?.filter((s) => s.estado === ESTADO.PENDIENTE)

  return (
    <>
      <header className="pagina-encabezado">
        <h1>Solicitudes pendientes</h1>
        <button className="boton secundario" onClick={recargar} disabled={cargando}>
          Actualizar
        </button>
      </header>

      {error && <MensajeError error={error} onReintentar={recargar} />}
      {cargando && !data && <Cargando />}
      {pendientes && pendientes.length === 0 && (
        <Vacio titulo="No tienes casos pendientes">
          <p>Cuando el líder te asigne un incidente aparecerá en esta bandeja.</p>
        </Vacio>
      )}
      {pendientes && pendientes.length > 0 && (
        <TablaSolicitudes solicitudes={pendientes} rutaBase="/especialista/solicitudes" mostrarInstructor />
      )}
    </>
  )
}
