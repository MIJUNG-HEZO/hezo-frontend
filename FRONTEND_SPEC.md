# HEZO Studio 프론트엔드 기능 명세서

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | HEZO Studio (Control Plane 프론트엔드) |
| 프레임워크 | Next.js 14+ (App Router) |
| CSS | Tailwind CSS |
| HTTP 클라이언트 | ky |
| 상태 관리 | React useState + @tanstack/react-query (예정) |
| 실시간 통신 | WebSocket (socket.io-client 예정) |
| 인증 | Auth.js v5 (예정, 현재 localStorage Mock) |
| 차트 | recharts (예정) |
| 배포 대상 | ECS Fargate (Control Plane) |

---

## 페이지 구조

```
src/app/
├── page.tsx                          # 대시보드 (메인) — 상태별 분기
├── auth/login/page.tsx               # 로그인 (카카오/네이버/이메일)
├── auth/register/page.tsx            # 회원가입
├── chat/page.tsx                     # 챗봇 전체 페이지 (독립 진입점)
├── dashboard/
│   ├── ai-score/page.tsx             # AI 친화도 점수 대시보드
│   ├── llm-citations/page.tsx        # LLM 인용 추적 대시보드
│   ├── operations/page.tsx           # 운영 지표 대시보드
│   └── business-context/page.tsx     # 한국형 비즈니스 컨텍스트 검증
├── preview/[siteId]/page.tsx         # 고객사 사이트 프리뷰
├── templates/page.tsx                # /chat으로 리다이렉트
└── settings/page.tsx                 # 설정 (미구현)
```

---

## 컴포넌트 구조

```
src/components/
├── layout/
│   ├── Sidebar.tsx                   # 슬라이드 오버레이 사이드바
│   └── AuthGuard.tsx                 # 인증 가드 (라우팅 보호)
├── chat/
│   ├── ChatModal.tsx                 # 챗봇 모달 (대시보드 위 오버레이)
│   └── PricingModal.tsx              # 결제 플랜 모달 (3-tier)
├── dashboard/
│   └── OnboardingDashboard.tsx       # 사이트 미발급 유저용 온보딩
├── preview/                          # (예정)
└── ui/                               # (예정) 공통 UI 컴포넌트
```

---

## 핵심 기능 상세

### 1. 인증 & 라우팅

| 기능 | 설명 | 상태 |
|------|------|------|
| 로그인 페이지 | 카카오 / 네이버 / 이메일 3종 버튼 | ✅ UI 완성 (Mock) |
| 인증 가드 | 비로그인 → /auth/login 리다이렉트 | ✅ 완성 (localStorage) |
| 상태별 분기 | 사이트 유무에 따라 대시보드 UI 변경 | ✅ 완성 |
| 상태 전환 (개발용) | 프로필 메뉴에서 로그인 상태 토글 | ✅ 완성 |

### 2. 사이드바 네비게이션

| 기능 | 설명 | 상태 |
|------|------|------|
| 슬라이드 오버레이 | ☰ 버튼으로 열고 닫는 구조 | ✅ 완성 |
| 상태별 메뉴 표시 | 사이트 없으면 대시보드 관련 메뉴 숨김 | ✅ 완성 |
| 새 사이트 만들기 | 항상 표시, 클릭 시 모달 (결제 or 챗봇) | ✅ 완성 |
| 프로필 드롭업 | 상태 전환 + 로그아웃 | ✅ 완성 |

### 3. 대시보드 (메인)

| 기능 | 설명 | 상태 |
|------|------|------|
| 온보딩 대시보드 | 사이트 없는 유저에게 만들기 유도 | ✅ UI 완성 |
| 데이터 대시보드 | AI 점수, LLM 인용, 트래픽, 문의, 사이트 상태, 회원 | ✅ UI 완성 (Mock 데이터) |
| 새 사이트 버튼 | 사이트 있으면 결제 모달 → 챗봇 모달 | ✅ 완성 |

### 4. 챗봇 (사이트 생성 플로우)

| 기능 | 설명 | 상태 |
|------|------|------|
| 모달 형식 | 대시보드 위에 오버레이, 배경 침범 안 함 | ✅ 완성 |
| Phase: 세션 시작 | 시작 버튼 | ✅ 완성 |
| Phase: 구조 선택 | 랜딩/일반/스토어 3개 카드 | ✅ 완성 |
| Phase: 템플릿 선택 | 구조별 템플릿 목록 | ✅ 완성 (Mock 3개씩) |
| Phase: 대화 | 채팅 UI + 메시지 입력 | ✅ UI 완성 (Mock) |
| 진행 상황 패널 | 좌측 5단계 체크리스트 | ✅ 완성 |
| 실시간 미리보기 | 우측 패널 (미구현 시 placeholder) | ✅ UI 완성 |

