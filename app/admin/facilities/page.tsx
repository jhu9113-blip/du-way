'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Eye, Filter, MapPin, MapPinned, RotateCcw, Save } from 'lucide-react'
import MapCanvas from '@/components/map/MapCanvas'
import { useEditableDemoDispatch, useEditableDemoState } from '@/lib/editable-demo-store'
import type { Facility } from '@/types'
import { cn } from '@/lib/utils'
import { facilities as initialFacilities } from '@/data/mock'

const TYPE_LABEL: Record<Facility['type'], string> = {
  ELEVATOR: '엘리베이터', RAMP: '경사로', STAIRS: '계단', ACCESSIBLE_ENTRANCE: '휠체어 출입구', STEEP_SLOPE: '급경사',
}

const TYPES = Object.keys(TYPE_LABEL) as Facility['type'][]
type FilterType = 'ALL' | Facility['type']
type FacilityDraft = { name: string; type: Facility['type']; lat: string; lng: string; buildingId: string; note: string }

function toDraft(facility: Facility): FacilityDraft {
  return { name: facility.name, type: facility.type, lat: String(facility.lat), lng: String(facility.lng), buildingId: facility.buildingId ?? '', note: facility.note ?? '' }
}

export default function AdminFacilitiesPage() {
  const { buildings, facilities } = useEditableDemoState()
  const dispatch = useEditableDemoDispatch()
  const [filter, setFilter] = useState<FilterType>('ALL')
  const filtered = useMemo(() => filter === 'ALL' ? facilities : facilities.filter((facility) => facility.type === filter), [facilities, filter])
  const [selectedId, setSelectedId] = useState(facilities[0]?.id ?? '')
  const selected = facilities.find((facility) => facility.id === selectedId) ?? facilities[0]
  const [draft, setDraft] = useState<FacilityDraft>(() => selected ? toDraft(selected) : { name: '', type: 'ELEVATOR', lat: '', lng: '', buildingId: '', note: '' })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function selectFacility(facility: Facility) {
    setSelectedId(facility.id)
    setDraft(toDraft(facility))
    setError('')
    setSaved(false)
  }

  function patch<K extends keyof FacilityDraft>(field: K, value: FacilityDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const name = draft.name.trim()
    const lat = Number(draft.lat)
    const lng = Number(draft.lng)

    if (!name) { setError('시설명을 입력해 주세요.'); return }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) { setError('위도는 -90에서 90 사이의 숫자로 입력해 주세요.'); return }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) { setError('경도는 -180에서 180 사이의 숫자로 입력해 주세요.'); return }

    dispatch({ type: 'UPDATE_FACILITY', payload: { ...selected, name, type: draft.type, lat, lng, buildingId: draft.buildingId || undefined, note: draft.note.trim() || undefined } })
    setError('')
    setSaved(true)
  }

  function resetSelected() {
    if (!selected) return
    dispatch({ type: 'RESET_FACILITY', payload: selected.id })
    const original = initialFacilities.find((facility) => facility.id === selected.id)
    if (original) setDraft(toDraft(original))
    setError('')
    setSaved(false)
  }

  return (
    <main className="p-5 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-base font-semibold text-primary"><MapPinned className="size-5" aria-hidden="true" />공간 데이터</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">접근성 시설 관리</h1>
          <p className="mt-2 text-base text-muted-foreground">기존 시설의 유형, 위치와 안내를 수정합니다. 시설 수는 고정됩니다.</p>
        </div>
        <Link href="/route" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Eye className="size-5" aria-hidden="true" />사용자 지도 확인</Link>
      </header>

      <div className="mt-7 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <section aria-labelledby="facility-list-title" className="rounded-2xl border border-border bg-card p-3">
          <h2 id="facility-list-title" className="px-2 py-2 text-lg font-bold text-foreground">시설 목록 <span className="text-primary">{filtered.length}</span></h2>
          <label htmlFor="facility-filter" className="mt-2 flex items-center gap-2 px-2 text-sm font-semibold text-foreground"><Filter className="size-4" aria-hidden="true" />유형 필터</label>
          <select id="facility-filter" value={filter} onChange={(e) => setFilter(e.target.value as FilterType)} className="mx-2 mt-2 min-h-11 w-[calc(100%_-_1rem)] rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="ALL">전체 시설</option>{TYPES.map((type) => <option key={type} value={type}>{TYPE_LABEL[type]}</option>)}
          </select>
          <div className="mt-3 space-y-2">
            {filtered.map((facility) => (
              <button key={facility.id} type="button" onClick={() => selectFacility(facility)} aria-pressed={selected?.id === facility.id} className={cn('w-full rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected?.id === facility.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary')}>
                <span className="block text-base font-bold text-foreground">{facility.name}</span><span className="mt-1 block text-sm text-muted-foreground">{TYPE_LABEL[facility.type]} · {facility.id}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="p-4 text-center text-base text-muted-foreground">해당 유형의 시설이 없습니다.</p>}
          </div>
        </section>

        {selected && <div className="space-y-6">
          <section aria-labelledby="facility-edit-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-primary">{selected.id}</p><h2 id="facility-edit-title" className="mt-1 text-xl font-bold text-foreground">시설 정보 편집</h2></div><button type="button" onClick={resetSelected} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-base font-bold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RotateCcw className="size-5" aria-hidden="true" />이 시설 초기화</button></div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="시설명" htmlFor="facility-name"><input id="facility-name" value={draft.name} onChange={(e) => patch('name', e.target.value)} className={inputClass} required /></Field>
                <Field label="시설 유형" htmlFor="facility-type"><select id="facility-type" value={draft.type} onChange={(e) => patch('type', e.target.value as Facility['type'])} className={inputClass}>{TYPES.map((type) => <option key={type} value={type}>{TYPE_LABEL[type]}</option>)}</select></Field>
                <Field label="위도" htmlFor="facility-lat"><input id="facility-lat" inputMode="decimal" value={draft.lat} onChange={(e) => patch('lat', e.target.value)} className={inputClass} required /></Field>
                <Field label="경도" htmlFor="facility-lng"><input id="facility-lng" inputMode="decimal" value={draft.lng} onChange={(e) => patch('lng', e.target.value)} className={inputClass} required /></Field>
                <Field label="연결 건물" htmlFor="facility-building"><select id="facility-building" value={draft.buildingId} onChange={(e) => patch('buildingId', e.target.value)} className={inputClass}><option value="">건물 연결 없음</option>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></Field>
              </div>
              <Field label="시설 안내" htmlFor="facility-note"><textarea id="facility-note" rows={3} value={draft.note} onChange={(e) => patch('note', e.target.value)} className={inputClass} /></Field>
              {error && <Message tone="error">{error}</Message>}{saved && <Message tone="success">시설 정보가 현재 세션에 반영되었습니다.</Message>}
              <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"><Save className="size-5" aria-hidden="true" />변경사항 적용</button>
            </form>
          </section>
          <section aria-labelledby="facility-map-title" className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><MapPin className="size-5 text-primary" aria-hidden="true" /><h2 id="facility-map-title" className="text-lg font-bold">지도 미리보기</h2></div><div className="mt-4 h-80 overflow-hidden rounded-2xl"><MapCanvas buildings={buildings} facilities={facilities} /></div></section>
        </div>}
      </div>
    </main>
  )
}

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) { return <div><label htmlFor={htmlFor} className="text-base font-semibold text-foreground">{label}</label>{children}</div> }
function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) { return <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-xl border p-3 text-base', tone === 'error' ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-primary/30 bg-primary/5 text-foreground')}>{tone === 'error' ? <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />}{children}</div> }
