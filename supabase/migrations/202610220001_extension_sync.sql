begin;

-- Existing studio tables use (id, user_id, data jsonb). Keep the canonical
-- fields in data; ext_id is a separate, per-owner identity for extension rows.
alter table public.prompts add column if not exists ext_id text;
alter table public.projects add column if not exists ext_id text;
create unique index if not exists prompts_extension_identity on public.prompts(user_id, ext_id) where ext_id is not null;
create unique index if not exists projects_extension_identity on public.projects(user_id, ext_id) where ext_id is not null;

create table if not exists public.extension_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists extension_tokens_owner on public.extension_tokens(user_id, created_at desc);
alter table public.extension_tokens enable row level security;
-- Token hashes never travel through the browser-accessible Supabase proxy.
revoke all on public.extension_tokens from public, anon, authenticated;
grant select, insert, update, delete on public.extension_tokens to service_role;

create or replace function public.extension_authenticate(p_token_hash text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare owner_id uuid;
begin
  update public.extension_tokens set last_used_at = clock_timestamp()
  where token_hash = p_token_hash and revoked_at is null
  returning user_id into owner_id;
  return owner_id;
end;
$$;

-- One statement snapshot, without PostgREST's row/page limit on each table.
create or replace function public.extension_library_snapshot(p_user_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'prompts', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'ext_id', p.ext_id, 'data', p.data) order by p.id)
      from public.prompts p where p.user_id = p_user_id), '[]'::jsonb),
    'projects', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'ext_id', p.ext_id, 'data', p.data) order by p.id)
      from public.projects p where p.user_id = p_user_id), '[]'::jsonb)
  );
$$;

create or replace function public.extension_replace_library(
  p_user_id uuid, p_token_hash text, p_prompts jsonb, p_projects jsonb
) returns void language plpgsql security invoker set search_path = '' as $$
begin
  -- Serialise whole-library replacements for one owner. The token row lock also
  -- orders revocation against an in-flight write; a revoked token cannot commit.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  perform 1 from public.extension_tokens
    where user_id = p_user_id and token_hash = p_token_hash and revoked_at is null for update;
  if not found then raise sqlstate 'PT401' using message = 'extension_token_revoked'; end if;
  if jsonb_typeof(p_prompts) is distinct from 'array' or jsonb_typeof(p_projects) is distinct from 'array' then
    raise exception 'invalid_library';
  end if;

  insert into public.projects(id, user_id, ext_id, data)
    select r.id, p_user_id, r.ext_id, r.data
    from jsonb_populate_recordset(null::public.projects, p_projects) r
    on conflict(id, user_id) do update set ext_id = excluded.ext_id, data = excluded.data;
  insert into public.prompts(id, user_id, ext_id, data)
    select r.id, p_user_id, r.ext_id, r.data
    from jsonb_populate_recordset(null::public.prompts, p_prompts) r
    on conflict(id, user_id) do update set ext_id = excluded.ext_id, data = excluded.data;

  delete from public.prompts p where p.user_id = p_user_id
    and not exists (select 1 from jsonb_array_elements(p_prompts) r where r->>'id' = p.id::text);
  delete from public.projects p where p.user_id = p_user_id
    and not exists (select 1 from jsonb_array_elements(p_projects) r where r->>'id' = p.id::text);
end;
$$;

revoke all on function public.extension_authenticate(text) from public, anon, authenticated;
revoke all on function public.extension_library_snapshot(uuid) from public, anon, authenticated;
revoke all on function public.extension_replace_library(uuid, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.extension_authenticate(text) to service_role;
grant execute on function public.extension_library_snapshot(uuid) to service_role;
grant execute on function public.extension_replace_library(uuid, text, jsonb, jsonb) to service_role;
grant select, insert, update, delete on public.prompts, public.projects to service_role;

notify pgrst, 'reload schema';
commit;
