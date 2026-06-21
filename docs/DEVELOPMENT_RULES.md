# 개발 규칙

## 공통 원칙

- API 스펙(`2. 개발 PRD/백엔드/API_SPEC_VERIFIED.md`)을 Source of Truth로 둡니다.
- 백엔드 미구현 엔드포인트는 mock 데이터로 대체하고 TODO를 명시합니다.
- 사용자 응답 경로를 막는 작업(LLM 호출, 파이프라인 실행)은 프론트에서 직접 호출하지 않습니다.
- 환경변수는 `NEXT_PUBLIC_*`만 클라이언트에 노출합니다. 시크릿은 절대 클라이언트 번들에 포함하지 않습니다.

## Next.js App Router 규칙

- Server Component를 기본으로 사용합니다. 클라이언트 상태·이벤트가 필요한 경우에만 `'use client'`를 추가합니다.
- 데이터 페칭은 Server Component에서 직접 fetch 또는 React Query(`useQuery`)를 사용합니다.
- 라우트 변경은 `next/navigation`의 `useRouter` / `redirect`를 사용합니다.

## 상태 관리 규칙

| 상태 종류 | 도구 |
|---|---|
| Contract JSON (챗봇 전역 상태) | Zustand |
| 서버 데이터 (API 응답) | React Query (`useQuery`, `useMutation`) |
| 폼 상태 | react-hook-form + zod |
| 로컬 UI 상태 (모달 오픈 등) | `useState` |

## 컴포넌트 규칙

- 컴포넌트는 `src/components/<domain>/` 하위에 둡니다.
- 페이지 단위 로직은 `src/app/` 하위에, 재사용 컴포넌트는 `src/components/`에 둡니다.
- 공용 API 훅은 `src/hooks/`, API 클라이언트·타입은 `src/lib/api.ts` 또는 `src/lib/<domain>.ts`에 둡니다.

## 스타일 규칙

- Tailwind CSS를 사용합니다. 인라인 `style={}` 사용을 최소화합니다.
- `tailwind-merge` + `clsx`로 클래스 조합합니다.
- z-index 충돌이 예상되면 React Portal(`createPortal`)을 사용합니다.

## 보안 규칙

- `.env.local`, API key, 토큰은 커밋하지 않습니다.
- `.env.local.example`에 mock 값만 작성합니다.
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`는 테스트 키(`test_ck_...`)와 라이브 키(`live_ck_...`)를 구분합니다.

## 빌드 검증

PR 생성 전 반드시 실행합니다.

```bash
npm run build   # TypeScript 오류 + 빌드 통과 확인
npm run lint    # ESLint 통과 확인
```
