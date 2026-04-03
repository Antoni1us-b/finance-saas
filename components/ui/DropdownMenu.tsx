'use client'

import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import React, {
  createContext, useContext, useEffect, useRef, useState,
} from 'react'
import { createPortal } from 'react-dom'

// ── Context ───────────────────────────────────────────────────
interface DropdownCtx {
  open: boolean
  setOpen: (v: boolean) => void
  /** Ref to the root wrapper — used by Content to anchor the portal */
  anchorRef: React.RefObject<HTMLDivElement | null>
}
const Ctx = createContext<DropdownCtx>({ open: false, setOpen: () => {}, anchorRef: { current: null } })

// ── Root ──────────────────────────────────────────────────────
interface DropdownMenuProps {
  children: React.ReactNode
  /** Controlled open state (optional) */
  open?: boolean
  onOpenChange?: (v: boolean) => void
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined

  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v)
    onOpenChange?.(v)
  }

  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click — check both anchor and portal content
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node
      // Don't close if click is inside the anchor
      if (ref.current?.contains(target)) return
      // Don't close if click is inside a portaled dropdown
      if ((target as Element).closest?.('[data-dropdown-portal]')) return
      setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <Ctx.Provider value={{ open, setOpen, anchorRef: ref }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </Ctx.Provider>
  )
}

// ── Trigger ───────────────────────────────────────────────────
interface DropdownMenuTriggerProps {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>
  asChild?: boolean
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useContext(Ctx)

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick })
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

// ── Content (portaled to body to avoid overflow clipping) ─────
type Align = 'start' | 'center' | 'end'
type Side  = 'top' | 'bottom'

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: Align
  side?: Side
  className?: string
  minWidth?: string
}

export function DropdownMenuContent({
  children,
  align = 'end',
  side = 'bottom',
  className,
  minWidth = '11rem',
}: DropdownMenuContentProps) {
  const { open, anchorRef } = useContext(Ctx)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Calculate position from anchor element
  useEffect(() => {
    if (!open || !anchorRef.current) { setPos(null); return }

    function update() {
      const rect = anchorRef.current!.getBoundingClientRect()
      const scrollX = window.scrollX
      const scrollY = window.scrollY

      let top = side === 'top'
        ? scrollY + rect.top
        : scrollY + rect.bottom + 4              // 4px gap

      let left: number
      if (align === 'end') {
        left = scrollX + rect.right              // right-align: will be shifted by CSS right:0 trick below
      } else if (align === 'center') {
        left = scrollX + rect.left + rect.width / 2
      } else {
        left = scrollX + rect.left
      }

      setPos({ top, left })
    }

    update()
    window.addEventListener('scroll', update, true)   // capture to catch inner scrolls
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, side, align])

  // After render, clamp the dropdown so it doesn't overflow the viewport
  useEffect(() => {
    if (!open || !contentRef.current || !pos) return
    const el = contentRef.current
    const rect = el.getBoundingClientRect()

    // Prevent overflowing right edge
    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${window.innerWidth - rect.width - 8 + window.scrollX}px`
    }
    // Prevent overflowing bottom — flip to top if needed
    if (rect.bottom > window.innerHeight - 8) {
      const anchorRect = anchorRef.current!.getBoundingClientRect()
      el.style.top = `${window.scrollY + anchorRect.top - rect.height - 4}px`
    }
  }, [pos, open])

  if (!open || !pos) return null

  const transformOrigin = side === 'top' ? 'bottom' : 'top'

  const style: React.CSSProperties = {
    position: 'absolute',
    top: pos.top,
    // For 'end' alignment, anchor to right edge; for 'start' anchor to left
    ...(align === 'end'
      ? { right: undefined, left: pos.left, transform: 'translateX(-100%)' }
      : align === 'center'
        ? { left: pos.left, transform: 'translateX(-50%)' }
        : { left: pos.left }),
    minWidth,
    transformOrigin,
    zIndex: 9999,
  }

  return createPortal(
    <div
      ref={contentRef}
      data-dropdown-portal
      style={style}
      className={cn(
        'rounded-xl border border-slate-100 dark:border-slate-800',
        'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60',
        'py-1 overflow-hidden',
        'animate-in fade-in slide-in-from-top-1 duration-100',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  )
}

// ── Item ──────────────────────────────────────────────────────
interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  icon?: React.ElementType
  className?: string
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled,
  destructive,
  icon: Icon,
  className,
}: DropdownMenuItemProps) {
  const { setOpen } = useContext(Ctx)

  function handleClick() {
    if (disabled) return
    setOpen(false)
    onClick?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
        'text-slate-700 dark:text-slate-300',
        'hover:bg-slate-50 dark:hover:bg-slate-800',
        destructive && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 text-left">{children}</span>
    </button>
  )
}

// ── Sub menu ──────────────────────────────────────────────────
interface DropdownMenuSubProps {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
}

export function DropdownMenuSub({ label, icon: Icon, children }: DropdownMenuSubProps) {
  const [subOpen, setSubOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setSubOpen(true)}
      onMouseLeave={() => setSubOpen(false)}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {subOpen && (
        <div className="absolute left-full top-0 ml-0.5 z-50 min-w-[11rem] rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Separator ─────────────────────────────────────────────────
export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
}

// ── Label ─────────────────────────────────────────────────────
export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {children}
    </div>
  )
}
