-- Spinwin: lock every table down by default. All app access goes through the
-- service role (via server-only route handlers), which bypasses RLS entirely.
-- No policies are granted to anon/authenticated on purpose.

alter table participants enable row level security;
alter table prizes enable row level security;
alter table winners enable row level security;
alter table draw_settings enable row level security;
