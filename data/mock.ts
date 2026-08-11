import type { Building, Course, Facility, RouteResult, Settings } from '@/types'

// 좌표는 임시값 — 실제 현장조사 후 교체 예정

export const buildings: Building[] = [
  {
    id: 'B-GYEONGSANG',
    name: '경상대학',
    aliases: ['경상관', '경상대'],
    lat: 35.8985,
    lng: 128.8085,
    entranceNodeIds: ['N-GS-E1'],
    indoorHint: '정문 우측 경사로 진입 → 1층 엘리베이터 이용',
  },
  {
    id: 'B-SUNGSAN',
    name: '성산홀',
    aliases: ['본관'],
    lat: 35.8992,
    lng: 128.8072,
    entranceNodeIds: ['N-SS-E1'],
    indoorHint: '후문 자동문 진입 → 좌측 엘리베이터',
  },
  {
    id: 'B-INFO',
    name: '정보통신대학',
    aliases: ['정통대'],
    lat: 35.8978,
    lng: 128.8098,
    entranceNodeIds: ['N-IN-E1'],
    indoorHint: '1층 정문은 계단만 있음. 측면 경사로 이용',
  },
  {
    id: 'B-LIB',
    name: '중앙도서관',
    aliases: ['도서관'],
    lat: 35.8996,
    lng: 128.809,
    entranceNodeIds: ['N-LB-E1'],
    indoorHint: '지하 주차장 방향 자동문 진입',
  },
]

export const facilities: Facility[] = [
  {
    id: 'F-01',
    type: 'ELEVATOR',
    name: '성산홀 엘리베이터',
    lat: 35.8992,
    lng: 128.8073,
    buildingId: 'B-SUNGSAN',
    note: '1F↔5F, 휠체어 이용 가능',
  },
  {
    id: 'F-02',
    type: 'ELEVATOR',
    name: '경상대 엘리베이터',
    lat: 35.8986,
    lng: 128.8084,
    buildingId: 'B-GYEONGSANG',
    note: '1F↔4F, 휠체어 이용 가능',
  },
  {
    id: 'F-03',
    type: 'RAMP',
    name: '성산홀 후문 경사로',
    lat: 35.89935,
    lng: 128.80755,
    buildingId: 'B-SUNGSAN',
    note: '완만한 경사, 자동문 연결',
  },
  {
    id: 'F-04',
    type: 'RAMP',
    name: '경상대 정문 경사로',
    lat: 35.89855,
    lng: 128.80845,
    buildingId: 'B-GYEONGSANG',
    note: '정문 우측',
  },
  {
    id: 'F-05',
    type: 'STEEP_SLOPE',
    name: '경상대 뒤편 오르막',
    lat: 35.89885,
    lng: 128.80825,
    note: '수동 휠체어 자력 통행 어려움',
  },
  {
    id: 'F-06',
    type: 'STAIRS',
    name: '정보통신대학 정문 계단',
    lat: 35.89785,
    lng: 128.80975,
    buildingId: 'B-INFO',
    note: '경사로 없음',
  },
]

// 성산홀 → 경상대학 경로 2종 (시연 고정값)
export const routes: Record<'FAST' | 'ACCESSIBLE', RouteResult> = {
  FAST: {
    kind: 'FAST',
    distanceM: 620,
    durationSec: 480,
    stairsCount: 1,
    elevatorCount: 0,
    rampCount: 0,
    hasSteepSlope: true,
    warnings: ['계단 1곳 포함', '급경사 구간 1곳 포함'],
    nodes: [
      { id: 'N-SS-E1', lat: 35.8992, lng: 128.8072, type: 'ENTRANCE', buildingId: 'B-SUNGSAN' },
      { id: 'F-J1', lat: 35.89905, lng: 128.80765, type: 'JUNCTION' },
      { id: 'F-ST', lat: 35.8989, lng: 128.80805, type: 'STAIRS' },
      { id: 'F-SL', lat: 35.89875, lng: 128.80828, type: 'WAYPOINT' },
      { id: 'F-J2', lat: 35.89862, lng: 128.8084, type: 'JUNCTION' },
      { id: 'N-GS-E1', lat: 35.8985, lng: 128.8085, type: 'ENTRANCE', buildingId: 'B-GYEONGSANG' },
    ],
  },
  ACCESSIBLE: {
    kind: 'ACCESSIBLE',
    distanceM: 760,
    durationSec: 660,
    stairsCount: 0,
    elevatorCount: 1,
    rampCount: 1,
    hasSteepSlope: false,
    warnings: [],
    nodes: [
      { id: 'N-SS-E1', lat: 35.8992, lng: 128.8072, type: 'ENTRANCE', buildingId: 'B-SUNGSAN' },
      { id: 'A-RP', lat: 35.89935, lng: 128.80755, type: 'RAMP' },
      { id: 'A-J1', lat: 35.8994, lng: 128.80805, type: 'JUNCTION' },
      { id: 'A-W1', lat: 35.89932, lng: 128.80852, type: 'WAYPOINT' },
      { id: 'A-EV', lat: 35.89905, lng: 128.80878, type: 'ELEVATOR' },
      { id: 'A-J2', lat: 35.89882, lng: 128.80872, type: 'JUNCTION' },
      { id: 'A-W2', lat: 35.89865, lng: 128.8086, type: 'WAYPOINT' },
      { id: 'N-GS-E1', lat: 35.8985, lng: 128.8085, type: 'ENTRANCE', buildingId: 'B-GYEONGSANG' },
    ],
  },
}

export const initialCourses: Course[] = [
  {
    id: 'c1',
    name: '경영정보시스템',
    day: 1,
    startTime: '09:00',
    endTime: '10:20',
    buildingId: 'B-SUNGSAN',
    room: '205',
  },
  {
    id: 'c2',
    name: 'UX 디자인',
    day: 1,
    startTime: '10:30',
    endTime: '12:00',
    buildingId: 'B-GYEONGSANG',
    room: '1402',
  },
]

export const initialSettings: Settings = {
  version: 1,
  mobility: 'WALK',
  avoidStairs: false,
  preferElevator: false,
  preferGentleSlope: false,
  minimizeDistance: false,
  bufferMinutes: 3,
}

// 데모용 현재시각: 월요일 09:47
export const initialDemoNow = '2026-08-10T09:47:00'
