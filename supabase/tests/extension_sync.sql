-- Run AFTER the migration against a disposable/staging Supabase database:
-- psql "$SUPABASE_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/extension_sync.sql
-- All fixtures are rolled back. Requires the database owner (not a publishable key).
begin;
do $$
declare
  owner_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid();
  token_id uuid;
  hash text := repeat('a', 64);
  before_snapshot jsonb;
  after_snapshot jsonb;
  p jsonb;
  j jsonb;
  last_used timestamptz;
begin
  if has_table_privilege('anon', 'public.extension_tokens', 'SELECT')
     or has_table_privilege('authenticated', 'public.extension_tokens', 'SELECT')
     or has_function_privilege('anon', 'public.extension_library_snapshot(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.extension_replace_library(uuid,text,jsonb,jsonb)', 'EXECUTE') then
    raise exception 'extension token tables/RPCs exposed to browser roles';
  end if;
  insert into auth.users(id, email) values (owner_id, owner_id::text || '@example.invalid'), (other_id, other_id::text || '@example.invalid');
  insert into public.extension_tokens(user_id, token_hash) values(owner_id, hash) returning id into token_id;
  insert into public.prompts(id, user_id, data) values
    ('extension-test-original', owner_id, '{"title":"original","content":"old"}'),
    ('extension-test-other', other_id, '{"title":"other owner"}');

  if public.extension_authenticate('wrong') is not null then raise exception 'invalid token accepted'; end if;
  if public.extension_authenticate(hash) is distinct from owner_id then raise exception 'valid token rejected'; end if;
  select last_used_at into last_used from public.extension_tokens where id = token_id;
  if last_used is null then raise exception 'last_used_at not updated'; end if;

  p := jsonb_build_object('id', 'extension-test-new', 'user_id', owner_id, 'ext_id', 'pr_sql_test',
    'data', jsonb_build_object('id', 'extension-test-new', 'title', 'new', 'no', '007', 'content', 'body {scene}'));
  j := jsonb_build_object('id', 'extension-test-project', 'user_id', owner_id, 'ext_id', 'pj_sql_test',
    'data', jsonb_build_object('id', 'extension-test-project', 'name', 'project', 'color', '#E8508A'));

  before_snapshot := public.extension_library_snapshot(owner_id);
  -- Projects are inserted first in the real function. Duplicate prompts force a
  -- later failure: that earlier insert AND any deletion must roll back together.
  begin
    perform public.extension_replace_library(owner_id, hash, jsonb_build_array(p, p), jsonb_build_array(j));
    raise exception 'expected duplicate write failure';
  exception when cardinality_violation then null;
  end;
  if public.extension_library_snapshot(owner_id) is distinct from before_snapshot then
    raise exception 'failed write partially changed the library';
  end if;

  perform public.extension_replace_library(owner_id, hash, jsonb_build_array(p), jsonb_build_array(j));
  after_snapshot := public.extension_library_snapshot(owner_id);
  if jsonb_array_length(after_snapshot->'prompts') <> 1
    or after_snapshot->'prompts'->0->>'ext_id' <> 'pr_sql_test'
    or after_snapshot->'prompts'->0->'data'->>'no' <> '007' then raise exception 'replacement failed'; end if;
  if not exists(select 1 from public.prompts where id = 'extension-test-other' and user_id = other_id) then raise exception 'cross-owner deletion'; end if;

  -- Simulate the existing website's upsert, which only writes id/user_id/data.
  insert into public.prompts(id, user_id, data) values('extension-test-new', owner_id, '{"title":"website edited"}')
    on conflict(id, user_id) do update set data = excluded.data;
  if (select ext_id from public.prompts where id = 'extension-test-new' and user_id = owner_id) is distinct from 'pr_sql_test' then
    raise exception 'website edit lost extension identity';
  end if;
  perform public.extension_replace_library(owner_id, hash, '[]', '[]');
  if public.extension_library_snapshot(owner_id) <> '{"prompts":[],"projects":[]}'::jsonb then raise exception 'empty replacement failed'; end if;

  update public.extension_tokens set revoked_at = now() where id = token_id;
  if public.extension_authenticate(hash) is not null then raise exception 'revoked token accepted'; end if;
  begin
    perform public.extension_replace_library(owner_id, hash, jsonb_build_array(p), '[]');
    raise exception 'revoked token wrote the library';
  exception when sqlstate 'PT401' then null;
  end;
  raise notice 'Extension transaction, isolation, identity, privilege and revocation checks passed';
end;
$$;
rollback;
