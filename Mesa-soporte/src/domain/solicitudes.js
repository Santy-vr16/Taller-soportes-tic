// Utilidades puras sobre los datos de una solicitud.

// La asignación vigente es la más reciente.
export function asignacionActual(asignaciones = []) {
  return [...asignaciones].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id,
  )[0] ?? null
}

export function nombreEspecialista(asignaciones) {
  return asignacionActual(asignaciones)?.especialista?.nombre ?? null
}
