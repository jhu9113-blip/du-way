'use client'

import { Minus, Plus, ArrowUpDown, ArrowUp, Route as RouteIcon, Ruler, FlaskConical, Info } from 'lucide-react'
import { useAppDispatch, useAppState } from '@/lib/store'
import type { Settings } from '@/types'
import AppHeader from '@/components/AppHeader'
import Toggle from '@/components/Toggle'
import MobilitySelector from '@/components/MobilitySelector'

export default function SettingsPage() {
  const { settings, demoGpsFailed, demoNoRoute } = useAppState()
  const dispatch = useAppDispatch()

  function patch(p: Partial<Settings>) {
    dispatch({ type: 'PATCH_SETTINGS', payload: p })
  }

  function setBuffer(next: number) {
    const clamped = Math.max(0, Math.min(30, next))
    patch({ bufferMinutes: clamped })
  }

  return (
    <main className="flex flex-1 flex-col px-6 pt-12">
      <AppHeader title="설정" subtitle="시연에 사용할 이동 조건과 여유 시간을 조정하세요." />

      <div className="sr-only">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>현재 경로와 안내 시간은 시연용 고정값이며, 설정에 따라 다시 계산되지 않습니다.</p>
      </div>

      {/* 이동 수단 */}
      <section aria-labelledby="mobility-h" className="mb-6">
        <h2 id="mobility-h" className="mb-3 text-lg font-bold text-foreground">
          이동 수단
        </h2>
        <MobilitySelector
          value={settings.mobility}
          onChange={(mobility) => patch({ mobility })}
        />
      </section>

      {/* 경로 우선순위 */}
      <section aria-labelledby="pref-h" className="mb-6">
        <h2 id="pref-h" className="mb-2 text-lg font-bold text-foreground">
          경로 우선순위
        </h2>
        <div className="divide-y divide-[#e2e7e3] rounded-[20px] bg-white/90 px-5 py-1 shadow-sm">
          <Toggle
            checked={settings.avoidStairs}
            onChange={(v) => patch({ avoidStairs: v })}
            label="계단 피하기"
            description="계단이 없는 경로를 우선합니다."
            icon={<ArrowUpDown className="size-5" />}
          />
          <Toggle
            checked={settings.preferElevator}
            onChange={(v) => patch({ preferElevator: v })}
            label="엘리베이터 우선"
            description="층 이동 시 엘리베이터를 이용합니다."
            icon={<ArrowUp className="size-5" />}
          />
          <Toggle
            checked={settings.preferGentleSlope}
            onChange={(v) => patch({ preferGentleSlope: v })}
            label="완만한 경사 우선"
            description="급경사 구간을 피합니다."
            icon={<RouteIcon className="size-5" />}
          />
          <Toggle
            checked={settings.minimizeDistance}
            onChange={(v) => patch({ minimizeDistance: v })}
            label="최단 거리 우선"
            description="조건이 같다면 더 짧은 경로를 택합니다."
            icon={<Ruler className="size-5" />}
          />
        </div>
      </section>

      {/* 버퍼 시간 */}
      <section aria-labelledby="buffer-h" className="mb-6">
        <h2 id="buffer-h" className="mb-2 text-lg font-bold text-foreground">
          도착 여유 시간
        </h2>
        <div className="flex items-center justify-between rounded-[20px] border-0 bg-white/90 p-5 shadow-sm">
          <div>
            <p className="text-base font-medium text-foreground">버퍼 {settings.bufferMinutes}분</p>
            <p className="mt-0.5 text-base text-muted-foreground">시연용 도착 여유 선호값으로 저장됩니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="버퍼 시간 1분 줄이기"
              onClick={() => setBuffer(settings.bufferMinutes - 1)}
              disabled={settings.bufferMinutes === 0}
              className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Minus className="size-5" aria-hidden="true" />
            </button>
            <span className="w-10 text-center text-xl font-bold tabular-nums text-foreground" aria-live="polite">
              {settings.bufferMinutes}
            </span>
            <button
              type="button"
              aria-label="버퍼 시간 1분 늘리기"
              onClick={() => setBuffer(settings.bufferMinutes + 1)}
              disabled={settings.bufferMinutes === 30}
              className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 시연용 시뮬레이션 */}
      <section aria-labelledby="demo-h" className="mb-4">
        <h2 id="demo-h" className="mb-2 inline-flex items-center gap-2 text-lg font-bold text-foreground">
          <FlaskConical className="size-5 text-muted-foreground" aria-hidden="true" />
          시연용 상황 재현
        </h2>
        <div className="divide-y divide-border rounded-2xl border border-dashed border-border bg-secondary px-4">
          <Toggle
            checked={demoGpsFailed}
            onChange={(v) => dispatch({ type: 'SET_DEMO_GPS_FAILED', payload: v })}
            label="GPS 실패 상황"
            description="현재 위치를 못 잡은 상황을 재현합니다."
          />
          <Toggle
            checked={demoNoRoute}
            onChange={(v) => dispatch({ type: 'SET_DEMO_NO_ROUTE', payload: v })}
            label="경로 없음 상황"
            description="조건에 맞는 경로가 없는 상황을 재현합니다."
          />
        </div>
      </section>
    </main>
  )
}
