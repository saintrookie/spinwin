-- Spinwin: race-safe draw functions. Callable only by service_role.

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
set search_path = public
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
    order by random()
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

revoke all on function public.draw_winners(uuid, integer) from public, anon, authenticated;
grant execute on function public.draw_winners(uuid, integer) to service_role;

create or replace function public.reset_draw()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Supabase's pg-safeupdate extension rejects DELETE/UPDATE with no WHERE
  -- clause, so every statement here is explicitly (if trivially) scoped.
  delete from winners where true;
  update participants set has_won = false where has_won = true;
  update prizes set awarded_count = 0 where awarded_count <> 0;
  update draw_settings set current_prize_id = null where id = 1;
end;
$$;

revoke all on function public.reset_draw() from public, anon, authenticated;
grant execute on function public.reset_draw() to service_role;

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
set search_path = public
as $$
  select id, full_name, plate_number
  from participants
  where has_won = false
  order by random()
  limit p_size;
$$;

revoke all on function public.sample_eligible_participants(integer) from public, anon, authenticated;
grant execute on function public.sample_eligible_participants(integer) to service_role;
