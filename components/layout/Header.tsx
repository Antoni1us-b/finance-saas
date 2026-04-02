'use client'

import { NotificationCenter } from '@/components/ui/NotificationCenter'
import { Button } from '@/components/ui/Button'
import { Menu, Plus, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const titles: Record<string, { th: string; en: string }> = {
  '/dashboard':     { th: 'ภาพรวม',    en: 'Dashboard' },
  '/accounts':      { th: 'บัญชี',      en: 'Accounts' },
  '/transactions':  { th: 'รายการ',     en: 'Transactions' },
  '/subscriptions': { th: 'บริการ',     en: 'Subscriptions' },
  '/goals':         { th: 'เป้าหมาย',  en: 'Goals' },
  '/settings':      { th: 'ตั้งค่า',   en: 'Settings' },
}

// Pages that have their own search UI (don't show global search shortcut)
const PAGES_WITH_SEARCH = ['/transactions', '/accounts', '/subscriptions']

interface HeaderProps {
  onMenuClick: () => void
  onAddClick?: () => void
}

export function Header({ onMenuClick, onAddClick }: HeaderProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const page     = Object.entries(titles).find(([k]) => pathname === k || pathname.startsWith(k + '/'))?.[1]
    ?? { th: 'FinFlow', en: '' }

  const showSearchShortcut = PAGES_WITH_SEARCH.some(p => pathname.startsWith(p))

  function handleSearchClick() {
    // Focus the search input on the current page if it exists
    const searchInput = document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="ค้นหา"]')
    if (searchInput) {
      searchInput.focus()
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      // Navigate to transactions as the primary search page
      router.push('/transactions')
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-4 md:px-6 border-b border-slate-100 dark:border-slate-800">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-none">{page.th}</h1>
          {page.en && <p className="text-[11px] text-slate-400 mt-0.5">{page.en}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Search shortcut — scrolls to / focuses the page search input */}
        {showSearchShortcut && (
          <button
            onClick={handleSearchClick}
            title="ค้นหา"
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {/* Notification center */}
        <NotificationCenter />

        {/* Add button */}
        {onAddClick && (
          <Button size="sm" onClick={onAddClick} className="hidden sm:inline-flex ml-1">
            <Plus className="h-4 w-4" />
            เพิ่มรายการ
          </Button>
        )}
      </div>
    </header>
  )
}
