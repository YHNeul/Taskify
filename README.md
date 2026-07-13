# Taskify

협업 팀을 위한 칸반 기반 업무 관리 서비스입니다.  
단순히 화면을 구현하는 데서 끝나지 않고, **인증/데이터 패칭/오류 복구/성능 최적화**를 한 흐름으로 설계한 Next.js 프론트엔드 프로젝트입니다.

- **App Router 기반 클라이언트 주도 데이터 전략**: 대시보드 진입 시 보드를 즉시 렌더링하고, React Query 캐시/prefetch로 상호작용 체감 속도를 개선합니다.
- **클라이언트-서버 역할 분리**: 서버 컴포넌트 전용 `fetch` 계층과 클라이언트 상호작용용 React Query 계층을 분리해 유지보수성을 높였습니다.
- **실서비스형 인증 흐름**: HttpOnly 쿠키 기반 인증, 보호 라우트 가드, 인증 페이지 역가드(로그인 상태 접근 제한)까지 반영했습니다.
- **복잡한 UI 상호작용 처리**: 칸반 보드 Drag & Drop, 컬럼/카드 CRUD, 모달 상태 관리, 페이지네이션을 안정적으로 통합했습니다.
- **운영 관점 오류 대응**: 에러 바운더리와 런타임 에러 리포팅 API를 두어 장애 관측 확장 포인트를 확보했습니다.

## 주요 기능

- 로그인/회원가입 및 인증 기반 라우팅
- 내 대시보드/내 정보 관리
- 대시보드 상세 칸반 보드
  - 컬럼 생성/수정/삭제
  - 카드 생성/조회/상세 모달
  - 카드 Drag & Drop 이동
  - 컬럼별 카드 점진 로딩(페이지네이션)
- 글로벌/세그먼트 에러 UI 및 재시도 동선

## 기술 스택

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Data Fetching**: TanStack Query v5, Axios, 서버 컴포넌트 `fetch`
- **State**: Zustand
- **Form & Validation**: React Hook Form, Zod
- **DnD**: dnd-kit
- **Quality**: ESLint, Prettier, Husky, lint-staged

## 아키텍처 포인트

### 1) 클라이언트 주도 조회 + React Query prefetch

대시보드 상세 페이지는 라우트 전환 체감 속도를 위해 보드를 우선 렌더링하고,  
`dashboard`, `columns`, `cards`를 React Query 훅으로 조회합니다.

추가로 사이드 메뉴 진입 전 prefetch, 카드 상세 idle prefetch를 적용해  
초기 체감 지연을 줄이면서도 상호작용 성능을 유지하도록 설계했습니다.

### 2) 인증/보안 중심 BFF 패턴

- `/api/auth/login`에서 업스트림 로그인 후 토큰을 **HttpOnly 쿠키**로 저장
- `/api/proxy/[...path]`에서 쿠키 토큰을 `Authorization` 헤더로 변환해 업스트림에 전달
- `proxy`(middleware)에서 보호 경로 접근 제어 및 인증 페이지 접근 역가드 적용

브라우저에 민감 토큰을 노출하지 않으면서, 프론트엔드가 API 사용성을 유지하도록 설계했습니다.

### 3) 데이터 전략의 일관성

- 전역 QueryClient 기본 정책: `staleTime`, `gcTime`, `retry`, `refetchOnWindowFocus` 튜닝
- 카드 데이터는 변경 빈도가 높아 캐시 정책을 분리해 신선도를 우선
- 서버/클라이언트 패칭 계층을 분리해 책임과 테스트 범위를 명확히 유지

### 4) 운영 준비도(Observability Ready)

런타임 에러를 클라이언트에서 수집해 `/api/client-errors`로 전송하는 공통 리포터를 두었습니다.  
추후 Sentry/Datadog 같은 외부 관측 시스템으로 교체할 때, 리포팅 진입점만 변경하면 되도록 설계했습니다.

## 폴더 구조

```text
src
├─ app                    # 라우트, 레이아웃, 에러 바운더리, Route Handlers
│  ├─ (auth)              # 로그인/회원가입
│  ├─ (main)              # 대시보드/마이페이지
│  └─ api                 # auth, proxy, client-errors
├─ lib                    # QueryProvider 등 인프라 레이어
├─ shared
│  ├─ apis                # 서버/클라이언트 API 계층
│  ├─ components          # 도메인/UI 컴포넌트
│  ├─ hooks               # 비즈니스 훅
│  ├─ store               # Zustand 스토어
│  ├─ constants           # 상수/키/설정
│  └─ utils               # 유틸리티/에러 리포팅
└─ proxy.ts               # 인증 기반 라우팅 제어
```

## 로컬 실행

### 1) 설치

```bash
npm install
```

### 2) 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 설정하세요.

```bash
NEXT_PUBLIC_API_URL=https://sp-taskify-api.vercel.app/22-2
# optional
NEXT_PUBLIC_IMAGE_HOSTNAMES=
```

### 3) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 검사
- `npm run test`: Vitest 단위 테스트 실행
- `npm run test:watch`: Vitest watch 모드
- `npm run check:button-size-usage`: 레거시 버튼 사이즈 사용 검사

## 테스트 범위

- 인증 Route Handler: 로그인 성공/실패 및 HttpOnly 쿠키 저장
- BFF Proxy Route: 쿠키 토큰의 Authorization 헤더 변환, 업스트림 에러(401/403/500) 전달, 네트워크 실패(502) 처리
- 라우팅 가드(`proxy.ts`): 보호 라우트 리다이렉트, 인증 페이지 역가드
- 핵심 훅: `useQueryParamState`, `useMeQuery` 상태 전이 및 분기 동작

## 코드 품질/협업 규칙

- Husky + lint-staged 기반 pre-commit 자동 검사
- ESLint + Prettier 일관 적용
- `@/` 절대 경로 import 강제(상대 경로 제한)
- 컴포넌트/훅/상수 네이밍 및 역할 분리 컨벤션 준수

## 앞으로의 확장 아이디어

- E2E 테스트(Playwright) 및 핵심 도메인 통합 테스트 추가
- 에러 리포팅 외부 SaaS 연동(Sentry/Datadog)
- 대시보드 활동 로그/감사 추적 기능
- 접근성 점검 자동화(axe, Lighthouse CI)

---

이 저장소는 "예쁘게 만든 UI"보다, **실무에서 오래 유지되는 프론트엔드 구조**를 목표로 설계했습니다.
