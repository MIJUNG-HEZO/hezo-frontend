# HEZO Frontend Design Changelog
**작업일:** 2026-06-29  
**세션 범위:** ChatModal 개편부터 디자인 정합성 감사까지

---

## 1. ChatModal — 채팅 우선 마법사 UI 전면 개편

**파일:** `src/components/chat/ChatModal.tsx`

### 변경 전
- 좌측 사이드바 + 우측 컨텐츠 분리 레이아웃
- 단계별 화면 교체 방식

### 변경 후
- **채팅 피드 누적 방식** — 모든 단계 메시지가 단일 스크롤 컨테이너에 쌓임
- **다크 헤더** (`bg-gray-900`) + 5개 세그먼트 진행 트랙 (에메랄드 채우기)
- `max-w-2xl` 좁힌 레이아웃, 좌측 사이드바 완전 제거
- **서브컴포넌트 분리:**
  - `AssistantMsg` — 에메랄드 "H" 아바타 + gray-100 말풍선
  - `UserBubble` — primary-500 말풍선, 우측 정렬
- 타이핑 인디케이터: 3-dot bounce with staggered delay
- **페이즈별 Footer CTA 변환:**
  - `start` → "시작하기"
  - `structure` → "다음"
  - `template` → "뒤로 / 다음"
  - `conversation` → 입력창 + 전송 버튼
  - `chat_done` → 미리보기 버튼
  - `preview` → "닫기 / 발행하기"
- 템플릿 카드에 iframe 미리보기 + 줌 아이콘 클릭 시 풀 프리뷰 모달

**애니메이션:**
```css
@keyframes msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* animate-[msg-in_220ms_ease-out_both] with stagger delays */
```

---

## 2. Dashboard — 대시보드 레이아웃 전면 개편

**파일:** `src/app/dashboard/page.tsx`, `src/components/dashboard/Ring.tsx`

### 우선순위 재정의
> "AI 봇감지랑 가시성이 친화도 점수보다 더 중요함"

### 레이아웃 구조 (위 → 아래)

```
[Hero Row: grid-cols-1 lg:grid-cols-2]
  ┌─────────────────────────────────────┐  ┌──────────────────────────────────┐
  │ AI 가시성 종합점수 (DarkCard)         │  │ AI 봇 크롤 감지 (DarkCard)        │
  │ 52px white score + delta badge       │  │ 총 방문수 + 4 bot rows            │
  │ 7일 추이 바 차트                      │  │ (GPT/Claude/Perplexity/Naver)    │
  └─────────────────────────────────────┘  └──────────────────────────────────┘

[SectionDivider: "사이트 건강"]

[Secondary Row: grid-cols-1 lg:grid-cols-[3fr_2fr]]
  ┌──────────────────────────────────┐  ┌──────────────────────────────┐
  │ AI 친화도 점수 (White Card)       │  │ AI 추천 개선 항목 (White Card) │
  │ Ring(88px) + SlotDots           │  │ 레벨 배지 + tips              │
  └──────────────────────────────────┘  └──────────────────────────────┘

[Health Row: grid-cols-2 lg:grid-cols-4]
  사이트 상태 | PageSpeed | Google 인덱싱 | LLM 인용
```

### 신규 서브컴포넌트
| 컴포넌트 | 역할 |
|---|---|
| `DarkCard` | `bg-gray-900 border-gray-800` 다크 KPI 카드 |
| `DarkCardTitle` | `text-gray-400` 라벨 |
| `SectionDivider` | 레이블 + 수평선 구분자 |
| `SlotDots` | filled/empty 8px 원형 도트 (GEO/JSON-LD 상태) |
| `DarkCardError` | 에러 상태 빈 화면 |

### Ring 컴포넌트 변경
```tsx
// 추가된 prop
trackColor?: string  // default: "var(--color-gray-100)"
// 다크 배경에서 트랙 색상 커스터마이즈용
```

---

## 3. 랜딩 페이지 — 대비·가시성 수정

### 3-1. Footer.tsx (`bg-surface-dark` = #101010 기준)

| 요소 | 변경 전 | 변경 후 | 대비비 |
|---|---|---|---|
| 설명 텍스트 | `text-white/35` | `text-white/50` | 3.4 → 5.5:1 |
| 컬럼 헤더 | `text-white/30` | `text-white/60` | 2.8 → 6.9:1 |
| 네비 링크 | `text-white/45` | `text-white/55` | 4.7 → 6.2:1 |
| 법적 / 저작권 | `text-white/25` | `text-white/40` | 2.4 → 4.0:1 |

