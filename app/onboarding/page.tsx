'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Footprints, Accessibility, Zap, HandHelping, ArrowRight, Route } from 'lucide-react'
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
    <main className="flex flex-1 flex-col px-5 pb-10 pt-10">
      <header className="mb-7">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
          <Route className="size-4" aria-hidden="true" />
          DU WAY
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-snug text-foreground text-balance">
          이동 조건에 맞춰
          <br />
          길을 안내해 드릴게요
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
          이름이나 학번 같은 개인정보는 묻지 않아요. 이동에 필요한 조건만 알려주시면 됩니다.
        </p>
      </header>

      <section aria-labelledby="mobility-heading" className="mb-6">
        <h2 id="mobility-heading" className="mb-3 text-lg font-bold text-foreground">
          주로 어떻게 이동하세요?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {MOBILITY_OPTIONS.map(({ value, label, Icon }) => {
            const active = draft.mobility === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => patch({ mobility: value })}
                className={cn(
                  'flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-card px-3 py-4 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active ? 'border-primary bg-primary/5' : 'border-border',
                )}
              >
                <Icon
                  className={cn('size-7', active ? 'text-primary' : 'text-muted-foreground')}
                  aria-hidden="true"
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={cn('text-base font-semibold', active ? 'text-primary' : 'text-foreground')}>
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
        <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
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
        className="mt-auto flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        시작하기
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>
      <p className="mt-3 text-center text-base text-muted-foreground">설정은 나중에 언제든 바꿀 수 있어요.</p>
    </main>
  )
}
