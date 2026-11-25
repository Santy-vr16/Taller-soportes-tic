import { useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'
import { AuthContext } from './authContext'

// Sesión de Supabase + perfil (rol) del usuario.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = aún leyendo la sesión
  const [perfilState, setPerfilState] = useState({ userId: null, perfil: null, error: null })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    // Solo se guarda la sesión aquí; no se hacen consultas dentro del callback.
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSession(nueva))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId) return
    let activo = true
    supabase
      .from('perfiles')
      .select('id, nombre, rol, activo')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!activo) return
        setPerfilState({
          userId,
          perfil: data,
          error: error?.message ?? (data ? null : 'Tu usuario no tiene un perfil asignado.'),
        })
      })
    return () => {
      activo = false
    }
  }, [userId])

  const perfilListo = perfilState.userId === userId
  const perfil = userId && perfilListo ? perfilState.perfil : null
  const cargando = session === undefined || (Boolean(userId) && !perfilListo)

  const value = {
    session,
    perfil,
    rol: perfil?.activo ? perfil.rol : null,
    cargando,
    errorPerfil: userId && perfilListo ? perfilState.error : null,
    cuentaInactiva: Boolean(perfil) && !perfil.activo,
    iniciarSesion: (correo, clave) => supabase.auth.signInWithPassword({ email: correo, password: clave }),
    registrarse: (correo, clave, nombre) =>
      supabase.auth.signUp({ email: correo, password: clave, options: { data: { nombre } } }),
    cerrarSesion: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
