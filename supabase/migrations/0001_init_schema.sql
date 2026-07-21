-- Spinwin: initial schema
create extension if not exists pgcrypto;

create table if not exists participants (
  id              uuid primary key default gen_random_uuid(),
  participant_no  text not null,
  full_name       text not null,
  plate_number    text,
  has_won         boolean not null default false,
  import_batch_id uuid,
  imported_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create unique index if not exists ux_participants_no on participants (participant_no);
create index if not exists idx_participants_eligible on participants (id) where has_won = false;
create index if not exists idx_participants_plate_number on participants (plate_number);

create table if not exists prizes (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  quantity      integer not null default 1 check (quantity > 0),
  awarded_count integer not null default 0 check (awarded_count >= 0),
  display_order integer not null default 0,
  image_url     text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_prizes_order on prizes (display_order) where is_active;

create table if not exists winners (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete restrict,
  prize_id       uuid not null references prizes(id) on delete restrict,
  won_at         timestamptz not null default now(),
  constraint ux_winners_participant unique (participant_id)
);
create index if not exists idx_winners_prize on winners (prize_id);
create index if not exists idx_winners_won_at on winners (won_at desc);

create table if not exists draw_settings (
  id                smallint primary key default 1 check (id = 1),
  current_prize_id  uuid references prizes(id),
  roll_duration_ms  integer not null default 4000,
  roll_speed_ms     integer not null default 60,
  sound_enabled     boolean not null default true,
  confetti_enabled  boolean not null default true,
  theme             text not null default 'dark',
  updated_at        timestamptz not null default now()
);
insert into draw_settings (id) values (1) on conflict (id) do nothing;
