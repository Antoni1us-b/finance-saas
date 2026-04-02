/**
 * IconMapper — Maps account names / subscription names / categories
 * to brand-specific colors and icons.
 *
 * Priority order:
 *  1. Exact normalized name match
 *  2. Partial name match
 *  3. AccountType / fallback default
 */

import {
  Briefcase, Building2, Car, Cloud, CreditCard, Film, Gift,
  Heart, Home, Laptop, Music, Plus, ShoppingBag, SmartphoneIcon,
  Tag, Target, TrendingUp, Utensils, Wallet,
} from 'lucide-react'
import type React from 'react'

// ── Brand config ──────────────────────────────────────────────
export interface BrandConfig {
  bg: string                     // background color (hex)
  fg: string                     // icon color (hex)
  Icon: React.ElementType        // Lucide icon component
}

// ── Normalize helper ──────────────────────────────────────────
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '')              // strip spaces
    .replace(/[+&()\-.,_]/g, '')      // strip common punctuation
}

// ── Brand map (keyed by normalized name fragment) ─────────────
const BRAND_MAP: [string, BrandConfig][] = [
  // ─── Thai Banks ───────────────────────────────────────────
  ['kbank',        { bg: '#16a34a', fg: '#ffffff', Icon: Building2 }],
  ['kasikorn',     { bg: '#16a34a', fg: '#ffffff', Icon: Building2 }],
  ['กสิกร',        { bg: '#16a34a', fg: '#ffffff', Icon: Building2 }],

  ['scb',          { bg: '#7c3aed', fg: '#ffffff', Icon: Building2 }],
  ['ไทยพาณิชย์',   { bg: '#7c3aed', fg: '#ffffff', Icon: Building2 }],

  ['ktb',          { bg: '#009c3f', fg: '#ffffff', Icon: Building2 }],
  ['krungthai',    { bg: '#009c3f', fg: '#ffffff', Icon: Building2 }],
  ['กรุงไทย',      { bg: '#009c3f', fg: '#ffffff', Icon: Building2 }],

  ['bbl',          { bg: '#1b4299', fg: '#ffffff', Icon: Building2 }],
  ['bangkokbank',  { bg: '#1b4299', fg: '#ffffff', Icon: Building2 }],
  ['กรุงเทพ',      { bg: '#1b4299', fg: '#ffffff', Icon: Building2 }],

  ['bay',          { bg: '#f59e0b', fg: '#78350f', Icon: Building2 }],
  ['krungsri',     { bg: '#f59e0b', fg: '#78350f', Icon: Building2 }],
  ['กรุงศรี',      { bg: '#f59e0b', fg: '#78350f', Icon: Building2 }],

  ['uob',          { bg: '#003087', fg: '#ffffff', Icon: Building2 }],
  ['tmb',          { bg: '#0052cc', fg: '#ffffff', Icon: Building2 }],
  ['ttb',          { bg: '#0052cc', fg: '#ffffff', Icon: Building2 }],
  ['ทหารไทย',      { bg: '#0052cc', fg: '#ffffff', Icon: Building2 }],

  ['gsb',          { bg: '#e91e8c', fg: '#ffffff', Icon: Building2 }],
  ['ออมสิน',       { bg: '#e91e8c', fg: '#ffffff', Icon: Building2 }],

  // ─── e-Wallets / Payments ─────────────────────────────────
  ['truemoney',    { bg: '#f97316', fg: '#ffffff', Icon: SmartphoneIcon }],
  ['ทรูมันนี่',    { bg: '#f97316', fg: '#ffffff', Icon: SmartphoneIcon }],
  ['tmw',          { bg: '#f97316', fg: '#ffffff', Icon: SmartphoneIcon }],

  ['promptpay',    { bg: '#0369a1', fg: '#ffffff', Icon: SmartphoneIcon }],
  ['พร้อมเพย์',    { bg: '#0369a1', fg: '#ffffff', Icon: SmartphoneIcon }],

  ['rabbitline',   { bg: '#00b900', fg: '#ffffff', Icon: SmartphoneIcon }],
  ['linepay',      { bg: '#00b900', fg: '#ffffff', Icon: SmartphoneIcon }],

  ['grab',         { bg: '#00b14f', fg: '#ffffff', Icon: SmartphoneIcon }],
  ['grabpay',      { bg: '#00b14f', fg: '#ffffff', Icon: SmartphoneIcon }],

  ['shopee',       { bg: '#f97316', fg: '#ffffff', Icon: ShoppingBag }],
  ['lazada',       { bg: '#6d28d9', fg: '#ffffff', Icon: ShoppingBag }],

  // ─── Streaming / Subscriptions ────────────────────────────
  ['netflix',      { bg: '#e50914', fg: '#ffffff', Icon: Film }],
  ['spotify',      { bg: '#1db954', fg: '#ffffff', Icon: Music }],
  ['youtube',      { bg: '#ff0000', fg: '#ffffff', Icon: Film }],

  ['icloud',       { bg: '#147efb', fg: '#ffffff', Icon: Cloud }],
  ['apple',        { bg: '#1c1c1e', fg: '#ffffff', Icon: Laptop }],

  ['adobe',        { bg: '#e83c23', fg: '#ffffff', Icon: Laptop }],

  ['lineman',      { bg: '#00b900', fg: '#ffffff', Icon: ShoppingBag }],
  ['linemanwongnai', { bg: '#00b900', fg: '#ffffff', Icon: ShoppingBag }],

  ['notion',       { bg: '#1c1c1e', fg: '#ffffff', Icon: Laptop }],
  ['figma',        { bg: '#a259ff', fg: '#ffffff', Icon: Laptop }],
  ['github',       { bg: '#24292e', fg: '#ffffff', Icon: Laptop }],
  ['vercel',       { bg: '#1c1c1e', fg: '#ffffff', Icon: Laptop }],

  // ─── Investment / Funds ───────────────────────────────────
  ['rmf',          { bg: '#0ea5e9', fg: '#ffffff', Icon: TrendingUp }],
  ['ssf',          { bg: '#6366f1', fg: '#ffffff', Icon: TrendingUp }],
  ['กองทุน',       { bg: '#0ea5e9', fg: '#ffffff', Icon: TrendingUp }],

  // ─── Generic Category fallbacks ───────────────────────────
  ['salary',       { bg: '#10b981', fg: '#ffffff', Icon: Briefcase }],
  ['เงินเดือน',    { bg: '#10b981', fg: '#ffffff', Icon: Briefcase }],
  ['freelance',    { bg: '#06b6d4', fg: '#ffffff', Icon: Laptop }],
  ['food',         { bg: '#f59e0b', fg: '#ffffff', Icon: Utensils }],
  ['อาหาร',        { bg: '#f59e0b', fg: '#ffffff', Icon: Utensils }],
  ['transport',    { bg: '#3b82f6', fg: '#ffffff', Icon: Car }],
  ['เดินทาง',      { bg: '#3b82f6', fg: '#ffffff', Icon: Car }],
  ['shopping',     { bg: '#ec4899', fg: '#ffffff', Icon: ShoppingBag }],
  ['ชอปปง',        { bg: '#ec4899', fg: '#ffffff', Icon: ShoppingBag }],
  ['housing',      { bg: '#f97316', fg: '#ffffff', Icon: Home }],
  ['บาน',          { bg: '#f97316', fg: '#ffffff', Icon: Home }],
  ['health',       { bg: '#10b981', fg: '#ffffff', Icon: Heart }],
  ['สุขภาพ',       { bg: '#10b981', fg: '#ffffff', Icon: Heart }],
  ['entertainment',{ bg: '#8b5cf6', fg: '#ffffff', Icon: Film }],
  ['สนทนาการ',     { bg: '#8b5cf6', fg: '#ffffff', Icon: Film }],
  ['gift',         { bg: '#ec4899', fg: '#ffffff', Icon: Gift }],
  ['ของขวญ',       { bg: '#ec4899', fg: '#ffffff', Icon: Gift }],
  ['investment',   { bg: '#6366f1', fg: '#ffffff', Icon: TrendingUp }],
  ['ลงทน',         { bg: '#6366f1', fg: '#ffffff', Icon: TrendingUp }],
]

