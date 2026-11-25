import { Link } from 'react-router-dom'
import EstadoBadge from './EstadoBadge'
import { nombreEspecialista } from '../domain/solicitudes'
import { formatearFecha, resumir } from '../shared/formato'

// `rutaBase` es el prefijo de detalle del rol, p. ej. "/lider/solicitudes".
export default function TablaSolicitudes({ solicitudes, rutaBase, mostrarInstructor, mostrarEspecialista }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th scope="col">N.º</th>
            <th scope="col">Ambiente y equipo</th>
            <th scope="col">Problema</th>
            {mostrarInstructor && <th scope="col">Instructor</th>}
            {mostrarEspecialista && <th scope="col">Especialista</th>}
            <th scope="col">Estado</th>
            <th scope="col">Actualizada</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => (
            <tr key={s.id} className={`fila estado-${s.estado}`}>
              <td>
                <Link to={`${rutaBase}/${s.id}`} aria-label={`Abrir solicitud ${s.id}`}>
                  #{s.id}
                </Link>
              </td>
              <td>
                {s.equipo?.ambiente?.nombre}
                <small className="sub">Equipo {s.equipo?.codigo}</small>
              </td>
              <td className="celda-texto">{resumir(s.descripcion)}</td>
              {mostrarInstructor && <td>{s.instructor?.nombre ?? '—'}</td>}
              {mostrarEspecialista && <td>{nombreEspecialista(s.asignaciones) ?? 'Sin asignar'}</td>}
              <td>
                <EstadoBadge estado={s.estado} />
              </td>
              <td>{formatearFecha(s.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
