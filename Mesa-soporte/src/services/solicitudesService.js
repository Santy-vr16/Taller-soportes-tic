import { supabase } from '../api/supabaseClient'

const SELECT_LISTA = `
  id, descripcion, estado, created_at, updated_at,
  instructor:perfiles(id, nombre),
  equipo:equipos(id, codigo, ambiente:ambientes(id, nombre)),
  asignaciones(id, created_at, especialista:perfiles!especialista_id(id, nombre))
`

const SELECT_DETALLE = `
  id, descripcion, observaciones, estado, created_at, updated_at,
  instructor:perfiles(id, nombre),
  equipo:equipos(id, codigo, ambiente:ambientes(id, nombre, ubicacion))
`

function lanzarSiError({ data, error }) {
  if (error) throw error
  return data
}

// El alcance (propias / asignadas / todas) lo define RLS según el rol del usuario.
export async function listarSolicitudes() {
  return lanzarSiError(
    await supabase.from('solicitudes').select(SELECT_LISTA).order('created_at', { ascending: false }),
  )
}

// Si se indica especialistaId, la solicitud nace asignada a ese técnico (Pendiente);
// si no, queda Nuevo y el líder la asigna.
export async function crearSolicitud({ equipoId, ambienteId, descripcion, observaciones, especialistaId }) {
  const id = lanzarSiError(
    await supabase.rpc('crear_solicitud', {
      p_ambiente: Number(ambienteId),
      p_equipo: Number(equipoId),
      p_descripcion: descripcion.trim(),
      p_observaciones: observaciones?.trim() || null,
      p_especialista: especialistaId || null,
    }),
  )
  return { id }
}

// Solicitud + todo su seguimiento (asignaciones, observaciones, escalamientos, historial).
export async function obtenerDetalle(id) {
  const [solicitud, asignaciones, observaciones, escalamientos, historial] = await Promise.all([
    supabase.from('solicitudes').select(SELECT_DETALLE).eq('id', id).maybeSingle(),
    supabase
      .from('asignaciones')
      .select('id, created_at, especialista:perfiles!especialista_id(id, nombre), asignador:perfiles!asignado_por(id, nombre)')
      .eq('solicitud_id', id),
    supabase
      .from('observaciones')
      .select('id, tipo, texto, created_at, autor:perfiles(id, nombre, rol)')
      .eq('solicitud_id', id),
    supabase
      .from('escalamientos')
      .select('id, motivo, created_at, area:areas_soporte(id, nombre), escalador:perfiles(id, nombre)')
      .eq('solicitud_id', id),
    supabase
      .from('historial_estados')
      .select('id, estado_anterior, estado_nuevo, created_at, usuario:perfiles(id, nombre)')
      .eq('solicitud_id', id),
  ])

  const base = lanzarSiError(solicitud)
  if (!base) throw new Error('La solicitud no existe o no tienes acceso a ella.')

  return {
    solicitud: base,
    asignaciones: lanzarSiError(asignaciones),
    observaciones: lanzarSiError(observaciones),
    escalamientos: lanzarSiError(escalamientos),
    historial: lanzarSiError(historial),
  }
}
