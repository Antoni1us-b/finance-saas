-- ============================================================
-- Personal Finance SaaS – Database Schema (Idempotent)
-- รันซ้ำได้ปลอดภัย ใช้ IF NOT EXISTS ทุกที่
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  currency    text not null default 'THB',
  locale      text not null default 'th-TH',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='profiles' and policyname='Users can view own profile'
  ) then
    create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- ============================================================
-- ACCOUNTS
-- ============================================================
create table if not exists public.accounts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  type         text not null check (type in ('bank','credit','investment','cash','e-wallet')),
  balance      numeric(15,2) not null default 0,
  currency     text not null default 'THB',
  color        text not null default '#0ea5e9',
  icon         text not null default 'bank',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.accounts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='accounts' and policyname='Users manage own accounts'
  ) then
    create policy "Users manage own accounts" on public.accounts
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade,
  name       text not null,
  name_th    text,
  icon       text not null default 'tag',
  color      text not null default '#6366f1',
  type       text not null check (type in ('income','expense','both')),
  is_system  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='categories' and policyname='Users view own + system categories'
  ) then
    create policy "Users view own + system categories" on public.categories for select
      using (auth.uid() = user_id or is_system = true);
    create policy "Users manage own categories" on public.categories for all
      using (auth.uid() = user_id and is_system = false)
      with check (auth.uid() = user_id and is_system = false);
  end if;
end $$;

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  account_id     uuid references public.accounts(id),
  category_id    uuid references public.categories(id),
  name           text not null,
  amount         numeric(15,2) not null,
  currency       text not null default 'THB',
  billing_cycle  text not null check (billing_cycle in ('daily','weekly','monthly','quarterly','yearly')),
  next_billing   date not null,
  logo_url       text,
  color          text not null default '#8b5cf6',
  is_active      boolean not null default true,
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='subscriptions' and policyname='Users manage own subscriptions'
  ) then
    create policy "Users manage own subscriptions" on public.subscriptions
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists public.transactions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  account_id      uuid not null references public.accounts(id) on delete cascade,
  to_account_id   uuid references public.accounts(id),
  category_id     uuid references public.categories(id),
  type            text not null check (type in ('income','expense','transfer')),
  amount          numeric(15,2) not null,
  date            date not null default current_date,
  note            text,
  tags            text[],
  is_recurring    boolean not null default false,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists transactions_user_id_date_idx on public.transactions(user_id, date desc);
create index if not exists transactions_account_id_idx   on public.transactions(account_id);
create index if not exists transactions_category_id_idx  on public.transactions(category_id);

alter table public.transactions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='transactions' and policyname='Users manage own transactions'
  ) then
    create policy "Users manage own transactions" on public.transactions
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  account_id     uuid references public.accounts(id),
  name           text not null,
  target_amount  numeric(15,2) not null,
  current_amount numeric(15,2) not null default 0,
  target_date    date,
  icon           text not null default 'target',
  color          text not null default '#10b981',
  is_completed   boolean not null default false,
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.goals enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='goals' and policyname='Users manage own goals'
  ) then
    create policy "Users manage own goals" on public.goals
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- SYSTEM CATEGORIES (seed — ใส่เฉพาะถ้ายังไม่มี)
-- ============================================================
insert into public.categories (name, name_th, icon, color, type, is_system)
select * from (values
  ('Salary',        'เงินเดือน',              'briefcase',     '#10b981', 'income',  true),
  ('Freelance',     'ฟรีแลนซ์',               'laptop',        '#06b6d4', 'income',  true),
  ('Investment',    'การลงทุน',               'trending-up',   '#6366f1', 'income',  true),
  ('Gift',          'ของขวัญ',                'gift',          '#ec4899', 'income',  true),
  ('Other Income',  'รายได้อื่นๆ',            'plus-circle',   '#8b5cf6', 'income',  true),
  ('Food & Drink',  'อาหารและเครื่องดื่ม',    'utensils',      '#f59e0b', 'expense', true),
  ('Transport',     'การเดินทาง',             'car',           '#3b82f6', 'expense', true),
  ('Shopping',      'การช้อปปิ้ง',            'shopping-bag',  '#ec4899', 'expense', true),
  ('Housing',       'ที่อยู่อาศัย',           'home',          '#f97316', 'expense', true),
  ('Health',        'สุขภาพ',                 'heart-pulse',   '#ef4444', 'expense', true),
  ('Entertainment', 'ความบันเทิง',            'film',          '#a855f7', 'expense', true),
  ('Education',     'การศึกษา',               'graduation-cap','#0ea5e9', 'expense', true),
  ('Utilities',     'สาธารณูปโภค',            'zap',           '#eab308', 'expense', true),
  ('Subscriptions', 'บริการรายเดือน',         'repeat',        '#8b5cf6', 'expense', true),
  ('Other Expense', 'รายจ่ายอื่นๆ',           'minus-circle',  '#6b7280', 'expense', true)
) as v(name, name_th, icon, color, type, is_system)
where not exists (
  select 1 from public.categories where is_system = true limit 1
);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: auto-update account balance
-- ============================================================
create or replace function public.update_account_balance()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_delta numeric(15,2) := 0;
begin
  if TG_OP = 'DELETE' then
    if OLD.type = 'income'   then v_delta := -OLD.amount; end if;
    if OLD.type = 'expense'  then v_delta :=  OLD.amount; end if;
    if OLD.type = 'transfer' then
      update accounts set balance = balance + OLD.amount where id = OLD.account_id;
      update accounts set balance = balance - OLD.amount where id = OLD.to_account_id;
      return OLD;
    end if;
    update accounts set balance = balance + v_delta where id = OLD.account_id;
    return OLD;
  end if;

  if TG_OP = 'INSERT' then
    if NEW.type = 'income'   then v_delta :=  NEW.amount; end if;
    if NEW.type = 'expense'  then v_delta := -NEW.amount; end if;
    if NEW.type = 'transfer' then
      update accounts set balance = balance - NEW.amount where id = NEW.account_id;
      update accounts set balance = balance + NEW.amount where id = NEW.to_account_id;
      return NEW;
    end if;
    update accounts set balance = balance + v_delta where id = NEW.account_id;
    return NEW;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_transaction_balance on public.transactions;
create trigger trg_transaction_balance
  after insert or delete on public.transactions
  for each row execute procedure public.update_account_balance();
