import { ESTADOS_INFO, TIPO_OBSERVACION } from '../domain/estados'
import { ETIQUETA_ROL } from '../domain/roles'
import { formatearFecha } from '../shared/formato'

const PRIORIDAD = { estado: 0, asignacion: 1, escalamiento: 2, observacion: 3 }

// Une historial, asignaciones, escalamientos y observaciones en un solo recorrido del caso.
// Las acciones de una misma operación comparten fecha, así que se desempata por tipo.
function construirEventos({ historial, asignaciones, escalamientos, observaciones }) {
  const eventos = [
    ...historial.map((h) => ({
      clave: `h${h.id}`,
      tipo: 'estado',
      id: h.id,
      fecha: h.created_at,
      clase: `estado-${h.estado_nuevo}`,
      titulo: h.estado_anterior
        ? `${ESTADOS_INFO[h.estado_anterior].etiqueta} → ${ESTADOS_INFO[h.estado_nuevo].etiqueta}`
        : 'Solicitud creada',
      autor: h.usuario?.nombre,
    })),
    ...asignaciones.map((a) => ({
      clave: `a${a.id}`,
      tipo: 'asignacion',
      id: a.id,
      fecha: a.created_at,
      titulo: `Asignada a ${a.especialista?.nombre ?? 'un especialista'}`,
      autor: a.asignador?.nombre,
    })),
    ...escalamientos.map((e) => ({
      clave: `e${e.id}`,
      tipo: 'escalamiento',
      id: e.id,
      fecha: e.created_at,
      titulo: `Escalada al área: ${e.area?.nombre}`,
      texto: e.motivo,
      autor: e.escalador?.nombre,
    })),
    ...observaciones.map((o) => ({
      clave: `o${o.id}`,
      tipo: 'observacion',
      id: o.id,
      fecha: o.created_at,
      titulo: TIPO_OBSERVACION[o.tipo] ?? 'Observación',
      texto: o.texto,
      autor: o.autor?.nombre,
      rolAutor: o.autor?.rol,
    })),
  ]
  return eventos.sort(
    (x, y) => new Date(x.fecha) - new Date(y.fecha) || PRIORIDAD[x.tipo] - PRIORIDAD[y.tipo] || x.id - y.id,
  )
}

export default function LineaTiempo({ detalle }) {
  const eventos = construirEventos(detalle)

  return (
    <section aria-labelledby="titulo-tiempo">
      <h2 id="titulo-tiempo">Seguimiento del caso</h2>
      <ol className="tiempo">
        {eventos.map((e) => (
          <li key={e.clave} className={`tiempo__item tipo-${e.tipo} ${e.clase ?? ''}`}>
            <p className="tiempo__titulo">{e.titulo}</p>
            {e.texto && <p className="tiempo__texto">{e.texto}</p>}
            <p className="tiempo__meta">
              {[e.autor ?? (e.rolAutor && ETIQUETA_ROL[e.rolAutor]), formatearFecha(e.fecha)]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
