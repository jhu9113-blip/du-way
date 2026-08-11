Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui 로 프로토타입을 만든다.
프로젝트명: DU WAY — 대구대학교 캠퍼스 맞춤형 길찾기 웹앱.
모든 UI 텍스트는 한국어.

## 이번 프로젝트의 목표
화면과 화면 전환(플로우)만 완성한다. 실제 데이터 연동은 하지 않는다.
발표 시연에서 5개 화면이 끊김 없이 이어지는 것이 유일한 성공 기준이다.

## 절대 지킬 제약 (위반 금지)
- 데이터베이스, 회원가입, 로그인, 인증 없음
- 외부 API 호출 없음. fetch/axios 사용 금지
- 카카오맵 등 지도 SDK 사용 금지 (아래 MapCanvas 규격대로 자체 SVG로 그린다)
- 개인식별 입력 필드를 절대 만들지 않는다: 이름, 학번, 이메일, 학과, 장애 유형
  → 대신 "계단을 피해야 하나요?" 같은 이동조건만 묻는다
- 모든 데이터는 파일에 하드코딩된 목업. localStorage 사용하지 않는다
- 경로 계산 로직을 만들지 않는다. 미리 계산된 결과 객체를 그대로 보여준다

## 상태 관리
lib/store.tsx 에 React Context + useReducer 로 전역 상태 하나만 둔다.
컴포넌트는 useAppState() / useAppDispatch() 훅으로만 접근한다.
(나중에 Zustand + persist 로 교체할 예정이므로 저장 관련 코드는 이 파일 밖으로 새어나가지 않게 한다)

상태 모양:
{
  onboarded: boolean;
  settings: Settings;
  courses: Course[];
  demoNow: string;          // "2026-08-10T09:47:00" — 데모용 현재시각
  demoGpsFailed: boolean;   // GPS 실패 상황 시뮬레이션
  demoNoRoute: boolean;     // 경로 없음 상황 시뮬레이션
}

## 타입 (types/index.ts — 아래 그대로 사용, 필드 추가/삭제 금지)

type Settings = {
  version: 1;
  mobility: 'WALK' | 'MANUAL_WHEELCHAIR' | 'POWER_WHEELCHAIR' | 'ASSISTED';
  avoidStairs: boolean;
  preferElevator: boolean;
  preferGentleSlope: boolean;
  minimizeDistance: boolean;
  bufferMinutes: number;
};

type Course = {
  id: string;
  name: string;
  day: 1 | 2 | 3 | 4 | 5;
  startTime: string;   // "10:30"
  endTime: string;     // "12:00"
  buildingId: string;
  room: string;
};

type Building = {
  id: string; name: string; aliases: string[];
  lat: number; lng: number;
  entranceNodeIds: string[];
  indoorHint?: string;
};

type Facility = {
  id: string;
  type: 'ELEVATOR' | 'RAMP' | 'STAIRS' | 'ACCESSIBLE_ENTRANCE' | 'STEEP_SLOPE';
  name: string; lat: number; lng: number;
  buildingId?: string; note?: string;
};

type PathNode = {
  id: string; lat: number; lng: number;
  type: 'ENTRANCE' | 'JUNCTION' | 'RAMP' | 'STAIRS' | 'ELEVATOR' | 'WAYPOINT';
  buildingId?: string;
};

type RouteResult = {
  kind: 'FAST' | 'ACCESSIBLE';
  nodes: PathNode[];
  distanceM: number;
  durationSec: number;
  stairsCount: number;
  elevatorCount: number;
  rampCount: number;
  hasSteepSlope: boolean;
  warnings: string[];
};

## 목업 데이터 (data/mock.ts — 좌표는 임시값, 실제 현장조사 후 교체 예정)

buildings (4개):
- B-GYEONGSANG "경상대학" ["경상관","경상대"] 35.8985/128.8085
  indoorHint: "정문 우측 경사로 진입 → 1층 엘리베이터 이용"
- B-SUNGSAN "성산홀" ["본관"] 35.8992/128.8072
  indoorHint: "후문 자동문 진입 → 좌측 엘리베이터"
- B-INFO "정보통신대학" ["정통대"] 35.8978/128.8098
  indoorHint: "1층 정문은 계단만 있음. 측면 경사로 이용"
- B-LIB "중앙도서관" ["도서관"] 35.8996/128.8090
  indoorHint: "지하 주차장 방향 자동문 진입"

