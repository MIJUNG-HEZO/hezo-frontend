# HEZO Studio 프론트엔드 — 남은 작업 체크리스트

> 백엔드 없이 프론트 단독으로 완성 가능한 작업 목록
> 작성일: 2026-06-04

---

## 🔴 필수 (백엔드 연동 전 반드시 완료)

### 1. 템플릿 HTML 전체 다운로드 + 저장

- [ ] 랜딩페이지 16종 다운로드 (`demo.hezo.asia/landing/01~16`)
- [ ] 블로그 5종 다운로드 (`demo.hezo.asia/blog/01~05`)
- [ ] 스토어 17종 다운로드 (`demo.hezo.asia/store/01~17`)
- [ ] `public/templates/landing/`, `blog/`, `store/`에 저장
- [ ] ChatModal의 `templateOptions` 데이터를 38종 전체로 업데이트

### 2. 프리뷰에 템플릿 실제 렌더링

- [ ] 프리뷰 단계에서 선택된 템플릿 HTML을 iframe으로 표시
- [ ] Contract JSON의 데이터(업체명, 서비스, 연락처)를 템플릿에 주입하는 로직
- [ ] 주입 방식: iframe postMessage 또는 서버사이드 문자열 치환
- [ ] 프리뷰 ↔ 템플릿 데이터 바인딩 포인트 정의

### 3. recharts 차트 적용

- [ ] `npm install recharts` 설치
- [ ] 대시보드 메인: 트래픽 미니 그래프 → LineChart 교체
- [ ] 대시보드 메인: 문의/예약 바 차트 → BarChart 교체
- [ ] AI 친화도: 레이더 차트 SVG → RadarChart 교체
- [ ] LLM 인용: 일별 추이 → LineChart 교체
- [ ] 방문자 회원: 증가 추이 → AreaChart 교체

---

## 🟡 중요 (품질 + 사용성)

### 4. shadcn/ui 공통 컴포넌트

- [ ] shadcn/ui 초기화 (`npx shadcn-ui@latest init`)
- [ ] Button 컴포넌트 통일
- [ ] Card 컴포넌트 통일
- [ ] Modal/Dialog 컴포넌트 통일 (현재 직접 구현 → shadcn Dialog로 전환)
- [ ] Input/Form 컴포넌트 통일
- [ ] Toast/알림 시스템 추가

### 5. 로딩/에러/404 페이지

- [ ] `app/loading.tsx` — 전역 로딩 스피너
- [ ] `app/not-found.tsx` — 404 페이지
- [ ] `app/error.tsx` — 에러 바운더리
- [ ] API 호출 중 로딩 상태 표시 (스켈레톤 또는 스피너)

### 6. 결제 모달 흐름 완성

- [ ] 프리뷰 → "발행하기" → 결제 UI → "결제 완료" → 발행 성공 화면
- [ ] 결제 성공 시 대시보드 상태 전환 (hasSite = true)
- [ ] "나중에 결제" → 프리뷰 상태 유지 + 대시보드에 "미결제 사이트" 표시

### 7. 대시보드 상태별 분기 완성

- [ ] 사이트 없음: 온보딩 대시보드 ✅ (완료)
- [ ] 사이트 1개 (발행됨): 데이터 대시보드 ✅ (완료)
- [ ] 사이트 1개 (미결제/프리뷰 상태): "발행 대기" 배너 표시
- [ ] 사이트 여러 개: 사이드바 셀렉터로 전환

### 8. 사이드바 사이트 셀렉터

- [ ] 사이트 여러 개일 때 드롭다운으로 선택
- [ ] 선택 시 대시보드 데이터 전환 (Mock)
- [ ] 현재 사이트 이름 표시

---

## 🟢 있으면 좋음 (폴리싱)

### 9. 반응형 미세 조정

- [ ] 대시보드 카드 grid 반응형 (3열 → 2열 → 1열)
- [ ] ChatModal 너비 조정 (작은 화면에서)
- [ ] 사이드바 모바일 대응 (이미 오버레이라 큰 문제 없음)

### 10. ESLint + Prettier 설정

- [ ] `.prettierrc` 생성 (세미콜론, 따옴표 통일)
- [ ] ESLint 규칙 확인 (Next.js 기본 + 추가)
- [ ] 전체 코드 포맷팅 실행

### 11. Dockerfile + CI 파이프라인

- [ ] `Dockerfile` 작성 (Next.js standalone 빌드)
- [ ] `.github/workflows/ci.yml` (lint + type-check + build)
- [ ] 빌드 성공 확인

### 12. 환경 변수 정리

- [ ] `.env.local` 생성 (`NEXT_PUBLIC_API_URL=http://localhost:8000`)
- [ ] `.env.production` 준비 (배포 시 API URL)
- [ ] `.env.example` 작성 (팀원용)

### 13. openapi-typescript 타입 생성

- [ ] 백엔드 FastAPI `/docs` → openapi.json 다운로드
- [ ] `npx openapi-typescript openapi.json -o src/types/api.ts`
- [ ] 기존 수동 타입(`types/index.ts`)을 자동 생성 타입으로 교체
- [ ] ⚠️ 이건 백엔드 API가 확정된 후에 진행

---

## 작업 순서 권장

```
Week 1:
  [1] 템플릿 38종 다운로드
  [2] 프리뷰 템플릿 렌더링
  [3] recharts 차트

Week 2:
  [4] shadcn/ui 컴포넌트
  [5] 로딩/에러 페이지
  [6] 결제 흐름 완성

Week 3:
  [7-8] 대시보드 + 사이트 셀렉터
  [9-12] 반응형, ESLint, Dockerfile, 환경 변수
```

---

## 완료 기준

프론트 단독 완성 = 다음이 모두 동작:
- [x] 로그인/회원가입 UI
- [x] 온보딩 대시보드
- [x] 데이터 대시보드 (Mock)
- [x] ChatModal 전체 흐름 (구조 → 템플릿 → 정보 → 프리뷰)
- [ ] 프리뷰에 실제 템플릿 렌더링
- [ ] 차트가 recharts로 표시됨
- [ ] 발행 → 결제 UI → 성공 화면
- [ ] `npm run build` 에러 없이 성공
