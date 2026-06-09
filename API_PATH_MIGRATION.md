# API 경로 마이그레이션 가이드

> 현재 프론트 → 백엔드 팀 코드 (HEZO-backend-main)
> 상태: Auth 전환 완료, Sites/Billing은 대기
> 수정일: 2026-06-09

---

## 인증 방식 — ✅ 전환 완료

### 현재 동작 상태
```
- Access Token: localStorage 저장, Authorization: Bearer 헤더
- Refresh Token: HttpOnly Cookie (백엔드가 Set-Cookie로 설정)
- api.ts: credentials: 'include', prefix: API_BASE_URL
- 401 인터셉터: 자동 refresh → 실패 시 로그인 리다이렉트
- AuthGuard: useEffect 기반 (hydration 이슈 해결됨)
- Sidebar: mounted 체크 후 렌더링 (hydration 이슈 해결됨)
- CORS: 백엔드 main.py에 CORSMiddleware 추가됨
```

---

## Auth API — ✅ 모두 연동 완료

| 프론트 호출 | 백엔드 엔드포인트 | 상태 | 프론트 구현 |
|------------|-----------------|------|-----------|
| 회원가입 | `POST /api/v1/auth/signup` | ✅ | ✅ login 페이지 |
| 로그인 | `POST /api/v1/auth/login` | ✅ | ✅ login 페이지 |
| 토큰 갱신 | `POST /api/v1/auth/refresh` | ✅ | ✅ api.ts 자동 refresh |
| 로그아웃 | `POST /api/v1/auth/logout` | ✅ | ✅ Sidebar 로그아웃 |
| 회원탈퇴 | `DELETE /api/v1/auth/me` | ✅ | ✅ 설정 → 계정 삭제 모달 |
| 이메일 인증 요청 | `POST /api/v1/auth/email-verification/request` | ✅ | ✅ /auth/verify-email |
| 이메일 인증 확인 | `POST /api/v1/auth/email-verification/confirm` | ✅ | ✅ /email-verification?token= |
| 카카오 로그인 | `POST /api/v1/auth/oauth/kakao` | ✅ | ✅ /oauth/kakao/callback |
| 네이버 로그인 | `POST /api/v1/auth/oauth/naver` | ✅ | ✅ /oauth/naver/callback |
| 소셜 가입 완료 | `POST /api/v1/auth/oauth/complete-signup` | ✅ | ✅ callback 페이지 내 |

### 프론트 Auth 라우트 구조
```
/auth/login                    — 이메일 로그인/회원가입 + 소셜 로그인 버튼
/auth/verify-email             — 이메일 인증 안내 (발송 후 대기)
/email-verification?token=xxx  — 이메일 인증 링크 처리
/oauth/kakao/callback          — 카카오 OAuth callback
/oauth/naver/callback          — 네이버 OAuth callback
```

### Auth 플로우 상세
```
[이메일 회원가입]
1. POST /auth/signup → 유저 정보 반환 (토큰 없음)
2. POST /auth/login → access_token 발급 + refresh_token Cookie
3. /auth/verify-email 이동
4. "인증 메일 보내기" → POST /email-verification/request → 메일 발송
5. 이메일 링크 클릭 → /email-verification?token=xxx → POST /confirm
6. 인증 완료 → 대시보드 이동

[카카오/네이버 소셜 로그인]
1. 카카오/네이버 인가 URL로 리다이렉트
2. callback 페이지로 code와 함께 돌아옴
3. POST /auth/oauth/kakao (또는 /naver) { code, redirect_uri }
4-A. 기존 유저: access_token 반환 → 대시보드 이동
4-B. 신규 유저: signup_token 반환 → 이메일/이름 입력 폼 표시
5. POST /auth/oauth/complete-signup { signup_token, email, name }
6. /auth/verify-email 이동

[로그아웃]
1. POST /auth/logout → refresh_token revoke + Cookie 삭제
2. localStorage access_token 삭제
3. /auth/login 리다이렉트

[회원탈퇴]
1. 설정 → "계정 삭제" → 확인 모달
2. DELETE /auth/me → soft delete + Cookie 삭제
3. localStorage 토큰 삭제 → /auth/login 리다이렉트

[토큰 자동 갱신]
1. API 호출 → 401 (access_token 만료)
2. POST /auth/refresh (Cookie의 refresh_token 자동 전송)
3. 새 access_token 발급 → localStorage 갱신
4. 원래 요청을 새 토큰으로 자동 재시도
5. refresh 실패 시 → /auth/login 리다이렉트
```

---

## Subscription / Plans — ✅ 연동 완료

