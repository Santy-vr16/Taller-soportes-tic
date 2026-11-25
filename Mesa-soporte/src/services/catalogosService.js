import { supabase } from '../api/supabaseClient'

async function consultar(consulta) {
  const { data, error } = await consulta
  if (error) throw error
  return data
}

export const listarAmbientes = () =>
  consultar(supabase.from('ambientes').select('id, nombre, ubicacion').order('nombre'))

export const listarEquiposPorAmbiente = (ambienteId) =>
  consultar(supabase.from('equipos').select('id, codigo').eq('ambiente_id', ambienteId).order('codigo'))

export const listarAreas = () =>
  consultar(supabase.from('areas_soporte').select('id, nombre').order('nombre'))

// Técnicos (especialistas activos) para que el instructor dirija su solicitud.
export async function listarTecnicos() {
  const { data, error } = await supabase.rpc('listar_tecnicos')
  if (error) throw error
  return data.map((t) => ({ id: t.id, nombre: t.nombre, competencias: t.competencias ?? [] }))
}

// Especialistas activos con sus competencias (para que el líder elija con criterio).
export async function listarEspecialistas() {
  const data = await consultar(
    supabase
      .from('perfiles')
      .select('id, nombre, perfil_competencias(competencia:competencias(nombre))')
      .eq('rol', 'especialista')
      .eq('activo', true)
      .order('nombre'),
  )
  return data.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    competencias: p.perfil_competencias.map((c) => c.competencia.nombre),
  }))
}
