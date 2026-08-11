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
const PAD = 90

const FACILITY_LABEL: Record<Facility['type'], string> = {
  ELEVATOR: '엘리베이터',
  RAMP: '경사로',
  STAIRS: '계단',
  ACCESSIBLE_ENTRANCE: '휠체어 출입구',
  STEEP_SLOPE: '급경사',
}

type Pt = { lat: number; lng: number }

export default function MapCanvas({
  buildings,
  facilities,
  route,
  currentPosition,
  highlightBuildingId,
  onBuildingClick,
}: MapCanvasProps) {
  const project = useMemo(() => {
    const pts: Pt[] = [
      ...buildings.map((b) => ({ lat: b.lat, lng: b.lng })),
      ...facilities.map((f) => ({ lat: f.lat, lng: f.lng })),
      ...(route?.nodes.map((n) => ({ lat: n.lat, lng: n.lng })) ?? []),
      ...(currentPosition ? [currentPosition] : []),
    ]

    // 좌표가 하나도 없을 때의 안전한 기본값
    let minLat = Math.min(...pts.map((p) => p.lat))
    let maxLat = Math.max(...pts.map((p) => p.lat))
    let minLng = Math.min(...pts.map((p) => p.lng))
    let maxLng = Math.max(...pts.map((p) => p.lng))

    if (!Number.isFinite(minLat)) {
      minLat = 0
      maxLat = 1
      minLng = 0
      maxLng = 1
    }

    const latSpan = maxLat - minLat || 1
    const lngSpan = maxLng - minLng || 1

    return (p: Pt) => {
      const x = PAD + ((p.lng - minLng) / lngSpan) * (VIEW_W - PAD * 2)
      // 위도는 위로 갈수록 커지므로 y 를 뒤집는다
      const y = PAD + ((maxLat - p.lat) / latSpan) * (VIEW_H - PAD * 2)
      return { x, y }
    }
  }, [buildings, facilities, route, currentPosition])

  const routePoints = useMemo(() => {
    if (!route) return ''
    return route.nodes.map((n) => project({ lat: n.lat, lng: n.lng })).map((p) => `${p.x},${p.y}`).join(' ')
  }, [route, project])

  const cur = currentPosition ? project(currentPosition) : null

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full rounded-2xl border border-border bg-secondary"
      role="img"
      aria-label="캠퍼스 길찾기 지도 (시연용 목업)"
    >
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>

      {/* 배경: 아주 옅은 격자 */}
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

      {/* 워터마크 */}
      <text
        x={VIEW_W / 2}
        y={VIEW_H - 24}
        textAnchor="middle"
        fontSize="20"
        fill="var(--color-muted-foreground)"
        opacity="0.7"
      >
        지도 배경은 시연용 목업입니다
      </text>

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
        const { x, y } = project({ lat: b.lat, lng: b.lng })
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
        const { x, y } = project({ lat: f.lat, lng: f.lng })
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
