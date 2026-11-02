-- CampusLost&Found schema: profiles, items, claims, reports + RLS, RPCs, storage, realtime.

create type public.item_status as enum ('found', 'claimed', 'returned');
create type public.claim_status as enum ('pending', 'approved', 'rejected');

-- Profiles ------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  admission_number text unique,
  faculty text not null default '',
  department text not null default '',
  level text not null default '',
  residence text not null default '',
  phone text not null default '',
  profile_complete boolean not null default false,
  notification_preferences jsonb not null default '{"match_alerts": true, "notifications": true}'::jsonb,
  created_at timestamptz not null default now()
);

-- New auth users get a profile row. Email sign-up passes campus details in
-- user metadata, so their profile is complete straight away; Google users
-- finish it on /complete-profile.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  complete boolean := coalesce(m->>'admission_number', '') <> ''
    and coalesce(m->>'faculty', '') <> ''
    and coalesce(m->>'department', '') <> ''
    and coalesce(m->>'level', '') <> ''
    and coalesce(m->>'residence', '') <> ''
    and coalesce(m->>'phone', '') <> '';
begin
  insert into public.profiles (id, email, full_name, admission_number, faculty, department, level, residence, phone, profile_complete)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(m->>'full_name', ''), m->>'name', ''),
    nullif(m->>'admission_number', ''),
    coalesce(m->>'faculty', ''),
    coalesce(m->>'department', ''),
    coalesce(m->>'level', ''),
    coalesce(m->>'residence', ''),
    coalesce(m->>'phone', ''),
    complete
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Items ---------------------------------------------------------------------
create function public.text_array_join(text[])
returns text
language sql
immutable
as $$ select coalesce(array_to_string($1, ' '), '') $$;

create table public.items (
  id uuid primary key default gen_random_uuid(),
  finder_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  photo_path text,
  title text not null check (char_length(title) between 2 and 60),
  category text not null check (char_length(category) <= 30),
  colors text[] not null default '{}',
  brand text not null default '' check (char_length(brand) <= 40),
  marks text not null default '' check (char_length(marks) <= 80),
  summary text not null default '' check (char_length(summary) <= 200),
  location text not null check (char_length(location) between 2 and 80),
  status public.item_status not null default 'found',
  found_at timestamptz not null default now(),
  search_text tsvector generated always as (
    to_tsvector(
      'english'::regconfig,
      title || ' ' || category || ' ' || public.text_array_join(colors) || ' ' || brand || ' ' || marks || ' ' || summary || ' ' || location
    )
  ) stored
);

create index items_search_text_idx on public.items using gin (search_text);
create index items_status_found_at_idx on public.items (status, found_at desc);
create index items_finder_idx on public.items (finder_id);

-- Claims --------------------------------------------------------------------
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  claimant_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  proof_text text not null check (char_length(proof_text) between 20 and 600),
  status public.claim_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create unique index claims_one_pending_per_user on public.claims (item_id, claimant_id) where status = 'pending';
create index claims_item_idx on public.claims (item_id);
create index claims_claimant_idx on public.claims (claimant_id);

-- Reports -------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 300),
  created_at timestamptz not null default now()
);

-- Row Level Security --------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.reports enable row level security;

-- Profiles: only the owner reads or edits their row. Finders see a claimant's
-- name/department through get_item_claims(); contact details only through
-- get_handover_contact().
create policy "Own profile is readable" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Own profile is editable" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Signed-in users read items" on public.items
  for select to authenticated using (true);
create policy "Finders post their own items" on public.items
  for insert to authenticated with check (finder_id = (select auth.uid()));
create policy "Finders edit their own items" on public.items
  for update to authenticated using (finder_id = (select auth.uid())) with check (finder_id = (select auth.uid()));
create policy "Finders delete their own items" on public.items
  for delete to authenticated using (finder_id = (select auth.uid()));

create policy "Claimants and finders read claims" on public.claims
  for select to authenticated using (
    claimant_id = (select auth.uid())
    or exists (select 1 from public.items i where i.id = item_id and i.finder_id = (select auth.uid()))
  );
create policy "Students claim other people's open items" on public.claims
  for insert to authenticated with check (
    claimant_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.items i
      where i.id = item_id and i.status = 'found' and i.finder_id <> (select auth.uid())
    )
  );

create policy "Students report posts" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));

-- RPCs ----------------------------------------------------------------------
create function public.admission_number_available(p_admission_number text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where lower(admission_number) = lower(trim(p_admission_number))
      and id is distinct from auth.uid()
  )
$$;

create function public.get_item_claims(p_item_id uuid)
returns table (
  id uuid,
  status public.claim_status,
  proof_text text,
  created_at timestamptz,
  claimant_name text,
  claimant_department text,
  claimant_level text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.items i where i.id = p_item_id and i.finder_id = auth.uid()) then
    raise exception 'Only the finder can view claims on this item' using errcode = '42501';
  end if;
  return query
    select c.id, c.status, c.proof_text, c.created_at, p.full_name, p.department, p.level
    from public.claims c
    join public.profiles p on p.id = c.claimant_id
    where c.item_id = p_item_id
    order by c.created_at;
