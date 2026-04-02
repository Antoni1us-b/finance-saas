'use client'

import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import React, {
  createContext, useContext, useEffect, useRef, useState,
} from 'react'

// ── Context ───────────────────────────────────────────────────
interface DropdownCtx {
  open: boolean
  setOpen: (v: boolean) => void
}
const Ctx = createContext<DropdownCtx>({ open: false, setOpen: () => {} })

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

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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
    <Ctx.Provider value={{ open, setOpen }}>
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

// ── Content ───────────────────────────────────────────────────
type Align = 'start' | 'center' | 'end'
type Side  = 'top' | 'bottom'

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: Align
  side?: Side
  className?: string
  minWidth?: string
}

const alignClass: Record<Align, string> = {
  start:  'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end:    'right-0',
}

const sideClass: Record<Side, string> = {
  bottom: 'top-full mt-1',
  top:    'bottom-full mb-1',
}

export function DropdownMenuContent({
  children,
  align = 'end',
  side = 'bottom',
  className,
  minWidth = '11rem',
}: DropdownMenuContentProps) {
  const { open } = useContext(Ctx)
  if (!open) return null

  return (
    <div
      style={{ minWidth }}
      className={cn(
        'absolute z-50 rounded-xl border border-slate-100 dark:border-slate-800',
        'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60',
        'py-1 overflow-hidden',
        'animate-in fade-in slide-in-from-top-1 duration-100',
        alignClass[align],
        sideClass[side],
        className,
      )}
    >
      {children}
    </div>
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
