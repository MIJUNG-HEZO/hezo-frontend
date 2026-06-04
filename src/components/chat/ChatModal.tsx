"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Phase = "start" | "structure" | "template" | "conversation" | "preview";

const structureOptions = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달", icon: "🖥️", recommended: true },
  { id: "multi", label: "일반 홈페이지", desc: "여러 페이지로 상세 정보 전달", icon: "📄" },
  { id: "store", label: "스토어", desc: "상품/메뉴 카탈로그 중심", icon: "🛒" },
];

const templateOptions: Record<string, { id: string; name: string; desc: string; previewUrl: string }[]> = {
  landing: [
    { id: "01-clinic-landing", name: "치과/임플란트 상담", desc: "상담 전환형 랜딩페이지", previewUrl: "/templates/landing/01-clinic-landing.html" },
    { id: "medical-clinic", name: "Medical Clinic", desc: "병원/한의원 랜딩", previewUrl: "" },
    { id: "consulting", name: "Consulting", desc: "전문직 소개 랜딩", previewUrl: "" },
  ],
  multi: [
    { id: "01-study-notebook", name: "공부 정리/학습 기록", desc: "학습 노트 블로그", previewUrl: "/templates/blog/01-study-notebook.html" },
    { id: "tech-blog", name: "Tech Blog", desc: "개발자 블로그", previewUrl: "" },
  ],
  store: [
    { id: "01-cafe-menu", name: "카페/디저트 메뉴", desc: "메뉴 주문형 스토어", previewUrl: "/templates/store/01-cafe-menu.html" },
    { id: "beauty-salon", name: "Beauty Salon", desc: "미용실/스파", previewUrl: "" },
  ],
};

function getProgress(phase: Phase) {
  const items = [
    { key: "start", label: "세션 시작" },
    { key: "structure", label: "구조 선택" },
    { key: "template", label: "템플릿 선택" },
    { key: "conversation", label: "정보 수집" },
    { key: "preview", label: "프리뷰" },
  ];
  const idx = { start: 0, structure: 1, template: 2, conversation: 3, preview: 4 }[phase];
  return items.map((item, i) => ({
    ...item,
    status: i < idx ? "done" : i === idx ? "active" : "pending",
  }));
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId?: string | null;
}