end;
$$;

create function public.approve_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
begin
  select c.item_id into v_item_id
  from public.claims c
  join public.items i on i.id = c.item_id
  where c.id = p_claim_id and c.status = 'pending' and i.status = 'found' and i.finder_id = auth.uid()
  for update of c, i;

  if v_item_id is null then
    raise exception 'This claim can''t be approved' using errcode = '42501';
  end if;

  update public.claims set status = 'approved', decided_at = now() where id = p_claim_id;
  update public.claims set status = 'rejected', decided_at = now()
    where item_id = v_item_id and status = 'pending' and id <> p_claim_id;
  update public.items set status = 'claimed' where id = v_item_id;
end;
$$;

create function public.reject_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.claims c set status = 'rejected', decided_at = now()
  from public.items i
  where c.id = p_claim_id and i.id = c.item_id and c.status = 'pending' and i.finder_id = auth.uid();
  if not found then
    raise exception 'This claim can''t be rejected' using errcode = '42501';
  end if;
end;
$$;

create function public.mark_returned(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.items set status = 'returned'
  where id = p_item_id and finder_id = auth.uid() and status = 'claimed';
  if not found then
    raise exception 'Approve a claim before marking the item returned' using errcode = '42501';
  end if;
end;
$$;

-- The only way a claimant ever sees a finder's phone or residence.
create function public.get_handover_contact(p_claim_id uuid)
returns table (full_name text, phone text, residence text)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name, p.phone, p.residence
  from public.claims c
  join public.items i on i.id = c.item_id
  join public.profiles p on p.id = i.finder_id
  where c.id = p_claim_id and c.claimant_id = auth.uid() and c.status = 'approved'
$$;

-- Ranks open items against parsed search criteria plus full-text search.
create function public.search_found_items(
  p_tsquery text default '',
  p_category text default '',
  p_colors text[] default '{}',
  p_brand text default '',
  p_marks text default '',
  p_location text default '',
  p_limit int default 10
)
returns table (
  id uuid, title text, category text, colors text[], brand text, marks text, summary text,
  location text, status public.item_status, found_at timestamptz, photo_path text, finder_id uuid, score real
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (
    select case when coalesce(p_tsquery, '') = '' then null else to_tsquery('english', p_tsquery) end as tsq
  ),
  scored as (
    select i.*,
      (
        (case when p_category <> '' and lower(i.category) = lower(p_category) then 3 else 0 end)
        + 2 * (select count(*) from unnest(p_colors) c where lower(c) in (select lower(x) from unnest(i.colors) x))
        + (case when p_brand <> '' and lower(i.brand) = lower(p_brand) then 3 else 0 end)
        + (case when p_marks <> '' and (i.marks || ' ' || i.summary) ilike '%' || p_marks || '%' then 3 else 0 end)
        + (case when p_location <> '' and i.location ilike '%' || p_location || '%' then 1 else 0 end)
        + coalesce((select ts_rank(i.search_text, q.tsq) * 10 from q where q.tsq is not null and i.search_text @@ q.tsq), 0)
      )::real as score
    from public.items i
    where i.status = 'found'
  )
  select s.id, s.title, s.category, s.colors, s.brand, s.marks, s.summary, s.location, s.status, s.found_at, s.photo_path, s.finder_id, s.score
  from scored s
  where s.score >= 1
  order by s.score desc, s.found_at desc
  limit least(greatest(p_limit, 1), 25)
$$;

revoke execute on function public.get_item_claims(uuid) from public, anon;
revoke execute on function public.approve_claim(uuid) from public, anon;
revoke execute on function public.reject_claim(uuid) from public, anon;
revoke execute on function public.mark_returned(uuid) from public, anon;
revoke execute on function public.get_handover_contact(uuid) from public, anon;
revoke execute on function public.search_found_items(text, text, text[], text, text, text, int) from public, anon;
grant execute on function public.get_item_claims(uuid) to authenticated;
grant execute on function public.approve_claim(uuid) to authenticated;
grant execute on function public.reject_claim(uuid) to authenticated;
grant execute on function public.mark_returned(uuid) to authenticated;
grant execute on function public.get_handover_contact(uuid) to authenticated;
grant execute on function public.search_found_items(text, text, text[], text, text, text, int) to authenticated;
grant execute on function public.admission_number_available(text) to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Storage: item-photos ------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-photos', 'item-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Signed-in users upload photos to their own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Signed-in users view item photos" on storage.objects
  for select to authenticated using (bucket_id = 'item-photos');
create policy "Users delete their own photos" on storage.objects
  for delete to authenticated using (
    bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Realtime ------------------------------------------------------------------
alter publication supabase_realtime add table public.claims, public.items;
