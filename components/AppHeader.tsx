import type { ReactNode } from 'react'

export default function AppHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-base font-semibold tracking-wide text-primary">DU WAY</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground text-balance">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-base leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  )
}