### 5. 결제 모달

| 기능 | 설명 | 상태 |
|------|------|------|
| 3-tier 플랜 | Starter(₩0) / Pro(₩49,000) / Enterprise(₩190,000~) | ✅ UI 완성 |
| 월간/연간 토글 | 연간 -17% 절약 표시 | ✅ 완성 |
| 플랜 선택 → 챗봇 전환 | 결제 후 ChatModal 오픈 | ✅ 흐름 완성 (Mock) |

### 6. AI 친화도 점수 대시보드

| 기능 | 설명 | 상태 |
|------|------|------|
| 총점 + 레이더 차트 | 82/100 + 6축 레이더 | ✅ UI 완성 (SVG placeholder) |
| 등급 테이블 | 0-29 ~ 90-100 5단계 | ✅ 완성 |
| 항목별 분석 6카드 | 시맨틱HTML/메타/청크/엔티티/구조화/FAQ | ✅ 완성 |
| 개선 제안 | 3개 항목 + 액션 버튼 | ✅ 완성 |
| 하단 요약 바 | 전체 요약 + 예상 개선 + 다음 검사 | ✅ 완성 |

### 7. LLM 인용 추적 대시보드

| 기능 | 설명 | 상태 |
|------|------|------|
| 상단 4 요약 카드 | 인용률/유입/답변수/효과종합 | ✅ 완성 |
| 엔진별 프로그레스 바 | ChatGPT/Perplexity/Claude | ✅ 완성 |
| 일별 추이 차트 | 바 차트 (placeholder) | ✅ UI 완성 |
| 표준 쿼리 결과 테이블 | 인용 여부 매트릭스 | ✅ 완성 |
| Referrer 추적 테이블 | 시간/엔진/방문수 | ✅ 완성 |
| 인사이트 3개 | 개선 제안 카드 | ✅ 완성 |
| 하단 요약 2카드 | "등장하는가?" + "방문하는가?" | ✅ 완성 |

### 8. 한국형 비즈니스 컨텍스트 검증

| 기능 | 설명 | 상태 |
|------|------|------|
| 사이트 프리뷰 + 푸터 | 법적 정보 자동 적용된 상태 | ✅ 완성 |
| 법적 필수 정보 체크리스트 | 5개 항목 (사업자등록번호 등) | ✅ 완성 |
| 공공데이터 연동 확인 | 4개 항목 자동 확인 상태 | ✅ 완성 |
| MVP 검증 범위 | 체크섬/API 연동 상태 | ✅ 완성 |
| 법적 리스크 대응 | 전자상거래법 안내 | ✅ 완성 |

### 9. 프리뷰 홈페이지 (고객 사이트 예시)

| 기능 | 설명 | 상태 |
|------|------|------|
| 전체 사이트 레이아웃 | 바른한의원 (랜딩페이지) | ✅ 완성 |
| AI 최적화 뱃지 | FAQ/Schema/LLM/Semantic/Structured | ✅ 완성 |
| 진료 안내 카드 | 4개 서비스 + 진료시간표 | ✅ 완성 |
| 환자 후기 | 3개 리뷰 카드 | ✅ 완성 |
| 법적 정보 푸터 | 사업자등록번호 포함 | ✅ 완성 |

---

## 앞으로 구현해야 할 체크리스트

### 인증 & 세션

- [ ] Auth.js v5 실제 연동 (카카오/네이버/이메일 OAuth)
- [ ] JWT 토큰 기반 API 인증 (ky interceptor에 실제 토큰 주입)
- [ ] 세션 만료 시 자동 리다이렉트
- [ ] 회원가입 페이지 구현 (/auth/register)

### 챗봇 (사이트 생성 플로우)

- [ ] WebSocket 연결 구현 (WS /api/v1/sessions/{id}/chat)
- [ ] 세션 생성 API 호출 (POST /api/v1/sessions)
- [ ] 구조 선택 API 호출 (PUT /sessions/{id}/structure)
- [ ] 템플릿 목록 실제 API 연동 (GET /api/v1/templates)
- [ ] 템플릿 선택 API 호출 (PUT /sessions/{id}/template)
- [ ] 실시간 메시지 송수신 (WebSocket)
- [ ] 리서치 진행 상태 표시 (research_started / research_completed)
- [ ] 진행 상황 체크리스트 실시간 업데이트 (progress 이벤트)
- [ ] 대화 시간 카운트다운 (13분 경고, 15분 종료)
- [ ] Contract_JSON 실시간 미리보기 업데이트
- [ ] 프리뷰 생성 요청 (POST /sessions/{id}/preview)
- [ ] 프리뷰 폴링 (GET /sessions/{id}/preview)
- [ ] 이미지 재생성 (POST /sessions/{id}/preview/retry-image, 최대 3회)
- [ ] 내용 재생성 (POST /sessions/{id}/preview/retry-content, 최대 2회)
- [ ] 발행 (POST /sessions/{id}/publish)
- [ ] 발행 완료 후 대시보드 상태 전환

