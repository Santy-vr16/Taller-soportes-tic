import { useQuery } from './useQuery'
import { listarSolicitudes } from '../services/solicitudesService'

export function useSolicitudes() {
  return useQuery('solicitudes', listarSolicitudes)
}
