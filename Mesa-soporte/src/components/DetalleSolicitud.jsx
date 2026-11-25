import { Link } from 'react-router-dom'
import EstadoBadge from './EstadoBadge'
import LineaTiempo from './LineaTiempo'
import { ESTADOS_INFO } from '../domain/estados'
import { nombreEspecialista } from '../domain/solicitudes'
import { formatearFecha } from '../shared/formato'

// Vista de solo lectura de una solicitud. Las acciones de cada rol llegan como `children`.
export default function DetalleSolicitud({ detalle, volverA, textoVolver, children }) {
  const { solicitud: s, asignaciones } = detalle
  const ambiente = s.equipo?.ambiente

  return (
    <>
      <Link to={volverA} className="volver">
        ← {textoVolver}
      </Link>

      <header className="pagina-encabezado">
        <div>
          <h1>Solicitud #{s.id}</h1>
          <p className="ayuda">{ESTADOS_INFO[s.estado]?.ayuda}</p>
        </div>
        <EstadoBadge estado={s.estado} />
      </header>

      <div className="detalle">
        <div className="detalle__principal">
          <section className="tarjeta" aria-labelledby="titulo-datos">
            <h2 id="titulo-datos">Incidente</h2>
            <dl className="datos">
              <div>
                <dt>Ambiente</dt>
                <dd>
                  {ambiente?.nombre}
                  {ambiente?.ubicacion && <small className="sub">{ambiente.ubicacion}</small>}
                </dd>
              </div>
              <div>
                <dt>Equipo</dt>
                <dd>{s.equipo?.codigo}</dd>
              </div>
              <div>
                <dt>Reportado por</dt>
                <dd>{s.instructor?.nombre ?? '—'}</dd>
              </div>
              <div>
                <dt>Especialista</dt>
                <dd>{nombreEspecialista(asignaciones) ?? 'Sin asignar'}</dd>
              </div>
              <div>
                <dt>Creada</dt>
                <dd>{formatearFecha(s.created_at)}</dd>
              </div>
            </dl>
            <h3>Descripción del problema</h3>
            <p className="texto-largo">{s.descripcion}</p>
            {s.observaciones && (
              <>
                <h3>Observaciones del instructor</h3>
                <p className="texto-largo">{s.observaciones}</p>
              </>
            )}
          </section>

          {children}
        </div>

        <aside className="detalle__lateral">
          <LineaTiempo detalle={detalle} />
        </aside>
      </div>
    </>
  )
}
