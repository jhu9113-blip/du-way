'use client'

import { useState } from 'react'
import {
  Clock,
  Ruler,
  ArrowUpDown,
  TriangleAlert,
  Mountain,
  CheckCircle2,
  Accessibility,
  Zap,
  Building2,
  Info,
} from 'lucide-react'
import { useAppState } from '@/lib/store'
import AppHeader from '@/components/AppHeader'
import MapCanvas from '@/components/map/MapCanvas'
import { buildings, facilities, routes } from '@/data/mock'
import type { RouteResult } from '@/types'
import { DEMO, formatDistance, formatDuration, getBuilding } from '@/lib/demo'
import { cn } from '@/lib/utils'

type Kind = 'ACCESSIBLE' | 'FAST'

export default function RoutePage() {
  const { demoNoRoute } = useAppState()
  const [kind, setKind] = useState<Kind>('ACCESSIBLE')

  const route = routes[kind]
  const dest = getBuilding(DEMO.nextCourseBuildingId)

  if (demoNoRoute) {
    return (
      <main className="flex flex-1 flex-col px-5 pt-8">
        <AppHeader title="길안내" />
        <div
          role="alert"
          className="mt-4 flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-8 text-center"
        >
          <TriangleAlert className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-lg font-bold text-foreground">조건에 맞는 경로를 찾지 못했어요</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            이동 조건을 완화하거나 설정에서 우선순위를 조정한 뒤 다시 시도해 주세요.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col px-5 pt-8">
      <AppHeader
        title="길안내"
        subtitle={`${DEMO.fromBuildingName} → ${DEMO.nextCourseBuilding} ${DEMO.nextCourseRoom}호`}
      />

      {/* 경로 선택 탭 */}
      <div
        role="tablist"
        aria-label="경로 종류 선택"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-secondary p-1.5"
      >
        <TabButton
          active={kind === 'ACCESSIBLE'}
          onClick={() => setKind('ACCESSIBLE')}
          icon={<Accessibility className="size-5" aria-hidden="true" />}
          label="무장애 경로"
        />
        <TabButton
          active={kind === 'FAST'}
          onClick={() => setKind('FAST')}
          icon={<Zap className="size-5" aria-hidden="true" />}
          label="빠른 경로"
        />
      </div>

      {/* 지도 */}
      <section aria-label={kind === 'ACCESSIBLE' ? '무장애 경로 지도' : '빠른 경로 지도'} className="mt-4">
        <div className="h-64 w-full overflow-hidden rounded-2xl">
          <MapCanvas
            buildings={buildings}
            facilities={facilities}
            route={route}
            highlightBuildingId={DEMO.nextCourseBuildingId}
          />
        </div>
        {/* 선/기호 범례 (색상만으로 구분하지 않음) */}
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          {kind === 'ACCESSIBLE' ? '실선: 무장애 경로' : '파선: 빠른 경로'} · 원형 기호는 시설 위치입니다.
        </p>
      </section>

      {/* 요약 지표 */}
      <section aria-label="경로 요약" className="mt-4 grid grid-cols-3 gap-3">
        <Metric icon={<Clock className="size-5" aria-hidden="true" />} label="예상 시간" value={formatDuration(route.durationSec)} />
        <Metric icon={<Ruler className="size-5" aria-hidden="true" />} label="거리" value={formatDistance(route.distanceM)} />
        <Metric icon={<ArrowUpDown className="size-5" aria-hidden="true" />} label="계단" value={`${route.stairsCount}곳`} />
      </section>

      {/* 상태 배지 — 항상 아이콘 + 텍스트 병기 */}
      <section aria-label="경로 특성" className="mt-4 space-y-2">
        {route.warnings.length > 0 ? (
          route.warnings.map((w) => (
            <StatusRow
              key={w}
              tone="warn"
              icon={w.includes('급경사') ? <Mountain className="size-5" aria-hidden="true" /> : <TriangleAlert className="size-5" aria-hidden="true" />}
              text={w}
            />
          ))
        ) : (
          <StatusRow
            tone="ok"
            icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
            text="계단·급경사 없는 안전한 경로예요"
          />
        )}
        {route.elevatorCount > 0 && (
          <StatusRow tone="ok" icon={<CheckCircle2 className="size-5" aria-hidden="true" />} text={`엘리베이터 ${route.elevatorCount}곳 이용`} />
        )}
        {route.rampCount > 0 && (
          <StatusRow tone="ok" icon={<CheckCircle2 className="size-5" aria-hidden="true" />} text={`경사로 ${route.rampCount}곳 이용`} />
        )}
      </section>

      {/* 실내 안내 */}
      {dest?.indoorHint && (
        <section aria-label="실내 진입 안내" className="mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Building2 className="size-4" aria-hidden="true" />
            {dest.name} 진입 안내
          </p>
          <p className="mt-1.5 text-base leading-relaxed text-foreground">{dest.indoorHint}</p>
        </section>
      )}

      <div className="h-2" />
    </main>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-base font-bold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-2 py-3 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function StatusRow({ tone, icon, text }: { tone: 'warn' | 'ok'; icon: React.ReactNode; text: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border p-3 text-base font-medium',
        tone === 'warn'
          ? 'border-destructive/40 bg-destructive/5 text-destructive'
          : 'border-primary/30 bg-primary/5 text-foreground',
      )}
    >
      <span className={tone === 'warn' ? 'text-destructive' : 'text-primary'}>{icon}</span>
      {text}
    </div>
  )
}
