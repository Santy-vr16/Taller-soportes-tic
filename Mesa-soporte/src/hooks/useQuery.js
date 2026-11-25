import { useCallback, useEffect, useRef, useState } from 'react'

// Ejecuta una consulta asíncrona y entrega { data, error, cargando, recargar }.
// `clave` identifica la consulta: si cambia, se vuelve a ejecutar.
export function useQuery(clave, consulta) {
  const consultaRef = useRef(consulta)
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState({ clave: null, version: -1, data: null, error: null })

  useEffect(() => {
    consultaRef.current = consulta
  })

  useEffect(() => {
    let activo = true
    consultaRef
      .current()
      .then((data) => {
        if (activo) setResultado({ clave, version, data, error: null })
      })
      .catch((error) => {
        if (activo) setResultado({ clave, version, data: null, error })
      })
    return () => {
      activo = false
    }
  }, [clave, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const vigente = resultado.clave === clave

  return {
    data: vigente ? resultado.data : null,
    error: vigente ? resultado.error : null,
    cargando: !(vigente && resultado.version === version),
    recargar,
  }
}
