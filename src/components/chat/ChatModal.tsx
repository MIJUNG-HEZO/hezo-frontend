"use client";

import { useState, useEffect } from "react";
import { api, getSubscriptionStatus, publishSite } from "@/lib/api";
import PricingModal from "@/components/chat/PricingModal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Phase = "start" | "structure" | "template" | "conversation" | "preview";

const structureOptions: { id: string; label: string; desc: string; icon: IconName; recommended?: boolean }[] = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달", icon: "monitor", recommended: true },
  { id: "multi", label: "일반 홈페이지", desc: "여러 페이지로 상세 정보 전달", icon: "file-text" },
  { id: "store", label: "스토어", desc: "상품/메뉴 카탈로그 중심", icon: "shopping-cart" },
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

  useState(() => {
    if (propSiteId) setSiteId(propSiteId);
  });

  if (propSiteId && propSiteId !== siteId) {
    setSiteId(propSiteId);
  }

  const [businessName, setBusinessName] = useState("");
  const [services, setServices] = useState("");
  const [phone, setPhone] = useState("");

  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [showPricingInChat, setShowPricingInChat] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "max">("free");
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    getSubscriptionStatus()
      .then((status) => setCurrentPlan(status.plan))
      .catch(() => {});
  }, []);

  const handlePublish = async () => {
    if (currentPlan === "free") {
      setShowPricingInChat(true);
      return;
    }
    if (!siteId) {
      setError("사이트 ID가 없습니다. 다시 시도해 주세요.");
      return;
    }
    setPublishing(true);
    setError("");
    try {
      await publishSite(siteId);
      setPublishSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response: Response }).response;
        if (response.status === 403) {
          setShowPricingInChat(true);
        } else {
          try {
            const body = await response.json();
            setError((body as { detail?: string }).detail || "발행에 실패했습니다");
          } catch {
            setError("발행에 실패했습니다");
          }
        }
      } else {
        setError("네트워크 오류가 발생했습니다");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleUpgradeSuccess = () => {
    getSubscriptionStatus()
      .then((status) => setCurrentPlan(status.plan))
      .catch(() => {});
  };

  if (!isOpen) return null;

  const progress = getProgress(phase);

  const handleStructureNext = () => {
    if (selectedStructure) setPhase("template");
  };

  const handleTemplateNext = async () => {
    if (!selectedTemplate || !selectedStructure) return;
    setLoading(true);
    setError("");
    try {
      if (siteId) {
        await api.patch(`api/v1/sites/${siteId}/onboarding/structure`, {
          json: { structure: selectedStructure, template_id: selectedTemplate },
        });
      }
      setPhase("conversation");
    } catch {
      setError("구조 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationComplete = async () => {
    const id = siteId || propSiteId;
    if (!id) {
      setError("사이트 ID가 없습니다. 모달을 닫고 다시 시도해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`api/v1/sites/${id}/onboarding/business`, { json: { business_name: businessName || "테스트 업체" } });
      await api.patch(`api/v1/sites/${id}/onboarding/industry`, { json: { industry: "한의원", job_module: "medical" } });
      await api.patch(`api/v1/sites/${id}/onboarding/services`, { json: { services: services ? services.split(",").map((s) => s.trim()) : ["서비스1"] } });
      await api.patch(`api/v1/sites/${id}/onboarding/contact`, { json: { phone: phone || "02-1234-5678", email: "", address: "", hours: "" } });
      await api.patch(`api/v1/sites/${id}/onboarding/legal`, { json: { business_reg_number: "123-45-67890" } });
      await api.post(`api/v1/sites/${id}/onboarding/complete`);
      await api.post(`api/v1/sites/${id}/contract`);
      await api.post(`api/v1/sites/${id}/preview`);
      // 백엔드 onboarding/preview는 현재 204 스텁 — 프리뷰 요약을 클라이언트에서 구성
      setPreviewData({
        site_id: id,
        structure: selectedStructure,
        template: selectedTemplate,
        business_name: businessName || "테스트 업체",
        services: services ? services.split(",").map((s) => s.trim()) : ["서비스1"],
        phone: phone || "02-1234-5678",
        note: "백엔드 스텁(204) 응답 — Contract/Preview 콘텐츠 생성은 추후 연동",
      });
      setPhase("preview");
    } catch (err) {
      console.error(err);
      setError("프리뷰 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex h-[85vh] w-[90vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 좌측: 진행 상황 */}
        <div className="flex w-48 flex-none flex-col border-r border-gray-200 bg-gray-50 p-4">
          <div className="mb-4">
            <span className="font-display text-sm font-bold text-gray-900">HEZO</span>
            <p className="mt-1 text-[10px] text-gray-500">사이트 만들기</p>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {progress.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                {item.status === "done" && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-white">
                    <Icon name="check" size={10} />
                  </span>
                )}
                {item.status === "active" && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  </span>
                )}
                {item.status === "pending" && (
                  <span className="h-4 w-4 rounded-full border border-gray-300" />
                )}
                <span
                  className={cn(
                    "text-[11px]",
                    item.status === "active"
                      ? "font-medium text-primary-700"
                      : item.status === "done"
                        ? "text-gray-600"
                        : "text-gray-400",
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {siteId && (
            <p className="border-t pt-2 text-[8px] text-gray-400">ID: {siteId.slice(0, 8)}...</p>
          )}
        </div>

        {/* 중앙: 메인 */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
            <span className="text-sm text-gray-500">
              {phase === "start" && "새 사이트 만들기"}
              {phase === "structure" && "1단계: 구조 선택"}
              {phase === "template" && "2단계: 템플릿 선택"}
              {phase === "conversation" && "3단계: 정보 입력"}
              {phase === "preview" && "프리뷰 완성!"}
            </span>
            <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
              <Icon name="x" size={18} />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-3 rounded-lg bg-error-50 p-2 text-xs text-error-600">{error}</div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {/* 시작 */}
            {phase === "start" && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                  <Icon name="rocket" size={30} className="text-primary-600" />
                </div>
                <h2 className="mb-2 font-display text-lg font-bold text-gray-900">사이트를 만들어 볼까요?</h2>
                <p className="mb-6 text-sm text-gray-500">5분 대화로 AI 최적화 홈페이지를 생성합니다.</p>
                <Button
                  hierarchy="primary"
                  size="xl"
                  onClick={() => setPhase("structure")}
                  iconTrailing={<Icon name="arrow-right" size={18} />}
                >
                  시작하기
                </Button>
              </div>
            )}

            {/* 구조 선택 */}
            {phase === "structure" && (
              <div>
                <h2 className="mb-4 font-display text-base font-bold text-gray-900">사이트 구조를 선택하세요</h2>
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {structureOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedStructure(opt.id)}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 text-center transition-colors",
                        selectedStructure === opt.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      {opt.recommended && (
                        <Badge color="brand" size="sm">추천</Badge>
                      )}
                      <span className="mx-auto my-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                        <Icon name={opt.icon} size={20} className="text-primary-600" />
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">{opt.label}</h3>
                      <p className="mt-1 text-[10px] text-gray-500">{opt.desc}</p>
                    </div>
                  ))}
                </div>
                {selectedStructure && (
                  <Button
                    hierarchy="primary"
                    size="lg"
                    onClick={handleStructureNext}
                    className="w-full"
                    iconTrailing={<Icon name="arrow-right" size={18} />}
                  >
                    다음
                  </Button>
                )}
              </div>
            )}

            {/* 템플릿 선택 */}
            {phase === "template" && selectedStructure && (
              <div>
                <h2 className="mb-4 font-display text-base font-bold text-gray-900">템플릿을 선택하세요</h2>
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(templateOptions[selectedStructure] || []).map((tpl) => (
                    <div
                      key={tpl.id}
                      className={cn(
                        "overflow-hidden rounded-xl border-2 transition-colors",
                        selectedTemplate === tpl.id ? "border-primary-500" : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <div onClick={() => setSelectedTemplate(tpl.id)} className="cursor-pointer">
                        {tpl.previewUrl ? (
                          <div className="relative h-24 overflow-hidden">
                            <iframe src={tpl.previewUrl} className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-[0.5]" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalUrl(tpl.previewUrl);
                              }}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white"
                            >
                              <Icon name="search" size={12} className="text-gray-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-20 items-center justify-center bg-gray-100 text-xs text-gray-400">준비 중</div>
                        )}
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-gray-900">{tpl.name}</h4>
                          <p className="text-[10px] text-gray-500">{tpl.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button hierarchy="secondary" size="lg" onClick={() => setPhase("structure")}>← 뒤로</Button>
                  {selectedTemplate && (
                    <Button
                      hierarchy="primary"
                      size="lg"
                      onClick={handleTemplateNext}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "저장 중..." : "다음 →"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* 대화 */}
            {phase === "conversation" && (
              <div className="flex max-w-md flex-col gap-4">
                <p className="text-sm text-gray-600">아래 정보를 입력하면 바로 프리뷰가 생성됩니다.</p>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">업체명</label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="예: 바른한의원" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">핵심 서비스 (쉼표 구분)</label>
                  <Input value={services} onChange={(e) => setServices(e.target.value)} placeholder="예: 침 치료, 추나요법, 한약 처방" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">전화번호</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="예: 02-123-4567" />
                </div>
                <Button
                  hierarchy="primary"
                  size="lg"
                  onClick={handleConversationComplete}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "프리뷰 생성 중..." : "프리뷰 생성하기 →"}
                </Button>
              </div>
            )}

            {/* 프리뷰 */}
            {phase === "preview" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                  <Icon name="sparkles" size={30} className="text-primary-600" />
                </div>
                <h2 className="mb-2 font-display text-lg font-bold text-gray-900">프리뷰가 생성되었습니다!</h2>
                <p className="mb-6 text-sm text-gray-500">Contract JSON 기반으로 사이트 구조가 만들어졌습니다.</p>

                {previewData && (
                  <div className="mb-4 max-h-60 overflow-auto rounded-lg bg-gray-900 p-4 text-left font-mono text-[10px] text-primary-300">
                    <pre>{JSON.stringify(previewData, null, 2)}</pre>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <Button hierarchy="secondary" size="md" onClick={onClose}>닫기</Button>
                  <Button hierarchy="primary" size="md" onClick={handlePublish} disabled={publishing}>
                    {publishing ? "발행 중..." : "발행하기"}
                  </Button>
                </div>

                {publishSuccess && (
                  <div className="mt-4 rounded-lg border border-success-200 bg-success-50 p-3">
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                      <Icon name="circle-check-big" size={16} /> 사이트가 성공적으로 발행되었습니다!
                    </p>
                    <p className="mt-1 text-xs text-success-600">잠시 후 대시보드로 이동합니다...</p>
                  </div>
                )}

                <PricingModal
                  isOpen={showPricingInChat}
                  onClose={() => setShowPricingInChat(false)}
                  onSelect={(plan) => {
                    setCurrentPlan(plan as "free" | "pro" | "max");
                    setShowPricingInChat(false);
                    if (siteId && plan !== "free") {
                      setPublishing(true);
                      setError("");
                      publishSite(siteId)
                        .then(() => {
                          setPublishSuccess(true);
                          setTimeout(() => {
                            onClose();
                            window.location.href = "/dashboard";
                          }, 1500);
                        })
                        .catch((err: unknown) => {
                          if (err && typeof err === "object" && "response" in err) {
                            const response = (err as { response: Response }).response;
                            if (response.status === 403) {
                              setShowPricingInChat(true);
                            } else {
                              setError("발행에 실패했습니다. 다시 시도해 주세요.");
                            }
                          } else {
                            setError("네트워크 오류가 발생했습니다");
                          }
                        })
                        .finally(() => setPublishing(false));
                    }
                  }}
                  currentPlan={currentPlan}
                  onSuccess={handleUpgradeSuccess}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 템플릿 확대 프리뷰 모달 */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewModalUrl(null)} />
          <div className="relative h-[85vh] w-[80vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">템플릿 미리보기</span>
              <button onClick={() => setPreviewModalUrl(null)} className="text-gray-400 transition-colors hover:text-gray-600">
                <Icon name="x" size={18} />
              </button>
            </div>
            <iframe src={previewModalUrl} className="h-[calc(100%-48px)] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
