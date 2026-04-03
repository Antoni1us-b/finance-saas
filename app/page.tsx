import {
  ArrowRight, BarChart3, Bell, CreditCard, Globe, Lock,
  PiggyBank, Search, Shield, Sparkles, Target, TrendingUp,
  Users, Wallet, Zap,
} from 'lucide-react'
import Link from 'next/link'

/* ─────────────────────────── data ─────────────────────────── */

const features = [
  {
    icon: Wallet,
    title: 'หลายบัญชี',
    titleEn: 'Multi-Account',
    desc: 'จัดการบัญชีธนาคาร บัตรเครดิต เงินสด และกระเป๋าเงินดิจิทัลในที่เดียว',
    color: 'bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
  },
  {
    icon: BarChart3,
    title: 'แดชบอร์ดอัจฉริยะ',
    titleEn: 'Smart Dashboard',
    desc: 'เห็นภาพรวมรายรับ-รายจ่ายแบบเรียลไทม์พร้อมกราฟที่อ่านง่าย',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    icon: Target,
    title: 'เป้าหมายการออม',
    titleEn: 'Goal Tracking',
    desc: 'ตั้งเป้าหมายการเงินและติดตามความคืบหน้าแบบ visual progress bar',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  },
  {
    icon: Bell,
    title: 'การแจ้งเตือน',
    titleEn: 'Smart Notifications',
    desc: 'ได้รับการแจ้งเตือนรายการซ้ำ งบประมาณใกล้ครบ และบิลที่กำลังจะถึงกำหนด',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
  {
    icon: Search,
    title: 'ค้นหาขั้นสูง',
    titleEn: 'Advanced Search',
    desc: 'ค้นหารายการธุรกรรมจากชื่อ หมวดหมู่ จำนวน หรือบัญชีได้ทันที',
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  },
  {
    icon: Globe,
    title: 'หลายสกุลเงิน',
    titleEn: 'Multi-Currency',
    desc: 'รองรับ THB, USD, EUR และอีกมากมาย พร้อมแปลงอัตราแลกเปลี่ยน',
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  },
]

const stats = [
  { value: '10,000+', label: 'ผู้ใช้งาน' },
  { value: '2M+',     label: 'รายการบันทึก' },
  { value: '99.9%',   label: 'Uptime' },
  { value: '4.9/5',   label: 'ความพึงพอใจ' },
]

const testimonials = [
  {
    name: 'สมชาย ก.',
    role: 'Freelancer',
    text: 'FinFlow ช่วยให้ผมเห็นภาพรวมการเงินที่ชัดเจนขึ้นมาก จากที่ไม่เคยจดบันทึก ตอนนี้ติดตามทุกบาททุกสตางค์',
  },
  {
    name: 'พิมพ์ใจ ว.',
    role: 'พนักงานบริษัท',
    text: 'ใช้งานง่ายมาก UI สวย ตั้งเป้าหมายออมเงินแล้วเห็น progress bar ทำให้มีแรงบันดาลใจเก็บเงิน',
  },
  {
    name: 'ธนกร ส.',
    role: 'เจ้าของธุรกิจ',
    text: 'จัดการได้หลายบัญชีในที่เดียว ไม่ต้องเปิดหลายแอป Dashboard สรุปให้เห็นภาพรวมทันที',
  },
]

/* ─────────────────────── component ────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ━━━ Navbar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 md:px-6 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <CreditCard className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Fin<span className="text-brand-600">Flow</span>
            </span>
          </Link>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              เริ่มใช้งานฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ Hero ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-100/40 dark:bg-brand-900/20 blur-3xl" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-violet-100/40 dark:bg-violet-900/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            ฟรี — ไม่ต้องผูกบัตรเครดิต
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
            จัดการเงินง่ายๆ
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              ในที่เดียว
            </span>
            {' '}กับ FinFlow
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ติดตามรายรับ-รายจ่าย จัดการหลายบัญชี ตั้งเป้าหมายออมเงิน
            <br className="hidden md:block" />
            และดูภาพรวมการเงินทั้งหมดแบบเรียลไทม์
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 px-7 py-3.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-200 dark:shadow-brand-900/40"
            >
              เริ่มใช้งานฟรี
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-base font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-7 py-3.5 rounded-2xl transition-all"
            >
              ทดลองใช้ Demo
            </Link>
          </div>

          {/* Hero dashboard mockup */}
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="relative rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/60 overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-lg bg-slate-100 dark:bg-slate-800 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-[11px] text-slate-400">app.finflow.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Mockup content */}
              <div className="p-4 md:p-6 grid grid-cols-3 gap-3 md:gap-4">
                {/* Stat cards */}
                {[
                  { label: 'ยอมคงเหลือ', value: '฿124,500', change: '+12%', color: 'text-brand-600', icon: TrendingUp },
                  { label: 'รายรับเดือนนี้', value: '฿45,000', change: '+8%', color: 'text-emerald-600', icon: PiggyBank },
                  { label: 'รายจ่ายเดือนนี้', value: '฿28,350', change: '-5%', color: 'text-rose-500', icon: CreditCard },
                ].map(({ label, value, change, color, icon: Icon }) => (
                  <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] md:text-xs text-slate-400">{label}</span>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <p className={`text-sm md:text-lg font-bold ${color} tabular-nums`}>{value}</p>
                    <span className="text-[10px] text-slate-400">{change} จากเดือนก่อน</span>
                  </div>
                ))}
              </div>

              {/* Fake chart area */}
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <div className="h-32 md:h-48 rounded-xl bg-gradient-to-t from-brand-50 to-white dark:from-brand-950/30 dark:to-slate-800 border border-slate-100 dark:border-slate-700 flex items-end justify-around px-4 pb-4 gap-2">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-brand-500/80 dark:bg-brand-400/60 max-w-[30px]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Social Proof Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tabular-nums">
                  {value}
                </p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Features ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-medium mb-4">
              <Zap className="h-3.5 w-3.5" />
              คุณสมบัติเด่น
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              ทุกสิ่งที่คุณต้องการ
              <br />
              <span className="text-brand-600">จัดการการเงินส่วนตัว</span>
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              ออกแบบมาเพื่อให้การจัดการเงินเป็นเรื่องง่ายและสนุก ไม่ว่าจะเป็นมือใหม่หรือมืออาชีพ
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, titleEn, desc, color }) => (
              <div
                key={title}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-slate-100/60 dark:hover:shadow-slate-900/40 hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {title}
                  <span className="text-xs font-normal text-slate-400 ml-2">{titleEn}</span>
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Testimonials ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-4">
              <Users className="h-3.5 w-3.5" />
              เสียงจากผู้ใช้จริง
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              ผู้ใช้กว่าหมื่นคน<span className="text-brand-600">ไว้วางใจ</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text }) => (
              <div
                key={name}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Security trust bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-slate-400">
            {[
              { icon: Shield, label: 'SSL Encryption' },
              { icon: Lock, label: 'RLS Protected' },
              { icon: Zap, label: '99.9% Uptime' },
              { icon: Globe, label: 'Hosted on Vercel' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 p-10 md:p-16 text-center">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/10 blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                พร้อมจัดการเงินอย่างมืออาชีพ?
              </h2>
              <p className="mt-4 text-brand-100 text-lg max-w-xl mx-auto">
                สมัครฟรีวันนี้ เริ่มติดตามการเงินของคุณได้ทันที ไม่ต้องผูกบัตรเครดิต
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-base font-semibold text-brand-600 bg-white hover:bg-brand-50 px-7 py-3.5 rounded-2xl transition-all active:scale-95 shadow-lg"
                >
                  สมัครสมาชิกฟรี
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-base font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/50 px-7 py-3.5 rounded-2xl transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Footer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                Fin<span className="text-brand-600">Flow</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-brand-600 transition-colors">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="hover:text-brand-600 transition-colors">
                สมัครสมาชิก
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} FinFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
