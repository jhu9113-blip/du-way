'use client'

import { useMemo } from 'react'
import type { Building, Facility, RouteResult } from '@/types'

// 지도 SDK 대신 SVG 로 그린다.
// 나중에 카카오맵 컴포넌트로 통째 교체할 것이므로 props 인터페이스를 정확히 지킨다.
export type MapCanvasProps = {
  buildings: Building[]
  facilities: Facility[]
  route?: RouteResult | null
  currentPosition?: { lat: number; lng: number } | null
  highlightBuildingId?: string
  onBuildingClick?: (id: string) => void
}

const VIEW_W = 1000
const VIEW_H = 700

// campus-map.png의 고정 촬영 범위. 지도는 북쪽이 화면 정위와 조금 다르므로
// 단순 최소/최대 확대 대신 실제 건물과 도로를 기준으로 맞춘 affine 변환을 쓴다.
// 기준점: 성산홀(460, 120), 경상대학 건물군(529, 559), 우회로 분기(420, 260)
const MAP_ORIGIN = { lat: 35.8992, lng: 128.8072, x: 460, y: 120 } as const
const VISIBLE_BUILDING_IDS = new Set(['B-SUNGSAN', 'B-GYEONGSANG'])

const FACILITY_LABEL: Record<Facility['type'], string> = {
  ELEVATOR: '엘리베이터',
  RAMP: '경사로',
  STAIRS: '계단',
  ACCESSIBLE_ENTRANCE: '휠체어 출입구',
  STEEP_SLOPE: '급경사',
}

type Pt = { lat: number; lng: number }

function projectMapPoint(p: Pt) {
  const dLng = p.lng - MAP_ORIGIN.lng
  const dLat = p.lat - MAP_ORIGIN.lat
  const x = MAP_ORIGIN.x - 16608 * dLng - 129415 * dLat
  const y = MAP_ORIGIN.y + 217310 * dLng - 223567 * dLat
  return { x, y }
}

export default function MapCanvas({
  buildings,
  facilities,
  route,
  currentPosition,
  highlightBuildingId,
  onBuildingClick,
}: MapCanvasProps) {
  const routePoints = useMemo(() => {
    if (!route) return ''
    return route.nodes.map((n) => projectMapPoint({ lat: n.lat, lng: n.lng })).map((p) => `${p.x},${p.y}`).join(' ')
  }, [route])

  const cur = currentPosition ? projectMapPoint(currentPosition) : null

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full rounded-2xl border border-border bg-secondary"
      role="img"
      aria-label="캠퍼스 길찾기 지도"
    >
      {/* 사용자·관리자 지도에 공통으로 쓰는 캠퍼스 지도 배경 */}
      <image
        href="/campus-map.png"
        x="0"
        y="0"
        width={VIEW_W}
        height={VIEW_H}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* 경로: polyline. ACCESSIBLE 은 실선, FAST 는 파선 (색상만으로 구분하지 않음) */}
      {route && (
        <polyline
          points={routePoints}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={route.kind === 'FAST' ? '16 12' : undefined}
          aria-label={route.kind === 'FAST' ? '빠른 경로 (파선)' : '무장애 경로 (실선)'}
        />
      )}

      {/* 건물 */}
      {buildings.map((b) => {
        // 현재 배경 이미지가 담고 있는 시연 구간의 건물만 표시한다.
        // 범위 밖 건물을 자동 축소해 끌어오면 엉뚱한 건물 위에 라벨이 놓인다.
        if (!VISIBLE_BUILDING_IDS.has(b.id)) return null
        const { x, y } = projectMapPoint({ lat: b.lat, lng: b.lng })
        if (x < 0 || x > VIEW_W || y < 0 || y > VIEW_H) return null
        const highlighted = b.id === highlightBuildingId
        return (
          <g
            key={b.id}
            role={onBuildingClick ? 'button' : undefined}
            tabIndex={onBuildingClick ? 0 : undefined}
            aria-label={`건물: ${b.name}`}
            className={onBuildingClick ? 'map-building cursor-pointer focus:outline-none' : undefined}
            onClick={onBuildingClick ? () => onBuildingClick(b.id) : undefined}
            onKeyDown={
              onBuildingClick
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onBuildingClick(b.id)
                    }
                  }
                : undefined
            }
          >
            <rect
              x={x - 48}
              y={y - 26}
              width="96"
              height="52"
              rx="14"
              fill="var(--color-card)"
              stroke={highlighted ? 'var(--color-primary)' : 'var(--color-border)'}
              strokeWidth={highlighted ? 5 : 2}
            />
            <text x={x} y={y + 6} textAnchor="middle" fontSize="20" fontWeight="600" fill="var(--color-foreground)">
              {b.name}
            </text>
          </g>
        )
      })}

      {/* 시설은 건물과 좌표가 가까워도 가려지지 않도록 건물 위에 표시한다. */}
      {facilities.map((f) => {
        if (f.buildingId && !VISIBLE_BUILDING_IDS.has(f.buildingId)) return null
        const { x, y } = projectMapPoint({ lat: f.lat, lng: f.lng })
        if (x < 0 || x > VIEW_W || y < 0 || y > VIEW_H) return null
        return <FacilityMarker key={f.id} x={x} y={y} type={f.type} name={f.name} />
      })}

      {/* 현재 위치: 파란 점 + 정확도 원 */}
      {cur && (
        <g aria-label="현재 위치">
          <circle cx={cur.x} cy={cur.y} r="34" fill="var(--color-primary)" opacity="0.15" />
          <circle cx={cur.x} cy={cur.y} r="11" fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth="3" />
        </g>
      )}
    </svg>
  )
}

function FacilityMarker({ x, y, type, name }: { x: number; y: number; type: Facility['type']; name: string }) {
  const label = `${FACILITY_LABEL[type]}: ${name}`
  const s = 15 // half-size
  return (
    <g aria-label={label}>
      <title>{label}</title>
      <circle cx={x} cy={y} r="19" fill="var(--color-card)" stroke="var(--color-border)" strokeWidth="2" />
      <g stroke="var(--color-foreground)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {type === 'ELEVATOR' && (
          <>
            <rect x={x - s + 4} y={y - s + 3} width={2 * (s - 4)} height={2 * (s - 3)} rx="2" />
            <path d={`M ${x - 3} ${y - 3} l 3 -4 l 3 4`} />
            <path d={`M ${x - 3} ${y + 3} l 3 4 l 3 -4`} />
          </>
        )}
        {type === 'RAMP' && <path d={`M ${x - s + 3} ${y + s - 4} L ${x + s - 3} ${y - s + 4} L ${x + s - 3} ${y + s - 4} Z`} />}
        {type === 'STAIRS' && (
          <path d={`M ${x - s + 3} ${y + s - 3} v -5 h 5 v -5 h 5 v -5 h 5`} />
        )}
        {type === 'ACCESSIBLE_ENTRANCE' && (
          <>
            <circle cx={x} cy={y - s + 6} r="3" />
            <path d={`M ${x} ${y - 3} v 7 h 6 M ${x} ${y} h 5`} />
          </>
        )}
        {type === 'STEEP_SLOPE' && (
          <>
            <path d={`M ${x} ${y - s + 3} L ${x + s - 3} ${y + s - 4} L ${x - s + 3} ${y + s - 4} Z`} />
            <path d={`M ${x} ${y - 3} v 5`} />
            <circle cx={x} cy={y + s - 8} r="0.6" fill="var(--color-foreground)" />
          </>
        )}
      </g>
    </g>
  )
}
