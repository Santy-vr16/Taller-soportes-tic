import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '../../hooks/useQuery'
import { useAccion } from '../../hooks/useAccion'
import { listarAmbientes, listarEquiposPorAmbiente, listarTecnicos } from '../../services/catalogosService'
import { crearSolicitud } from '../../services/solicitudesService'
import { Cargando, MensajeError } from '../../components/Feedback'

export default function NuevaSolicitud() {
  const navegar = useNavigate()
  const ids = { ambiente: useId(), equipo: useId(), descripcion: useId(), observaciones: useId() }
  const [ambienteId, setAmbienteId] = useState('')
  const [equipoId, setEquipoId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const ambientes = useQuery('ambientes', listarAmbientes)
  const equipos = useQuery(`equipos:${ambienteId}`, () => (ambienteId ? listarEquiposPorAmbiente(ambienteId) : Promise.resolve([])))
  const tecnicos = useQuery('tecnicos', listarTecnicos)
  const guardar = useAccion(crearSolicitud)

  async function enviar(evento) {
    evento.preventDefault()
    const { ok, resultado } = await guardar.ejecutar({
      ambienteId,
      equipoId,
      descripcion,
      observaciones,
      especialistaId: tecnicoId,
    })
    if (ok) navegar(`/instructor/solicitudes/${resultado.id}`)
  }

  const descripcionValida = descripcion.trim().length >= 10

  return (
    <>
      <Link to="/instructor" className="volver">← Mis solicitudes</Link>
      <header className="pagina-encabezado">
        <h1>Nueva solicitud de soporte</h1>
      </header>

      {ambientes.error && <MensajeError error={ambientes.error} onReintentar={ambientes.recargar} />}
      {ambientes.cargando && !ambientes.data && <Cargando />}

      {ambientes.data && (
        <form className="tarjeta formulario" onSubmit={enviar}>
          <div className="campo">
            <label htmlFor={ids.ambiente}>Ambiente de formación</label>
            <select
              id={ids.ambiente}
              value={ambienteId}
              required
              onChange={(e) => {
                setAmbienteId(e.target.value)
                setEquipoId('')
              }}
            >
              <option value="">Selecciona…</option>
              {ambientes.data.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor={ids.equipo}>Equipo afectado</label>
            <select id={ids.equipo} value={equipoId} required disabled={!ambienteId} onChange={(e) => setEquipoId(e.target.value)}>
              <option value="">{ambienteId ? 'Selecciona el código…' : 'Primero elige el ambiente'}</option>
              {equipos.data?.map((q) => (
                <option key={q.id} value={q.id}>{q.codigo}</option>
              ))}
            </select>
            {ambienteId && equipos.data?.length === 0 && <small className="sub">Este ambiente no tiene equipos registrados.</small>}
          </div>

          <fieldset className="campo">
            <legend>¿A qué técnico se la envías?</legend>
            {tecnicos.cargando && !tecnicos.data && !tecnicos.error && <small className="sub">Cargando técnicos…</small>}
            {tecnicos.error && (
              <div className="alerta error" role="alert">
                <p>
                  No se pudo cargar la lista de técnicos. Si es la primera vez, ejecuta el archivo
                  <strong> 002_instructor_elige_tecnico.sql </strong> en el SQL Editor de Supabase.
                </p>
                <small>{tecnicos.error.message}</small>
                <button type="button" className="boton secundario" onClick={tecnicos.recargar}>Reintentar</button>
              </div>
            )}
            {tecnicos.data?.length === 0 && (
              <p className="alerta aviso">No hay técnicos activos todavía. El líder asignará tu solicitud.</p>
            )}
            {tecnicos.data?.length > 0 && (
              <div className="tecnicos">
                {tecnicos.data.map((t) => (
                  <label key={t.id} className="tecnico">
                    <input type="radio" name="tecnico" value={t.id} checked={tecnicoId === t.id} onChange={() => setTecnicoId(t.id)} />
                    <span className="avatar" aria-hidden="true">{t.nombre[0]?.toUpperCase()}</span>
                    <span>
                      <span className="tecnico__nombre">{t.nombre}</span>
                      <span className="tecnico__comp">{t.competencias.length > 0 ? t.competencias.join(', ') : 'Soporte general'}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {tecnicos.data?.length > 0 && <small className="sub">Quedará Pendiente y asignada a este técnico.</small>}
          </fieldset>

          <div className="campo">
            <label htmlFor={ids.descripcion}>Descripción del problema</label>
            <textarea id={ids.descripcion} rows={4} value={descripcion} required onChange={(e) => setDescripcion(e.target.value)} />
            <small className="sub">Describe qué falla y cuándo ocurre (mínimo 10 caracteres).</small>
          </div>

          <div className="campo">
            <label htmlFor={ids.observaciones}>
              Observaciones <span className="opcional">(opcional)</span>
            </label>
            <textarea id={ids.observaciones} rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>

          {guardar.error && <p className="alerta error" role="alert">{guardar.error}</p>}
          <div className="acciones-fila">
            <button className="boton primario" disabled={guardar.cargando || !equipoId || !descripcionValida || (tecnicos.data?.length > 0 && !tecnicoId)}>
              {guardar.cargando ? 'Enviando…' : 'Enviar solicitud'}
            </button>
            <Link to="/instructor" className="boton secundario">Cancelar</Link>
          </div>
        </form>
      )}
    </>
  )
}
