"use client";

import { useParams } from "next/navigation";
import PublishButton from "@/components/preview/PublishButton";
import { Icon, type IconName } from "@/components/ui/Icon";

const values: { icon: IconName; title: string; desc: string }[] = [
  { icon: "target", title: "맞춤 치료", desc: "개인 체질과 증상에 맞춘\n1:1 맞춤 치료" },
  { icon: "leaf", title: "자연 치료", desc: "자연에서 찾은 안전하고\n효과적인 치료" },
  { icon: "heart", title: "정성 진료", desc: "환자 한 분 한 분에게\n정성을 다하는 진료" },
  { icon: "building-2", title: "믿을 수 있는 한의원", desc: "풍부한 경험과 체계적인\n의료 시스템" },
];

const aiBadges: { icon: IconName; label: string }[] = [
  { icon: "file-text", label: "Schema.org 적용" },
  { icon: "circle-help", label: "FAQ 구조화" },
  { icon: "sparkles", label: "한국어 최적화" },
  { icon: "link", label: "구조화된 데이터" },
];

export default function PreviewPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const siteStatus = "preview_ready";
  const userPlan: "free" | "pro" | "max" = "free";
  const sitesUsed = 0;
  const sitesLimit = 0;

  return (
    <div className="bg-white">
      {/* HEZO 프리뷰 액션 바 */}
      <div className="sticky top-0 z-[60] bg-gray-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">프리뷰 모드</span>
            <span className="rounded-full bg-warning-500/20 px-2 py-0.5 text-xs text-warning-300">
              미발급
            </span>
          </div>
          <PublishButton
            siteId={siteId}
            siteStatus={siteStatus}
            userPlan={userPlan}
            sitesUsed={sitesUsed}
            sitesLimit={sitesLimit}
          />
        </div>
      </div>

      {/* 생성된 사이트 네비게이션 */}
      <header className="sticky top-[52px] z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Icon name="leaf" size={18} className="text-primary-600" /> 바른한의원
            </span>
            <nav className="flex gap-6 text-sm text-gray-600">
              {["진료안내", "의료진", "치료프로그램", "후기", "FAQ", "블로그"].map((n) => (
                <a key={n} href="#" className="hover:text-primary-700">{n}</a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">02-123-4567</span>
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700">
              예약하기
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary-500 px-3 py-1 text-xs text-primary-700">
              AI Optimized <Icon name="check" size={12} />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 bg-primary-50 py-1.5 text-[11px] text-primary-700">
          <Icon name="sparkles" size={12} /> AI 친화 구조가 자동 적용되었습니다
        </div>
      </header>

      {/* 히어로 */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-20">
          <div className="max-w-lg">
            <h1 className="mb-4 font-display text-3xl font-bold leading-tight text-gray-900">
              자연의 치유력으로
              <br />
              건강한 삶을 되찾아 드립니다
            </h1>
            <p className="mb-6 text-gray-600">
              바른 진료, 바른 치료, 바른 마음으로
              <br />
              환자 한 분 한 분의 삶에 맞는 치료를 제공합니다.
            </p>
            <button className="rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700">
              진료 예약하기
            </button>
          </div>
          <div className="h-64 w-96 rounded-2xl bg-gray-200" />
        </div>
        <div className="absolute bottom-6 right-6 flex flex-wrap justify-end gap-3">
          {["FAQ Structured", "Schema Applied", "LLM Ready", "Semantic HTML", "Structured Data"].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] text-gray-600"
            >
              <Icon name="check" size={11} className="text-primary-600" /> {badge}
            </span>
          ))}
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {values.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-white p-6 text-center transition-shadow hover:shadow-md"
            >
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50">
                <Icon name={card.icon} size={22} className="text-primary-600" />
              </span>
              <h3 className="mb-2 font-semibold text-gray-800">{card.title}</h3>
              <p className="whitespace-pre-line text-xs text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 진료 안내 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 font-display text-xl font-bold text-gray-900">진료 안내</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { title: "침 치료", desc: "경혈 자극을 통해 기혈 순환을 돕고 통증과 질환을 치료합니다." },
            { title: "한약 처방", desc: "개인 체질과 증상에 맞는 맞춤 한약을 처방합니다." },
            { title: "뜸 치료", desc: "온열 자극으로 기혈 순환을 촉진하고, 면역력을 강화합니다." },
            { title: "부항 치료", desc: "어혈 제거와 근육 이완을 통해 통증을 완화합니다." },
          ].map((item) => (
            <div key={item.title} className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
              <div className="h-32 bg-gray-100" />
              <div className="p-4">
                <h4 className="mb-1 font-medium text-gray-800">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
                <a href="#" className="mt-2 inline-block text-xs text-primary-700 hover:underline">
                  자세히 보기 ›
                </a>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
            <h4 className="mb-3 text-sm font-medium text-primary-800">진료 시간 안내</h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-gray-700"><span>평일</span><span>AM 09:30 - PM 06:30</span></div>
              <div className="flex justify-between text-gray-700"><span>점심시간</span><span>PM 01:00 - PM 02:00</span></div>
              <div className="flex justify-between text-gray-700"><span>토요일</span><span>AM 09:30 - PM 01:30</span></div>
              <div className="flex justify-between text-gray-400"><span>일요일/공휴일</span><span>휴진</span></div>
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary-300 py-2 text-xs text-primary-700 hover:bg-primary-100">
              <Icon name="map-pin" size={13} /> 오시는 길
            </button>
          </div>
        </div>
      </section>

      {/* 환자 후기 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 font-display text-xl font-bold text-gray-900">환자 후기</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { text: "만성 통증이 3개월만에 크게 호전되었어요. 치료 후 삶이 가벼워지고 활력이 생겼어요. 정말 감동입니다.", name: "김OO님", info: "30대 여성" },
            { text: "한약 복용으로 오래 고생했던 비염이 크게 좋아졌는데, 늘 자세하고 전문적이고 치료효과가 뛰어나 만족합니다.", name: "이OO님", info: "40대 남성" },
            { text: "무릎 반월판 손상 후 한방치료를 받으면서 수술 없이 회복하였습니다. 치료 결과에 매우 만족합니다.", name: "박OO님", info: "10대 자녀 보호자" },
          ].map((review, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="mb-3 flex gap-0.5">
                {Array(5).fill(0).map((_, j) => (
                  <Icon key={j} name="star" size={14} className="fill-warning-400 text-warning-400" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-700">&ldquo;{review.text}&rdquo;</p>
              <p className="text-xs text-gray-400">{review.name} | {review.info}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI 검색·LLM 노출 최적화 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl bg-gray-50 p-8">
          <h3 className="mb-2 text-center font-display font-bold text-gray-800">AI 검색·LLM 노출 최적화</h3>
          <p className="mb-6 text-center text-xs text-gray-500">
            이 사이트는 AI가 이해하기 쉬운 구조로 설계되어 각종 LLM에서 더 잘 노출됩니다.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {aiBadges.map((item) => (
              <div key={item.label} className="text-center">
                <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Icon name={item.icon} size={20} className="text-primary-600" />
                </span>
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 text-xs md:grid-cols-5">
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 font-medium text-white">
                <Icon name="leaf" size={14} className="text-primary-400" /> 바른한의원
              </h4>
              <p className="leading-relaxed">
                서울특별시 강남구 테헤란로 123, 4층 (역삼동)
                <br />
                사업자등록번호 123-45-67890
              </p>
              <p className="mt-2 text-gray-400">© 2025 바른한의원. All rights reserved.</p>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-white">진료 안내</h4>
              <ul className="flex flex-col gap-1 text-gray-400">
                <li>침 치료</li><li>한약 처방</li><li>뜸 치료</li><li>부항 치료</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-white">한의원 소개</h4>
              <ul className="flex flex-col gap-1 text-gray-400">
                <li>한의원 소개</li><li>의료진 소개</li><li>진료 철학</li><li>오시는 길</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-white">고객센터</h4>
              <ul className="flex flex-col gap-1 text-gray-400">
                <li>공지사항</li><li>자주 묻는 질문</li><li>상담 문의</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-white">문의 및 예약</h4>
              <p className="mb-2 flex items-center gap-1.5 text-sm text-white">
                <Icon name="phone" size={14} /> 02-123-4567
              </p>
              <p className="flex items-center gap-1.5 text-gray-400">
                <Icon name="mail" size={14} /> 문의@barun-hanclinic.com
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-gray-400">
                <Icon name="message-circle" size={14} /> 카카오톡 @바른한의원
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-end border-t border-gray-700 pt-6">
            <div className="flex items-center gap-2 rounded-lg border border-primary-700/50 bg-primary-900/30 px-4 py-2">
              <Icon name="check" size={14} className="text-primary-400" />
              <div>
                <p className="text-[10px] font-medium text-primary-300">AI 친화 구조 자동 적용</p>
                <p className="text-[9px] text-primary-400/70">지속적으로 AI 활용에 최적화된 구조를 유지합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
