# API 경로 마이그레이션 가이드

> 현재 프론트 → 백엔드 팀 코드 (HEZO-backend-main)
> 상태: Phase 1 (인증) 전환 완료, 나머지 대기 중
> 수정일: 2026-06-08

---

## 인증 방식 변경 — ✅ Phase 1 완료

### 현재 상태 (전환 완료)
```
- Access Token: localStorage 저장, Authorization: Bearer 헤더
- Refresh Token: HttpOnly Cookie (백엔드가 Set-Cookie로 설정)
- api.ts: credentials: 'include' 적용됨
- 401 인터셉터: 토큰 제거 + /auth/login 리다이렉트
- AuthGuard: useEffect 기반 (hydration 이슈 해결됨)
- Sidebar: mounted 체크 후 렌더링 (hydration 이슈 해결됨)
```

### 프론트에서 완료한 것
```
✅ api.ts에 credentials: 'include' 추가
✅ 401 응답 시 토큰 제거 + 리다이렉트 인터셉터
✅ login 페이지: signup → 자동 login → access_token 저장
✅ AuthGuard: SSR hydration 불일치 해결 (useEffect 기반)
✅ Sidebar: mounted 체크 추가
✅ CORS: 백엔드 main.py에 CORSMiddleware 추가
```

### 아직 안 된 것 (백엔드 미구현)
```
❌ POST /auth/refresh (토큰 갱신) — 프론트는 준비됨, 백엔드 미구현
❌ POST /auth/logout — 프론트는 localStorage 삭제만 하고 있음
❌ access_token 메모리 저장 전환 (현재 localStorage, 나중에 변경 가능)
```

---

## API 경로 매핑 — 현재 상태

### Auth

| 프론트 호출 | 백엔드 팀 규격 | 구현 상태 | 프론트 전환 |
|------------|-------------|---------|-----------|
| `POST api/v1/auth/signup` | `POST /api/v1/auth/signup` | ✅ 구현됨 | ✅ 전환 완료 |
| `POST api/v1/auth/login` | `POST /api/v1/auth/login` | ✅ 구현됨 | ✅ 전환 완료 |
| `GET api/v1/auth/me` | `GET /api/v1/users/me` | ❌ 미구현 | ⏳ 대기 |
| - | `POST /api/v1/auth/refresh` | ❌ 미구현 | ⏳ 대기 |
| - | `POST /api/v1/auth/logout` | ❌ 미구현 | ⏳ 대기 |
| - | `GET /api/v1/auth/oauth/{provider}/authorize` | ❌ 미구현 | ⏳ 대기 |
| - | `GET /api/v1/auth/oauth/{provider}/callback` | ❌ 미구현 | ⏳ 대기 |

#### 응답 형식 (현재 동작 확인됨)

```json
// POST /api/v1/auth/signup → 201
{ "id": "uuid", "email": "...", "name": "...", "phone": null, "email_verified_at": null, "created_at": "...", "updated_at": "..." }

// POST /api/v1/auth/login → 200
{ "access_token": "jwt...", "token_type": "bearer" }
// + Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth
```

#### 프론트 로그인 플로우 (현재)
```
1. 회원가입: POST /auth/signup → 유저 정보만 반환 (토큰 없음)
2. 자동 로그인: POST /auth/login → access_token 획득
3. localStorage에 access_token 저장
4. router.push("/") → 대시보드 이동
```

### Sites

| 프론트 호출 | 백엔드 팀 규격 | 구현 상태 | 프론트 전환 |
|------------|-------------|---------|-----------|
| `POST api/v1/sites` | `POST /api/v1/sites` | ✅ 구현됨 | ⚠️ 바디 형식 다름 |
| `GET api/v1/sites` | `GET /api/v1/sites` | ✅ 구현됨 | ⏳ 대기 |
| `GET api/v1/sites/{id}` | `GET /api/v1/sites/{id}` | ✅ 구현됨 | ⏳ 대기 |
| `PATCH api/v1/sites/{id}/status` | `PATCH /api/v1/sites/{id}` | ✅ 구현됨 | ⚠️ 경로 다름 |
| `DELETE api/v1/sites/{id}` | ❌ 미구현 | - | ⏳ 대기 |
| `POST api/v1/sites/{id}/publish` | `POST /api/v1/sites/{id}/publish/check` | ❌ 의미 다름 | ⏳ 대기 |

#### Sites 요청 차이 (전환 시 변경 필요)
```
현재 프론트 create: { "name": "", "structure": "", "template_id": "" }
백엔드 팀 create: { "name": "강남한의원", "site_type": "landing", "module_key": "medical" }
```

### Plans

| 프론트 호출 | 백엔드 팀 규격 | 구현 상태 | 프론트 전환 |
|------------|-------------|---------|-----------|
| - | `GET /api/v1/plans` | ✅ 구현됨 | ⏳ 대기 (프론트 미사용) |
| `GET api/v1/subscription/status` | `GET /api/v1/subscriptions/me` | ❌ 미구현 | ⏳ 대기 |
| `POST api/v1/subscription/upgrade` | `POST /api/v1/billing/checkout` | ❌ 미구현 | ⏳ 대기 |

### 온보딩 / Contract / Preview (백엔드 팀 2차 MVP)

| 프론트 호출 | 백엔드 팀 규격 | 비고 |
|------------|-------------|------|
| `PATCH api/v1/sites/{id}/onboarding/*` | 미정 | 2차 MVP |
| `POST api/v1/sites/{id}/contract` | 미정 | 2차 MVP |
| `POST api/v1/sites/{id}/preview` | 미정 | 2차 MVP |
| `POST api/v1/sites/{id}/publish` | 미정 | 2차 MVP |

---

## 남은 전환 순서

### Phase 2: Users (GET /users/me 구현 후)
```
1. Sidebar: "api/v1/auth/me" → "api/v1/users/me"
2. ChatModal: 동일 변경
3. UserResponse 타입에 subscription 정보 반영
```

### Phase 3: Plans/Subscriptions (구현 후)
```
1. getSubscriptionStatus: "api/v1/subscription/status" → "api/v1/subscriptions/me"
2. upgradePlan: "api/v1/subscription/upgrade" → "api/v1/billing/checkout"
3. BillingPanel, PricingModal 응답 타입 변경
```

### Phase 4: Sites create 바디 변경
```
1. site create 요청: {name, structure, template_id} → {name, site_type, module_key}
2. site_type/module_key 조합 검증 로직 프론트에도 추가
```

### Phase 5: 온보딩/Preview/Publish (2차 MVP 이후)
```
백엔드 팀 규격 확정 후 전환
```

---

## 현재 프론트가 당장 추가로 해야 할 것

```
1. sites API 호출 시 인증 토큰이 필요함 (require_authenticated)
   → 현재 api.ts에서 Bearer 헤더 자동 추가됨 ✅
   → 단, GET /sites 호출 시 email_verified 필요할 수 있음 (site create만)

2. 회원가입 후 대시보드 진입 시 GET /sites 호출이 정상 동작하는지 확인
   → sites 테이블이 비어있으면 [] 반환 → hasSite=false → 온보딩 표시
```

---

## 백엔드 로컬 환경 정보

```
서버: http://localhost:8000
DB: Docker PostgreSQL (hezo_app:hezo_password@localhost:5432/hezo_dev)
CORS: localhost:3000, localhost:3001 허용
JWT: HS256, Access 15분, Refresh 14일 (Cookie)
```
