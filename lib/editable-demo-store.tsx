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
  | { type: 'UPDATE_BUILDING'; payload: Building }
  | { type: 'RESET_BUILDING'; payload: string }
  | { type: 'SET_FACILITIES'; payload: Facility[] }
  | { type: 'UPDATE_FACILITY'; payload: Facility }
  | { type: 'RESET_FACILITY'; payload: string }
  | { type: 'SET_ROUTES'; payload: Record<'FAST' | 'ACCESSIBLE', RouteResult> }
  | { type: 'UPDATE_ROUTE'; payload: RouteResult }
  | { type: 'RESET_ROUTE'; payload: RouteResult['kind'] }
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
    case 'UPDATE_BUILDING': {
      const building = cloneBuildings([action.payload])[0]
      return {
        ...state,
        buildings: state.buildings.map((item) => item.id === building.id ? building : item),
        demo: {
          ...state.demo,
          ...(state.demo.nextCourseBuildingId === building.id ? { nextCourseBuilding: building.name } : {}),
          ...(state.demo.fromBuildingId === building.id ? { fromBuildingName: building.name } : {}),
        },
        dirty: true,
      }
    }
    case 'RESET_BUILDING': {
      const original = initialBuildings.find((building) => building.id === action.payload)
      if (!original) return state
      const building = cloneBuildings([original])[0]
      return {
        ...state,
        buildings: state.buildings.map((item) => item.id === building.id ? building : item),
        demo: {
          ...state.demo,
          ...(state.demo.nextCourseBuildingId === building.id ? { nextCourseBuilding: building.name } : {}),
          ...(state.demo.fromBuildingId === building.id ? { fromBuildingName: building.name } : {}),
        },
        dirty: true,
      }
    }
    case 'SET_FACILITIES':
      return { ...state, facilities: cloneFacilities(action.payload), dirty: true }
    case 'UPDATE_FACILITY': {
      const facility = { ...action.payload }
      return {
        ...state,
        facilities: state.facilities.map((item) => item.id === facility.id ? facility : item),
        dirty: true,
      }
    }
    case 'RESET_FACILITY': {
      const original = initialFacilities.find((facility) => facility.id === action.payload)
      if (!original) return state
      return {
        ...state,
        facilities: state.facilities.map((item) => item.id === original.id ? { ...original } : item),
        dirty: true,
      }
    }
    case 'SET_ROUTES':
      return {
        ...state,
        routes: {
          FAST: cloneRoute(action.payload.FAST),
          ACCESSIBLE: cloneRoute(action.payload.ACCESSIBLE),
        },
        dirty: true,
      }
    case 'UPDATE_ROUTE':
      return {
        ...state,
        routes: { ...state.routes, [action.payload.kind]: cloneRoute(action.payload) },
        dirty: true,
      }
    case 'RESET_ROUTE':
      return {
        ...state,
        routes: { ...state.routes, [action.payload]: cloneRoute(initialRoutes[action.payload]) },
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
