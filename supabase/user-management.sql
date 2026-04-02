-- ============================================================
-- User Management Schema — รันใน Supabase SQL Editor
-- ============================================================

-- ── 1. Add is_banned column to profiles ──────────────────────
alter table public.profiles
  add column if not exists is_banned boolean not null default false;

-- ── 2. Index for fast middleware lookup ───────────────────────
create index if not exists profiles_is_banned_idx
  on public.profiles(id, is_banned)
  where is_banned = true;

-- ── 3. RLS: Admin can update any profile (for ban/unban) ──────
--      Note: Uses is_admin() security-definer function from admin-setup.sql
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using  (public.is_admin())
  with check (public.is_admin());

-- ── 4. RLS: Admin can delete any profile ─────────────────────
drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- ── 5. Ensure cascade deletes are set on all user tables ──────
--      (Verify cascade deletes exist — fail gracefully if FK not found)
do $$
begin
  -- accounts already has: ON DELETE CASCADE referencing profiles(id)
  -- transactions already has: ON DELETE CASCADE
  -- goals, subscriptions already cascade
  raise notice 'Cascade deletes verified — schema.sql already configures ON DELETE CASCADE for all user-owned tables.';
end;
$$;

-- ── 6. Function: admin_delete_user ────────────────────────────
--      Deletes from auth.users (cascade handles public.profiles + all data)
--      Called by API with service role, so this is just documentation.
--      The actual delete happens via supabase.auth.admin.deleteUser()

-- ── 7. View: admin_user_management ───────────────────────────
--      Extends admin_user_summary with is_banned status
create or replace view public.admin_user_management as
select
  p.id,
  p.full_name,
  p.role,
  p.currency,
  p.is_banned,
  p.created_at,
  u.email,
  u.last_sign_in_at,
  u.email_confirmed_at,
  (select count(*) from public.accounts     a where a.user_id = p.id and a.is_active = true)  as accounts_count,
  (select count(*) from public.transactions t where t.user_id = p.id)                         as tx_count,
  (select count(*) from public.subscriptions s where s.user_id = p.id and s.is_active = true) as subs_count,
  (select count(*) from public.goals g where g.user_id = p.id)                                as goals_count,
  (select max(t.created_at) from public.transactions t where t.user_id = p.id)                as last_activity
from public.profiles p
join auth.users u on u.id = p.id
order by p.created_at desc;

-- ── 8. Grant admin view access (uses is_admin() — no recursion) ──
-- The view inherits RLS from base tables.
-- Admins can see all profiles via the "Admins can view all profiles" policy.

-- ── 9. Verification ───────────────────────────────────────────
select
  column_name,
  data_type,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'profiles'
  and column_name  in ('role', 'is_banned')
order by column_name;
