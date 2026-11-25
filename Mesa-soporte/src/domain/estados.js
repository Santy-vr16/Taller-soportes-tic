// Reglas de estados de las solicitudes.
// Espejo de la tabla `transiciones_estado` de la base de datos: sirve para decidir
// qué acciones mostrar en pantalla. La validación real ocurre en Supabase (RPC + RLS).

export const ESTADO = {
  NUEVO: 'nuevo',
  PENDIENTE: 'pendiente',
  RESUELTO: 'resuelto',
  REQUIERE_ESCALAMIENTO: 'requiere_escalamiento',
  ESCALADO: 'escalado',
  CERRADO: 'cerrado',
}

export const ESTADOS_INFO = {
  [ESTADO.NUEVO]: { etiqueta: 'Nuevo', ayuda: 'Esperando revisión del líder' },
  [ESTADO.PENDIENTE]: { etiqueta: 'Pendiente', ayuda: 'Asignada a un especialista' },
  [ESTADO.RESUELTO]: { etiqueta: 'Resuelto', ayuda: 'El especialista aplicó una solución' },
  [ESTADO.REQUIERE_ESCALAMIENTO]: {
    etiqueta: 'Requiere escalamiento',
    ayuda: 'El líder debe evaluar su remisión a otra área',
  },
  [ESTADO.ESCALADO]: { etiqueta: 'Escalado', ayuda: 'Remitida a otra área o equipo técnico' },
  [ESTADO.CERRADO]: { etiqueta: 'Cerrado', ayuda: 'Atención finalizada' },
}

export const ORDEN_ESTADOS = Object.values(ESTADO)

export const TRANSICIONES = [
  { desde: ESTADO.NUEVO, hacia: ESTADO.PENDIENTE, rol: 'lider' },
  { desde: ESTADO.PENDIENTE, hacia: ESTADO.RESUELTO, rol: 'especialista' },
  { desde: ESTADO.PENDIENTE, hacia: ESTADO.REQUIERE_ESCALAMIENTO, rol: 'especialista' },
  { desde: ESTADO.REQUIERE_ESCALAMIENTO, hacia: ESTADO.ESCALADO, rol: 'lider' },
  { desde: ESTADO.RESUELTO, hacia: ESTADO.CERRADO, rol: 'lider' },
  { desde: ESTADO.ESCALADO, hacia: ESTADO.CERRADO, rol: 'lider' },
]

export function puedeTransicionar(rol, desde, hacia) {
  return TRANSICIONES.some((t) => t.rol === rol && t.desde === desde && t.hacia === hacia)
}

export const TIPO_OBSERVACION = {
  comentario: 'Comentario',
  accion: 'Acción realizada',
  solucion: 'Solución aplicada',
  motivo_escalamiento: 'Motivo de escalamiento',
  cierre: 'Observación de cierre',
}
