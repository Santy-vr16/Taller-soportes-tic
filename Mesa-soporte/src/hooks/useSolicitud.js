import { useQuery } from './useQuery'
import { obtenerDetalle } from '../services/solicitudesService'

export function useSolicitud(id) {
  return useQuery(`solicitud:${id}`, () => obtenerDetalle(id))
}
