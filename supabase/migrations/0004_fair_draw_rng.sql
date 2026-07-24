-- Spinwin: strengthen draw fairness for large participant pools.
--
-- `ORDER BY random()` uses Postgres's built-in PRNG, which is fast but not
-- cryptographically secure — its output is statistically uniform but
-- deterministic given its internal state, so it isn't the strongest
-- foundation for a public prize draw that has to withstand scrutiny about
-- whether the selection was manipulable. pgcrypto's gen_random_bytes() reads
-- from the OS CSPRNG instead, giving each eligible participant a value that
-- is both uniformly distributed and unpredictable. bytea has a well-defined
-- byte-wise ordering, so `ORDER BY gen_random_bytes(n)` is a drop-in
-- replacement for `ORDER BY random()` — same uniform-selection semantics,
-- stronger randomness source. This scales fine at 20k+ rows: the partial
-- index on (id) where has_won = false keeps the scan limited to eligible
-- rows, and sorting even the full 20k by a random key is a low-millisecond
-- operation in Postgres.
--
-- Supabase installs extensions like pgcrypto into the `extensions` schema,
-- not `public`. Since these functions pin `search_path` for security, that
-- schema has to be added explicitly or gen_random_bytes() won't resolve.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.draw_winners(
  p_prize_id uuid,
  p_count    integer default 1
)
returns table (
  winner_id       uuid,
  participant_id  uuid,
  participant_no  text,
  full_name       text,
  plate_number    text,
  prize_id        uuid,
  won_at          timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_remaining integer;
  v_take      integer;
begin
  select (quantity - awarded_count) into v_remaining
  from prizes where id = p_prize_id for update;

  if v_remaining is null then
    raise exception 'Prize % not found', p_prize_id;
  end if;

  v_take := least(p_count, greatest(v_remaining, 0));
  if v_take <= 0 then
    return;
  end if;

  return query
  with selected as (
    select p.id
    from participants p
    where p.has_won = false
    order by gen_random_bytes(8)
    limit v_take
    for update skip locked
  ),
  inserted as (
    insert into winners as w (participant_id, prize_id)
    select s.id, p_prize_id from selected s
    returning w.id, w.participant_id, w.prize_id, w.won_at
  ),
  mark_won as (
    update participants pa set has_won = true
    from selected s where pa.id = s.id
  ),
  bump_prize as (
    update prizes set awarded_count = awarded_count + (select count(*) from selected)
    where id = p_prize_id
  )
  select i.id, i.participant_id, pa.participant_no, pa.full_name, pa.plate_number,
         i.prize_id, i.won_at
  from inserted i join participants pa on pa.id = i.participant_id;
end;
$$;

-- Cosmetic sample used to seed the client-side rolling animation. Never used
-- to determine an actual winner (draw_winners is authoritative for that).
create or replace function public.sample_eligible_participants(p_size integer)
returns table (
  id           uuid,
  full_name    text,
  plate_number text
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select id, full_name, plate_number
  from participants
  where has_won = false
  order by gen_random_bytes(8)
  limit p_size;
$$;