| 프론트 호출 | 백엔드 엔드포인트 | 상태 |
|------------|-----------------|------|
| 구독 상태 | `GET /api/v1/subscriptions/me` | ✅ 연동됨 |
| 플랜 목록 | `GET /api/v1/plans` | ✅ 백엔드 구현됨 (프론트 미사용) |

### 프론트 getSubscriptionStatus() 동작
```
1. GET /subscriptions/me → { subscription: { plan: { code, max_sites, can_publish } } }
2. plan.code 매핑: FREE→starter, PRO→pro, MAX→enterprise
3. GET /sites로 published 사이트 수 카운트
4. 통합 SubscriptionStatus 객체 반환
```

---

## Sites — ⏳ 일부 연동 (백엔드 팀 구현 범위 한정)

| 프론트 호출 | 백엔드 엔드포인트 | 상태 | 비고 |
|------------|-----------------|------|------|
| 사이트 목록 | `GET /api/v1/sites` | ✅ | 대시보드 hasSite 판단용 |
| 사이트 생성 | `POST /api/v1/sites` | ✅ | 바디 형식 다름 (아래 참조) |
| 사이트 상세 | `GET /api/v1/sites/{id}` | ✅ | |
| 사이트 수정 | `PATCH /api/v1/sites/{id}` | ✅ | |
| 온보딩 | `PATCH /sites/{id}/onboarding/*` | ❌ 없음 | 2차 MVP |
| Contract | `POST /sites/{id}/contract` | ❌ 없음 | 2차 MVP |
| 프리뷰 | `POST /sites/{id}/preview` | ❌ 없음 | 2차 MVP |
| 발행 | `POST /sites/{id}/publish` | ❌ 없음 | 2차 MVP |

### Sites 요청 바디 차이
```
현재 프론트 create: { "name": "", "structure": "", "template_id": "" }
백엔드 팀 create: { "name": "강남한의원", "site_type": "landing", "module_key": "medical" }
→ 전환 시 변경 필요
```

---

## Billing — ⏳ 대기

| 프론트 호출 | 백엔드 엔드포인트 | 상태 |
|------------|-----------------|------|
| 결제 요청 | `POST /api/v1/billing/checkout` | ❌ 미등록 (라우터에 미포함) |
| 결제 목록 | `GET /api/v1/billing/payments` | ❌ 미등록 |

---

## 프론트 환경 설정

### .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_KAKAO_CLIENT_ID=카카오_REST_API_키
NEXT_PUBLIC_NAVER_CLIENT_ID=네이버_Client_ID
```

### 백엔드 .env (프론트 연동에 필요한 항목)
```
DATABASE_URL=postgresql+psycopg://hezo_app:hezo_password@localhost:5432/hezo_dev
JWT_SECRET_KEY=hezo-dev-secret-key-must-be-32bytes!
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=14
COOKIE_SECURE=false
FRONTEND_BASE_URL=http://localhost:3000
KAKAO_CLIENT_ID=카카오_REST_API_키
KAKAO_CLIENT_SECRET=카카오_시크릿
NAVER_CLIENT_ID=네이버_Client_ID
NAVER_CLIENT_SECRET=네이버_시크릿
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=이메일
SMTP_PASSWORD=앱비밀번호
SMTP_FROM_EMAIL=발송이메일
```

### 카카오/네이버 Redirect URI 등록
```
카카오: http://localhost:3000/oauth/kakao/callback
네이버: http://localhost:3000/oauth/naver/callback
```

---

## 남은 전환 작업

### Phase 2: Users (GET /users/me 구현 후)
```
Sidebar, ChatModal에서 유저 정보 조회 경로 변경
```

### Phase 3: Billing (checkout 구현 후)
```
PricingModal 업그레이드 → POST /billing/checkout 연동
```

### Phase 4: Sites create 바디 변경
```
{name, structure, template_id} → {name, site_type, module_key}
```

### Phase 5: 온보딩/Preview/Publish (2차 MVP)
```
백엔드 팀 규격 확정 후 전환
```

---

## 추가 구현 완료 기능

| 기능 | 프론트 위치 | 비고 |
|------|-----------|------|
| 회원탈퇴 확인 모달 | /settings | ⚠️ 모달 + DELETE 호출 |
| 재가입 환영 메시지 | 대시보드 | 🎉 "다시 돌아오셨군요!" 토스트 |
| 로딩 스켈레톤 | /app/loading.tsx | DashboardSkeleton |
| 에러 바운더리 | /app/error.tsx | 글로벌 에러 페이지 |
| React Query | QueryProvider | 서버 상태 캐싱 |
| react-hook-form + zod | 로그인, 설정 | 폼 검증 |