### 결제

- [ ] 결제 API 연동 (토스페이먼츠 or 포트원) — v1.1
- [ ] 결제 성공 콜백 → 챗봇 모달 전환
- [ ] 현재 플랜 상태 표시
- [ ] 구독 관리 페이지 (설정)

### 대시보드 — 실제 데이터 연동

- [ ] @tanstack/react-query 설치 및 설정
- [ ] GET /api/v1/metrics/{siteId} 연동 (AI 친화도 점수)
- [ ] GET /api/v1/metrics/{siteId}/history 연동 (추세 데이터)
- [ ] GET /api/v1/metrics/{siteId}/competitors 연동 (경쟁사 비교)
- [ ] recharts 설치 + 레이더 차트 구현
- [ ] recharts 라인 차트 (LLM 유입 추이)
- [ ] recharts 바 차트 (문의/예약 추이)
- [ ] 사이트 목록 API 연동 (GET /api/v1/sites)
- [ ] 사이트 상태 실시간 갱신
- [ ] 날짜 범위 필터 기능 구현

### 템플릿

- [ ] 랜딩페이지 템플릿 5종 HTML 제작
- [ ] 일반 홈페이지 템플릿 5종 HTML 제작
- [ ] 스토어 템플릿 5종 HTML 제작
- [ ] 템플릿 미리보기 iframe/렌더링 구현
- [ ] 템플릿 썸네일 이미지 생성

### 공통 UI

- [ ] shadcn/ui 또는 공통 컴포넌트 라이브러리 구성
- [ ] 로딩 스피너 / 스켈레톤 컴포넌트
- [ ] 토스트 알림 시스템
- [ ] 에러 바운더리 + 에러 페이지
- [ ] 404 페이지

### 성능 & 품질

- [ ] Next.js Image 최적화 적용
- [ ] 코드 스플리팅 확인 (dynamic import)
- [ ] Lighthouse 성능 검사 90+ 달성
- [ ] ESLint + Prettier 설정 통일
- [ ] 접근성(a11y) 기본 검사

### 배포 & CI/CD

- [ ] Dockerfile 작성 (Next.js standalone)
- [ ] GitHub Actions CI (lint + type-check + build)
- [ ] ECR Push + ECS 배포 워크플로우
- [ ] 환경 변수 관리 (.env.local / .env.production)
- [ ] 프리뷰 배포 (PR별 vercel preview or ECS staging)

---

## 기술 스택 확정

| 역할 | 라이브러리 | 설치 여부 |
|------|-----------|-----------|
| 프레임워크 | Next.js 14+ | ✅ 설치됨 |
| CSS | Tailwind CSS | ✅ 설치됨 |
| HTTP | ky | ✅ 설치됨 |
| 서버 상태 | @tanstack/react-query | ❌ 미설치 |
| 실시간 | socket.io-client | ❌ 미설치 |
| 차트 | recharts | ❌ 미설치 |
| 인증 | next-auth (Auth.js v5) | ❌ 미설치 |
| 폼 | react-hook-form + zod | ❌ 미설치 |
| UI 컴포넌트 | shadcn/ui | ❌ 미설치 |
| 타입 생성 | openapi-typescript | ❌ 미설치 |

---

## 파일 크기 현황

| 파일 | 역할 | 라인 수 (약) |
|------|------|-------------|
| app/page.tsx | 대시보드 메인 (데이터 + 온보딩 분기) | ~150 |
| app/chat/page.tsx | 챗봇 전체 페이지 | ~200 |
| app/dashboard/ai-score/page.tsx | AI 친화도 점수 | ~200 |
| app/dashboard/llm-citations/page.tsx | LLM 인용 추적 | ~200 |
| app/dashboard/business-context/page.tsx | 비즈니스 컨텍스트 | ~180 |
| app/preview/[siteId]/page.tsx | 프리뷰 홈페이지 | ~180 |
| components/chat/ChatModal.tsx | 챗봇 모달 | ~150 |
| components/chat/PricingModal.tsx | 결제 모달 | ~130 |
| components/dashboard/OnboardingDashboard.tsx | 온보딩 | ~80 |
| components/layout/Sidebar.tsx | 사이드바 | ~120 |
| components/layout/AuthGuard.tsx | 인증 가드 | ~30 |
| lib/api.ts | API 클라이언트 | ~15 |
| lib/auth-guard.ts | 인증 상태 관리 (Mock) | ~40 |
| types/index.ts | 타입 정의 | ~80 |
