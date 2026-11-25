import { useId, useState } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { useAccion } from '../../hooks/useAccion'
import { listarEspecialistas } from '../../services/catalogosService'
import { asignarSolicitud } from '../../services/accionesService'
import { Cargando, MensajeError } from '../Feedback'

export default function AsignarEspecialista({ solicitudId, onListo }) {
  const id = useId()
  const [especialistaId, setEspecialistaId] = useState('')
  const { data: especialistas, error: errorCarga, cargando, recargar } = useQuery('especialistas', listarEspecialistas)
  const { ejecutar, cargando: guardando, error } = useAccion(asignarSolicitud)

  async function enviar(evento) {
    evento.preventDefault()
    const { ok } = await ejecutar(solicitudId, especialistaId)
    if (ok) onListo?.()
  }

  return (
    <form className="tarjeta panel-accion" onSubmit={enviar}>
      <h2>Asignar especialista</h2>
      <p className="ayuda">Elige a quien tenga las competencias para atender este caso. Pasará a Pendiente.</p>
      {cargando && <Cargando texto="Cargando especialistas" />}
      {errorCarga && <MensajeError error={errorCarga} onReintentar={recargar} />}
      {especialistas && especialistas.length === 0 && (
        <p className="alerta error">
          No hay especialistas activos. Cambia el rol de un usuario a «especialista» en la tabla perfiles.
        </p>
      )}
      {especialistas && especialistas.length > 0 && (
        <div className="campo">
          <label htmlFor={id}>Especialista</label>
          <select id={id} value={especialistaId} required onChange={(e) => setEspecialistaId(e.target.value)}>
            <option value="">Selecciona…</option>
            {especialistas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
                {e.competencias.length > 0 && ` (${e.competencias.join(', ')})`}
              </option>
            ))}
          </select>
        </div>
      )}
      {error && (
        <p className="alerta error" role="alert">
          {error}
        </p>
      )}
      <button className="boton primario" disabled={guardando || !especialistaId}>
        {guardando ? 'Asignando…' : 'Asignar especialista'}
      </button>
    </form>
  )
}
