-- ============================================================
-- Notifications Table Setup — รันใน Supabase SQL Editor
-- ============================================================

-- ── 1. Create table ───────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null default 'system'
              check (type in ('transaction', 'goal', 'subscription', 'system')),
  title       text not null,
  message     text not null,
  is_read     boolean not null default false,
  link        text,
  created_at  timestamptz not null default now()
);

-- ── 2. Indexes ────────────────────────────────────────────
create index if not exists notifications_user_id_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications(user_id, is_read)
  where is_read = false;

-- ── 3. Enable RLS ─────────────────────────────────────────
alter table public.notifications enable row level security;

-- ── 4. RLS policies (idempotent) ──────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'notifications'
      and policyname = 'Users manage own notifications'
  ) then
    create policy "Users manage own notifications"
      on public.notifications
      for all
      using  (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- ── 5. Auto-cleanup: delete notifications older than 90 days ──
-- (Optional: run via pg_cron or Supabase scheduled functions)
-- delete from public.notifications
-- where created_at < now() - interval '90 days';

-- ── 6. Verification ───────────────────────────────────────
select
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'notifications'
order by ordinal_position;
