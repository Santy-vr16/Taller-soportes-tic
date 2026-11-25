import { useParams } from 'react-router-dom'
import { useSolicitud } from '../../hooks/useSolicitud'
import DetalleSolicitud from '../../components/DetalleSolicitud'
import { Cargando, MensajeError } from '../../components/Feedback'

// El instructor solo consulta: no tiene acciones sobre la solicitud una vez creada.
export default function SeguimientoSolicitud() {
  const { id } = useParams()
  const { data, error, cargando, recargar } = useSolicitud(id)

  if (error) return <MensajeError error={error} onReintentar={recargar} />
  if (cargando && !data) return <Cargando />
  return <DetalleSolicitud detalle={data} volverA="/instructor" textoVolver="Mis solicitudes" />
}