// ── Account type defaults ─────────────────────────────────────
const TYPE_DEFAULTS: Record<string, BrandConfig> = {
  bank:       { bg: '#0ea5e9', fg: '#ffffff', Icon: Building2 },
  credit:     { bg: '#8b5cf6', fg: '#ffffff', Icon: CreditCard },
  investment: { bg: '#10b981', fg: '#ffffff', Icon: TrendingUp },
  cash:       { bg: '#f59e0b', fg: '#ffffff', Icon: Wallet },
  'e-wallet': { bg: '#f97316', fg: '#ffffff', Icon: SmartphoneIcon },
  income:     { bg: '#10b981', fg: '#ffffff', Icon: TrendingUp },
  expense:    { bg: '#ef4444', fg: '#ffffff', Icon: ShoppingBag },
  both:       { bg: '#6366f1', fg: '#ffffff', Icon: Tag },
}

// ── Core lookup ───────────────────────────────────────────────
export function getIconConfig(name: string, typeHint?: string): BrandConfig {
  const key = normalize(name)

  // 1. Exact match
  for (const [brand, config] of BRAND_MAP) {
    if (normalize(brand) === key) return config
  }

  // 2. Partial match (brand contained in name OR name contained in brand)
  for (const [brand, config] of BRAND_MAP) {
    const nb = normalize(brand)
    if (key.includes(nb) || nb.includes(key)) return config
  }

  // 3. Type-based default
  if (typeHint && TYPE_DEFAULTS[typeHint]) return TYPE_DEFAULTS[typeHint]

  // 4. Generic fallback
  return { bg: '#6366f1', fg: '#ffffff', Icon: Plus }
}

