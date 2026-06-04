"use client";

import { useState } from "react";

// 챗봇 단계
type ChatPhase = "industry" | "structure" | "info_collect" | "preview";

// 구조 옵션
const structureOptions = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달.\n서비스 소개와 신뢰 구축에 적합.", icon: "🖥️", recommended: true },
  { id: "multi", label: "일반 홈페이지", desc: "여러 페이지로 상세 정보 전달.\n블로그, 포트폴리오에 적합.", icon: "📄", recommended: false },
  { id: "store", label: "스토어", desc: "상품/메뉴 카탈로그 중심.\n식당, 쇼핑몰에 적합.", icon: "🛒", recommended: false },
];

// 진행 체크리스트
const progressItems = [
  { key: "industry", label: "업종 확인", status: "done" },
  { key: "structure", label: "구조 선택", status: "done" },
  { key: "business_name", label: "업체명", status: "done" },
  { key: "services", label: "핵심 서비스", status: "done" },
  { key: "contact", label: "연락처", status: "in_progress" },
  { key: "business_info", label: "사업자 정보", status: "pending" },
  { key: "confirm", label: "최종 확인", status: "pending" },
];

// 스테퍼 단계
const steps = ["업종 확인", "구조 선택", "정보 수집", "내용 구성", "완료"];

