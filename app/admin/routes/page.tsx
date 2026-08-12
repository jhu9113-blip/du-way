'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Eye, MapPin, Plus, RotateCcw, Route as RouteIcon, Save, Trash2 } from 'lucide-react'
import MapCanvas from '@/components/map/MapCanvas'
import { useEditableDemoDispatch, useEditableDemoState } from '@/lib/editable-demo-store'
import type { PathNode, RouteResult } from '@/types'
import { routes as initialRoutes } from '@/data/mock'
import { cn } from '@/lib/utils'

type Kind = RouteResult['kind']
type NodeDraft = Omit<PathNode, 'lat' | 'lng'> & { lat: string; lng: string }
type RouteDraft = {
  distanceM: string
  durationMinutes: string
  stairsCount: string
  elevatorCount: string
  rampCount: string
  hasSteepSlope: boolean
  warnings: string
  nodes: NodeDraft[]
}

const NODE_TYPES: PathNode['type'][] = ['ENTRANCE', 'JUNCTION', 'RAMP', 'STAIRS', 'ELEVATOR', 'WAYPOINT']
const NODE_LABEL: Record<PathNode['type'], string> = {
  ENTRANCE: '출입구', JUNCTION: '교차점', RAMP: '경사로', STAIRS: '계단', ELEVATOR: '엘리베이터', WAYPOINT: '경유지',
}

function toDraft(route: RouteResult): RouteDraft {
  return {
    distanceM: String(route.distanceM),
    durationMinutes: String(route.durationSec / 60),
    stairsCount: String(route.stairsCount),
    elevatorCount: String(route.elevatorCount),
    rampCount: String(route.rampCount),
    hasSteepSlope: route.hasSteepSlope,
    warnings: route.warnings.join('\n'),
    nodes: route.nodes.map((node) => ({ ...node, lat: String(node.lat), lng: String(node.lng) })),
  }
}

