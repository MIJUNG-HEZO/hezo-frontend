# API 경로 마이그레이션 가이드

> 현재 프론트 → 기존 hezo-api (새 폴더/hezo-api)
> 목표 프론트 → 백엔드 팀 코드 (HEZO-backend-main)
> 상태: 백엔드 팀 구현 진행 중, 프론트는 구현 완료 시 순차 전환

---

## 인증 방식 변경

### 현재 (hezo-api)
```
- Access Token: localStorage 저장, Authorization: Bearer 헤더
- Refresh Token: 없음
- 로그인 응답: { access_token, token_type }
```

### 목표 (HEZO-backend-main)
```
- Access Token: 메모리 저장 (localStorage 금지), Authorization: Bearer 헤더
- Refresh Token: HttpOnly Cookie (자동 전송)
- 로그인 응답: { access_token, token_type, expires_in, user: {...} }
- Refresh: POST /api/v1/auth/refresh (Cookie 자동 전송)
```

### 프론트 변경 필요 사항
```
1. api.ts의 credentials 옵션 추가 (Cookie 포함 전송)
   → ky.get(..., { credentials: 'include' })
2. 401 응답 시 자동 refresh 로직 추가
3. access_token 만료(15분) 대비 인터셉터 구현
4. localStorage 대신 메모리 변수로 토큰 관리 (선택)
```

---

## API 경로 매핑

### Auth

| 현재 프론트 호출 | 백엔드 팀 규격 | 구현 상태 | 응답 차이 |
|---------------|-------------|---------|---------|
| `POST api/v1/auth/signup` | `POST /api/v1/auth/signup` | ✅ 구현됨 | 응답 다름 (아래 참조) |
| `POST api/v1/auth/login` | `POST /api/v1/auth/login` | ❌ 미구현 | - |
| `GET api/v1/auth/me` | `GET /api/v1/users/me` | ❌ 미구현 | 경로 변경 |
| - | `POST /api/v1/auth/refresh` | ❌ 미구현 | 신규 |
| - | `POST /api/v1/auth/logout` | ❌ 미구현 | 신규 |
| - | `POST /api/v1/auth/email/verify-request` | ❌ 미구현 | 신규 |
| - | `POST /api/v1/auth/email/verify` | ❌ 미구현 | 신규 |
| - | `GET /api/v1/auth/oauth/{provider}/authorize` | ❌ 미구현 | 신규 |
| - | `GET /api/v1/auth/oauth/{provider}/callback` | ❌ 미구현 | 신규 |

#### Signup 응답 차이

```
현재: { "access_token": "...", "token_type": "bearer" }
목표: { "id": "uuid", "email": "...", "name": "...", "phone": null, "email_verified_at": null, "created_at": "...", "updated_at": "..." }
     + Set-Cookie: refresh_token=...
     + 별도 access_token은 login에서 발급
```

### Sites

| 현재 프론트 호출 | 백엔드 팀 규격 | 구현 상태 |
|---------------|-------------|---------|
| `POST api/v1/sites` | `POST /api/v1/sites` | ✅ 동일 |
| `GET api/v1/sites` | `GET /api/v1/sites` | ✅ 동일 |
| `GET api/v1/sites/{id}` | `GET /api/v1/sites/{id}` | ✅ 동일 |
| `PATCH api/v1/sites/{id}/status` | `PATCH /api/v1/sites/{id}` | ⚠️ 경로 다름 |
| `DELETE api/v1/sites/{id}` | ❌ 미구현 | - |
| `POST api/v1/sites/{id}/publish` | `POST /api/v1/sites/{id}/publish/check` | ⚠️ 다른 의미 |
| `POST api/v1/sites/{id}/unpublish` | ❌ 미구현 | - |

#### Sites 요청 차이

```
현재 create: { "name": "", "structure": "", "template_id": "" }
목표 create: { "name": "강남한의원", "site_type": "landing", "module_key": "medical" }
```

### Subscription / Plans

| 현재 프론트 호출 | 백엔드 팀 규격 | 구현 상태 |
|---------------|-------------|---------|
| `GET api/v1/subscription/status` | `GET /api/v1/subscriptions/me` | ❌ 미등록 |
| `POST api/v1/subscription/upgrade` | `POST /api/v1/billing/checkout` | ❌ 미등록 |
| - | `GET /api/v1/plans` | ❌ 미등록 |
| - | `GET /api/v1/plans/me/usage` | ❌ 미등록 |

### 온보딩 / Contract / Preview (백엔드 팀에 없음)

| 현재 프론트 호출 | 백엔드 팀 규격 | 비고 |
|---------------|-------------|------|
| `PATCH api/v1/sites/{id}/onboarding/*` | 미정 | 백엔드 팀 2차 MVP |
| `POST api/v1/sites/{id}/contract` | 미정 | 백엔드 팀 2차 MVP |
| `POST api/v1/sites/{id}/preview` | 미정 | 백엔드 팀 2차 MVP |
| `POST api/v1/sites/{id}/publish` | 미정 | 발행 로직은 결제 후 |

---

## 전환 순서 (백엔드 팀 구현 완료 시)

### Phase 1: 인증 전환 (login/refresh/logout 구현 후)
```
1. api.ts에 credentials: 'include' 추가
2. login 응답 처리 변경 (TokenResponse → access_token + user)
3. auth-guard.ts에서 isAuthenticated 로직 유지 (access_token 존재 여부)
4. 401 시 refresh 자동 호출 인터셉터 추가
5. login 페이지에서 응답 형식 변경 대응
```

### Phase 2: Users 전환 (GET /users/me 구현 후)
```
1. Sidebar: "api/v1/auth/me" → "api/v1/users/me"
2. ChatModal: 동일 변경
3. UserResponse 타입 변경 (plan → subscription 기반으로)
```

### Phase 3: Plans/Subscriptions 전환 (구현 후)
```
1. getSubscriptionStatus: "api/v1/subscription/status" → "api/v1/subscriptions/me"
2. upgradePlan: "api/v1/subscription/upgrade" → "api/v1/billing/checkout"
3. 응답 타입 변경 대응
```

### Phase 4: Sites 전환 (site_type/module_key 형식 구현 후)
```
1. site create 요청 바디 변경
2. 경로는 동일하되 필드명 변경
3. publish 로직 대응
```

### Phase 5: 온보딩/Preview/Publish (2차 MVP 이후)
```
백엔드 팀 규격 확정 후 전환
```

---

## 현재 프론트가 당장 변경할 것: 없음

> 백엔드 팀 코드가 login, users/me, subscriptions/me, billing/checkout을
> 구현 완료할 때까지 현재 hezo-api를 그대로 사용합니다.
> 이 문서는 전환 시점에 참조하는 가이드입니다.
