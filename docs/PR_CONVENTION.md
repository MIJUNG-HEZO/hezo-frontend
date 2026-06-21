# PR 컨벤션

## PR 제목

```text
<type>(<scope>): <subject>
```

예시:

```text
feature(chat): 슬롯 채우기 진행률 UI 추가
fix(billing): PricingModal 사이드바 transform 탈출 (React Portal)
refactor(dashboard): AI 노출 현황 페이지 컴포넌트 분리
```

## PR 본문

PR 본문은 `.github/pull_request_template.md`를 사용합니다.

반드시 포함합니다.

- 연결된 이슈
- 작업 목표
- 주요 변경 내용
- UI 확인 방법 및 결과 (스크린샷 권장)
- 리뷰 요청 사항

## PR 범위

- 하나의 PR은 하나의 작업 단위만 다룹니다.
- UI 변경과 API 연동은 같은 PR에 포함할 수 있습니다.
- Dockerfile/CI 변경은 가능하면 분리합니다.

## 리뷰 중점

- API 스펙(`API_SPEC_VERIFIED.md`) 정합성
- TypeScript 타입 안전성
- Server Component vs Client Component 경계 (`'use client'` 최소화)
- Zustand(Contract JSON 전역 상태) / React Query(서버 상태) 역할 분리
- 반응형·접근성 기본 준수
- 민감 정보(`NEXT_PUBLIC_*` 이외 시크릿) 노출 없음
