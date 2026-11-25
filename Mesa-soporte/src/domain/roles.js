export const ROL = {
  INSTRUCTOR: 'instructor',
  LIDER: 'lider',
  ESPECIALISTA: 'especialista',
}

export const ETIQUETA_ROL = {
  instructor: 'Instructor',
  lider: 'Líder de soporte',
  especialista: 'Especialista de soporte',
}

export const RUTA_INICIAL = {
  instructor: '/instructor',
  lider: '/lider',
  especialista: '/especialista',
}

export const NAVEGACION = {
  instructor: [
    { a: '/instructor', texto: 'Mis solicitudes', exacta: true },
    { a: '/instructor/nueva', texto: 'Nueva solicitud' },
  ],
  lider: [{ a: '/lider', texto: 'Solicitudes', exacta: true }],
  especialista: [
    { a: '/especialista', texto: 'Pendientes', exacta: true },
    { a: '/especialista/historial', texto: 'Historial' },
  ],
}

export function rutaInicial(rol) {
  return RUTA_INICIAL[rol] ?? '/login'
}
