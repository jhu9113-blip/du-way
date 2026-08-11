'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, MapPin, DoorOpen, AlertTriangle, Navigation, CalendarDays, ChevronRight } from 'lucide-react'
import { useAppState } from '@/lib/store'
import AppHeader from '@/components/AppHeader'
import MapCanvas from '@/components/map/MapCanvas'
import { buildings, facilities, routes } from '@/data/mock'
import { DEMO, MOBILITY_LABEL } from '@/lib/demo'

export default function HomePage() {
  const { onboarded, settings } = useAppState()
  const router = useRouter()

  useEffect(() => {
    if (!onboarded) router.replace('/onboarding')
  }, [onboarded, router])

  if (!onboarded) {
    return (
      <main className="flex flex-1 items-center justify-center px-5">
        <p className="text-base text-muted-foreground">온보딩으로 이동 중…</p>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col px-5 pt-8">
      <AppHeader title="다음 수업까지" subtitle="지금 출발하면 딱 맞게 도착할 수 있어요." />

      {/* 다음 수업 카드 */}
      <section
        aria-labelledby="next-course"
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-base font-semibold text-primary">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            다음 수업
          </span>
          <span className="text-base font-medium text-muted-foreground">
            이동 수단 · {MOBILITY_LABEL[settings.mobility]}
          </span>
        </div>

        <h2 id="next-course" className="mt-3 text-xl font-bold text-foreground">
          {DEMO.nextCourseName}
        </h2>

        <dl className="mt-4 space-y-2.5 text-base">
          <div className="flex items-center gap-2.5 text-foreground">
            <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">시작 시각</dt>
            <dd>{DEMO.nextCourseStart} 시작</dd>
          </div>
          <div className="flex items-center gap-2.5 text-foreground">
            <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">장소</dt>
            <dd>
              {DEMO.nextCourseBuilding} {DEMO.nextCourseRoom}호
            </dd>
          </div>
          <div className="flex items-center gap-2.5 text-foreground">
            <DoorOpen className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">출발지</dt>
            <dd>{DEMO.fromBuildingName}에서 출발</dd>
          </div>
        </dl>

        {/* 추천 출발 시각 강조 */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#1b7135] px-4 py-3 text-primary-foreground">
          <div>
            <p className="text-base font-medium opacity-90">추천 출발 시각</p>
            <p className="text-2xl font-bold tabular-nums">{DEMO.recommendedDeparture}</p>
          </div>
          <div className="text-right">
            <p className="text-base font-medium opacity-90">예상 이동</p>
            <p className="text-2xl font-bold tabular-nums">{DEMO.travelMinutes}분</p>
          </div>
        </div>
      </section>

      {/* 연강 경고 — 아이콘 + 텍스트 병기 */}
      {DEMO.backToBackWarning && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4"
        >
          <AlertTriangle className="size-6 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-base font-bold text-destructive">연강 주의 · 시간이 빠듯해요</p>
            <p className="mt-1 text-base leading-relaxed text-foreground">
              직전 수업이 {DEMO.prevCourseEnd}에 끝나 쉬는 시간은 {DEMO.breakMinutes}분인데, 이동에 {DEMO.travelMinutes}
              분이 필요해요.{`\u00a0`}약 {DEMO.shortageMinutes}분 부족합니다.
            </p>
          </div>
        </div>
      )}

      {/* 지도 미리보기 */}
      <section aria-label="경로 미리보기" className="mt-4">
        <div className="h-56 w-full overflow-hidden rounded-2xl">
          <MapCanvas
            buildings={buildings}
            facilities={facilities}
            route={routes.ACCESSIBLE}
            highlightBuildingId={DEMO.nextCourseBuildingId}
          />
        </div>
      </section>

      {/* 길안내 시작 */}
      <Link
        href="/route"
        className="mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#1b7135] px-6 text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Navigation className="size-5" aria-hidden="true" />
        길안내 시작하기
      </Link>

      <Link
        href="/timetable"
        className="mt-3 flex min-h-[48px] items-center justify-between rounded-2xl border border-border bg-card px-4 text-base font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="size-5 text-muted-foreground" aria-hidden="true" />
          오늘 시간표 보기
        </span>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
      </Link>
    </main>
  )
}
