-- Score search by matching query words (works without Gemini too).
drop function public.search_found_items(text, text, text[], text, text, text, int);

create function public.search_found_items(
  p_query text default '',
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
    select tsvector_to_array(to_tsvector('english', coalesce(p_query, ''))) as lexemes
  ),
  scored as (
    select i.*,
      (
        (case when p_category <> '' and lower(i.category) = lower(p_category) then 3 else 0 end)
        + 2 * (select count(*) from unnest(p_colors) c where lower(c) in (select lower(x) from unnest(i.colors) x))
        + (case when p_brand <> '' and lower(i.brand) = lower(p_brand) then 3 else 0 end)
        + (case when p_marks <> '' and (i.marks || ' ' || i.summary) ilike '%' || p_marks || '%' then 3 else 0 end)
        + (case when p_location <> '' and i.location ilike '%' || p_location || '%' then 1 else 0 end)
        + (select count(*) from q, unnest(q.lexemes) l where l = any (tsvector_to_array(i.search_text)))
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

revoke execute on function public.search_found_items(text, text, text[], text, text, text, int) from public, anon;
grant execute on function public.search_found_items(text, text, text[], text, text, text, int) to authenticated;
