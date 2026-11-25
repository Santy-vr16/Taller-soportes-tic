import { ESTADOS_INFO } from '../domain/estados'

export default function EstadoBadge({ estado }) {
  return <span className={`insignia estado-${estado}`}>{ESTADOS_INFO[estado]?.etiqueta ?? estado}</span>
}
