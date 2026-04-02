import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 text-slate-400">{prefix}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm',
              'placeholder:text-slate-400 text-slate-800',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              prefix && 'pl-9',
              suffix && 'pr-9',
              error && 'border-red-400 focus:ring-red-400',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-slate-400">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm',
            'text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
