const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export function formatearFecha(iso) {
  return iso ? formatoFecha.format(new Date(iso)) : ''
}

export function resumir(texto = '', max = 90) {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio
}
