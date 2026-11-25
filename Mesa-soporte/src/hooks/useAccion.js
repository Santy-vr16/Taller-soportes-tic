import { useCallback, useState } from 'react'
import { mensajeError } from '../shared/errores'

// Envuelve una acción asíncrona (rpc, insert...) con estado de carga y error.
export function useAccion(accion) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const ejecutar = useCallback(
    async (...args) => {
      setCargando(true)
      setError('')
      try {
        const resultado = await accion(...args)
        return { ok: true, resultado }
      } catch (e) {
        setError(mensajeError(e))
        return { ok: false }
      } finally {
        setCargando(false)
      }
    },
    [accion],
  )

  return { ejecutar, cargando, error }
}