export default function ChatPage() {
  const [phase, setPhase] = useState<ChatPhase>("structure");
  const [selectedStructure, setSelectedStructure] = useState<string | null>("landing");
  const [input, setInput] = useState("");
  const [rightTab, setRightTab] = useState<"preview" | "schema">("preview");

  const currentStepIndex = phase === "industry" ? 0 : phase === "structure" ? 1 : phase === "info_collect" ? 2 : 4;

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8">
      {/* ═══════════ 좌측: 진행 상황 패널 ═══════════ */}
      <div className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900">HEZO</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">베타</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-3">5분 대화로<br/>사이트 만들기</h2>
          <p className="text-[11px] text-gray-500 mt-2">챗봇과 대화하여 필요한 정보를 알려주세요.<br/>완료 후 AI가 사이트를 만들어 드립니다.</p>
        </div>

        {/* 진행 상황 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-700">진행 상황</span>
            <span className="text-[10px] text-gray-400">5 / 7 단계</span>
          </div>
          <div className="space-y-1.5">
            {progressItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 py-1">
                {item.status === "done" && <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</span>}
                {item.status === "in_progress" && <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] animate-pulse">●</span>}
                {item.status === "pending" && <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-300">○</span>}
                <span className={`text-xs ${item.status === "done" ? "text-gray-600" : item.status === "in_progress" ? "text-green-700 font-medium" : "text-gray-400"}`}>
                  {item.label}
                </span>
                <span className={`text-[9px] ml-auto ${item.status === "done" ? "text-green-500" : item.status === "in_progress" ? "text-green-600" : "text-gray-300"}`}>
                  {item.status === "done" ? "완료" : item.status === "in_progress" ? "진행 중" : "대기"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-[9px] text-gray-400">🔒 입력하신 정보는 안전하게 보호됩니다.</p>
        </div>
      </div>

      {/* ═══════════ 중앙: 채팅 + 구조 선택 통합 ═══════════ */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* 상단 스테퍼 */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                  i < currentStepIndex ? "bg-green-600 text-white" :
                  i === currentStepIndex ? "bg-green-100 text-green-700 ring-2 ring-green-400" :
                  "bg-gray-200 text-gray-400"
                }`}>
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] ${i === currentStepIndex ? "text-green-700 font-medium" : "text-gray-400"}`}>{step}</span>
                {i < steps.length - 1 && <div className="w-6 h-px bg-gray-300"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 (대화 or 구조 선택) */}
        <div className="flex-1 overflow-y-auto">
          {phase === "structure" ? (
            /* ─── 구조 선택 단계 ─── */
            <div className="p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">업종 기반 사이트 구조 추천</h2>
              <p className="text-xs text-gray-500 mb-6">수집된 정보를 바탕으로 고객님께 가장 적합한 사이트 구조를 추천했어요.</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
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
                    {selectedStructure === opt.id && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-600"></span>}
                  </div>
                ))}
              </div>

              {selectedStructure && (
                <button
                  onClick={() => setPhase("info_collect")}
                  className="w-full py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  이 구조로 시작하기 →
                </button>
              )}

              {/* 자동 적용 항목 */}
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-700 mb-3">자동 적용 항목</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Schema.org 적용", "FAQ 구조 생성", "시맨틱 HTML", "메타 태그 최적화", "Open Graph", "llms.txt 생성"].map((item) => (
                    <div key={item} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                      <span className="text-green-500 text-xs">✓</span>
                      <span className="text-[10px] text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ─── 대화 단계 ─── */
            <div className="p-6 space-y-3">
              {/* 어시스턴트 메시지들 */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">😊</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-700 max-w-[70%]">
                  좋습니다! 랜딩페이지 구조로 시작할게요.<br/>업체명을 알려주세요.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm">Timeless Accessories</div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">😊</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-700 max-w-[70%]">
                  핵심 상품이나 서비스를 알려주세요. (최대 5개)
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm">가죽가방, 쥬얼리, 시계</div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs flex-shrink-0">😊</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-gray-700 max-w-[70%]">
                  연락처(전화번호, 이메일)를 알려주세요.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력 */}
        <div className="px-6 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700">➤</button>
          </div>
        </div>
      </div>

      {/* ═══════════ 우측: 템플릿 프리뷰 + Schema ═══════════ */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          <button onClick={() => setRightTab("preview")} className={`flex-1 py-3 text-xs font-medium ${rightTab === "preview" ? "text-green-700 border-b-2 border-green-600" : "text-gray-400"}`}>
            실시간 미리보기
          </button>
          <button onClick={() => setRightTab("schema")} className={`flex-1 py-3 text-xs font-medium ${rightTab === "schema" ? "text-green-700 border-b-2 border-green-600" : "text-gray-400"}`}>
            Schema JSON
          </button>
        </div>

        {rightTab === "preview" ? (
          /* 랜딩페이지 템플릿 프리뷰 (Luxury Accessory 기반) */
          <div className="flex-1 overflow-y-auto p-3">
            <div className="rounded-lg border border-gray-200 overflow-hidden text-[9px]">
              {/* 네비 */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <span className="font-bold text-gray-800">Timeless</span>
                <div className="flex gap-2 text-gray-500">
                  <span>Shop</span><span>Lookbook</span><span>Journal</span>
                </div>
              </div>
              {/* 히어로 */}
              <div className="bg-gradient-to-br from-stone-100 to-stone-50 p-5">
                <p className="text-[8px] text-stone-500 uppercase tracking-wider mb-1">Timeless</p>
                <h3 className="text-sm font-bold text-stone-900 mb-1">Elegance<br/>Redefined</h3>
                <p className="text-[8px] text-stone-600 mb-3">Premium accessories crafted for refined luxury.</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-stone-900 text-white rounded text-[7px]">Shop Collection →</span>
                  <span className="px-2 py-1 border border-stone-300 rounded text-[7px] text-stone-600">View Lookbook</span>
                </div>
              </div>
              {/* 카테고리 */}
              <div className="p-3">
                <p className="text-[8px] font-bold text-stone-800 mb-2">Curated Categories</p>
                <div className="grid grid-cols-3 gap-1">
                  {["Leather Bags", "Fine Jewelry", "Timepieces"].map((cat) => (
                    <div key={cat} className="bg-stone-50 rounded p-2 text-center">
                      <div className="w-6 h-6 bg-stone-200 rounded mx-auto mb-1"></div>
                      <span className="text-[7px] text-stone-600">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 베스트셀러 */}
              <div className="p-3 border-t border-gray-100">
                <p className="text-[8px] font-bold text-stone-800 mb-2">Best Sellers</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { name: "Classic Shoulder Bag", price: "$980" },
                    { name: "Gold Minimal Ring", price: "$320" },
                  ].map((product) => (
                    <div key={product.name} className="bg-stone-50 rounded p-2">
                      <div className="w-full h-8 bg-stone-200 rounded mb-1"></div>
                      <p className="text-[7px] text-stone-700">{product.name}</p>
                      <p className="text-[7px] font-bold text-stone-900">{product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* 풋터 */}
              <div className="bg-stone-900 text-stone-400 p-3 text-center">
                <p className="text-[7px]">Luxury Accessory</p>
                <p className="text-[6px]">Shop · Lookbook · Journal · Contact</p>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 text-center">랜딩페이지 템플릿 미리보기</p>
          </div>
        ) : (
          /* Schema JSON */
          <div className="flex-1 overflow-y-auto p-3">
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-[9px] font-mono leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Timeless Accessories",
  "url": "https://timeless-acc.hezo.app",
  "description": "Premium accessories crafted
    for refined luxury and timeless style.",
  "category": [
    "Leather Bags",
    "Fine Jewelry",
    "Timepieces"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "KR"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Best Sellers",
    "itemListElement": [
      {
        "@type": "Product",
        "name": "Classic Shoulder Bag",
        "offers": { "price": "980" }
      }
    ]
  }
}`}
            </pre>
            <p className="text-[9px] text-green-600 mt-2">✓ Schema 자동 적용 완료</p>
          </div>
        )}
      </div>
    </div>
  );
}
