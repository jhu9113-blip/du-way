'use client'

import { usePathname } from 'next/navigation'
import BottomTabBar from '@/components/BottomTabBar'
import { cn } from '@/lib/utils'

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isEntryFlow = pathname === '/welcome' || pathname === '/onboarding'

  return (
    <>
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full flex-col',
          isAdmin ? 'max-w-7xl' : cn('max-w-[430px]', !isEntryFlow && 'pb-24'),
        )}
      >
        {children}
      </div>
      {!isAdmin && !isEntryFlow && <BottomTabBar />}
    </>
  )
}
