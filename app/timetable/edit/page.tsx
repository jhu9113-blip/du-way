'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Check, ChevronDown, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEditableDemoDispatch, useEditableDemoState } from '@/lib/editable-demo-store'
import type { Course } from '@/types'

const DAYS = [
  { value: 1, short: '월', label: '월요일' },
  { value: 2, short: '화', label: '화요일' },
  { value: 3, short: '수', label: '수요일' },
  { value: 4, short: '목', label: '목요일' },
  { value: 5, short: '금', label: '금요일' },
] as const

const START_HOUR = 9
const END_HOUR = 14
const GRID_MINUTES = (END_HOUR - START_HOUR) * 60
const TIME_OPTIONS = Array.from({ length: 11 }, (_, index) => {
  const minutes = START_HOUR * 60 + index * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

type Draft = {
  name: string
  professor: string
  day: Course['day']
  startTime: string
  endTime: string
  location: string
}

const initialDraft: Draft = {
  name: '',
  professor: '',
  day: 1,
  startTime: '09:00',
  endTime: '10:00',
  location: '',
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

function blockPosition(course: Pick<Course, 'startTime' | 'endTime'>) {
  const gridStart = START_HOUR * 60
  const start = Math.max(gridStart, toMinutes(course.startTime))
  const end = Math.min(END_HOUR * 60, toMinutes(course.endTime))

  return {
    top: `${((start - gridStart) / GRID_MINUTES) * 100}%`,
    height: `${(Math.max(0, end - start) / GRID_MINUTES) * 100}%`,
  }
}

export default function TimetableEditPage() {
  const { courses } = useEditableDemoState()
  const dispatch = useEditableDemoDispatch()
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [error, setError] = useState('')

  const previewCourse = useMemo<Course | null>(() => {
    if (!draft.name.trim() || toMinutes(draft.endTime) <= toMinutes(draft.startTime)) return null
    return {
      id: 'preview',
      name: draft.name.trim(),
      professor: draft.professor.trim(),
      day: draft.day,
      startTime: draft.startTime,
      endTime: draft.endTime,
      buildingId: draft.location.trim(),
      room: '',
      location: draft.location.trim(),
    }
  }, [draft])

  const visibleCourses = [...courses, ...(previewCourse ? [previewCourse] : [])]

  function patch<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.name.trim() || !draft.professor.trim() || !draft.location.trim()) {
      setError('수업명, 교수명, 장소를 모두 입력해 주세요.')
      return
    }
    if (toMinutes(draft.endTime) <= toMinutes(draft.startTime)) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    const course: Course = {
      id: `course-${Date.now()}`,
      name: draft.name.trim(),
      professor: draft.professor.trim(),
      day: draft.day,
      startTime: draft.startTime,
      endTime: draft.endTime,
      buildingId: draft.location.trim(),
      room: '',
      location: draft.location.trim(),
    }

    dispatch({ type: 'SET_COURSES', payload: [...courses, course] })
    router.push('/timetable')
  }

  return (
    <main className="flex flex-1 flex-col px-8 pb-8 pt-10">
      <header className="flex items-start justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="시간표로 돌아가기"
          className="mt-0.5 flex size-10 items-center justify-start text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-6" aria-hidden="true" />
        </button>
        <div className="mr-auto">
          <h1 className="text-2xl font-bold text-primary">수업 추가</h1>
          <p className="mt-4 text-xs text-muted-foreground">수업 사이 이동에 필요한 시간을 함께 확인하세요.</p>
        </div>
        <button
          type="submit"
          form="course-form"
          className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-[#145c22] px-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0f4d1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          완료
        </button>
      </header>

      <section aria-label="주간 시간표" className="mt-9 overflow-hidden rounded-[20px] border border-primary bg-white/60">
        <div className="grid h-7 grid-cols-[22px_repeat(5,minmax(0,1fr))] border-b border-primary text-[10px] text-foreground">
          <span aria-hidden="true" />
          {DAYS.map((day) => (
            <span key={day.value} className="flex items-center justify-center border-l border-primary">{day.short}</span>
          ))}
        </div>

        <div className="grid h-[210px] grid-cols-[22px_repeat(5,minmax(0,1fr))]">
          <div className="relative">
            {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
              <span
                key={index}
                className="absolute right-1 -translate-y-1/2 text-[9px] text-foreground"
                style={{ top: `${(index / (END_HOUR - START_HOUR)) * 100}%` }}
              >
                {START_HOUR + index > 12 ? START_HOUR + index - 12 : START_HOUR + index}
              </span>
            ))}
          </div>

          {DAYS.map((day) => (
            <div key={day.value} className="relative border-l border-primary">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="absolute inset-x-0 border-t border-primary"
                  style={{ top: `${(index / (END_HOUR - START_HOUR)) * 100}%` }}
                />
              ))}
              {visibleCourses
                .filter((course) => course.day === day.value && toMinutes(course.endTime) > START_HOUR * 60 && toMinutes(course.startTime) < END_HOUR * 60)
                .map((course) => (
                  <div
                    key={course.id}
                    className="absolute inset-x-0.5 z-10 overflow-hidden rounded-sm border border-[#57bd70] bg-[#baf3c6]/95 px-1 py-0.5 text-[8px] leading-tight text-[#145c22]"
                    style={blockPosition(course)}
                    title={`${course.name} ${course.startTime}–${course.endTime}`}
                  >
                    <strong className="block truncate">{course.name}</strong>
                    <span>{course.startTime}–{course.endTime}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <form id="course-form" onSubmit={save} className="-mx-8 mt-3 flex-1 rounded-t-[24px] bg-white/30 px-12 pb-8 pt-10 shadow-[0_-3px_8px_rgba(0,80,20,0.08)]">
        <TextField label="수업명" value={draft.name} onChange={(value) => patch('name', value)} />
        <TextField label="교수명" value={draft.professor} onChange={(value) => patch('professor', value)} />

        <div className="grid grid-cols-[1.15fr_1fr_1fr] gap-3 border-b border-[#7aad85] py-3">
          <SelectField
            label="요일"
            value={String(draft.day)}
            onChange={(value) => patch('day', Number(value) as Course['day'])}
            options={DAYS.map((day) => ({ value: String(day.value), label: day.label }))}
          />
          <SelectField label="시작 시간" value={draft.startTime} onChange={(value) => patch('startTime', value)} options={TIME_OPTIONS.map((time) => ({ value: time, label: time }))} />
          <SelectField label="종료 시간" value={draft.endTime} onChange={(value) => patch('endTime', value)} options={TIME_OPTIONS.map((time) => ({ value: time, label: time }))} />
        </div>

        <div className="flex items-end gap-3 border-b border-[#7aad85] py-3">
          <label className="flex-1">
            <span className="sr-only">장소</span>
            <input
              value={draft.location}
              onChange={(event) => patch('location', event.target.value)}
              placeholder="장소"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground focus:outline-none"
              required
            />
          </label>
          <button
            type="button"
            onClick={() => setDraft(initialDraft)}
            aria-label="입력 내용 지우기"
            className="text-[#00d629] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-6" aria-hidden="true" />
          </button>
        </div>

        {error && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="size-3.5 text-primary" aria-hidden="true" /> 입력한 수업은 위 시간표에서 바로 확인할 수 있어요.
        </p>
      </form>
    </main>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block border-b border-[#7aad85] py-3">
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground focus:outline-none"
        required
      />
    </label>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="relative min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none bg-transparent pr-4 text-sm text-foreground focus:outline-none"
        aria-label={label}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-3.5 -translate-y-1/2 text-[#00bb27]" aria-hidden="true" />
    </label>
  )
}