export default function ChatModal({ isOpen, onClose, siteId: propSiteId }: ChatModalProps) {
  const [phase, setPhase] = useState<Phase>("start");
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // prop에서 siteId 동기화
  useState(() => {
    if (propSiteId) setSiteId(propSiteId);
  });

  // propSiteId가 바뀌면 반영
  if (propSiteId && propSiteId !== siteId) {
    setSiteId(propSiteId);
  }

  // 대화 단계 하드코딩 데이터
  const [businessName, setBusinessName] = useState("");
  const [services, setServices] = useState("");
  const [phone, setPhone] = useState("");

  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const progress = getProgress(phase);

  // 구조 선택 완료 → 다음 단계
  const handleStructureNext = () => {
    if (selectedStructure) setPhase("template");
  };

  // 템플릿 선택 완료 → 대화 단계 + 백엔드 호출
  const handleTemplateNext = async () => {
    if (!selectedTemplate || !selectedStructure) return;
    setLoading(true);
    setError("");
    try {
      // 사이트의 구조/템플릿 저장
      if (siteId) {
        await api.patch(`api/v1/sites/${siteId}/onboarding/structure`, {
          json: { structure: selectedStructure, template_id: selectedTemplate },
        }).json();
      }
      setPhase("conversation");
    } catch {
      setError("구조 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  // 대화 완료 → 온보딩 + Contract + 프리뷰 일괄 실행
  const handleConversationComplete = async () => {
    const id = siteId || propSiteId;
    if (!id) {
      setError("사이트 ID가 없습니다. 모달을 닫고 다시 시도해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 온보딩 데이터 저장
      await api.patch(`api/v1/sites/${id}/onboarding/business`, { json: { business_name: businessName || "테스트 업체" } }).json();
      await api.patch(`api/v1/sites/${id}/onboarding/industry`, { json: { industry: "한의원", job_module: "medical" } }).json();
      await api.patch(`api/v1/sites/${id}/onboarding/services`, { json: { services: services ? services.split(",").map(s => s.trim()) : ["서비스1"] } }).json();
      await api.patch(`api/v1/sites/${id}/onboarding/contact`, { json: { phone: phone || "02-1234-5678", email: "", address: "", hours: "" } }).json();
      await api.patch(`api/v1/sites/${id}/onboarding/legal`, { json: { business_reg_number: "123-45-67890" } }).json();

      // 온보딩 완료
      await api.post(`api/v1/sites/${id}/onboarding/complete`).json();

      // Contract 생성
      await api.post(`api/v1/sites/${id}/contract`).json();

      // 프리뷰 생성
      const preview = await api.post(`api/v1/sites/${id}/preview`).json();
      setPreviewData(preview as Record<string, unknown>);
      setPhase("preview");
    } catch (err) {
      console.error(err);
      setError("프리뷰 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[90vw] h-[85vh] max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">

        {/* 좌측: 진행 상황 */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
          <div className="mb-4">
            <span className="text-sm font-bold text-gray-900">HEZO</span>
            <p className="text-[10px] text-gray-500 mt-1">사이트 만들기</p>
          </div>
          <div className="flex-1 space-y-2">
            {progress.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                {item.status === "done" && <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[9px]">✓</span>}
                {item.status === "active" && <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[9px] animate-pulse">●</span>}
                {item.status === "pending" && <span className="w-4 h-4 rounded-full border border-gray-300"></span>}
                <span className={`text-[11px] ${item.status === "active" ? "text-green-700 font-medium" : item.status === "done" ? "text-gray-600" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {siteId && <p className="text-[8px] text-gray-400 pt-2 border-t">ID: {siteId.slice(0, 8)}...</p>}
        </div>

        {/* 중앙: 메인 */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
            <span className="text-sm text-gray-500">
              {phase === "start" && "새 사이트 만들기"}
              {phase === "structure" && "1단계: 구조 선택"}
              {phase === "template" && "2단계: 템플릿 선택"}
              {phase === "conversation" && "3단계: 정보 입력"}
              {phase === "preview" && "프리뷰 완성!"}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {error && <div className="mx-6 mt-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

          <div className="flex-1 overflow-y-auto p-6">
            {/* 시작 */}
            {phase === "start" && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-3xl mb-4">🚀</div>
                <h2 className="text-lg font-bold mb-2">사이트를 만들어 볼까요?</h2>
                <p className="text-sm text-gray-500 mb-6">5분 대화로 AI 최적화 홈페이지를 생성합니다.</p>
                <button onClick={() => setPhase("structure")} className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
                  시작하기 →
                </button>
              </div>
            )}

            {/* 구조 선택 */}
            {phase === "structure" && (
              <div>
                <h2 className="text-base font-bold mb-4">사이트 구조를 선택하세요</h2>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {structureOptions.map((opt) => (
                    <div key={opt.id} onClick={() => setSelectedStructure(opt.id)}
                      className={`cursor-pointer rounded-xl p-4 border-2 text-center ${selectedStructure === opt.id ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                      {opt.recommended && <span className="text-[8px] bg-green-600 text-white px-2 py-0.5 rounded-full">추천</span>}
                      <span className="text-2xl block my-2">{opt.icon}</span>
                      <h3 className="font-bold text-sm">{opt.label}</h3>
                      <p className="text-[10px] text-gray-500 mt-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
                {selectedStructure && <button onClick={handleStructureNext} className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">다음 →</button>}
              </div>
            )}

            {/* 템플릿 선택 */}
            {phase === "template" && selectedStructure && (
              <div>
                <h2 className="text-base font-bold mb-4">템플릿을 선택하세요</h2>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {(templateOptions[selectedStructure] || []).map((tpl) => (
                    <div key={tpl.id} className={`rounded-xl border-2 overflow-hidden ${selectedTemplate === tpl.id ? "border-green-600" : "border-gray-200 hover:border-gray-300"}`}>
                      <div onClick={() => setSelectedTemplate(tpl.id)} className="cursor-pointer">
                        {tpl.previewUrl ? (
                          <div className="relative h-24 overflow-hidden">
                            <iframe src={tpl.previewUrl} className="w-[200%] h-[200%] pointer-events-none origin-top-left scale-[0.5]" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewModalUrl(tpl.previewUrl); }}
                              className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-xs hover:bg-white shadow"
                            >🔍</button>
                          </div>
                        ) : (
                          <div className="h-20 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">준비 중</div>
                        )}
                        <div className="p-3">
                          <h4 className="font-medium text-sm">{tpl.name}</h4>
                          <p className="text-[10px] text-gray-500">{tpl.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPhase("structure")} className="px-4 py-2.5 border text-gray-600 rounded-lg text-sm">← 뒤로</button>
                  {selectedTemplate && <button onClick={handleTemplateNext} disabled={loading} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {loading ? "저장 중..." : "다음 →"}
                  </button>}
                </div>
              </div>
            )}

            {/* 대화 (하드코딩 폼) */}
            {phase === "conversation" && (
              <div className="max-w-md space-y-4">
                <p className="text-sm text-gray-600 mb-4">아래 정보를 입력하면 바로 프리뷰가 생성됩니다.</p>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">업체명</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="예: 바른한의원" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">핵심 서비스 (쉼표 구분)</label>
                  <input value={services} onChange={(e) => setServices(e.target.value)} placeholder="예: 침 치료, 추나요법, 한약 처방" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">전화번호</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="예: 02-123-4567" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <button onClick={handleConversationComplete} disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {loading ? "프리뷰 생성 중..." : "프리뷰 생성하기 →"}
                </button>
              </div>
            )}

            {/* 프리뷰 */}
            {phase === "preview" && (
              <div className="text-center">
                <div className="text-3xl mb-4">🎉</div>
                <h2 className="text-lg font-bold mb-2">프리뷰가 생성되었습니다!</h2>
                <p className="text-sm text-gray-500 mb-6">Contract JSON 기반으로 사이트 구조가 만들어졌습니다.</p>

                {previewData && (
                  <div className="text-left bg-gray-900 text-green-400 p-4 rounded-lg text-[10px] font-mono overflow-auto max-h-60 mb-4">
                    <pre>{JSON.stringify(previewData, null, 2)}</pre>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-sm">닫기</button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">발행하기</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 템플릿 확대 프리뷰 모달 */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewModalUrl(null)} />
          <div className="relative w-[80vw] h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <span className="text-sm text-gray-600">템플릿 미리보기</span>
              <button onClick={() => setPreviewModalUrl(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <iframe src={previewModalUrl} className="w-full h-[calc(100%-48px)]" />
          </div>
        </div>
      )}
    </div>
  );
}
