import { useId, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { rutaInicial } from '../domain/roles'
import { useAccion } from '../hooks/useAccion'
import { mensajeError } from '../shared/errores'

const PASOS = [
  ['El instructor reporta', 'la falla del equipo y puede dirigirla a un técnico específico.'],
  ['El líder asigna', 'los casos que llegan sin técnico y supervisa todo el proceso.'],
  ['El técnico (especialista) atiende', 'y registra la solución o pide escalarlo a otra área.'],
]

export default function Login() {
  const { session, rol, cargando, iniciarSesion, registrarse } = useAuth()
  const idNombre = useId()
  const idCorreo = useId()
  const idClave = useId()
  const [modoRegistro, setModoRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')

  const acceder = useAccion(async () => {
    const email = correo.trim().toLowerCase()

    if (!modoRegistro) {
      const { error } = await iniciarSesion(email, clave)
      if (error) throw error
      return
    }

    const { data, error } = await registrarse(email, clave, nombre.trim())
    if (error) throw error
    // Con la confirmación de correo activa, Supabase "crea" un usuario sin identidades
    // cuando el correo ya existe (no devuelve error por seguridad).
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('Ya existe una cuenta con ese correo.')
    }
    // Sin confirmación de correo, signUp ya devuelve la sesión y el usuario entra directo.
    // Si no la devolvió, se intenta iniciar sesión de inmediato con las mismas credenciales.
    if (!data.session) {
      const { error: errorSesion } = await iniciarSesion(email, clave)
      if (errorSesion) throw errorSesion
    }
  })

  if (session && !cargando) return <Navigate to={rol ? rutaInicial(rol) : '/'} replace />

  async function enviar(evento) {
    evento.preventDefault()
    await acceder.ejecutar()
  }

  return (
    <div className="login">
      <section className="login__intro">
        <h1>Mesa de soporte técnico</h1>
        <p>Gestión de incidentes tecnológicos en los ambientes de formación.</p>
        <ol className="pasos">
          {PASOS.map(([fuerte, resto]) => (
            <li key={fuerte}>
              <strong>{fuerte}</strong> {resto}
            </li>
          ))}
        </ol>
      </section>

      <div className="login__lado">
      <form className="tarjeta login__form" onSubmit={enviar}>
        <h2>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        {modoRegistro && (
          <div className="campo">
            <label htmlFor={idNombre}>Nombre completo</label>
            <input id={idNombre} value={nombre} required autoComplete="name" onChange={(e) => setNombre(e.target.value)} />
          </div>
        )}
        <div className="campo">
          <label htmlFor={idCorreo}>Correo</label>
          <input id={idCorreo} type="email" value={correo} required autoComplete="email" onChange={(e) => setCorreo(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor={idClave}>Contraseña</label>
          <input
            id={idClave}
            type="password"
            value={clave}
            required
            minLength={6}
            autoComplete={modoRegistro ? 'new-password' : 'current-password'}
            onChange={(e) => setClave(e.target.value)}
          />
        </div>
        {modoRegistro && (
          <small className="sub">
            Las cuentas nuevas se crean como instructor. El rol de líder o técnico lo habilita el administrador.
          </small>
        )}
        {acceder.error && <p className="alerta error" role="alert">{acceder.error}</p>}
        <button className="boton primario" disabled={acceder.cargando}>
          {acceder.cargando ? 'Procesando…' : modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
        <button
          type="button"
          className="boton enlace"
          onClick={() => setModoRegistro((m) => !m)}
        >
          {modoRegistro ? 'Ya tengo cuenta' : 'No tengo cuenta'}
        </button>
      </form>
      </div>
    </div>
  )
}
