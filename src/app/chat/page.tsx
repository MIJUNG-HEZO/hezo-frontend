"use client";

import { useState } from "react";
import { useChatSession, MAX_REGENERATIONS } from "@/hooks/useChatSession";
import PricingModal from "@/components/chat/PricingModal";

// ═══════════ 단계 정의 ═══════════
type Phase = "start" | "structure" | "template" | "conversation";

// 진행 상황 (좌측 패널)
function getProgressItems(phase: Phase) {
  const items = [
    { key: "session", label: "대화 세션 시작" },
    { key: "structure", label: "업종 · 구조 선택" },
    { key: "template", label: "템플릿 선택" },
    { key: "info_collect", label: "정보 수집 대화" },
    { key: "preview", label: "프리뷰 생성" },
  ];

  const phaseIndex = { start: 0, structure: 1, template: 2, conversation: 3 };
  const current = phaseIndex[phase];

  return items.map((item, i) => ({
    ...item,
    status: i < current ? "done" : i === current ? "in_progress" : "pending",
  }));
}

// 구조 옵션
const structureOptions = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달.\n서비스/브랜드 소개에 적합.", icon: "🖥️", recommended: true },
  { id: "multi", label: "일반 홈페이지", desc: "여러 페이지로 상세 정보 전달.\n기업, 클리닉 등에 적합.", icon: "📄", recommended: false },
  { id: "store", label: "스토어", desc: "상품/메뉴 카탈로그 중심.\n식당, 쇼핑몰에 적합.", icon: "🛒", recommended: false },
];

// 템플릿 옵션 (구조별)
const templateOptions: Record<string, { id: string; name: string; desc: string }[]> = {
  landing: [
    { id: "luxury-accessory", name: "Luxury Accessory", desc: "프리미엄 액세서리 브랜드용 랜딩" },
    { id: "medical-clinic", name: "Medical Clinic", desc: "병원/한의원 진료 안내 랜딩" },
    { id: "consulting", name: "Consulting Firm", desc: "컨설팅/전문직 소개 랜딩" },
  ],
  multi: [
    { id: "corporate", name: "Corporate", desc: "기업 소개 멀티페이지" },
    { id: "portfolio", name: "Portfolio", desc: "포트폴리오/작업물 멀티페이지" },
  ],
  store: [
    { id: "restaurant", name: "Restaurant", desc: "식당/카페 메뉴 스토어" },
    { id: "ecommerce", name: "E-Commerce", desc: "소규모 쇼핑몰 스토어" },
  ],
};

