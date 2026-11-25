export function Cargando({ texto = 'Cargando' }) {
  return (
    <p className="cargando" role="status">
      {texto}…
    </p>
  )
}

export function MensajeError({ error, onReintentar }) {
  const texto = error?.message ?? String(error)
  return (
    <div className="alerta error" role="alert">
      <p>{texto}</p>
      {onReintentar && (
        <button className="boton secundario" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function Vacio({ titulo, children }) {
  return (
    <div className="vacio">
      <h2>{titulo}</h2>
      {children}
    </div>
  )
}
