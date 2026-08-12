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
    <header className="mb-8 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[23px] font-bold leading-tight text-primary text-balance">{title}</h1>
        {subtitle ? (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  )
}