export default function ChatPage() {
  const [phase, setPhase] = useState<Phase>("start");
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [rightTab, setRightTab] = useState<"preview" | "schema">("preview");
  const [showPricingModal, setShowPricingModal] = useState(false);

  const {
    sessionState,
    sendMessage,
    requestRegeneration,
    startNewSession,
    formatTime,
  } = useChatSession();

  const progressItems = getProgressItems(phase);
  const currentStepNum = progressItems.filter((i) => i.status === "done").length + 1;
  const totalSteps = progressItems.length;

  /** 메시지 전송 핸들러 */
  const handleSendMessage = () => {
    if (!input.trim()) return;
    const canSend = sendMessage(input.trim());
    if (canSend) {
      setInput("");
      // TODO: 실제 메시지를 채팅 목록에 추가하는 로직
    }
  };

  /** 재생성 버튼 핸들러 */
  const handleRegeneration = () => {
    requestRegeneration();
    // TODO: 실제 재생성 API 호출 로직
  };

  /** 새 세션 시작 핸들러 */
  const handleStartNewSession = () => {
    startNewSession();
    setPhase("start");
    setSelectedStructure(null);
    setSelectedTemplate(null);
    setInput("");
  };

  const canRegenerate = sessionState.regenerationCount < MAX_REGENERATIONS && !sessionState.isExpired;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] -m-8">
      {/* ═══════════ 좌측: 진행 상황 패널 ═══════════ */}
      <div className="hidden md:flex w-60 bg-white border-r border-gray-200 p-5 flex-col">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900">HEZO</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">베타</span>
          </div>
          <h2 className="text-base font-bold text-gray-900 mt-3">사이트 만들기</h2>
          <p className="text-[11px] text-gray-500 mt-1">단계별로 진행하여 AI가<br/>최적의 사이트를 만들어 드립니다.</p>
        </div>

        {/* 진행 상황 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-700">진행 상황</span>
            <span className="text-[10px] text-gray-400">{currentStepNum} / {totalSteps} 단계</span>
          </div>
          <div className="space-y-1.5">
            {progressItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 py-1">
                {item.status === "done" && <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</span>}
                {item.status === "in_progress" && <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] animate-pulse">●</span>}
                {item.status === "pending" && <span className="w-4 h-4 rounded-full border border-gray-300 text-[10px]"></span>}
                <span className={`text-xs ${item.status === "done" ? "text-gray-600" : item.status === "in_progress" ? "text-green-700 font-medium" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-[9px] text-gray-400">🔒 입력 정보는 안전하게 보호됩니다.</p>
        </div>
      </div>

      {/* ═══════════ 중앙: 메인 콘텐츠 ═══════════ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* 상단 스테퍼 */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            {["세션 시작", "구조 선택", "템플릿 선택", "정보 수집", "프리뷰"].map((step, i) => {
              const stepPhaseIndex = { start: 0, structure: 1, template: 2, conversation: 3 }[phase] ?? 0;
              return (
                <div key={step} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                    i < stepPhaseIndex ? "bg-green-600 text-white" :
                    i === stepPhaseIndex ? "bg-green-100 text-green-700 ring-2 ring-green-400" :
                    "bg-gray-200 text-gray-400"
                  }`}>
                    {i < stepPhaseIndex ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] ${i === stepPhaseIndex ? "text-green-700 font-medium" : "text-gray-400"}`}>{step}</span>
                  {i < 4 && <div className="w-5 h-px bg-gray-300"></div>}
                </div>
              );
            })}
          </div>
          {/* 세션 타이머 (대화 단계에서 세션 시작 후 표시) */}
          {phase === "conversation" && sessionState.startedAt !== null && (
            <div className="flex items-center justify-center mt-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                sessionState.isExpired
                  ? "bg-red-100 text-red-700"
                  : sessionState.remainingSeconds <= 60
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
              }`}>
                <span>⏱</span>
                <span>{formatTime(sessionState.remainingSeconds)}</span>
                {sessionState.isExpired && <span className="ml-1">만료</span>}
              </div>
            </div>
          )}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ─── Phase: 세션 시작 ─── */}
          {phase === "start" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl mb-4">🚀</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">새 사이트를 만들어 볼까요?</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-md">
                AI 챗봇과 대화하면서 5분 만에 AI 검색에 최적화된 홈페이지를 자동으로 생성합니다.
              </p>
              <button
                onClick={() => setPhase("structure")}
                className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm"
              >
                대화 세션 시작하기 →
              </button>
              <p className="text-[10px] text-gray-400 mt-4">예상 소요 시간: 5~10분</p>
            </div>
          )}

          {/* ─── Phase: 업종 · 구조 선택 ─── */}
          {phase === "structure" && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">사이트 구조를 선택하세요</h2>
              <p className="text-xs text-gray-500 mb-6">업종에 맞는 최적의 구조를 추천합니다. 원하시는 구조를 선택해 주세요.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {structureOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedStructure(opt.id)}
                    className={`relative cursor-pointer rounded-xl p-5 border-2 transition-all text-center ${
                      selectedStructure === opt.id ? "border-green-600 bg-green-50 shadow" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {opt.recommended && <span className="absolute -top-2 left-3 px-2 py-0.5 bg-green-600 text-white text-[8px] rounded-full">추천</span>}
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">{opt.label}</h3>
                    <p className="text-[10px] text-gray-500 whitespace-pre-line">{opt.desc}</p>
                  </div>
                ))}
              </div>

              {selectedStructure && (
                <button
                  onClick={() => setPhase("template")}
                  className="w-full py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  다음: 템플릿 선택 →
                </button>
              )}
            </div>
          )}

          {/* ─── Phase: 템플릿 선택 ─── */}
          {phase === "template" && selectedStructure && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">템플릿을 선택하세요</h2>
              <p className="text-xs text-gray-500 mb-6">
                선택한 구조({structureOptions.find((s) => s.id === selectedStructure)?.label})에 맞는 템플릿 목록입니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(templateOptions[selectedStructure] || []).map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                      selectedTemplate === tpl.id ? "border-green-600 shadow" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      미리보기
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-sm text-gray-900">{tpl.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{tpl.desc}</p>
                    </div>
                    {selectedTemplate === tpl.id && (
                      <div className="bg-green-50 px-4 py-2 text-[10px] text-green-700 font-medium text-center">✓ 선택됨</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("structure")}
                  className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  ← 구조 다시 선택
                </button>
                {selectedTemplate && (
                  <button
                    onClick={() => setPhase("conversation")}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    다음: 대화 시작하기 →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── Phase: 대화 (정보 수집) ─── */}
          {phase === "conversation" && (
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">😊</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-700">
                  좋습니다! <span className="font-medium">{templateOptions[selectedStructure!]?.find((t) => t.id === selectedTemplate)?.name}</span> 템플릿으로 시작할게요.<br/>
                  먼저 업체명을 알려주세요.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm">Timeless Accessories</div>
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">😊</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-700">
                  핵심 상품이나 서비스를 알려주세요. (최대 5개)
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm">가죽가방, 쥬얼리, 시계</div>
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">😊</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-700">
                  연락처(전화번호, 이메일)를 알려주세요.
                </div>
              </div>

              {/* 세션 만료 안내 메시지 */}
              {sessionState.isExpired && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-center">
                    <p className="text-sm text-red-700 font-medium mb-1">⏱ 세션이 만료되었습니다</p>
                    <p className="text-xs text-red-600">세션이 만료되었습니다. 새 세션을 시작해주세요.</p>
                  </div>
                  <button
                    onClick={handleStartNewSession}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    새 세션 시작
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 입력 (대화 단계에서만) */}
        {phase === "conversation" && (
          <div className="px-6 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                placeholder={sessionState.isExpired ? "세션이 만료되었습니다" : "메시지를 입력하세요..."}
                disabled={sessionState.isExpired}
                className={`flex-1 px-4 py-2.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  sessionState.isExpired
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-50 border-gray-200"
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={sessionState.isExpired || !input.trim()}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  sessionState.isExpired || !input.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                ➤
              </button>
              {/* 재생성 버튼 */}
              <button
                onClick={handleRegeneration}
                disabled={!canRegenerate}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  canRegenerate
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
              >
                🔄 재생성 ({sessionState.regenerationCount}/{MAX_REGENERATIONS})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ 우측: 미리보기 패널 ═══════════ */}
      <div className="hidden md:flex w-72 bg-white border-l border-gray-200 flex-col">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setRightTab("preview")} className={`flex-1 py-3 text-xs font-medium ${rightTab === "preview" ? "text-green-700 border-b-2 border-green-600" : "text-gray-400"}`}>
            미리보기
          </button>
          <button onClick={() => setRightTab("schema")} className={`flex-1 py-3 text-xs font-medium ${rightTab === "schema" ? "text-green-700 border-b-2 border-green-600" : "text-gray-400"}`}>
            Schema
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {phase === "start" ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <span className="text-3xl mb-2">🖼️</span>
              <p className="text-xs">세션을 시작하면<br/>미리보기가 표시됩니다.</p>
            </div>
          ) : rightTab === "preview" ? (
            /* 랜딩페이지 템플릿 미리보기 */
            <div>
              <div className="rounded-lg border border-gray-200 overflow-hidden text-[9px]">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="font-bold text-gray-800">Timeless</span>
                  <div className="flex gap-2 text-gray-500"><span>Shop</span><span>Lookbook</span></div>
                </div>
                <div className="bg-gradient-to-br from-stone-100 to-stone-50 p-4">
                  <p className="text-[8px] text-stone-500 uppercase tracking-wider mb-1">Timeless</p>
                  <h3 className="text-xs font-bold text-stone-900 mb-1">Elegance Redefined</h3>
                  <p className="text-[8px] text-stone-600 mb-2">Premium accessories crafted for refined luxury.</p>
                  <span className="px-2 py-0.5 bg-stone-900 text-white rounded text-[7px]">Shop →</span>
                </div>
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {["Leather Bags", "Jewelry", "Watches"].map((c) => (
                      <div key={c} className="bg-stone-50 rounded p-1.5 text-center">
                        <div className="w-5 h-5 bg-stone-200 rounded mx-auto mb-0.5"></div>
                        <span className="text-[6px] text-stone-600">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-stone-900 text-stone-400 p-2 text-center text-[6px]">
                  Luxury Accessory · Shop · Lookbook
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 text-center">
                {selectedTemplate ? `${templateOptions[selectedStructure!]?.find((t) => t.id === selectedTemplate)?.name} 템플릿` : "랜딩페이지 템플릿"}
              </p>
              {/* 사이트 발급하기 버튼 (프리뷰 확인 후) */}
              {phase === "conversation" && (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full mt-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  사이트 발급하기
                </button>
              )}
            </div>
          ) : (
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-[8px] font-mono leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Timeless Accessories",
  "category": ["Leather Bags",
    "Fine Jewelry", "Timepieces"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [...]
  }
}`}
            </pre>
          )}
        </div>
      </div>

      {/* 사이트 발급 결제 모달 — 사이드바 업그레이드와 동일한 3가지 플랜 디자인 */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelect={() => setShowPricingModal(false)}
      />
    </div>
  );
}
