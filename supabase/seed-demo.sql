-- ============================================================
-- Demo Account Seed Data
-- รัน function นี้หลังจาก user สมัครสมาชิก เพื่อใส่ข้อมูลจำลอง
-- ใช้ใน: app/api/demo/seed/route.ts
-- ============================================================

create or replace function public.seed_demo_data(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  acc_bank     uuid;
  acc_credit   uuid;
  acc_invest   uuid;
  acc_cash     uuid;
  acc_wallet   uuid;
  cat_salary   uuid;
  cat_freelance uuid;
  cat_food     uuid;
  cat_transport uuid;
  cat_shopping uuid;
  cat_housing  uuid;
  cat_health   uuid;
  cat_entertain uuid;
  cat_subs     uuid;
  sub_netflix  uuid;
  sub_spotify  uuid;
  goal_emerg   uuid;
  goal_japan   uuid;
  goal_house   uuid;
begin
  -- ── ป้องกันสร้างซ้ำ ──────────────────────────────────────
  if exists (select 1 from public.accounts where user_id = target_user_id limit 1) then
    raise exception 'Demo data already exists for this user';
  end if;

  -- ── Accounts ─────────────────────────────────────────────
  insert into public.accounts (user_id,name,type,balance,currency,color,icon)
  values (target_user_id,'กสิกรไทย ออมทรัพย์','bank',    125430,'THB','#16a34a','building-2')
  returning id into acc_bank;

  insert into public.accounts (user_id,name,type,balance,currency,color,icon)
  values (target_user_id,'SCB บัตรเครดิต','credit',   -8200,'THB','#7c3aed','credit-card')
  returning id into acc_credit;

  insert into public.accounts (user_id,name,type,balance,currency,color,icon)
  values (target_user_id,'กองทุน RMF','investment',210000,'THB','#0ea5e9','trending-up')
  returning id into acc_invest;

  insert into public.accounts (user_id,name,type,balance,currency,color,icon)
  values (target_user_id,'เงินสด','cash',3500,'THB','#f59e0b','wallet')
  returning id into acc_cash;

  insert into public.accounts (user_id,name,type,balance,currency,color,icon)
  values (target_user_id,'TrueMoney Wallet','e-wallet',1200,'THB','#f97316','smartphone')
  returning id into acc_wallet;

  -- ── ดึง system category IDs ───────────────────────────────
  select id into cat_salary    from public.categories where name='Salary'        and is_system=true limit 1;
  select id into cat_freelance from public.categories where name='Freelance'     and is_system=true limit 1;
  select id into cat_food      from public.categories where name='Food & Drink'  and is_system=true limit 1;
  select id into cat_transport from public.categories where name='Transport'     and is_system=true limit 1;
  select id into cat_shopping  from public.categories where name='Shopping'      and is_system=true limit 1;
  select id into cat_housing   from public.categories where name='Housing'       and is_system=true limit 1;
  select id into cat_health    from public.categories where name='Health'        and is_system=true limit 1;
  select id into cat_entertain from public.categories where name='Entertainment' and is_system=true limit 1;
  select id into cat_subs      from public.categories where name='Subscriptions' and is_system=true limit 1;

  -- ── Transactions (6 เดือนย้อนหลัง) ──────────────────────
  -- เดือน -5
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring) values
  (target_user_id,acc_bank,cat_salary,   'income', 65000, current_date - interval '5 months' + interval '1 day', 'เงินเดือน',true),
  (target_user_id,acc_bank,cat_housing,  'expense',12000, current_date - interval '5 months' + interval '5 days','ค่าเช่าบ้าน',true),
  (target_user_id,acc_cash,cat_food,     'expense',3200,  current_date - interval '5 months' + interval '6 days','ค่าอาหาร',false),
  (target_user_id,acc_bank,cat_transport,'expense',1800,  current_date - interval '5 months' + interval '7 days','น้ำมันรถ',false),
  (target_user_id,acc_credit,cat_shopping,'expense',4500, current_date - interval '5 months' + interval '10 days','ช้อปปิ้ง Central',false);

  -- เดือน -4
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring) values
  (target_user_id,acc_bank,cat_salary,   'income', 65000, current_date - interval '4 months' + interval '1 day','เงินเดือน',true),
  (target_user_id,acc_bank,cat_freelance,'income', 15000, current_date - interval '4 months' + interval '8 days','งาน Freelance เว็บ',false),
  (target_user_id,acc_bank,cat_housing,  'expense',12000, current_date - interval '4 months' + interval '5 days','ค่าเช่าบ้าน',true),
  (target_user_id,acc_cash,cat_food,     'expense',4100,  current_date - interval '4 months' + interval '6 days','ค่าอาหาร',false),
  (target_user_id,acc_bank,cat_transport,'expense',2100,  current_date - interval '4 months' + interval '8 days','น้ำมัน + ทางด่วน',false),
  (target_user_id,acc_credit,cat_health, 'expense',2500,  current_date - interval '4 months' + interval '14 days','ตรวจสุขภาพประจำปี',false);

  -- เดือน -3
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring) values
  (target_user_id,acc_bank,cat_salary,   'income', 65000, current_date - interval '3 months' + interval '1 day','เงินเดือน',true),
  (target_user_id,acc_bank,cat_housing,  'expense',12000, current_date - interval '3 months' + interval '5 days','ค่าเช่าบ้าน',true),
  (target_user_id,acc_cash,cat_food,     'expense',3800,  current_date - interval '3 months' + interval '6 days','ค่าอาหาร',false),
  (target_user_id,acc_credit,cat_entertain,'expense',1200,current_date - interval '3 months' + interval '12 days','ดูหนัง + ของว่าง',false),
  (target_user_id,acc_bank,cat_transport,'expense',1900,  current_date - interval '3 months' + interval '9 days','น้ำมัน',false);

  -- เดือน -2
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring) values
  (target_user_id,acc_bank,cat_salary,   'income', 65000, current_date - interval '2 months' + interval '1 day','เงินเดือน',true),
  (target_user_id,acc_bank,cat_freelance,'income', 8000,  current_date - interval '2 months' + interval '15 days','ออกแบบ Logo',false),
  (target_user_id,acc_bank,cat_housing,  'expense',12000, current_date - interval '2 months' + interval '5 days','ค่าเช่าบ้าน',true),
  (target_user_id,acc_cash,cat_food,     'expense',4500,  current_date - interval '2 months' + interval '6 days','ค่าอาหาร',false),
  (target_user_id,acc_credit,cat_shopping,'expense',7800, current_date - interval '2 months' + interval '18 days','Lazada Sale',false),
  (target_user_id,acc_bank,cat_transport,'expense',2200,  current_date - interval '2 months' + interval '7 days','น้ำมัน + Grab',false);

  -- เดือน -1
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring) values
  (target_user_id,acc_bank,cat_salary,   'income', 65000, current_date - interval '1 month'  + interval '1 day','เงินเดือน',true),
  (target_user_id,acc_bank,cat_housing,  'expense',12000, current_date - interval '1 month'  + interval '5 days','ค่าเช่าบ้าน',true),
  (target_user_id,acc_cash,cat_food,     'expense',3600,  current_date - interval '1 month'  + interval '6 days','ค่าอาหาร',false),
  (target_user_id,acc_bank,cat_transport,'expense',2000,  current_date - interval '1 month'  + interval '8 days','น้ำมัน',false),
  (target_user_id,acc_credit,cat_health, 'expense',800,   current_date - interval '1 month'  + interval '20 days','ซื้อยา',false),
  (target_user_id,acc_bank,cat_freelance,'income', 12000, current_date - interval '1 month'  + interval '22 days','งาน Next.js',false);

  -- เดือนนี้
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring) values
  (target_user_id,acc_bank,cat_salary,   'income', 65000, date_trunc('month',current_date),'เงินเดือน',true),
  (target_user_id,acc_bank,cat_housing,  'expense',12000, date_trunc('month',current_date) + interval '4 days','ค่าเช่าบ้าน',true),
  (target_user_id,acc_cash,cat_food,     'expense',1200,  current_date - interval '3 days','ข้าวกะเพรา + ก๋วยเตี๋ยว',false),
  (target_user_id,acc_bank,cat_transport,'expense',600,   current_date - interval '1 day','น้ำมัน',false);

  -- ── Subscriptions ─────────────────────────────────────────
  insert into public.subscriptions(user_id,account_id,category_id,name,amount,billing_cycle,next_billing,color,is_active,note)
  values (target_user_id,acc_bank,cat_subs,'Netflix',599,'monthly',
    (date_trunc('month',current_date) + interval '1 month' + interval '11 days')::date,
    '#e50914',true,'Premium 4K')
  returning id into sub_netflix;

  insert into public.subscriptions(user_id,account_id,category_id,name,amount,billing_cycle,next_billing,color,is_active,note)
  values (target_user_id,acc_bank,cat_subs,'Spotify',149,'monthly',
    (date_trunc('month',current_date) + interval '1 month' + interval '7 days')::date,
    '#1db954',true,'Individual')
  returning id into sub_spotify;

  insert into public.subscriptions(user_id,account_id,category_id,name,amount,billing_cycle,next_billing,color,is_active)
  values (target_user_id,acc_bank,cat_subs,'iCloud+ 200GB',35,'monthly',
    (date_trunc('month',current_date) + interval '1 month' + interval '2 days')::date,
    '#147efb',true);

  insert into public.subscriptions(user_id,account_id,category_id,name,amount,billing_cycle,next_billing,color,is_active,note)
  values (target_user_id,acc_credit,cat_subs,'Adobe Creative Cloud',1890,'monthly',
    (date_trunc('month',current_date) + interval '1 month' + interval '19 days')::date,
    '#e83c23',true,'All Apps Plan');

  insert into public.subscriptions(user_id,account_id,category_id,name,amount,billing_cycle,next_billing,color,is_active)
  values (target_user_id,acc_bank,cat_subs,'LINE MAN Wongnai Pro',129,'monthly',
    (date_trunc('month',current_date) + interval '1 month' + interval '14 days')::date,
    '#00b900',true);

  -- ── Goals ─────────────────────────────────────────────────
  insert into public.goals(user_id,account_id,name,target_amount,current_amount,target_date,icon,color,is_completed,note)
  values (target_user_id,acc_invest,'กองทุนฉุกเฉิน',200000,125430,
    (current_date + interval '6 months')::date,
    'shield','#10b981',false,'6 เดือนของค่าใช้จ่าย = 6 × ฿33,000')
  returning id into goal_emerg;

  insert into public.goals(user_id,account_id,name,target_amount,current_amount,target_date,icon,color,is_completed,note)
  values (target_user_id,acc_invest,'ท่องเที่ยวญี่ปุ่น',80000,32000,
    (current_date + interval '4 months')::date,
    'plane','#f59e0b',false,'ซากุระ เม.ย. ปีหน้า');

  insert into public.goals(user_id,account_id,name,target_amount,current_amount,target_date,icon,color,is_completed,note)
  values (target_user_id,acc_invest,'ดาวน์บ้าน',500000,210000,
    (current_date + interval '2 years')::date,
    'home','#0ea5e9',false,'ดาวน์ 10% บ้านราคา 5 ล้าน')
  returning id into goal_house;

  -- goal ที่สำเร็จแล้ว
  insert into public.goals(user_id,account_id,name,target_amount,current_amount,icon,color,is_completed)
  values (target_user_id,acc_invest,'MacBook Pro M3',79900,79900,'laptop','#6366f1',true);

  -- ── สร้าง transaction ของ subscription เดือนนี้ ──────────
  insert into public.transactions(user_id,account_id,category_id,type,amount,date,note,is_recurring,subscription_id)
  values
  (target_user_id,acc_bank,cat_subs,'expense',599,
   date_trunc('month',current_date) + interval '11 days','Netflix รายเดือน',true,sub_netflix),
  (target_user_id,acc_bank,cat_subs,'expense',149,
   date_trunc('month',current_date) + interval '7 days','Spotify รายเดือน',true,sub_spotify);

end;
$$;
