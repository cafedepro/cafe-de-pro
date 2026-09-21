import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }
>(function Field({ label, error, hint, id, className, ...props }, ref) {
  const inputId = id ?? props.name
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-base outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:border-emerald-700',
          error ? 'border-red-600' : 'border-stone-300',
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-stone-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-err`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
})

export function Button({
  variant = 'primary',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost'; loading?: boolean }) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-emerald-800 text-white hover:bg-emerald-900',
        variant === 'ghost' && 'text-stone-700 hover:bg-stone-200',
        className,
      )}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
      {children}
    </p>
  )
}

export function FullScreenMessage({ children }: { children: ReactNode }) {
  return <div className="grid h-full place-items-center p-6 text-stone-600">{children}</div>
}
