'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Building2, CheckCircle2, Eye, MapPin, RotateCcw, Save } from 'lucide-react'
import MapCanvas from '@/components/map/MapCanvas'
import { useEditableDemoDispatch, useEditableDemoState } from '@/lib/editable-demo-store'
import type { Building } from '@/types'
import { cn } from '@/lib/utils'
import { buildings as initialBuildings } from '@/data/mock'

const BUILDING_IMAGES: Record<string, string> = {
  'B-GYEONGSANG': '/images/du-way/building-gyeongsang.png',
  'B-SUNGSAN': '/images/du-way/building-sungsan.png',
  'B-INFO': '/images/du-way/building-info.png',
  'B-LIB': '/images/du-way/building-library.png',
}

type BuildingDraft = {
  name: string
  aliases: string
  lat: string
  lng: string
  entranceNodeIds: string
  indoorHint: string
}

function toDraft(building: Building): BuildingDraft {
  return {
    name: building.name,
    aliases: building.aliases.join(', '),
    lat: String(building.lat),
    lng: String(building.lng),
    entranceNodeIds: building.entranceNodeIds.join(', '),
    indoorHint: building.indoorHint ?? '',
  }
}

function splitValues(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default function AdminBuildingsPage() {
  const { buildings, facilities } = useEditableDemoState()
  const dispatch = useEditableDemoDispatch()
  const [selectedId, setSelectedId] = useState(buildings[0]?.id ?? '')
  const selected = buildings.find((building) => building.id === selectedId) ?? buildings[0]
  const [draft, setDraft] = useState<BuildingDraft>(() => selected ? toDraft(selected) : {
    name: '', aliases: '', lat: '', lng: '', entranceNodeIds: '', indoorHint: '',
  })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function selectBuilding(building: Building) {
    setSelectedId(building.id)
    setDraft(toDraft(building))
    setError('')
    setSaved(false)
  }

  function patch(field: keyof BuildingDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return

    const name = draft.name.trim()
    const lat = Number(draft.lat)
    const lng = Number(draft.lng)
    const entranceNodeIds = splitValues(draft.entranceNodeIds)

    if (!name) {
      setError('건물명을 입력해 주세요.')
      return
    }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setError('위도는 -90에서 90 사이의 숫자로 입력해 주세요.')
      return
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setError('경도는 -180에서 180 사이의 숫자로 입력해 주세요.')
      return
    }
    if (entranceNodeIds.length === 0) {
      setError('출입구 노드 ID를 한 개 이상 입력해 주세요.')
      return
    }

    dispatch({
      type: 'UPDATE_BUILDING',
      payload: {
        ...selected,
        name,
        aliases: splitValues(draft.aliases),
        lat,
        lng,
        entranceNodeIds,
        indoorHint: draft.indoorHint.trim() || undefined,
      },
    })
    setError('')
    setSaved(true)
  }

  function resetSelected() {
    if (!selected) return
    dispatch({ type: 'RESET_BUILDING', payload: selected.id })
    const original = initialBuildings.find((building) => building.id === selected.id)
    if (original) setDraft(toDraft(original))
    setError('')
    setSaved(false)
  }

  return (
    <main className="p-5 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-base font-semibold text-primary"><Building2 className="size-5" aria-hidden="true" />공간 데이터</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">건물 관리</h1>
          <p className="mt-2 text-base text-muted-foreground">기존 건물의 위치와 진입 안내를 수정합니다. ID와 건물 수는 고정됩니다.</p>
        </div>
        <Link href="/" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Eye className="size-5" aria-hidden="true" />사용자 홈 확인
        </Link>
      </header>

      <div className="mt-7 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <section aria-labelledby="building-list-title" className="rounded-2xl border border-border bg-card p-3">
          <h2 id="building-list-title" className="px-2 py-2 text-lg font-bold text-foreground">건물 목록 <span className="text-primary">{buildings.length}</span></h2>
          <div className="mt-1 space-y-2">
            {buildings.map((building) => (
              <button
                key={building.id}
                type="button"
                onClick={() => selectBuilding(building)}
                aria-pressed={selected?.id === building.id}
                className={cn(
                  'w-full rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected?.id === building.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary',
                )}
              >
                <span className="flex items-center gap-3">
                  <Image
                    src={BUILDING_IMAGES[building.id]}
                    alt=""
                    width={1536}
                    height={1024}
                    sizes="64px"
                    className="size-16 shrink-0 rounded-xl border border-border bg-secondary object-cover"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-base font-bold text-foreground">{building.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{building.id}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {selected && (
          <div className="space-y-6">
            <section aria-labelledby="building-edit-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-secondary">
                <Image
                  src={BUILDING_IMAGES[selected.id]}
                  alt={`${selected.name} 대표 이미지`}
                  width={1536}
                  height={1024}
                  sizes="(max-width: 1280px) calc(100vw - 40px), 900px"
                  className="aspect-[16/6] w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{selected.id}</p>
                  <h2 id="building-edit-title" className="mt-1 text-xl font-bold text-foreground">건물 정보 편집</h2>
                </div>
                <button type="button" onClick={resetSelected} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-base font-bold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <RotateCcw className="size-5" aria-hidden="true" />이 건물 초기화
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="건물명" htmlFor="building-name"><input id="building-name" value={draft.name} onChange={(e) => patch('name', e.target.value)} className={inputClass} required /></Field>
                  <Field label="별칭" htmlFor="building-aliases" help="쉼표로 구분"><input id="building-aliases" value={draft.aliases} onChange={(e) => patch('aliases', e.target.value)} className={inputClass} /></Field>
                  <Field label="위도" htmlFor="building-lat"><input id="building-lat" inputMode="decimal" value={draft.lat} onChange={(e) => patch('lat', e.target.value)} className={inputClass} required /></Field>
                  <Field label="경도" htmlFor="building-lng"><input id="building-lng" inputMode="decimal" value={draft.lng} onChange={(e) => patch('lng', e.target.value)} className={inputClass} required /></Field>
                </div>
                <Field label="출입구 노드 ID" htmlFor="building-entrances" help="쉼표로 구분"><input id="building-entrances" value={draft.entranceNodeIds} onChange={(e) => patch('entranceNodeIds', e.target.value)} className={inputClass} required /></Field>
                <Field label="실내 진입 안내" htmlFor="building-hint"><textarea id="building-hint" rows={3} value={draft.indoorHint} onChange={(e) => patch('indoorHint', e.target.value)} className={inputClass} /></Field>

                {error && <Message tone="error">{error}</Message>}
                {saved && <Message tone="success">건물 정보가 현재 세션에 반영되었습니다.</Message>}

                <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto">
                  <Save className="size-5" aria-hidden="true" />변경사항 적용
                </button>
              </form>
            </section>

            <section aria-labelledby="building-map-title" className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2"><MapPin className="size-5 text-primary" aria-hidden="true" /><h2 id="building-map-title" className="text-lg font-bold text-foreground">지도 미리보기</h2></div>
              <div className="mt-4 h-80 overflow-hidden rounded-2xl"><MapCanvas buildings={buildings} facilities={facilities} highlightBuildingId={selected.id} onBuildingClick={(id) => {
                const building = buildings.find((item) => item.id === id)
                if (building) selectBuilding(building)
              }} /></div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function Field({ label, htmlFor, help, children }: { label: string; htmlFor: string; help?: string; children: React.ReactNode }) {
  return <div><label htmlFor={htmlFor} className="text-base font-semibold text-foreground">{label}</label>{help && <span className="ml-2 text-sm text-muted-foreground">{help}</span>}{children}</div>
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-xl border p-3 text-base', tone === 'error' ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-primary/30 bg-primary/5 text-foreground')}>
    {tone === 'error' ? <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />}{children}
  </div>
}
