'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, CalendarDays, CheckCircle2, Eye, FlaskConical, Home, Navigation, RefreshCcw, Save } from 'lucide-react'
import Toggle from '@/components/Toggle'
import { useAppDispatch, useAppState } from '@/lib/store'
import { useEditableDemoDispatch, useEditableDemoState, type DemoValues } from '@/lib/editable-demo-store'
import { initialCourses } from '@/data/mock'
import { DEMO } from '@/lib/demo'
import type { Course } from '@/types'
import { cn } from '@/lib/utils'

type CourseDraft = Omit<Course, 'day'> & { day: Course['day'] }
type DemoDraft = Omit<DemoValues, 'travelMinutes' | 'breakMinutes' | 'shortageMinutes'> & {
  travelMinutes: string
  breakMinutes: string
  shortageMinutes: string
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function cloneCourses(courses: Course[]): CourseDraft[] {
  return courses.map((course) => ({ ...course }))
}

function toDemoDraft(demo: DemoValues): DemoDraft {
  return {
    ...demo,
    travelMinutes: String(demo.travelMinutes),
    breakMinutes: String(demo.breakMinutes),
    shortageMinutes: String(demo.shortageMinutes),
  }
}

export default function AdminDemoPage() {
  const { buildings, courses, demo } = useEditableDemoState()
  const demoDispatch = useEditableDemoDispatch()
  const { demoGpsFailed, demoNoRoute } = useAppState()
  const appDispatch = useAppDispatch()
  const [courseDrafts, setCourseDrafts] = useState<CourseDraft[]>(() => cloneCourses(courses))
  const [demoDraft, setDemoDraft] = useState<DemoDraft>(() => toDemoDraft(demo))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function patchCourse(index: number, field: keyof CourseDraft, value: string) {
    setCourseDrafts((current) => current.map((course, courseIndex) => courseIndex === index ? { ...course, [field]: value } : course))
    setSaved(false)
  }

  function patchDemo<K extends keyof DemoDraft>(field: K, value: DemoDraft[K]) {
    setDemoDraft((current) => {
      const next = { ...current, [field]: value }
      if (field === 'nextCourseBuildingId') next.nextCourseBuilding = buildings.find((building) => building.id === value)?.name ?? current.nextCourseBuilding
      if (field === 'fromBuildingId') next.fromBuildingName = buildings.find((building) => building.id === value)?.name ?? current.fromBuildingName
      return next
    })
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    for (const course of courseDrafts) {
      if (!course.name.trim() || !course.room.trim()) { setError('모든 수업의 수업명과 강의실을 입력해 주세요.'); return }
      if (!TIME_PATTERN.test(course.startTime) || !TIME_PATTERN.test(course.endTime)) { setError('수업 시간은 HH:mm 형식으로 입력해 주세요.'); return }
      if (course.startTime >= course.endTime) { setError(`${course.name}의 종료 시각은 시작 시각보다 늦어야 합니다.`); return }
      if (!buildings.some((building) => building.id === course.buildingId)) { setError(`${course.name}의 건물을 선택해 주세요.`); return }
    }

    const requiredTimes = [demoDraft.nextCourseStart, demoDraft.recommendedDeparture, demoDraft.prevCourseEnd]
    if (requiredTimes.some((time) => !TIME_PATTERN.test(time))) { setError('고정 안내 시각은 HH:mm 형식으로 입력해 주세요.'); return }
    if (!demoDraft.nextCourseName.trim() || !demoDraft.nextCourseRoom.trim()) { setError('다음 수업명과 강의실을 입력해 주세요.'); return }

    const travelMinutes = Number(demoDraft.travelMinutes)
    const breakMinutes = Number(demoDraft.breakMinutes)
    const shortageMinutes = Number(demoDraft.shortageMinutes)
    if ([travelMinutes, breakMinutes, shortageMinutes].some((value) => !Number.isInteger(value) || value < 0)) { setError('이동·쉬는·부족 시간은 0 이상의 정수로 입력해 주세요.'); return }

    demoDispatch({ type: 'SET_COURSES', payload: courseDrafts.map((course) => ({ ...course, name: course.name.trim(), room: course.room.trim() })) })
    demoDispatch({
      type: 'SET_DEMO',
      payload: {
        ...demoDraft,
        nextCourseName: demoDraft.nextCourseName.trim(),
        nextCourseRoom: demoDraft.nextCourseRoom.trim(),
        travelMinutes,
        breakMinutes,
        shortageMinutes,
      },
    })
    setError('')
    setSaved(true)
  }

  function resetDemo() {
    demoDispatch({ type: 'RESET_DEMO' })
    appDispatch({ type: 'SET_DEMO_GPS_FAILED', payload: false })
    appDispatch({ type: 'SET_DEMO_NO_ROUTE', payload: false })
    setCourseDrafts(cloneCourses(initialCourses))
    setDemoDraft(toDemoDraft(DEMO))
    setError('')
    setSaved(false)
  }

  return (
    <main className="p-5 sm:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-base font-semibold text-primary"><FlaskConical className="size-5" aria-hidden="true" />시연 데이터</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">데모 관리</h1>
          <p className="mt-2 text-base text-muted-foreground">수업과 홈 안내값, 길안내 예외 상태를 현재 브라우저 세션에서 관리합니다.</p>
        </div>
        <button type="button" onClick={resetDemo} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-bold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RefreshCcw className="size-5" aria-hidden="true" />데모 데이터 초기화</button>
      </header>

      <nav aria-label="사용자 화면 미리보기" className="mt-6 grid gap-3 sm:grid-cols-3">
        <PreviewLink href="/" icon={<Home className="size-5" />} label="사용자 홈" />
        <PreviewLink href="/timetable" icon={<CalendarDays className="size-5" />} label="시간표" />
        <PreviewLink href="/route" icon={<Navigation className="size-5" />} label="길안내" />
      </nav>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
        <section aria-labelledby="course-edit-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="course-edit-title" className="text-xl font-bold">월요일 데모 수업</h2>
          <p className="mt-1 text-base text-muted-foreground">현재 두 수업의 개수와 ID는 고정됩니다.</p>
          <div className="mt-5 space-y-4">
            {courseDrafts.map((course, index) => (
              <article key={course.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="font-bold text-primary">수업 {index + 1} · {course.id}</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="수업명" htmlFor={`course-name-${index}`}><input id={`course-name-${index}`} value={course.name} onChange={(e) => patchCourse(index, 'name', e.target.value)} className={inputClass} /></Field>
                  <Field label="시작" htmlFor={`course-start-${index}`}><input id={`course-start-${index}`} type="time" value={course.startTime} onChange={(e) => patchCourse(index, 'startTime', e.target.value)} className={inputClass} /></Field>
                  <Field label="종료" htmlFor={`course-end-${index}`}><input id={`course-end-${index}`} type="time" value={course.endTime} onChange={(e) => patchCourse(index, 'endTime', e.target.value)} className={inputClass} /></Field>
                  <Field label="건물" htmlFor={`course-building-${index}`}><select id={`course-building-${index}`} value={course.buildingId} onChange={(e) => patchCourse(index, 'buildingId', e.target.value)} className={inputClass}>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></Field>
                  <Field label="강의실" htmlFor={`course-room-${index}`}><input id={`course-room-${index}`} value={course.room} onChange={(e) => patchCourse(index, 'room', e.target.value)} className={inputClass} /></Field>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="home-demo-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="home-demo-title" className="text-xl font-bold">홈 고정 안내값</h2>
          <p className="mt-1 text-base text-muted-foreground">자동 계산하지 않고 입력한 값을 그대로 표시합니다.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="다음 수업명" htmlFor="demo-course-name"><input id="demo-course-name" value={demoDraft.nextCourseName} onChange={(e) => patchDemo('nextCourseName', e.target.value)} className={inputClass} /></Field>
            <Field label="다음 수업 시작" htmlFor="demo-course-start"><input id="demo-course-start" type="time" value={demoDraft.nextCourseStart} onChange={(e) => patchDemo('nextCourseStart', e.target.value)} className={inputClass} /></Field>
            <Field label="목적지 건물" htmlFor="demo-destination"><select id="demo-destination" value={demoDraft.nextCourseBuildingId} onChange={(e) => patchDemo('nextCourseBuildingId', e.target.value)} className={inputClass}>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></Field>
            <Field label="강의실" htmlFor="demo-room"><input id="demo-room" value={demoDraft.nextCourseRoom} onChange={(e) => patchDemo('nextCourseRoom', e.target.value)} className={inputClass} /></Field>
            <Field label="출발 건물" htmlFor="demo-origin"><select id="demo-origin" value={demoDraft.fromBuildingId} onChange={(e) => patchDemo('fromBuildingId', e.target.value)} className={inputClass}>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></Field>
            <Field label="추천 출발" htmlFor="demo-departure"><input id="demo-departure" type="time" value={demoDraft.recommendedDeparture} onChange={(e) => patchDemo('recommendedDeparture', e.target.value)} className={inputClass} /></Field>
            <Field label="예상 이동(분)" htmlFor="demo-travel"><input id="demo-travel" inputMode="numeric" value={demoDraft.travelMinutes} onChange={(e) => patchDemo('travelMinutes', e.target.value)} className={inputClass} /></Field>
            <Field label="직전 수업 종료" htmlFor="demo-prev-end"><input id="demo-prev-end" type="time" value={demoDraft.prevCourseEnd} onChange={(e) => patchDemo('prevCourseEnd', e.target.value)} className={inputClass} /></Field>
            <Field label="쉬는 시간(분)" htmlFor="demo-break"><input id="demo-break" inputMode="numeric" value={demoDraft.breakMinutes} onChange={(e) => patchDemo('breakMinutes', e.target.value)} className={inputClass} /></Field>
            <Field label="부족 시간(분)" htmlFor="demo-shortage"><input id="demo-shortage" inputMode="numeric" value={demoDraft.shortageMinutes} onChange={(e) => patchDemo('shortageMinutes', e.target.value)} className={inputClass} /></Field>
          </div>
          <label className="mt-5 flex min-h-11 items-center gap-3 text-base font-semibold"><input type="checkbox" checked={demoDraft.backToBackWarning} onChange={(e) => patchDemo('backToBackWarning', e.target.checked)} className="size-5 accent-primary" />홈에 연강 경고 표시</label>
        </section>

        <section aria-labelledby="exception-demo-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="exception-demo-title" className="text-xl font-bold">길안내 예외 상태</h2>
          <p className="mt-1 text-base text-muted-foreground">토글 변경 즉시 사용자 길안내에 반영됩니다.</p>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-dashed border-border bg-secondary px-4">
            <Toggle checked={demoGpsFailed} onChange={(value) => appDispatch({ type: 'SET_DEMO_GPS_FAILED', payload: value })} label="GPS 실패 상황" description="성산홀 기준 대체 안내를 표시합니다." />
            <Toggle checked={demoNoRoute} onChange={(value) => appDispatch({ type: 'SET_DEMO_NO_ROUTE', payload: value })} label="경로 없음 상황" description="조건에 맞는 경로가 없는 대체 화면을 표시합니다." />
          </div>
        </section>

        {error && <Message tone="error">{error}</Message>}{saved && <Message tone="success">수업과 고정 안내값이 사용자 화면에 반영되었습니다.</Message>}
        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"><Save className="size-5" aria-hidden="true" />데모 변경사항 적용</button>
      </form>
    </main>
  )
}

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label htmlFor={htmlFor} className="text-base font-semibold text-foreground">{label}</label>{children}</div> }
function PreviewLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) { return <Link href={href} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span aria-hidden="true">{icon}</span><Eye className="size-4" aria-hidden="true" />{label}</Link> }
function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) { return <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-xl border p-3 text-base', tone === 'error' ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-primary/30 bg-primary/5 text-foreground')}>{tone === 'error' ? <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />}{children}</div> }
