-- =====================================================================
-- 002 - El instructor puede dirigir la solicitud a un técnico
-- Ejecutar en: Supabase > SQL Editor (después de 001_mesa_soporte.sql)
-- =====================================================================

-- Lista de técnicos (especialistas activos) visible para instructor y líder.
-- Se hace con security definer porque el RLS de "perfiles" no deja al instructor ver a otros.
create or replace function listar_tecnicos()
returns table (id uuid, nombre text, competencias text[])
language plpgsql stable security definer set search_path = public as $$
begin
  if rol_actual() not in ('instructor', 'lider') then
    raise exception 'No tienes permiso para consultar los técnicos';
  end if;

  return query
    select p.id,
           p.nombre,
           coalesce(
             array_agg(c.nombre order by c.nombre) filter (where c.nombre is not null),
             '{}'::text[]
           )
    from perfiles p
    left join perfil_competencias pc on pc.perfil_id = p.id
    left join competencias c on c.id = pc.competencia_id
    where p.rol = 'especialista' and p.activo
    group by p.id, p.nombre
    order by p.nombre;
end; $$;

-- Instructor crea la solicitud. Si elige técnico, nace asignada (Pendiente);
-- si no, queda Nuevo y el líder la asigna como antes.
create or replace function crear_solicitud(
  p_ambiente      bigint,
  p_equipo        bigint,
  p_descripcion   text,
  p_observaciones text default null,
  p_especialista  uuid default null
) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_id bigint;
begin
  if rol_actual() <> 'instructor' then
    raise exception 'Solo un instructor puede crear solicitudes';
  end if;

  if p_especialista is not null and not exists (
    select 1 from perfiles where id = p_especialista and rol = 'especialista' and activo
  ) then
    raise exception 'El técnico seleccionado no es un especialista activo';
  end if;

  insert into solicitudes (instructor_id, ambiente_id, equipo_id, descripcion, observaciones, estado)
  values (auth.uid(), p_ambiente, p_equipo, p_descripcion, nullif(trim(p_observaciones), ''), 'nuevo')
  returning id into v_id;   -- el trigger solicitud_creada registra el historial inicial

  if p_especialista is not null then
    insert into asignaciones (solicitud_id, especialista_id, asignado_por)
    values (v_id, p_especialista, auth.uid());

    update solicitudes set estado = 'pendiente', updated_at = now() where id = v_id;

    insert into historial_estados (solicitud_id, estado_anterior, estado_nuevo, usuario_id)
    values (v_id, 'nuevo', 'pendiente', auth.uid());
  end if;

  return v_id;
end; $$;

revoke all on function listar_tecnicos()                                    from public, anon;
revoke all on function crear_solicitud(bigint, bigint, text, text, uuid)    from public, anon;
grant execute on function listar_tecnicos()                                 to authenticated;
grant execute on function crear_solicitud(bigint, bigint, text, text, uuid) to authenticated;
