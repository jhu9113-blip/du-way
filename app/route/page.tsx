'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  SlidersHorizontal,
} from 'lucide-react'
import { useAppState } from '@/lib/store'
import { useEditableDemoState } from '@/lib/editable-demo-store'
import AppHeader from '@/components/AppHeader'
import MapCanvas from '@/components/map/MapCanvas'
import { formatDistance, formatDuration } from '@/lib/demo'
import { cn } from '@/lib/utils'

type Kind = 'ACCESSIBLE' | 'FAST'

export default function RoutePage() {
  const { demoGpsFailed, demoNoRoute } = useAppState()
  const { buildings, facilities, routes, demo } = useEditableDemoState()
  const [kind, setKind] = useState<Kind>('ACCESSIBLE')

  const route = routes[kind]
  const dest = buildings.find((building) => building.id === demo.nextCourseBuildingId)

  if (demoNoRoute) {
    return (
      <main className="flex flex-1 flex-col px-7 pt-10">
        <AppHeader title="길안내" />
        <div
          role="alert"
          className="mt-4 flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-8 text-center"
        >
          <TriangleAlert className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-lg font-bold text-foreground">조건에 맞는 경로를 찾지 못했어요</p>
          <p className="text-base leading-relaxed text-muted-foreground">
            이동 조건을 완화하거나 설정에서 우선순위를 조정한 뒤 다시 시도해 주세요.
          </p>
          <Link
            href="/settings"
            className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <SlidersHorizontal className="size-5" aria-hidden="true" />
            설정에서 조건 조정하기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col px-7 pt-10">
      <AppHeader
        title="길안내"
        subtitle={`${demo.fromBuildingName} → ${demo.nextCourseBuilding} ${demo.nextCourseRoom}호`}
      />

      {demoGpsFailed && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4"
        >
          <TriangleAlert className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-base font-bold text-foreground">현재 위치를 확인할 수 없어요</p>
            <p className="mt-1 text-base leading-relaxed text-muted-foreground">
              시연용 출발지인 {demo.fromBuildingName}을 기준으로 계속 안내합니다.
            </p>
            <Link
              href="/settings"
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-base font-bold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              GPS 실패 상황 해제하기
            </Link>
          </div>
        </div>
      )}

      {/* 경로 선택 탭 */}
      <div
        role="tablist"
        aria-label="경로 종류 선택"
        className="grid grid-cols-2 gap-2 rounded-2xl border-0 bg-[#b6ffb9] p-2"
      >
        <TabButton
          id="route-tab-accessible"
          active={kind === 'ACCESSIBLE'}
          onClick={() => setKind('ACCESSIBLE')}
          icon={<Accessibility className="size-5" aria-hidden="true" />}
          label="무장애 경로"
        />
        <TabButton
          id="route-tab-fast"
          active={kind === 'FAST'}
          onClick={() => setKind('FAST')}
          icon={<Zap className="size-5" aria-hidden="true" />}
          label="빠른 경로"
        />
      </div>

      <div
        id="route-details"
        role="tabpanel"
        aria-labelledby={`route-tab-${kind.toLowerCase()}`}
      >
      {/* 지도 */}
      <section aria-label={kind === 'ACCESSIBLE' ? '무장애 경로 지도' : '빠른 경로 지도'} className="mt-4">
        <div className="h-52 w-full overflow-hidden rounded-[20px] shadow-sm">
          <MapCanvas
            buildings={buildings}
            facilities={facilities}
            route={route}
            highlightBuildingId={demo.nextCourseBuildingId}
          />
        </div>
        {/* 선/기호 범례 (색상만으로 구분하지 않음) */}
        <p className="mt-2 flex items-center gap-1.5 text-base text-muted-foreground">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          {kind === 'ACCESSIBLE' ? '실선: 무장애 경로' : '파선: 빠른 경로'} · 원형 기호는 시설 위치입니다.
        </p>
      </section>

      {/* 요약 지표 */}
      <section aria-label="경로 요약" className="mt-4 grid grid-cols-3 gap-2">
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
          <p className="inline-flex items-center gap-2 text-base font-semibold text-primary">
            <Building2 className="size-4" aria-hidden="true" />
            {dest.name} 진입 안내
          </p>
          <p className="mt-1.5 text-base leading-relaxed text-foreground">{dest.indoorHint}</p>
        </section>
      )}
      </div>

      <div className="h-2" />
    </main>
  )
}

function TabButton({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls="route-details"
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

        const tabs = Array.from(
          event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [],
        )
        if (tabs.length === 0) return

        event.preventDefault()
        const currentIndex = tabs.indexOf(event.currentTarget)
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : event.key === 'ArrowRight'
                ? (currentIndex + 1) % tabs.length
                : (currentIndex - 1 + tabs.length) % tabs.length

        tabs[nextIndex]?.focus()
        tabs[nextIndex]?.click()
      }}
      className={cn(
        'flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-base font-bold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active ? 'bg-[#76cf82] text-[#075d16] shadow-sm' : 'text-[#176c25]',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border-0 bg-[#65c781] px-2 py-3 text-center text-white shadow-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-base text-muted-foreground">{label}</span>
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
