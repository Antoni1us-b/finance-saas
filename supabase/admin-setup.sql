-- ============================================================
-- Admin Setup — รันซ้ำได้ปลอดภัย (Idempotent)
-- ============================================================

-- ── 1. Admin role column บน profiles ──────────────────────
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

-- ── 2. Helper function: is_admin() — Security Definer ─────
--      ใช้แทน sub-select ใน RLS เพื่อป้องกัน infinite recursion
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── 3. Views ──────────────────────────────────────────────
create or replace view public.admin_system_stats as
select
  (select count(*) from auth.users)                                   as total_users,
  (select count(*) from public.profiles where role = 'admin')         as total_admins,
  (select count(*) from public.accounts  where is_active = true)      as total_accounts,
  (select count(*) from public.transactions)                          as total_transactions,
  (select count(*) from public.subscriptions where is_active = true)  as total_subscriptions,
  (select count(*) from public.goals)                                 as total_goals,
  (select count(*) from public.goals where is_completed = true)       as completed_goals,
  (select coalesce(sum(amount),0) from public.transactions where type = 'income')  as total_income,
  (select coalesce(sum(amount),0) from public.transactions where type = 'expense') as total_expense,
  now() as generated_at;

create or replace view public.admin_user_summary as
select
  p.id,
  p.full_name,
  p.role,
  p.currency,
  p.created_at,
  (select count(*) from public.accounts     a where a.user_id = p.id and a.is_active = true)  as accounts_count,
  (select count(*) from public.transactions t where t.user_id = p.id)                         as tx_count,
  (select count(*) from public.subscriptions s where s.user_id = p.id and s.is_active = true) as subs_count,
  (select count(*) from public.goals g where g.user_id = p.id and g.is_completed = false)     as active_goals,
  (select max(t.created_at) from public.transactions t where t.user_id = p.id)                as last_activity
from public.profiles p
order by p.created_at desc;

-- ── 4. RLS: Drop old policy (idempotent) + recreate ───────
--      Fix: ใช้ is_admin() function แทน sub-select เพื่อป้องกัน
--      infinite recursion ใน policy
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_admin()
  );

-- ── 5. Function: grant_admin ──────────────────────────────
create or replace function public.grant_admin_role(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Permission denied: admin only';
  end if;
  update public.profiles set role = 'admin' where id = target_user_id;
end;
$$;

-- ── 6. Grant admin to specific user ──────────────────────
--      ตรวจสอบว่า user มีอยู่จริงก่อน grant
do $$
declare
  v_user_id uuid;
  v_profile_exists boolean;
begin
  -- ดึง user id จาก auth.users
  select id into v_user_id
  from auth.users
  where email = 'boomdod_101@hotmail.com'
  limit 1;

  if v_user_id is null then
    raise notice 'USER NOT FOUND: boomdod_101@hotmail.com is not registered in auth.users';
    raise notice 'Please sign up with this email first, then re-run this script.';
    return;
  end if;

  raise notice 'Found user: %', v_user_id;

  -- ตรวจสอบว่า profile ถูกสร้างแล้ว
  select exists(select 1 from public.profiles where id = v_user_id)
  into v_profile_exists;

  if not v_profile_exists then
    -- สร้าง profile ถ้ายังไม่มี (trigger อาจไม่ได้ทำงาน)
    insert into public.profiles (id) values (v_user_id)
    on conflict (id) do nothing;
    raise notice 'Created missing profile for user: %', v_user_id;
  end if;

  -- Grant admin role
  update public.profiles
  set role = 'admin'
  where id = v_user_id;

  raise notice 'SUCCESS: Granted admin role to boomdod_101@hotmail.com (id: %)', v_user_id;
end;
$$;

-- ── 7. Verification ───────────────────────────────────────
--      ตรวจสอบผลลัพธ์
select
  u.email,
  p.id,
  p.role,
  p.full_name,
  p.created_at
from auth.users u
join public.profiles p on p.id = u.id
where p.role = 'admin'
order by p.created_at;
