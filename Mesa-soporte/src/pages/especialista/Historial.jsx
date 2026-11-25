import { useSolicitudes } from '../../hooks/useSolicitudes'
import TablaSolicitudes from '../../components/TablaSolicitudes'
import { Cargando, MensajeError, Vacio } from '../../components/Feedback'
import { ESTADO } from '../../domain/estados'

export default function Historial() {
  const { data, error, cargando, recargar } = useSolicitudes()
  const atendidas = data?.filter((s) => s.estado !== ESTADO.PENDIENTE)

  return (
    <>
      <header className="pagina-encabezado">
        <h1>Historial de casos atendidos</h1>
      </header>

      {error && <MensajeError error={error} onReintentar={recargar} />}
      {cargando && !data && <Cargando />}
      {atendidas && atendidas.length === 0 && (
        <Vacio titulo="Todavía no has cerrado casos">
          <p>Aquí verás los incidentes que resolviste o que pediste escalar.</p>
        </Vacio>
      )}
      {atendidas && atendidas.length > 0 && (
        <TablaSolicitudes solicitudes={atendidas} rutaBase="/especialista/solicitudes" mostrarInstructor />
      )}
    </>
  )
}
