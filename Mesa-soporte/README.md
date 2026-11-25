# Mesa de soporte técnico

Aplicación web para reportar, asignar y dar seguimiento a incidentes tecnológicos en los ambientes de formación.
React + Vite en el frontend, Supabase (PostgreSQL + Auth) como backend.

## Puesta en marcha

1. Instala dependencias: `npm install`
2. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. En Supabase > SQL Editor ejecuta `supabase/migrations/001_mesa_soporte.sql` y después `002_instructor_elige_tecnico.sql`.
4. Crea usuarios (Authentication > Users, o con «No tengo cuenta» en el login).
   Todos nacen como **instructor**. Para crear al líder y a los especialistas:
   ```sql
   update perfiles set rol = 'lider'        where id = '<UUID del usuario>';
   update perfiles set rol = 'especialista' where id = '<UUID del usuario>';
   ```
5. `npm run dev`

> **Sin verificación de correo:** el script SQL ya confirma automáticamente cada cuenta nueva.
> Además, en Authentication > Providers > Email desactiva «Confirm email» para que Supabase no intente enviar correos.
> Así el usuario inicia sesión apenas se registra.

## Arquitectura

```
src/
├── api/supabaseClient.js    # cliente único de Supabase
├── auth/                    # sesión, perfil/rol y rutas protegidas
├── domain/                  # reglas puras: estados, transiciones, roles
├── services/                # ÚNICA capa que habla con Supabase
├── hooks/                   # useQuery, useAccion, useSolicitud(es)
├── components/              # UI reutilizable (+ acciones/ por tipo de acción)
├── pages/{instructor,lider,especialista}/   # una carpeta por rol
└── shared/                  # formato de fechas y mensajes de error
```

Flujo: página → hook → servicio → Supabase. Las páginas no importan `supabase` directamente.

## Dónde se hacen cumplir las reglas

- **Transiciones de estado:** tabla `transiciones_estado` + función interna `_cambiar_estado`.
- **Acciones:** funciones RPC (`asignar_solicitud`, `resolver_solicitud`, `solicitar_escalamiento`,
  `escalar_solicitud`, `cerrar_solicitud`, `agregar_observacion`, `crear_solicitud`, `listar_tecnicos`). La tabla `solicitudes` no admite UPDATE directo.
- **Visibilidad:** RLS. El instructor ve lo suyo, el especialista lo asignado y el líder todo.
- **Historial:** se registra automáticamente en `historial_estados`.

La interfaz solo oculta botones según rol y estado; aunque alguien manipule el cliente, la base de datos rechaza lo no permitido.

## Cómo extender

- Nueva área de escalamiento: `insert into areas_soporte (nombre) values (...)`.
- Nuevo estado o transición: `transiciones_estado` (SQL) y `domain/estados.js`.
- Nuevas categorías de incidente, reportes o notificaciones: agregar tabla/módulo sin tocar el flujo existente.
