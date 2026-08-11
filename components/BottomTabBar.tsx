'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Navigation, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/timetable', label: '시간표', Icon: CalendarDays },
  { href: '/route', label: '길안내', Icon: Navigation },
  { href: '/settings', label: '설정', Icon: Settings },
] as const

export default function BottomTabBar() {
  const pathname = usePathname()

  // 온보딩 화면에서는 탭바를 숨긴다
  if (pathname === '/onboarding') return null

  return (
    <nav
      aria-label="주요 화면 이동"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[56px] min-w-[44px] flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-6" aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
