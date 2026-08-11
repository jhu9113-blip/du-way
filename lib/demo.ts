import type { Building } from '@/types'
import { buildings } from '@/data/mock'

// 시연 고정 계산값 — 계산하지 말고 이 값을 그대로 쓴다.
export const DEMO = {
  nextCourseName: 'UX 디자인',
  nextCourseStart: '10:30',
  nextCourseBuilding: '경상대학',
  nextCourseBuildingId: 'B-GYEONGSANG',
  nextCourseRoom: '1402',
  travelMinutes: 13,
  recommendedDeparture: '10:14',
  prevCourseEnd: '10:20',
  breakMinutes: 10,
  shortageMinutes: 3, // 3분 부족
  backToBackWarning: true, // 연강 경고 ON
  fromBuildingId: 'B-SUNGSAN',
  fromBuildingName: '성산홀',
} as const

export const MOBILITY_LABEL: Record<string, string> = {
  WALK: '도보',
  MANUAL_WHEELCHAIR: '수동 휠체어',
  POWER_WHEELCHAIR: '전동 휠체어',
  ASSISTED: '도움 이동',
}

export const DAY_LABEL: Record<number, string> = {
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
}

const buildingMap = new Map<string, Building>(buildings.map((b) => [b.id, b]))

export function getBuilding(id: string): Building | undefined {
  return buildingMap.get(id)
}

export function getBuildingName(id: string): string {
  return buildingMap.get(id)?.name ?? id
}

// 초 → "N분" 표기 (반올림, 시연용)
export function formatDuration(sec: number): string {
  return `${Math.round(sec / 60)}분`
}

// 미터 → 표기
export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`
}
