import { useParams } from 'react-router-dom'
import { useSolicitud } from '../../hooks/useSolicitud'
import DetalleSolicitud from '../../components/DetalleSolicitud'
import AccionConTexto from '../../components/acciones/AccionConTexto'
import AsignarEspecialista from '../../components/acciones/AsignarEspecialista'
import EscalarSolicitud from '../../components/acciones/EscalarSolicitud'
import { Cargando, MensajeError } from '../../components/Feedback'
import { ESTADO, puedeTransicionar } from '../../domain/estados'
import { agregarObservacion, cerrarSolicitud } from '../../services/accionesService'

const ROL = 'lider'

export default function GestionarSolicitud() {
  const { id } = useParams()
  const { data, error, cargando, recargar } = useSolicitud(id)

  if (error) return <MensajeError error={error} onReintentar={recargar} />
  if (cargando && !data) return <Cargando />

  const { estado } = data.solicitud
  const solicitudId = data.solicitud.id

  return (
    <DetalleSolicitud detalle={data} volverA="/lider" textoVolver="Solicitudes">
      {puedeTransicionar(ROL, estado, ESTADO.PENDIENTE) && (
        <AsignarEspecialista solicitudId={solicitudId} onListo={recargar} />
      )}

      {puedeTransicionar(ROL, estado, ESTADO.ESCALADO) && (
        <EscalarSolicitud solicitudId={solicitudId} onListo={recargar} />
      )}

      {puedeTransicionar(ROL, estado, ESTADO.CERRADO) && (
        <AccionConTexto
          titulo="Cerrar solicitud"
          ayuda={
            estado === ESTADO.RESUELTO
              ? 'Verifica la solución aplicada por el especialista antes de cerrar.'
              : 'Cierra el caso cuando el área responsable haya solucionado el incidente.'
          }
          etiqueta="Observación de cierre"
          requerido={false}
          boton="Cerrar solicitud"
          onEnviar={(texto) => cerrarSolicitud(solicitudId, texto)}
          onListo={recargar}
        />
      )}

      {estado !== ESTADO.CERRADO && (
        <AccionConTexto
          titulo="Agregar observación"
          etiqueta="Observación de seguimiento"
          boton="Guardar observación"
          variante="secundario"
          onEnviar={(texto) => agregarObservacion(solicitudId, texto, 'comentario')}
          onListo={recargar}
        />
      )}
    </DetalleSolicitud>
  )
}
