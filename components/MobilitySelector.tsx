'use client'

import type { Settings } from '@/types'
import { cn } from '@/lib/utils'

const MOBILITY_OPTIONS: { value: Settings['mobility']; label: string }[] = [
  { value: 'WALK', label: '도보' },
  { value: 'ASSISTED', label: '도움 이동' },
  { value: 'POWER_WHEELCHAIR', label: '전동 휠체어' },
  { value: 'MANUAL_WHEELCHAIR', label: '수동 휠체어' },
]

type MobilitySelectorProps = {
  value: Settings['mobility']
  onChange: (value: Settings['mobility']) => void
  size?: 'onboarding' | 'settings'
}

export default function MobilitySelector({
  value,
  onChange,
  size = 'settings',
}: MobilitySelectorProps) {
  return (
    <div className={cn('grid grid-cols-2', size === 'onboarding' ? 'gap-4' : 'gap-3')}>
      {MOBILITY_OPTIONS.map((option) => {
        const active = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center rounded-[18px] border-0 px-3 text-center text-white shadow-md transition-[background-color,transform,box-shadow] hover:bg-[#3eaf60] active:scale-[.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              size === 'onboarding' ? 'min-h-[74px] py-4 text-[15px]' : 'min-h-[58px] py-3 text-sm',
              active ? 'bg-[#35a957] shadow-[0_5px_10px_rgba(21,116,49,0.2)]' : 'bg-[#46b967]',
            )}
          >
            <span className="font-semibold">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