facilities (6개): 엘리베이터 2, 경사로 2, 계단 1, 급경사 1
예) F-01 ELEVATOR "성산홀 엘리베이터" note "1F↔5F, 휠체어 이용 가능"
    F-05 STEEP_SLOPE "경상대 뒤편 오르막" note "수동 휠체어 자력 통행 어려움"

routes: 성산홀 → 경상대학 경로 2종을 하드코딩 (시연 고정값)
- FAST: distanceM 620, durationSec 480, stairsCount 1, elevatorCount 0,
        rampCount 0, hasSteepSlope true,
        warnings ["계단 1곳 포함", "급경사 구간 1곳 포함"], nodes 6개
- ACCESSIBLE: distanceM 760, durationSec 660, stairsCount 0, elevatorCount 1,
        rampCount 1, hasSteepSlope false, warnings [], nodes 8개
두 경로의 nodes 좌표는 서로 다른 길로 보이게 벌려서 만든다.

courses (초기 2개, 월요일):
- c1 "경영정보시스템" day 1, 09:00~10:20, B-SUNGSAN, "205"
- c2 "UX 디자인"     day 1, 10:30~12:00, B-GYEONGSANG, "1402"

settings 초기값: mobility 'WALK', 모든 옵션 false, bufferMinutes 3
demoNow 초기값: 월요일 09:47

## 시연 고정 계산값 (계산하지 말고 이 숫자를 그대로 쓴다)
- 다음 수업: UX 디자인 10:30 경상대학 1402호
- 예상 이동시간: 13분  → 추천 출발 10:14
- 직전 수업 10:20 종료 → 쉬는시간 10분 → 13분 필요 → 3분 부족 → 연강 경고 ON

## MapCanvas 규격 (components/map/MapCanvas.tsx)
지도 SDK 대신 SVG로 그린다. 나중에 카카오맵 컴포넌트로 통째 교체할 것이므로
props 인터페이스를 정확히 지킨다.

props: {
  buildings: Building[];
  facilities: Facility[];
  route?: RouteResult | null;
  currentPosition?: { lat: number; lng: number } | null;
  highlightBuildingId?: string;
  onBuildingClick?: (id: string) => void;
}

동작:
- 전달된 모든 좌표의 min/max 로 bounding box 를 잡고 SVG viewBox 에 정규화 투영
- 배경: 아주 옅은 격자 + "지도 배경은 시연용 목업입니다" 워터마크 텍스트
- 건물: 둥근 사각 + 건물명 라벨
- 시설: 타입별 아이콘(엘리베이터/경사로/계단/휠체어출입구/급경사) + aria-label
- 경로: polyline. ACCESSIBLE 은 실선, FAST 는 파선으로 구분 (색상만으로 구분 금지)
- 현재 위치: 파란 점 + 정확도 원

## 라우팅 (5개)
/onboarding, / (홈), /timetable, /route, /settings
- onboarded 가 false 면 / 접근 시 /onboarding 으로 리다이렉트
- /onboarding 을 제외한 모든 화면에 하단 탭바: 홈 / 시간표 / 길안내 / 설정
- 하단 탭바는 아이콘 + 텍스트 라벨 병기, 각 항목 최소 44×44px

## 디자인 규칙 (접근성 서비스이므로 반드시 준수)
- 모바일 우선 375px 기준 설계, 1280px PC 에서도 중앙 정렬로 정상 표시
- 본문 최소 16px, 터치 영역 최소 44×44px, 명도 대비 4.5:1 이상
- 색상만으로 상태를 구분하지 않는다. 항상 아이콘 + 텍스트 병기
  (X) 빨간 선 = 계단 포함   (O) 삼각형 아이콘 + "계단 1곳 포함"
- 모든 인터랙티브 요소 키보드 조작 가능, 포커스 링 유지
- 톤: 딥 네이비(#1B3A6B) 프라이머리, 배경은 밝은 뉴트럴, 카드는 흰색 + 얇은 테두리
- 둥근 모서리 크게(rounded-2xl), 그림자는 약하게, 정보 밀도는 낮게

## 이번 턴 산출물 (여기까지만 만든다)
1. types/index.ts
2. data/mock.ts
3. lib/store.tsx (Context + Provider + 훅)
4. app/layout.tsx (Provider 감싸기) + 하단 탭바 컴포넌트
5. components/map/MapCanvas.tsx (완성)
6. 5개 라우트 파일 — 각 화면은 제목과 "다음 단계에서 구현" 자리표시자만

각 화면 내용은 다음 메시지에서 하나씩 지시할 테니, 지금은 절대 미리 만들지 마라.