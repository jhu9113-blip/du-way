'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, FlaskConical, LayoutDashboard, LogOut, MapPinned, Route, ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-store'
import { cn } from '@/lib/utils'

const ADMIN_MENU = [
  { href: '/admin', label: '대시보드', Icon: LayoutDashboard },
  { href: '/admin/buildings', label: '건물', Icon: Building2 },
  { href: '/admin/facilities', label: '시설', Icon: MapPinned },
  { href: '/admin/routes', label: '경로', Icon: Route },
  { href: '/admin/demo', label: '데모', Icon: FlaskConical },
] as const

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { authenticated, logout } = useAdminAuth()
  const isLogin = pathname === '/admin/login'

  useEffect(() => {
    if (!isLogin && !authenticated) router.replace('/admin/login')
    if (isLogin && authenticated) router.replace('/admin')
  }, [authenticated, isLogin, router])

  if (isLogin) return children

  if (!authenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <p className="text-base text-muted-foreground">관리자 로그인 화면으로 이동 중…</p>
      </main>
    )
  }

  function handleLogout() {
    logout()
    router.replace('/admin/login')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40 md:flex-row">
      <aside className="border-b border-border bg-card md:w-64 md:border-b-0 md:border-r">
        <div className="flex min-h-20 items-center justify-between gap-3 px-5 md:border-b md:border-border">
          <Link href="/admin" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-primary">DU WAY</span>
              <span className="block text-base font-bold text-foreground">관리자</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <LogOut className="size-5" aria-hidden="true" />
            로그아웃
          </button>
        </div>

        <nav aria-label="관리자 메뉴" className="overflow-x-auto px-3 pb-3 md:py-4">
          <ul className="flex gap-2 md:flex-col">
            {ADMIN_MENU.map(({ href, label, Icon, ...item }) => {
              const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
              const disabled = 'disabled' in item && item.disabled

              return (
                <li key={href} className="shrink-0">
                  {disabled ? (
                    <span
                      aria-disabled="true"
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-medium text-muted-foreground opacity-50"
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {label}
                      <span className="text-xs">준비 중</span>
                    </span>
                  ) : (
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-auto hidden border-t border-border p-3 md:block">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-base font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="size-5" aria-hidden="true" />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
