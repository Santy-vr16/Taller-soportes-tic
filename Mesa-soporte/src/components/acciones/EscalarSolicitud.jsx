import { useId, useState } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { useAccion } from '../../hooks/useAccion'
import { listarAreas } from '../../services/catalogosService'
import { escalarSolicitud } from '../../services/accionesService'
import { Cargando, MensajeError } from '../Feedback'

export default function EscalarSolicitud({ solicitudId, onListo }) {
  const idArea = useId()
  const idMotivo = useId()
  const [areaId, setAreaId] = useState('')
  const [motivo, setMotivo] = useState('')
  const { data: areas, error: errorCarga, cargando, recargar } = useQuery('areas', listarAreas)
  const { ejecutar, cargando: guardando, error } = useAccion(escalarSolicitud)

  async function enviar(evento) {
    evento.preventDefault()
    const { ok } = await ejecutar(solicitudId, areaId, motivo.trim())
    if (ok) onListo?.()
  }

  return (
    <form className="tarjeta panel-accion" onSubmit={enviar}>
      <h2>Escalar a otra área</h2>
      <p className="ayuda">El especialista no pudo resolver el caso. Remítelo formalmente al área responsable.</p>
      {cargando && <Cargando texto="Cargando áreas" />}
      {errorCarga && <MensajeError error={errorCarga} onReintentar={recargar} />}
      {areas && (
        <>
          <div className="campo">
            <label htmlFor={idArea}>Área responsable</label>
            <select id={idArea} value={areaId} required onChange={(e) => setAreaId(e.target.value)}>
              <option value="">Selecciona…</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor={idMotivo}>Motivo del escalamiento</label>
            <textarea id={idMotivo} rows={3} value={motivo} required onChange={(e) => setMotivo(e.target.value)} />
          </div>
        </>
      )}
      {error && (
        <p className="alerta error" role="alert">
          {error}
        </p>
      )}
      <button className="boton primario" disabled={guardando || !areaId || !motivo.trim()}>
        {guardando ? 'Escalando…' : 'Escalar solicitud'}
      </button>
    </form>
  )
}
