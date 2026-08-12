'use client'

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { Building, Course, Facility, RouteResult } from '@/types'
import {
  buildings as initialBuildings,
  facilities as initialFacilities,
  initialCourses,
  routes as initialRoutes,
} from '@/data/mock'
import { DEMO } from '@/lib/demo'

export type DemoValues = {
  nextCourseName: string
  nextCourseStart: string
  nextCourseBuilding: string
  nextCourseBuildingId: string
  nextCourseRoom: string
  travelMinutes: number
  recommendedDeparture: string
  prevCourseEnd: string
  breakMinutes: number
  shortageMinutes: number
  backToBackWarning: boolean
  fromBuildingId: string
  fromBuildingName: string
}

export type EditableDemoState = {
  buildings: Building[]
  facilities: Facility[]
  routes: Record<'FAST' | 'ACCESSIBLE', RouteResult>
  courses: Course[]
  demo: DemoValues
  dirty: boolean
}

export type EditableDemoAction =
  | { type: 'SET_BUILDINGS'; payload: Building[] }
  | { type: 'SET_FACILITIES'; payload: Facility[] }
  | { type: 'SET_ROUTES'; payload: Record<'FAST' | 'ACCESSIBLE', RouteResult> }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_DEMO'; payload: DemoValues }
  | { type: 'RESET_ALL' }

function cloneBuildings(source: Building[]) {
  return source.map((building) => ({
    ...building,
    aliases: [...building.aliases],
    entranceNodeIds: [...building.entranceNodeIds],
  }))
}

function cloneFacilities(source: Facility[]) {
  return source.map((facility) => ({ ...facility }))
}

function cloneCourses(source: Course[]) {
  return source.map((course) => ({ ...course }))
}

function cloneRoute(route: RouteResult): RouteResult {
  return {
    ...route,
    nodes: route.nodes.map((node) => ({ ...node })),
    warnings: [...route.warnings],
  }
}

function createInitialState(): EditableDemoState {
  return {
    buildings: cloneBuildings(initialBuildings),
    facilities: cloneFacilities(initialFacilities),
    routes: {
      FAST: cloneRoute(initialRoutes.FAST),
      ACCESSIBLE: cloneRoute(initialRoutes.ACCESSIBLE),
    },
    courses: cloneCourses(initialCourses),
    demo: { ...DEMO },
    dirty: false,
  }
}

function reducer(state: EditableDemoState, action: EditableDemoAction): EditableDemoState {
  switch (action.type) {
    case 'SET_BUILDINGS':
      return { ...state, buildings: cloneBuildings(action.payload), dirty: true }
    case 'SET_FACILITIES':
      return { ...state, facilities: cloneFacilities(action.payload), dirty: true }
    case 'SET_ROUTES':
      return {
        ...state,
        routes: {
          FAST: cloneRoute(action.payload.FAST),
          ACCESSIBLE: cloneRoute(action.payload.ACCESSIBLE),
        },
        dirty: true,
      }
    case 'SET_COURSES':
      return { ...state, courses: cloneCourses(action.payload), dirty: true }
    case 'SET_DEMO':
      return { ...state, demo: { ...action.payload }, dirty: true }
    case 'RESET_ALL':
      return createInitialState()
    default:
      return state
  }
}

const EditableDemoStateContext = createContext<EditableDemoState | null>(null)
const EditableDemoDispatchContext = createContext<Dispatch<EditableDemoAction> | null>(null)

export function EditableDemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  return (
    <EditableDemoStateContext.Provider value={state}>
      <EditableDemoDispatchContext.Provider value={dispatch}>
        {children}
      </EditableDemoDispatchContext.Provider>
    </EditableDemoStateContext.Provider>
  )
}

export function useEditableDemoState() {
  const context = useContext(EditableDemoStateContext)

  if (context === null) {
    throw new Error('useEditableDemoState는 EditableDemoProvider 안에서만 사용할 수 있습니다.')
  }

  return context
}

export function useEditableDemoDispatch() {
  const context = useContext(EditableDemoDispatchContext)

  if (context === null) {
    throw new Error('useEditableDemoDispatch는 EditableDemoProvider 안에서만 사용할 수 있습니다.')
  }

  return context
}
