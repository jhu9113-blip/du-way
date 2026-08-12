export type Settings = {
  version: 1
  mobility: 'WALK' | 'MANUAL_WHEELCHAIR' | 'POWER_WHEELCHAIR' | 'ASSISTED'
  avoidStairs: boolean
  preferElevator: boolean
  preferGentleSlope: boolean
  minimizeDistance: boolean
  bufferMinutes: number
}

export type Course = {
  id: string
  name: string
  professor?: string
  day: 1 | 2 | 3 | 4 | 5
  startTime: string // "10:30"
  endTime: string // "12:00"
  buildingId: string
  room: string
  location?: string
}

export type Building = {
  id: string
  name: string
  aliases: string[]
  lat: number
  lng: number
  entranceNodeIds: string[]
  indoorHint?: string
}

export type Facility = {
  id: string
  type: 'ELEVATOR' | 'RAMP' | 'STAIRS' | 'ACCESSIBLE_ENTRANCE' | 'STEEP_SLOPE'
  name: string
  lat: number
  lng: number
  buildingId?: string
  note?: string
}

export type PathNode = {
  id: string
  lat: number
  lng: number
  type: 'ENTRANCE' | 'JUNCTION' | 'RAMP' | 'STAIRS' | 'ELEVATOR' | 'WAYPOINT'
  buildingId?: string
}

export type RouteResult = {
  kind: 'FAST' | 'ACCESSIBLE'
  nodes: PathNode[]
  distanceM: number
  durationSec: number
  stairsCount: number
  elevatorCount: number
  rampCount: number
  hasSteepSlope: boolean
  warnings: string[]
}
