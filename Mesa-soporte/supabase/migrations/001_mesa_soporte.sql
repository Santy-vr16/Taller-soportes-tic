-- =====================================================================
-- MESA DE SOPORTE TÉCNICO - Esquema Supabase (PostgreSQL)
-- Ejecutar en: Supabase > SQL Editor
-- =====================================================================

-- ---------- 0. REINICIO OPCIONAL ----------
-- Si ya ejecutaste una versión anterior y te dio errores de "already exists",
-- quita los /* */ de este bloque para borrar todo y empezar limpio.
-- OJO: elimina las tablas de la app y sus datos (NO borra los usuarios de Auth).
/*
drop trigger  if exists on_auth_user_created      on auth.users;
drop trigger  if exists on_auth_user_autoconfirm  on auth.users;
drop table if exists historial_estados, escalamientos, observaciones, asignaciones,
                     solicitudes, equipos, ambientes, perfil_competencias, competencias,
                     areas_soporte, transiciones_estado, perfiles cascade;
drop function if exists asignar_solicitud(bigint, uuid), agregar_observacion(bigint, text, tipo_observacion),
                        resolver_solicitud(bigint, text), solicitar_escalamiento(bigint, text),
                        escalar_solicitud(bigint, bigint, text), cerrar_solicitud(bigint, text),
                        _cambiar_estado(bigint, estado_solicitud), _historial_inicial(),
                        es_especialista_asignado(bigint), rol_actual(), handle_new_user(),
                        autoconfirmar_usuario() cascade;
drop type if exists tipo_observacion, estado_solicitud, rol_usuario cascade;
*/

-- ---------- 1. TIPOS ----------
create type rol_usuario as enum ('instructor', 'lider', 'especialista');

create type estado_solicitud as enum (
  'nuevo', 'pendiente', 'resuelto',
  'requiere_escalamiento', 'escalado', 'cerrado'
);

create type tipo_observacion as enum (
  'comentario', 'accion', 'solucion', 'motivo_escalamiento', 'cierre'
);

-- ---------- 2. TABLAS ----------
-- Perfil de cada usuario (extiende auth.users de Supabase)
create table perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  rol        rol_usuario not null default 'instructor',
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

