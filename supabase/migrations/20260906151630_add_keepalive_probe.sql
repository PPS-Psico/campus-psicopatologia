-- Sonda de actividad para evitar el pausado automatico del plan gratuito de
-- Supabase. El workflow keep-supabase-awake la invoca a diario para que la
-- peticion llegue efectivamente a Postgres y no se quede en el gateway.
--
-- Deliberadamente inerte: devuelve la hora del servidor, no lee ni escribe
-- ningun dato del parcial y no toca el esquema exam_private.

create or replace function public.keepalive()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;

comment on function public.keepalive() is
  'Sonda de actividad del workflow keep-supabase-awake. Solo devuelve now(); no accede a datos del parcial.';

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