// ── React component ───────────────────────────────────────────
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface BrandIconProps {
  name: string
  typeHint?: string
  /** Override background color (e.g. from account.color field) */
  colorOverride?: string
  size?: IconSize
  className?: string
  /** Show first letter of name as fallback text instead of icon */
  showInitial?: boolean
}

const sizeMap: Record<IconSize, { wrap: string; icon: string; text: string }> = {
  xs: { wrap: 'h-7 w-7 rounded-lg',   icon: 'h-3.5 w-3.5', text: 'text-[10px]' },
  sm: { wrap: 'h-8 w-8 rounded-xl',   icon: 'h-4 w-4',     text: 'text-xs' },
  md: { wrap: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5',     text: 'text-sm' },
  lg: { wrap: 'h-11 w-11 rounded-2xl',icon: 'h-5 w-5',     text: 'text-base' },
  xl: { wrap: 'h-14 w-14 rounded-2xl',icon: 'h-6 w-6',     text: 'text-lg' },
}

export function BrandIcon({
  name,
  typeHint,
  colorOverride,
  size = 'md',
  className = '',
  showInitial = false,
}: BrandIconProps) {
  const config = getIconConfig(name, typeHint)
  const { Icon } = config
  const bg = colorOverride ?? config.bg
  const { wrap, icon, text } = sizeMap[size]

  return (
    <div
      className={`${wrap} flex items-center justify-center shrink-0 font-bold ${className}`}
      style={{ backgroundColor: bg, color: config.fg }}
    >
      {showInitial ? (
        <span className={text}>{name.slice(0, 1).toUpperCase()}</span>
      ) : (
        <Icon className={icon} />
      )}
    </div>
  )
}

// ── Category icon (uses icon name string from DB) ─────────────
const LUCIDE_MAP: Record<string, React.ElementType> = {
  briefcase:     Briefcase,
  laptop:        Laptop,
  'trending-up': TrendingUp,
  gift:          Gift,
  'plus-circle': Plus,
  utensils:      Utensils,
  car:           Car,
  'shopping-bag':ShoppingBag,
  home:          Home,
  heart:         Heart,
  film:          Film,
  music:         Music,
  smartphone:    SmartphoneIcon,
  'building-2':  Building2,
  'credit-card': CreditCard,
  wallet:        Wallet,
  tag:           Tag,
  target:        Target,
  shield:        Tag,
  plane:         Car,
}

interface CategoryIconProps {
  iconName: string   // icon string stored in DB (e.g. "briefcase")
  color: string      // hex color stored in DB
  size?: IconSize
  className?: string
}

export function CategoryIcon({ iconName, color, size = 'md', className = '' }: CategoryIconProps) {
  const Icon = LUCIDE_MAP[iconName] ?? Tag
  const { wrap, icon } = sizeMap[size]

  return (
    <div
      className={`${wrap} flex items-center justify-center shrink-0 ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className={icon} />
    </div>
  )
}
