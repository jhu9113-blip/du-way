'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
  icon?: ReactNode
}) {
  return (
    <label className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 py-1">
      <span className="flex items-start gap-3">
        {icon ? <span className="mt-0.5 text-primary" aria-hidden="true">{icon}</span> : null}
        <span>
          <span className="block text-base font-medium text-foreground">{label}</span>
          {description ? (
            <span className="mt-0.5 block text-base leading-relaxed text-muted-foreground">{description}</span>
          ) : null}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-11 w-[68px] shrink-0 items-center rounded-full border-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'border-primary bg-primary' : 'border-border bg-muted',
        )}
      >
        <span
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-full bg-card shadow-sm transition-transform',
            checked ? 'translate-x-7' : 'translate-x-0.5',
          )}
        >
          <span
            className={cn('text-[10px] font-bold', checked ? 'text-primary' : 'text-muted-foreground')}
            aria-hidden="true"
          >
            {checked ? 'ON' : 'OFF'}
          </span>
        </span>
      </button>
    </label>
  )
}