create table competencias (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

create table perfil_competencias (
  perfil_id      uuid   not null references perfiles(id) on delete cascade,
  competencia_id bigint not null references competencias(id) on delete cascade,
  primary key (perfil_id, competencia_id)
);

create table ambientes (
  id        bigint generated always as identity primary key,
  nombre    text not null unique,
  ubicacion text
);

create table equipos (
  id          bigint generated always as identity primary key,
  codigo      text   not null,
  ambiente_id bigint not null references ambientes(id),
  unique (codigo, ambiente_id),
  unique (id, ambiente_id)      -- permite validar equipo-ambiente en solicitudes
);

-- Áreas a las que se puede escalar (escalable a futuro)
create table areas_soporte (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

create table solicitudes (
  id            bigint generated always as identity primary key,
  instructor_id uuid   not null references perfiles(id),
  ambiente_id   bigint not null,
  equipo_id     bigint not null,
  descripcion   text   not null check (length(trim(descripcion)) >= 10),
  observaciones text,
  estado        estado_solicitud not null default 'nuevo',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- el equipo debe pertenecer al ambiente indicado
  foreign key (equipo_id, ambiente_id) references equipos(id, ambiente_id)
);

create table asignaciones (
  id              bigint generated always as identity primary key,
  solicitud_id    bigint not null references solicitudes(id) on delete cascade,
  especialista_id uuid   not null references perfiles(id),
  asignado_por    uuid   not null references perfiles(id),
  created_at      timestamptz not null default now()
);

create table observaciones (
  id           bigint generated always as identity primary key,
  solicitud_id bigint not null references solicitudes(id) on delete cascade,
  usuario_id   uuid   not null references perfiles(id),
  tipo         tipo_observacion not null default 'comentario',
  texto        text   not null check (length(trim(texto)) > 0),
  created_at   timestamptz not null default now()
);

create table escalamientos (
  id           bigint generated always as identity primary key,
  solicitud_id bigint not null references solicitudes(id) on delete cascade,
  area_id      bigint not null references areas_soporte(id),
  motivo       text   not null check (length(trim(motivo)) > 0),
  escalado_por uuid   not null references perfiles(id),
  created_at   timestamptz not null default now()
);

create table historial_estados (
  id              bigint generated always as identity primary key,
  solicitud_id    bigint not null references solicitudes(id) on delete cascade,
  estado_anterior estado_solicitud,
  estado_nuevo    estado_solicitud not null,
  usuario_id      uuid not null references perfiles(id),
  created_at      timestamptz not null default now()
);

-- Transiciones permitidas (reglas de negocio guardadas como datos)
create table transiciones_estado (
  desde estado_solicitud not null,
  hacia estado_solicitud not null,
  rol   rol_usuario      not null,
  primary key (desde, hacia, rol)
);

insert into transiciones_estado (desde, hacia, rol) values
  ('nuevo',                 'pendiente',             'lider'),
  ('pendiente',             'resuelto',              'especialista'),
  ('pendiente',             'requiere_escalamiento', 'especialista'),
  ('requiere_escalamiento', 'escalado',              'lider'),
  ('resuelto',              'cerrado',               'lider'),
  ('escalado',              'cerrado',               'lider');

-- Índices
create index on solicitudes (instructor_id);
create index on solicitudes (ambiente_id);
create index on solicitudes (equipo_id, ambiente_id);
create index on equipos (ambiente_id);
create index on perfil_competencias (competencia_id);
create index on asignaciones (asignado_por);
create index on observaciones (usuario_id);
create index on escalamientos (solicitud_id);
create index on escalamientos (area_id);
create index on escalamientos (escalado_por);
create index on historial_estados (usuario_id);
create index on solicitudes (estado);
create index on asignaciones (solicitud_id, created_at desc);
create index on asignaciones (especialista_id);
create index on observaciones (solicitud_id);
create index on historial_estados (solicitud_id);

-- ---------- 3. FUNCIONES AUXILIARES ----------
create or replace function rol_actual() returns rol_usuario
language sql stable security definer set search_path = public as $$
  select rol from perfiles where id = auth.uid() and activo;
$$;

create or replace function es_especialista_asignado(p_solicitud bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from (
      select especialista_id from asignaciones
      where solicitud_id = p_solicitud
      order by created_at desc, id desc limit 1
    ) a where a.especialista_id = auth.uid()
  );
$$;

-- Crea el perfil automáticamente al registrarse un usuario
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, nombre)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Sin verificación de correo: toda cuenta nueva nace confirmada, así puede
-- iniciar sesión apenas se registre (aunque «Confirm email» siga activo en el panel).
create or replace function autoconfirmar_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end; $$;

create trigger on_auth_user_autoconfirm
  before insert on auth.users
  for each row execute function autoconfirmar_usuario();

-- ---------- 4. LÓGICA DE NEGOCIO (RPC) ----------
-- Función interna: valida la transición y registra el historial
create or replace function _cambiar_estado(p_solicitud bigint, p_nuevo estado_solicitud)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_actual estado_solicitud;
  v_rol    rol_usuario := rol_actual();
begin
  select estado into v_actual from solicitudes where id = p_solicitud for update;
  if v_actual is null then raise exception 'La solicitud no existe'; end if;

  if not exists (
    select 1 from transiciones_estado
    where desde = v_actual and hacia = p_nuevo and rol = v_rol
  ) then
    raise exception 'Transición no permitida: % -> % para el rol %', v_actual, p_nuevo, v_rol;
  end if;

  update solicitudes set estado = p_nuevo, updated_at = now() where id = p_solicitud;
  insert into historial_estados (solicitud_id, estado_anterior, estado_nuevo, usuario_id)
  values (p_solicitud, v_actual, p_nuevo, auth.uid());
end; $$;
revoke all on function _cambiar_estado(bigint, estado_solicitud) from public, anon, authenticated;

-- Al crear una solicitud se registra el primer historial
create or replace function _historial_inicial() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into historial_estados (solicitud_id, estado_anterior, estado_nuevo, usuario_id)
  values (new.id, null, 'nuevo', new.instructor_id);
  return new;
end; $$;

create trigger solicitud_creada
  after insert on solicitudes
  for each row execute function _historial_inicial();

-- Líder: asigna especialista (Nuevo -> Pendiente)
create or replace function asignar_solicitud(p_solicitud bigint, p_especialista uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if rol_actual() <> 'lider' then raise exception 'Solo el líder puede asignar'; end if;
  if not exists (select 1 from perfiles where id = p_especialista and rol = 'especialista' and activo) then
    raise exception 'El usuario seleccionado no es un especialista activo';
  end if;

  perform _cambiar_estado(p_solicitud, 'pendiente');
  insert into asignaciones (solicitud_id, especialista_id, asignado_por)
  values (p_solicitud, p_especialista, auth.uid());
end; $$;

-- Agregar observación (líder o especialista asignado)
create or replace function agregar_observacion(
  p_solicitud bigint, p_texto text, p_tipo tipo_observacion default 'comentario'
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not (rol_actual() = 'lider' or (rol_actual() = 'especialista' and es_especialista_asignado(p_solicitud))) then
    raise exception 'No tienes permiso para registrar observaciones en esta solicitud';
  end if;
  insert into observaciones (solicitud_id, usuario_id, tipo, texto)
  values (p_solicitud, auth.uid(), p_tipo, p_texto);
end; $$;

-- Especialista: resuelve (Pendiente -> Resuelto)
create or replace function resolver_solicitud(p_solicitud bigint, p_solucion text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_especialista_asignado(p_solicitud) then
    raise exception 'La solicitud no está asignada a ti';
  end if;
  if p_solucion is null or length(trim(p_solucion)) = 0 then
    raise exception 'Debes describir la solución aplicada';
  end if;
  perform _cambiar_estado(p_solicitud, 'resuelto');
  insert into observaciones (solicitud_id, usuario_id, tipo, texto)
  values (p_solicitud, auth.uid(), 'solucion', p_solucion);
end; $$;

-- Especialista: no pudo resolver (Pendiente -> Requiere escalamiento)
create or replace function solicitar_escalamiento(p_solicitud bigint, p_motivo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_especialista_asignado(p_solicitud) then
    raise exception 'La solicitud no está asignada a ti';
  end if;
  if p_motivo is null or length(trim(p_motivo)) = 0 then
    raise exception 'Debes explicar por qué no se pudo resolver';
  end if;
  perform _cambiar_estado(p_solicitud, 'requiere_escalamiento');
  insert into observaciones (solicitud_id, usuario_id, tipo, texto)
  values (p_solicitud, auth.uid(), 'motivo_escalamiento', p_motivo);
end; $$;

-- Líder: escala formalmente (Requiere escalamiento -> Escalado)
create or replace function escalar_solicitud(p_solicitud bigint, p_area bigint, p_motivo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _cambiar_estado(p_solicitud, 'escalado');
  insert into escalamientos (solicitud_id, area_id, motivo, escalado_por)
  values (p_solicitud, p_area, p_motivo, auth.uid());
end; $$;

-- Líder: cierra (Resuelto/Escalado -> Cerrado)
create or replace function cerrar_solicitud(p_solicitud bigint, p_observacion text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _cambiar_estado(p_solicitud, 'cerrado');
  if p_observacion is not null and length(trim(p_observacion)) > 0 then
    insert into observaciones (solicitud_id, usuario_id, tipo, texto)
    values (p_solicitud, auth.uid(), 'cierre', p_observacion);
  end if;
end; $$;

-- Solo usuarios autenticados pueden llamar las acciones públicas
revoke all on function asignar_solicitud(bigint, uuid)                          from public, anon;
revoke all on function agregar_observacion(bigint, text, tipo_observacion)      from public, anon;
revoke all on function resolver_solicitud(bigint, text)                         from public, anon;
revoke all on function solicitar_escalamiento(bigint, text)                     from public, anon;
revoke all on function escalar_solicitud(bigint, bigint, text)                  from public, anon;
revoke all on function cerrar_solicitud(bigint, text)                           from public, anon;
grant execute on function asignar_solicitud(bigint, uuid)                       to authenticated;
grant execute on function agregar_observacion(bigint, text, tipo_observacion)   to authenticated;
grant execute on function resolver_solicitud(bigint, text)                      to authenticated;
grant execute on function solicitar_escalamiento(bigint, text)                  to authenticated;
grant execute on function escalar_solicitud(bigint, bigint, text)               to authenticated;
grant execute on function cerrar_solicitud(bigint, text)                        to authenticated;

-- ---------- 5. SEGURIDAD (RLS) ----------
alter table perfiles            enable row level security;
alter table competencias        enable row level security;
alter table perfil_competencias enable row level security;
alter table ambientes           enable row level security;
alter table equipos             enable row level security;
alter table areas_soporte       enable row level security;
alter table solicitudes         enable row level security;
alter table asignaciones        enable row level security;
alter table observaciones       enable row level security;
alter table escalamientos       enable row level security;
alter table historial_estados   enable row level security;
alter table transiciones_estado enable row level security;

-- Catálogos: lectura para cualquier usuario autenticado
create policy "leer catalogo" on ambientes           for select to authenticated using (true);
create policy "leer catalogo" on equipos             for select to authenticated using (true);
create policy "leer catalogo" on areas_soporte       for select to authenticated using (true);
create policy "leer catalogo" on competencias        for select to authenticated using (true);
create policy "leer catalogo" on transiciones_estado for select to authenticated using (true);

-- Perfiles: ver el propio; el líder ve todos (para elegir especialista)
create policy "ver perfil propio" on perfiles for select to authenticated
  using (id = auth.uid() or rol_actual() = 'lider');
-- Mostrar el nombre de quienes participan en solicitudes que el usuario ya puede ver
-- (instructor que reportó, especialista asignado y autores de observaciones)
create policy "ver perfiles de seguimiento" on perfiles for select to authenticated
  using (
    exists (select 1 from solicitudes s where s.instructor_id = perfiles.id)
    or exists (select 1 from asignaciones a where a.especialista_id = perfiles.id or a.asignado_por = perfiles.id)
    or exists (select 1 from observaciones o where o.usuario_id = perfiles.id)
    or exists (select 1 from escalamientos e where e.escalado_por = perfiles.id)
    or exists (select 1 from historial_estados h where h.usuario_id = perfiles.id)
  );
create policy "ver competencias" on perfil_competencias for select to authenticated
  using (perfil_id = auth.uid() or rol_actual() = 'lider');

-- Solicitudes
create policy "instructor ve las suyas" on solicitudes for select to authenticated
  using (instructor_id = auth.uid());
create policy "lider ve todas" on solicitudes for select to authenticated
  using (rol_actual() = 'lider');
create policy "especialista ve asignadas" on solicitudes for select to authenticated
  using (rol_actual() = 'especialista' and es_especialista_asignado(id));
create policy "instructor crea" on solicitudes for insert to authenticated
  with check (rol_actual() = 'instructor' and instructor_id = auth.uid() and estado = 'nuevo');
-- Sin policy de UPDATE/DELETE: el estado solo cambia por las funciones RPC.

-- Tablas de seguimiento: lectura según acceso a la solicitud
-- (la subconsulta respeta el RLS de solicitudes)
create policy "ver asignaciones" on asignaciones for select to authenticated
  using (exists (select 1 from solicitudes s where s.id = solicitud_id));
create policy "ver observaciones" on observaciones for select to authenticated
  using (exists (select 1 from solicitudes s where s.id = solicitud_id));
create policy "ver escalamientos" on escalamientos for select to authenticated
  using (exists (select 1 from solicitudes s where s.id = solicitud_id));
create policy "ver historial" on historial_estados for select to authenticated
  using (exists (select 1 from solicitudes s where s.id = solicitud_id));
-- Las escrituras en estas tablas solo ocurren dentro de las funciones RPC.

-- ---------- 6. DATOS DE EJEMPLO (opcional) ----------
insert into ambientes (nombre, ubicacion) values ('Ambiente 301', 'Bloque A'), ('Ambiente 302', 'Bloque A')
  on conflict (nombre) do nothing;
insert into equipos (codigo, ambiente_id)
  select c.codigo, a.id
  from (values ('PC-01', 'Ambiente 301'), ('PC-02', 'Ambiente 301'), ('PC-01', 'Ambiente 302')) as c(codigo, ambiente)
  join ambientes a on a.nombre = c.ambiente
  on conflict (codigo, ambiente_id) do nothing;
insert into areas_soporte (nombre) values ('Redes'), ('Infraestructura'), ('Proveedor externo')
  on conflict (nombre) do nothing;
insert into competencias (nombre) values ('Hardware'), ('Software'), ('Redes')
  on conflict (nombre) do nothing;

-- ---------- 7. USUARIOS QUE YA EXISTÍAN ----------
-- Confirma las cuentas que quedaron pendientes de verificar correo...
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
-- ...y crea el perfil de los usuarios que se registraron antes de existir el trigger.
insert into perfiles (id, nombre)
  select u.id, coalesce(nullif(trim(u.raw_user_meta_data->>'nombre'), ''), u.email)
  from auth.users u
  where not exists (select 1 from perfiles p where p.id = u.id);

-- Para crear al primer líder: registra el usuario desde la app y luego ejecuta:
-- update perfiles set rol = 'lider' where id = (select id from auth.users where email = 'tu_correo@ejemplo.com');