export default function AdminRoutesPage() {
  const { buildings, facilities, routes, demo } = useEditableDemoState()
  const dispatch = useEditableDemoDispatch()
  const [kind, setKind] = useState<Kind>('ACCESSIBLE')
  const [draft, setDraft] = useState<RouteDraft>(() => toDraft(routes.ACCESSIBLE))
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const route = routes[kind]

  function selectRoute(nextKind: Kind) {
    setKind(nextKind)
    setDraft(toDraft(routes[nextKind]))
    setError('')
    setSaved(false)
  }

  function patch<K extends keyof Omit<RouteDraft, 'nodes'>>(field: K, value: RouteDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function patchNode(index: number, field: keyof NodeDraft, value: string) {
    setDraft((current) => ({
      ...current,
      nodes: current.nodes.map((node, nodeIndex) => nodeIndex === index ? { ...node, [field]: value } : node),
    }))
    setSaved(false)
  }

  function addNode() {
    const last = draft.nodes.at(-1)
    setDraft((current) => ({
      ...current,
      nodes: [...current.nodes, {
        id: `${kind}-NODE-${current.nodes.length + 1}`,
        lat: last?.lat ?? '35.899',
        lng: last?.lng ?? '128.808',
        type: 'WAYPOINT',
      }],
    }))
    setSaved(false)
  }

  function removeNode(index: number) {
    setDraft((current) => ({ ...current, nodes: current.nodes.filter((_, nodeIndex) => nodeIndex !== index) }))
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const distanceM = Number(draft.distanceM)
    const durationMinutes = Number(draft.durationMinutes)
    const counts = [draft.stairsCount, draft.elevatorCount, draft.rampCount].map(Number)

    if (!Number.isFinite(distanceM) || distanceM <= 0) { setError('거리는 0보다 큰 숫자로 입력해 주세요.'); return }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) { setError('예상 시간은 0보다 큰 숫자로 입력해 주세요.'); return }
    if (counts.some((count) => !Number.isInteger(count) || count < 0)) { setError('시설 이용 횟수는 0 이상의 정수로 입력해 주세요.'); return }
    if (draft.nodes.length < 2) { setError('경로 노드는 출발지와 목적지를 포함해 두 개 이상이어야 합니다.'); return }

    const ids = new Set<string>()
    const nodes: PathNode[] = []
    for (const node of draft.nodes) {
      const id = node.id.trim()
      const lat = Number(node.lat)
      const lng = Number(node.lng)
      if (!id) { setError('모든 노드에 ID를 입력해 주세요.'); return }
      if (ids.has(id)) { setError(`중복된 노드 ID가 있습니다: ${id}`); return }
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) { setError(`${id}의 위도를 -90에서 90 사이로 입력해 주세요.`); return }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) { setError(`${id}의 경도를 -180에서 180 사이로 입력해 주세요.`); return }
      ids.add(id)
      nodes.push({ id, lat, lng, type: node.type, ...(node.buildingId ? { buildingId: node.buildingId } : {}) })
    }

    dispatch({
      type: 'UPDATE_ROUTE',
      payload: {
        kind,
        distanceM,
        durationSec: Math.round(durationMinutes * 60),
        stairsCount: counts[0], elevatorCount: counts[1], rampCount: counts[2],
        hasSteepSlope: draft.hasSteepSlope,
        warnings: draft.warnings.split('\n').map((warning) => warning.trim()).filter(Boolean),
        nodes,
      },
    })
    setError('')
    setSaved(true)
  }

  function resetRoute() {
    dispatch({ type: 'RESET_ROUTE', payload: kind })
    setDraft(toDraft(initialRoutes[kind]))
    setError('')
    setSaved(false)
  }

  return (
    <main className="p-5 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-base font-semibold text-primary"><RouteIcon className="size-5" aria-hidden="true" />경로 데이터</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">경로 관리</h1>
          <p className="mt-2 text-base text-muted-foreground">고정 경로의 지표, 경고와 노드를 수정합니다. 경로 자동 계산은 하지 않습니다.</p>
        </div>
        <Link href="/route" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Eye className="size-5" aria-hidden="true" />사용자 길안내 확인</Link>
      </header>

      <div role="tablist" aria-label="편집할 경로 선택" className="mt-7 grid max-w-xl grid-cols-2 gap-2 rounded-2xl border border-border bg-secondary p-1.5">
        {(['ACCESSIBLE', 'FAST'] as Kind[]).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={kind === item} onClick={() => selectRoute(item)} className={cn('min-h-12 rounded-xl px-3 text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', kind === item ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground')}>
            {item === 'ACCESSIBLE' ? '무장애 경로' : '빠른 경로'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
        <section aria-labelledby="route-summary-edit" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-primary">{kind}</p><h2 id="route-summary-edit" className="mt-1 text-xl font-bold">경로 요약과 경고</h2></div><button type="button" onClick={resetRoute} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-base font-bold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><RotateCcw className="size-5" aria-hidden="true" />이 경로 초기화</button></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="거리(m)" htmlFor="route-distance"><input id="route-distance" inputMode="numeric" value={draft.distanceM} onChange={(e) => patch('distanceM', e.target.value)} className={inputClass} /></Field>
            <Field label="예상 시간(분)" htmlFor="route-duration"><input id="route-duration" inputMode="decimal" value={draft.durationMinutes} onChange={(e) => patch('durationMinutes', e.target.value)} className={inputClass} /></Field>
            <Field label="계단(곳)" htmlFor="route-stairs"><input id="route-stairs" inputMode="numeric" value={draft.stairsCount} onChange={(e) => patch('stairsCount', e.target.value)} className={inputClass} /></Field>
            <Field label="엘리베이터(곳)" htmlFor="route-elevator"><input id="route-elevator" inputMode="numeric" value={draft.elevatorCount} onChange={(e) => patch('elevatorCount', e.target.value)} className={inputClass} /></Field>
            <Field label="경사로(곳)" htmlFor="route-ramp"><input id="route-ramp" inputMode="numeric" value={draft.rampCount} onChange={(e) => patch('rampCount', e.target.value)} className={inputClass} /></Field>
          </div>
          <label className="mt-5 flex min-h-11 items-center gap-3 text-base font-semibold"><input type="checkbox" checked={draft.hasSteepSlope} onChange={(e) => patch('hasSteepSlope', e.target.checked)} className="size-5 accent-primary" />급경사 구간 포함</label>
          <Field label="경고 문구" htmlFor="route-warnings" help="한 줄에 하나씩 입력"><textarea id="route-warnings" rows={3} value={draft.warnings} onChange={(e) => patch('warnings', e.target.value)} className={inputClass} /></Field>
        </section>

        <section aria-labelledby="route-node-edit" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="route-node-edit" className="text-xl font-bold">경로 노드</h2><p className="mt-1 text-base text-muted-foreground">표시 순서대로 선이 연결됩니다.</p></div><button type="button" onClick={addNode} className="flex min-h-11 items-center gap-2 rounded-xl border border-primary px-3 text-base font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Plus className="size-5" aria-hidden="true" />노드 추가</button></div>
          <div className="mt-5 space-y-3">
            {draft.nodes.map((node, index) => (
              <article key={`${index}-${node.id}`} className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between"><p className="font-bold text-foreground">노드 {index + 1}</p><button type="button" onClick={() => removeNode(index)} aria-label={`노드 ${index + 1} 삭제`} className="flex size-11 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Trash2 className="size-5" aria-hidden="true" /></button></div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="ID" htmlFor={`node-id-${index}`}><input id={`node-id-${index}`} value={node.id} onChange={(e) => patchNode(index, 'id', e.target.value)} className={inputClass} /></Field>
                  <Field label="유형" htmlFor={`node-type-${index}`}><select id={`node-type-${index}`} value={node.type} onChange={(e) => patchNode(index, 'type', e.target.value)} className={inputClass}>{NODE_TYPES.map((type) => <option key={type} value={type}>{NODE_LABEL[type]}</option>)}</select></Field>
                  <Field label="위도" htmlFor={`node-lat-${index}`}><input id={`node-lat-${index}`} inputMode="decimal" value={node.lat} onChange={(e) => patchNode(index, 'lat', e.target.value)} className={inputClass} /></Field>
                  <Field label="경도" htmlFor={`node-lng-${index}`}><input id={`node-lng-${index}`} inputMode="decimal" value={node.lng} onChange={(e) => patchNode(index, 'lng', e.target.value)} className={inputClass} /></Field>
                  <Field label="연결 건물" htmlFor={`node-building-${index}`}><select id={`node-building-${index}`} value={node.buildingId ?? ''} onChange={(e) => patchNode(index, 'buildingId', e.target.value)} className={inputClass}><option value="">연결 없음</option>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></Field>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="route-map-preview" className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><MapPin className="size-5 text-primary" aria-hidden="true" /><h2 id="route-map-preview" className="text-lg font-bold">적용된 경로 미리보기</h2></div><p className="mt-1 text-sm text-muted-foreground">폼 값을 적용하면 아래 지도와 사용자 길안내가 갱신됩니다.</p><div className="mt-4 h-96 overflow-hidden rounded-2xl"><MapCanvas buildings={buildings} facilities={facilities} route={route} highlightBuildingId={demo.nextCourseBuildingId} /></div></section>

        {error && <Message tone="error">{error}</Message>}{saved && <Message tone="success">경로 정보가 현재 세션과 사용자 길안내에 반영되었습니다.</Message>}
        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"><Save className="size-5" aria-hidden="true" />경로 변경사항 적용</button>
      </form>
    </main>
  )
}

const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
function Field({ label, htmlFor, help, children }: { label: string; htmlFor: string; help?: string; children: React.ReactNode }) { return <div><label htmlFor={htmlFor} className="text-base font-semibold text-foreground">{label}</label>{help && <span className="ml-2 text-sm text-muted-foreground">{help}</span>}{children}</div> }
function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) { return <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-xl border p-3 text-base', tone === 'error' ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-primary/30 bg-primary/5 text-foreground')}>{tone === 'error' ? <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />}{children}</div> }
