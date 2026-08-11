'use client'

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { Course, Settings } from '@/types'
import { initialCourses, initialDemoNow, initialSettings } from '@/data/mock'

// 나중에 Zustand + persist 로 교체 예정.
// 저장(persist) 관련 코드는 이 파일 밖으로 새어나가지 않게 한다.

export type AppState = {
  onboarded: boolean
  settings: Settings
  courses: Course[]
  demoNow: string // "2026-08-10T09:47:00" — 데모용 현재시각
  demoGpsFailed: boolean // GPS 실패 상황 시뮬레이션
  demoNoRoute: boolean // 경로 없음 상황 시뮬레이션
}

export type AppAction =
  | { type: 'SET_ONBOARDED'; payload: boolean }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'PATCH_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'REMOVE_COURSE'; payload: string }
  | { type: 'SET_DEMO_NOW'; payload: string }
  | { type: 'SET_DEMO_GPS_FAILED'; payload: boolean }
  | { type: 'SET_DEMO_NO_ROUTE'; payload: boolean }
  | { type: 'RESET' }

const initialState: AppState = {
  onboarded: false,
  settings: initialSettings,
  courses: initialCourses,
  demoNow: initialDemoNow,
  demoGpsFailed: false,
  demoNoRoute: false,
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ONBOARDED':
      return { ...state, onboarded: action.payload }
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload }
    case 'PATCH_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'SET_COURSES':
      return { ...state, courses: action.payload }
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] }
    case 'REMOVE_COURSE':
      return { ...state, courses: state.courses.filter((c) => c.id !== action.payload) }
    case 'SET_DEMO_NOW':
      return { ...state, demoNow: action.payload }
    case 'SET_DEMO_GPS_FAILED':
      return { ...state, demoGpsFailed: action.payload }
    case 'SET_DEMO_NO_ROUTE':
      return { ...state, demoNoRoute: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const AppStateContext = createContext<AppState | null>(null)
const AppDispatchContext = createContext<Dispatch<AppAction> | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (ctx === null) {
    throw new Error('useAppState는 AppProvider 안에서만 사용할 수 있습니다.')
  }
  return ctx
}

export function useAppDispatch(): Dispatch<AppAction> {
  const ctx = useContext(AppDispatchContext)
  if (ctx === null) {
    throw new Error('useAppDispatch는 AppProvider 안에서만 사용할 수 있습니다.')
  }
  return ctx
}
