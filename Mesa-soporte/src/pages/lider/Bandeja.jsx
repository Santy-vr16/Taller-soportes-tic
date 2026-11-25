import { useState } from 'react'
import { useSolicitudes } from '../../hooks/useSolicitudes'
import TablaSolicitudes from '../../components/TablaSolicitudes'
import { Cargando, MensajeError, Vacio } from '../../components/Feedback'
import { ESTADOS_INFO, ORDEN_ESTADOS } from '../../domain/estados'

export default function Bandeja() {
  const { data, error, cargando, recargar } = useSolicitudes()
  const [filtro, setFiltro] = useState('todas')

  const conteo = (estado) => data.filter((s) => s.estado === estado).length
  const visibles = data && (filtro === 'todas' ? data : data.filter((s) => s.estado === filtro))

  return (
    <>
      <header className="pagina-encabezado">
        <h1>Solicitudes de soporte</h1>
        <button className="boton secundario" onClick={recargar} disabled={cargando}>
          Actualizar
        </button>
      </header>

      {error && <MensajeError error={error} onReintentar={recargar} />}
      {cargando && !data && <Cargando />}

      {data && (
        <>
          <div className="chips" role="group" aria-label="Filtrar por estado">
            <button className="chip" aria-pressed={filtro === 'todas'} onClick={() => setFiltro('todas')}>
              Todas <span>{data.length}</span>
            </button>
            {ORDEN_ESTADOS.map((estado) => (
              <button key={estado} className={`chip estado-${estado}`} aria-pressed={filtro === estado} onClick={() => setFiltro(estado)}>
                {ESTADOS_INFO[estado].etiqueta} <span>{conteo(estado)}</span>
              </button>
            ))}
          </div>

          {visibles.length === 0 ? (
            <Vacio titulo="No hay solicitudes en este estado">
              <p>Cuando lleguen nuevos reportes aparecerán aquí.</p>
            </Vacio>
          ) : (
            <TablaSolicitudes solicitudes={visibles} rutaBase="/lider/solicitudes" mostrarInstructor mostrarEspecialista />
          )}
        </>
      )}
    </>
  )
}
