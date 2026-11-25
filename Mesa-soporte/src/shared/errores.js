// Convierte errores de Supabase/Postgres en un mensaje entendible para el usuario.
// Los mensajes de las funciones RPC (raise exception) ya están en español.
export function mensajeError(error) {
  if (!error) return ''
  const msg = error.message ?? String(error)
  if (/Invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.'
  if (/Email not confirmed/i.test(msg))
    return 'Supabase aún exige confirmar el correo. Desactiva «Confirm email» en Authentication > Providers > Email y ejecuta el script SQL.'
  if (/Database error saving new user/i.test(msg))
    return 'No se pudo crear el perfil del usuario. Ejecuta de nuevo el script SQL de la base de datos.'
  if (/rate limit/i.test(msg)) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (/Password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.'
  if (/User already registered/i.test(msg)) return 'Ya existe una cuenta con ese correo.'
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'No hay conexión con el servidor. Revisa tu internet.'
  if (/row-level security/i.test(msg)) return 'No tienes permiso para realizar esta acción.'
  return msg
}
