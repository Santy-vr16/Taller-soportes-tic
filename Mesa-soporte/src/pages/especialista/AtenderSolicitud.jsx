import { useParams } from 'react-router-dom'
import { useSolicitud } from '../../hooks/useSolicitud'
import DetalleSolicitud from '../../components/DetalleSolicitud'
import AccionConTexto from '../../components/acciones/AccionConTexto'
import { Cargando, MensajeError } from '../../components/Feedback'
import { ESTADO, puedeTransicionar } from '../../domain/estados'
import { agregarObservacion, resolverSolicitud, solicitarEscalamiento } from '../../services/accionesService'

const ROL = 'especialista'

export default function AtenderSolicitud() {
  const { id } = useParams()
  const { data, error, cargando, recargar } = useSolicitud(id)

  if (error) return <MensajeError error={error} onReintentar={recargar} />
  if (cargando && !data) return <Cargando />

  const { estado } = data.solicitud
  const solicitudId = data.solicitud.id
  const enAtencion = estado === ESTADO.PENDIENTE

  return (
    <DetalleSolicitud detalle={data} volverA="/especialista" textoVolver="Pendientes">
      {enAtencion && (
        <AccionConTexto
          titulo="Registrar acción realizada"
          ayuda="Anota lo que revisaste o probaste en el equipo."
          etiqueta="Acción realizada"
          boton="Guardar acción"
          variante="secundario"
          onEnviar={(texto) => agregarObservacion(solicitudId, texto, 'accion')}
          onListo={recargar}
        />
      )}

      {puedeTransicionar(ROL, estado, ESTADO.RESUELTO) && (
        <AccionConTexto
          titulo="Finalizar: problema resuelto"
          ayuda="El caso quedará como Resuelto y el líder verificará el cierre."
          etiqueta="Solución aplicada"
          boton="Marcar como resuelto"
          onEnviar={(texto) => resolverSolicitud(solicitudId, texto)}
          onListo={recargar}
        />
      )}

      {puedeTransicionar(ROL, estado, ESTADO.REQUIERE_ESCALAMIENTO) && (
        <AccionConTexto
          titulo="No pude resolverlo"
          ayuda="Explica el motivo y qué intentaste. El líder decidirá a qué área remitirlo."
          etiqueta="Motivo y acciones realizadas"
          boton="Solicitar escalamiento"
          variante="peligro"
          onEnviar={(texto) => solicitarEscalamiento(solicitudId, texto)}
          onListo={recargar}
        />
      )}
    </DetalleSolicitud>
  )
}
