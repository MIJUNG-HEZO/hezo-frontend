# 커밋 컨벤션

## 형식

```text
<type>(<scope>): <subject>
```

예시:

```text
feature(chat): 슬롯 채우기 진행률 UI 추가
fix(billing): PricingModal Portal z-index 수정
refactor(dashboard): 사이드바 컴포넌트 분리
chore(infra): Dockerfile NEXT_PUBLIC_TOSS_CLIENT_KEY ARG 추가
```

## type

| type | 설명 |
|---|---|
| `feature` | 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `chore` | 설정/빌드/의존성 |
| `refactor` | 리팩터링 |
| `test` | 테스트 |
| `infra` | Dockerfile, CI/CD |

## scope 후보

| scope | 대상 |
|---|---|
| `auth` | 로그인·회원가입·소셜 OAuth |
| `chat` | 챗봇 UI·슬롯 채우기 플로우 |
| `dashboard` | 스튜디오 대시보드·사이드바 |
| `preview` | 프리뷰 페이지·파이프라인 폴링 |
| `billing` | 결제 모달·구독 플랜 UI |
| `admin` | 어드민 대시보드 |
| `studio` | 공통 레이아웃·헤더·네비게이션 |
| `api` | API 클라이언트·타입·훅 |
| `types` | TypeScript 타입 정의 |
| `infra` | Dockerfile·CI/CD 설정 |

## 규칙

- subject는 한 줄로 작성합니다.
- 하나의 커밋은 하나의 의도를 갖습니다.
- 민감 정보(API 키, 토큰) 커밋 즉시 알려야 합니다.
