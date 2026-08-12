'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Footprints, Accessibility, Zap, HandHelping } from 'lucide-react'
import { useAppDispatch, useAppState } from '@/lib/store'
import type { Settings } from '@/types'
import Toggle from '@/components/Toggle'
import { cn } from '@/lib/utils'

const MOBILITY_OPTIONS: { value: Settings['mobility']; label: string; Icon: typeof Footprints }[] = [
  { value: 'WALK', label: '도보', Icon: Footprints },
  { value: 'MANUAL_WHEELCHAIR', label: '수동 휠체어', Icon: Accessibility },
  { value: 'POWER_WHEELCHAIR', label: '전동 휠체어', Icon: Zap },
  { value: 'ASSISTED', label: '도움 이동', Icon: HandHelping },
]

export default function OnboardingPage() {
  const { settings } = useAppState()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const [draft, setDraft] = useState<Settings>(settings)

  function patch(p: Partial<Settings>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  function finish() {
    dispatch({ type: 'SET_SETTINGS', payload: draft })
    dispatch({ type: 'SET_ONBOARDED', payload: true })
    router.replace('/')
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-8 pt-16">
      <header className="mb-14">
        <h1 className="text-[25px] font-bold leading-tight text-primary text-balance">
          이동 조건에 맞춰
          <br />
          길을 안내해 드릴게요
        </h1>
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground text-pretty">
          이름이나 학번 같은 개인정보는 묻지 않아요. 이동에 필요한 조건만 알려주시면 됩니다.
        </p>
      </header>

      <section aria-labelledby="mobility-heading" className="mb-14">
        <h2 id="mobility-heading" className="mb-3 text-lg font-bold text-foreground">
          주로 어떻게 이동하세요?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {MOBILITY_OPTIONS.map(({ value, label, Icon }) => {
            const active = draft.mobility === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => patch({ mobility: value })}
                className={cn(
                  'flex min-h-[74px] items-center justify-center gap-2 rounded-[18px] border-0 px-3 py-4 text-center shadow-sm transition-all active:scale-[.98]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active ? 'bg-[#35a957] text-white' : 'bg-[#54c477] text-white',
                )}
              >
                <Icon
                  className="size-6 opacity-80"
                  aria-hidden="true"
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className="text-[15px] font-semibold">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="pref-heading" className="mb-8">
        <h2 id="pref-heading" className="mb-2 text-lg font-bold text-foreground">
          경로에서 무엇을 피하거나 우선할까요?
        </h2>
        <div className="divide-y divide-[#e2e7e3] rounded-[20px] bg-white/90 px-5 py-1 shadow-sm">
          <Toggle
            checked={draft.avoidStairs}
            onChange={(v) => patch({ avoidStairs: v })}
            label="계단을 피해야 하나요?"
            description="계단이 없는 경로를 우선 안내합니다."
          />
          <Toggle
            checked={draft.preferElevator}
            onChange={(v) => patch({ preferElevator: v })}
            label="엘리베이터를 우선할까요?"
            description="층 이동 시 엘리베이터가 있는 길을 선택합니다."
          />
          <Toggle
            checked={draft.preferGentleSlope}
            onChange={(v) => patch({ preferGentleSlope: v })}
            label="완만한 경사를 우선할까요?"
            description="급경사 구간을 피해 완만한 길을 안내합니다."
          />
          <Toggle
            checked={draft.minimizeDistance}
            onChange={(v) => patch({ minimizeDistance: v })}
            label="최단 거리를 우선할까요?"
            description="조건이 같다면 더 짧은 경로를 선택합니다."
          />
        </div>
      </section>

      <button
        type="button"
        onClick={finish}
        className="mt-auto flex min-h-[48px] items-center justify-center rounded-[15px] bg-[#54c477] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[#45b968] active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        시작하기
      </button>
      <p className="mt-3 text-center text-base text-muted-foreground">설정은 나중에 언제든 바꿀 수 있어요.</p>
    </main>
  )
}
