'use client'

import Link from 'next/link'
import { Clock, MapPin, Navigation, CircleDot } from 'lucide-react'
import { useAppState } from '@/lib/store'
import AppHeader from '@/components/AppHeader'
import { DAY_LABEL, DEMO, getBuildingName } from '@/lib/demo'
import { cn } from '@/lib/utils'

export default function TimetablePage() {
  const { courses } = useAppState()

  // 데모: 월요일(1) 기준으로 정렬해 보여준다
  const dayCourses = [...courses]
    .filter((c) => c.day === 1)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <main className="flex flex-1 flex-col px-5 pt-8">
      <AppHeader
        title="오늘의 시간표"
        subtitle="수업 사이 이동에 필요한 시간을 함께 확인하세요."
        action={
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {DAY_LABEL[1]}
          </span>
        }
      />

      <ol className="space-y-3">
        {dayCourses.map((course) => {
          const isNext = course.name === DEMO.nextCourseName
          return (
            <li key={course.id}>
              <article
                className={cn(
                  'rounded-2xl border bg-card p-4',
                  isNext ? 'border-2 border-primary' : 'border-border',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-primary">
                    <Clock className="size-4" aria-hidden="true" />
                    {course.startTime} – {course.endTime}
                  </span>
                  {isNext && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                      <CircleDot className="size-3.5" aria-hidden="true" />
                      다음 수업
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-lg font-bold text-foreground">{course.name}</h2>

                <p className="mt-1.5 inline-flex items-center gap-1.5 text-base text-muted-foreground">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {getBuildingName(course.buildingId)} {course.room}호
                </p>

                {isNext && (
                  <Link
                    href="/route"
                    className="mt-3 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Navigation className="size-4" aria-hidden="true" />
                    여기로 길안내
                  </Link>
                )}
              </article>
            </li>
          )
        })}
      </ol>

      <p className="mt-6 rounded-xl border border-dashed border-border bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
        시간표 편집은 시연 범위에 포함되지 않습니다.
      </p>
    </main>
  )
}
