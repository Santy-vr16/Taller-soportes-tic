import { useId, useState } from 'react'
import { useAccion } from '../../hooks/useAccion'

// Panel genérico: un campo de texto y un botón que ejecuta una acción sobre la solicitud.
export default function AccionConTexto({
  titulo,
  ayuda,
  etiqueta,
  boton,
  requerido = true,
  variante = 'primario',
  onEnviar,
  onListo,
}) {
  const id = useId()
  const [texto, setTexto] = useState('')
  const { ejecutar, cargando, error } = useAccion(onEnviar)

  async function enviar(evento) {
    evento.preventDefault()
    const { ok } = await ejecutar(texto.trim())
    if (ok) {
      setTexto('')
      onListo?.()
    }
  }

  return (
    <form className="tarjeta panel-accion" onSubmit={enviar}>
      <h2>{titulo}</h2>
      {ayuda && <p className="ayuda">{ayuda}</p>}
      <div className="campo">
        <label htmlFor={id}>
          {etiqueta}
          {!requerido && <span className="opcional"> (opcional)</span>}
        </label>
        <textarea id={id} rows={3} value={texto} required={requerido} onChange={(e) => setTexto(e.target.value)} />
      </div>
      {error && (
        <p className="alerta error" role="alert">
          {error}
        </p>
      )}
      <button className={`boton ${variante}`} disabled={cargando || (requerido && !texto.trim())}>
        {cargando ? 'Guardando…' : boton}
      </button>
    </form>
  )
}