### 3-2. Pricing.tsx

| 요소 | 변경 전 | 변경 후 |
|---|---|---|
| Pro 카드 금액 부제 | `text-white/40` | `text-white/55` |
| Pro 카드 결제 주기 | `text-white/35` | `text-white/50` |
| "가장 인기" 배지 | `bg-white/10 text-white/80` (흰 배경에서 불가시) | `bg-primary-500 text-white shadow-sm` |

> **배지 불가시 원인:** 배지가 `absolute -top-3.5`로 카드 위에 떠서 흰 페이지 배경 위에 렌더링됨. `bg-white/10`은 흰 배경 위에서 무색.

### 3-3. HowItWorks.tsx

| 요소 | 변경 전 | 변경 후 |
|---|---|---|
| 단계 워터마크 숫자 | `text-gray-100` (흰 카드에서 불가시) | `text-gray-200` |

---

## 4. 로그인 페이지 — 2분할 레이아웃 전면 개편

**파일:** `src/app/auth/login/page.tsx`

### 변경 전
- 400px 중앙 카드 단일 레이아웃
- 하단 "회원가입으로 전환" 텍스트 링크

### 변경 후
- **2분할 전체화면** (`min-h-screen flex`)

**좌: 브랜드 패널** (`bg-gray-900`, 데스크탑 전용)
- Logo (dark variant)
- 헤드라인: "AI 검색 시대, **가장 먼저** 준비하세요" (에메랄드 강조)
- 3개 지표 카드: 1,200+ / 15분 / 82점 (반투명 테두리)
- ChatGPT·Perplexity 인용 칩 (고유 브랜드 색상)
- 하단 부연: "첫 사이트 무료 · 신용카드 없이 시작"

**우: 폼 패널** (`bg-white`, flex-1)
- **탭 스위처** (로그인 / 회원가입) — 링크 토글 대체
- 상황별 헤딩: "다시 오셨군요!" / "무료로 시작하기"
- 소셜 버튼: 카카오·네이버 인라인 SVG 아이콘 포함
- 에러 메시지에 `triangle-alert` 아이콘 추가
- 약관 동의 문구 (회원가입 시만 표시)
- 기존 로직 (react-hook-form, zod, OAuth, API 호출, 라우팅) 전부 보존

---

## 5. 디자인 시스템 정합성 감사 — 수정 3건

**감사 범위:** UI 컴포넌트 7개, 레이아웃 5개, 랜딩 10개, 대시보드 5개, 인증 2개 페이지

### 수정된 항목

**① Hero.tsx — secondary CTA 버튼**
```tsx
// 변경 전: raw <a> inline 스타일
className="inline-flex ... rounded-lg border border-gray-300 bg-white px-[18px] py-3 ..."

// 변경 후: buttonVariants 사용
className={cn(buttonVariants({ hierarchy: "secondary", size: "xl" }))}
```

**② CTA.tsx — 두 버튼 모두**
```tsx
// 변경 전: raw <Link> inline 스타일 (primary, secondary 모두)
// 변경 후:
<Link href="..." className={buttonVariants({ hierarchy: "secondary", size: "xl" })}>도입 문의</Link>
<Link href="..." className={buttonVariants({ hierarchy: "primary", size: "xl" })}>무료로 시작하기</Link>
```

**③ Features.tsx — hover 색상 토큰**
```tsx
// 변경 전: hover:bg-[#eeeeee]
// 변경 후: hover:bg-gray-200
```

### 수정 효과
- 버튼 `border-radius` 통일: `rounded-lg`(10px) → `rounded-md`(8px)
- primary 버튼에 `shadow-button-primary`, focus ring, disabled state 자동 적용
- 디자인 토큰 시스템 외부 하드코딩 제거

### 미수정 (선택적)
| 이슈 | 설명 |
|---|---|
| 랜딩 eyebrow 3연속 | Features/HowItWorks/Pricing 동일 패턴 |
| ai-score 버튼 | raw 스타일 → Button 컴포넌트 교체 |
| 다크 배경 2종 | `surface-dark`(마케팅) vs `gray-900`(앱) 분리 — 의도적 구분 |

---

## 디자인 토큰 참조 (수정 작업 기준)

```
primary-500: #059669  (에메랄드 브랜드)
gray-900:    #101828  (앱 다크 배경)
surface-dark: #101010 (마케팅 다크 배경)
surface-card: #f5f5f5 (연한 회색 카드 배경)
```

**대비비 공식** (흰색 알파 on #101010):  
`C = 239 × alpha + 16` → 4.5:1 기준 최소 alpha ≈ 0.46
