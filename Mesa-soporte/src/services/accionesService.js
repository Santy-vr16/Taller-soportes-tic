// Acciones que cambian el estado o el seguimiento de una solicitud.
// Cada una llama a una función RPC de Supabase, que valida rol, asignación y transición.
import { supabase } from '../api/supabaseClient'

async function rpc(nombre, args) {
  const { error } = await supabase.rpc(nombre, args)
  if (error) throw error
}

// Líder
export const asignarSolicitud = (solicitudId, especialistaId) =>
  rpc('asignar_solicitud', { p_solicitud: solicitudId, p_especialista: especialistaId })

export const escalarSolicitud = (solicitudId, areaId, motivo) =>
  rpc('escalar_solicitud', { p_solicitud: solicitudId, p_area: areaId, p_motivo: motivo })

export const cerrarSolicitud = (solicitudId, observacion) =>
  rpc('cerrar_solicitud', { p_solicitud: solicitudId, p_observacion: observacion || null })

// Especialista
export const resolverSolicitud = (solicitudId, solucion) =>
  rpc('resolver_solicitud', { p_solicitud: solicitudId, p_solucion: solucion })

export const solicitarEscalamiento = (solicitudId, motivo) =>
  rpc('solicitar_escalamiento', { p_solicitud: solicitudId, p_motivo: motivo })

// Líder y especialista asignado
export const agregarObservacion = (solicitudId, texto, tipo = 'comentario') =>
  rpc('agregar_observacion', { p_solicitud: solicitudId, p_texto: texto, p_tipo: tipo })
