'use client'

import { usePathname } from 'next/navigation'
import BottomTabBar from '@/components/BottomTabBar'
import { cn } from '@/lib/utils'

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full flex-col',
          isAdmin ? 'max-w-7xl' : 'max-w-[430px] pb-24',
        )}
      >
        {children}
      </div>
      {!isAdmin && <BottomTabBar />}
    </>
  )
}
