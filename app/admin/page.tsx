'use client'

import Link from 'next/link'
import {
  Accessibility,
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  Info,
  LayoutDashboard,
  MapPinned,
  RefreshCcw,
  Route,
} from 'lucide-react'
import { useAppDispatch, useAppState } from '@/lib/store'
import { useEditableDemoDispatch, useEditableDemoState } from '@/lib/editable-demo-store'
import { formatDistance, formatDuration } from '@/lib/demo'

export default function AdminDashboardPage() {
  const { demoGpsFailed, demoNoRoute } = useAppState()
  const appDispatch = useAppDispatch()
  const { buildings, facilities, routes, courses, dirty } = useEditableDemoState()
  const demoDispatch = useEditableDemoDispatch()

  const facilityCounts = facilities.reduce<Record<string, number>>((counts, facility) => {
    counts[facility.type] = (counts[facility.type] ?? 0) + 1
    return counts
  }, {})

  function resetAll() {
    demoDispatch({ type: 'RESET_ALL' })
    appDispatch({ type: 'SET_DEMO_GPS_FAILED', payload: false })
    appDispatch({ type: 'SET_DEMO_NO_ROUTE', payload: false })
  }

  return (
    <main className="p-5 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-base font-semibold text-primary">
            <LayoutDashboard className="size-5" aria-hidden="true" />
            관리자 대시보드
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">DU WAY 데이터 현황</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            사용자 앱과 동일한 메모리 목업 상태를 확인합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={resetAll}
          disabled={!dirty && !demoGpsFailed && !demoNoRoute}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-bold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCcw className="size-5" aria-hidden="true" />
          전체 초기화
        </button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Building2 className="size-6" />} label="건물" value={`${buildings.length}개`} detail="캠퍼스 건물 목업" />
        <SummaryCard icon={<MapPinned className="size-6" />} label="접근성 시설" value={`${facilities.length}개`} detail={`엘리베이터 ${facilityCounts.ELEVATOR ?? 0} · 경사로 ${facilityCounts.RAMP ?? 0}`} />
        <SummaryCard icon={<Route className="size-6" />} label="등록 경로" value={`${Object.keys(routes).length}개`} detail="빠른 경로 · 무장애 경로" />
        <SummaryCard icon={<BookOpen className="size-6" />} label="데모 수업" value={`${courses.length}개`} detail="월요일 고정 시간표" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="route-summary" className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">경로 데이터</p>
              <h2 id="route-summary" className="mt-1 text-xl font-bold text-foreground">경로 요약</h2>
            </div>
            <Link
              href="/route"
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-base font-bold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Eye className="size-5" aria-hidden="true" />
              사용자 화면
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <RouteSummary
              title="무장애 경로"
              icon={<Accessibility className="size-5" />}
              distance={formatDistance(routes.ACCESSIBLE.distanceM)}
              duration={formatDuration(routes.ACCESSIBLE.durationSec)}
              detail={`계단 ${routes.ACCESSIBLE.stairsCount} · 엘리베이터 ${routes.ACCESSIBLE.elevatorCount} · 경사로 ${routes.ACCESSIBLE.rampCount}`}
            />
            <RouteSummary
              title="빠른 경로"
              icon={<Route className="size-5" />}
              distance={formatDistance(routes.FAST.distanceM)}
              duration={formatDuration(routes.FAST.durationSec)}
              detail={`계단 ${routes.FAST.stairsCount} · 경고 ${routes.FAST.warnings.length}`}
            />
          </div>
        </section>

        <section aria-labelledby="demo-status" className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-primary">시연 제어</p>
          <h2 id="demo-status" className="mt-1 text-xl font-bold text-foreground">예외 상태</h2>
          <div className="mt-4 space-y-3">
            <StatusItem label="GPS 실패" active={demoGpsFailed} />
            <StatusItem label="경로 없음" active={demoNoRoute} />
          </div>
          <Link
            href="/settings"
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 text-base font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            시연 상태 변경하기
          </Link>
        </section>
      </div>

      <section aria-labelledby="data-sections" className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="data-sections" className="text-xl font-bold text-foreground">데이터 관리 메뉴</h2>
            <p className="text-base text-muted-foreground">다음 스프린트부터 순서대로 편집 기능을 연결합니다.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['건물 관리', '시설 관리', '경로 관리', '데모 관리'].map((label) => (
            <div key={label} className="rounded-xl border border-dashed border-border bg-secondary/50 p-4">
              <p className="font-bold text-foreground">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">후속 스프린트 예정</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-base leading-relaxed text-foreground">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>
          {dirty ? '현재 세션에 수정된 목업 데이터가 있습니다.' : '현재 데이터는 초기 목업과 같습니다.'}
          {' '}로그인과 편집 데이터는 브라우저 메모리에만 유지되며 새로고침하면 초기화됩니다.
        </p>
      </div>
    </main>
  )
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">{icon}</span>
      <p className="mt-4 text-base font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </article>
  )
}

function RouteSummary({ title, icon, distance, duration, detail }: { title: string; icon: React.ReactNode; distance: string; duration: string; detail: string }) {
  return (
    <article className="rounded-xl border border-border bg-secondary/50 p-4">
      <p className="flex items-center gap-2 font-bold text-foreground"><span className="text-primary" aria-hidden="true">{icon}</span>{title}</p>
      <p className="mt-3 text-xl font-bold text-foreground">{distance} · {duration}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </article>
  )
}

function StatusItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-3">
      <span className="flex items-center gap-2 text-base font-medium text-foreground">
        {active ? <AlertTriangle className="size-5 text-destructive" aria-hidden="true" /> : <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />}
        {label}
      </span>
      <span className={active ? 'font-bold text-destructive' : 'font-bold text-primary'}>{active ? '재현 중' : '정상'}</span>
    </div>
  )
}
