"use client";

import { useState, useEffect, useRef } from "react";
import { api, getSubscriptionStatus, publishSite, getPipelineStatus, sendChatMessage, triggerPreview } from "@/lib/api";
import PricingModal from "@/components/chat/PricingModal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Phase = "start" | "structure" | "template" | "conversation" | "chat_done" | "preview";

const structureOptions: { id: string; label: string; desc: string; icon: IconName; recommended?: boolean }[] = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달", icon: "monitor", recommended: true },
  { id: "multi", label: "블로그", desc: "콘텐츠·기록 중심 블로그형", icon: "file-text" },
  { id: "store", label: "스토어", desc: "상품/메뉴 카탈로그 중심", icon: "shopping-cart" },
];

const TEMPLATE_DOMAIN: Record<string, { domain: string; domain_label: string }> = {
  "01-clinic-landing":   { domain: "medical-clinic",  domain_label: "병원/임플란트" },
  "02-course-landing":   { domain: "education",        domain_label: "교육/강의" },
  "17-solar-energy":     { domain: "construction",     domain_label: "시공/설치 서비스" },
  "05-lifting-clinic":   { domain: "medical-clinic",  domain_label: "병원/클리닉" },
  "01-food-travel-blog": { domain: "food-travel",      domain_label: "음식/여행 블로그" },
  "03-developer-docs":   { domain: "developer",        domain_label: "개발자 블로그" },
  "17-career-notebook":  { domain: "career",           domain_label: "커리어/취업" },
  "01-cafe-menu":        { domain: "cafe-dessert",     domain_label: "카페/디저트" },
  "06-oops-nail":        { domain: "beauty-salon",     domain_label: "네일/뷰티샵" },
  "10-wine-market":      { domain: "wine-market",      domain_label: "와인/주류 셀렉샵" },
};

const templateOptions: Record<string, { id: string; name: string; desc: string; previewUrl: string; badge?: string }[]> = {
  landing: [
    { id: "01-clinic-landing", name: "병원/임플란트 상담", desc: "상담 전환형 랜딩페이지", previewUrl: "/templates/landing/01-clinic-landing.html", badge: "추천" },
    { id: "02-course-landing", name: "강의/부트캠프", desc: "수강 신청형 랜딩페이지", previewUrl: "/templates/landing/02-course-landing.html" },
    { id: "17-solar-energy", name: "시공/설치 서비스", desc: "견적 문의형 랜딩페이지", previewUrl: "/templates/landing/17-solar-energy.html" },
  ],
  multi: [
    { id: "01-food-travel-blog", name: "음식/여행 블로그", desc: "감성 콘텐츠 블로그", previewUrl: "/templates/blog/01-food-travel-blog.html", badge: "추천" },
    { id: "03-developer-docs", name: "개발자 블로그", desc: "기술 문서/포트폴리오", previewUrl: "/templates/blog/03-developer-docs.html" },
    { id: "17-career-notebook", name: "커리어 성장 노트", desc: "이직·취업 기록 블로그", previewUrl: "/templates/blog/17-career-notebook.html" },
  ],
  store: [
    { id: "01-cafe-menu", name: "카페/디저트 메뉴", desc: "메뉴 주문형 스토어", previewUrl: "/templates/store/01-cafe-menu.html", badge: "추천" },
    { id: "06-oops-nail", name: "네일/뷰티샵", desc: "스타일 예약형 스토어", previewUrl: "/templates/store/06-oops-nail.html" },
    { id: "10-wine-market", name: "와인/주류 셀렉샵", desc: "큐레이션 상품 스토어", previewUrl: "/templates/store/10-wine-market.html" },
  ],
};

/** 폼 입력값으로 로컬 Contract JSON 생성 (백엔드 없이 미리보기용) */
function buildLocalContract(slots: Record<string, unknown>, templateId: string) {
  const bName = (slots.business_name as string) || "";
  const svcRaw = (slots.core_services as string) || "";
  const serviceList = svcRaw ? svcRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const phone = (slots.phone as string) || "";
  const kakao = (slots.kakao_channel as string) || "";
  const region = (slots.business_region as string) || "";
  const hours = (slots.business_hours as string) || "평일 09:00-18:00";
  const cta = kakao && kakao !== "없음" ? "카카오톡 상담" : "무료 상담 신청";

  return {
    template: { template_id: templateId },
    brand: { name: bName || "My Business" },
    contact: {
      phone,
      email: "",
      address: region,
      hours: { weekday: hours },
      kakao: kakao !== "없음" ? kakao : "",
    },
    content: {
      landing: {
        domain_data: {
          hero: {
            headline: bName || "환영합니다",
            subheadline: svcRaw || "",
            cta_text: cta,
          },
          services: serviceList.map((s) => ({ name: s, desc: "" })),
          values: [] as { name: string; desc: string }[],
          reviews: [],
          faq: [],
        },
      },
    },
  };
}

function getProgress(phase: Phase) {
  const items = [
    { key: "start", label: "세션 시작" },
    { key: "structure", label: "구조 선택" },
    { key: "template", label: "템플릿 선택" },
    { key: "conversation", label: "정보 수집" },
    { key: "preview", label: "프리뷰" },
  ];
  const phaseIdx: Record<Phase, number> = {
    start: 0, structure: 1, template: 2, conversation: 3, chat_done: 3, preview: 4,
  };
  const idx = phaseIdx[phase] ?? 0;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useState(() => {
    if (propSiteId) setSiteId(propSiteId);
  });

  if (propSiteId && propSiteId !== siteId) {
    setSiteId(propSiteId);
  }

  // P1 LLM 챗봇 대화 상태
  type ChatMessage = { role: "user" | "assistant"; content: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [currentSlot, setCurrentSlot] = useState("business_name");
  const [chatSessionId] = useState(() => `chat-${Date.now()}`);
  const [slotFilled, setSlotFilled] = useState<Record<string, unknown>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [previewSrcdoc, setPreviewSrcdoc] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [showPricingInChat, setShowPricingInChat] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "max">("free");
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [pipelineMode, setPipelineMode] = useState<"aws_pipeline" | "local" | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null);
  const [pipelineMessage, setPipelineMessage] = useState<string>("");

  useEffect(() => {
    getSubscriptionStatus()
      .then((status) => setCurrentPlan(status.plan))
      .catch(() => {});
  }, []);

  // conversation 단계 진입 시 초기 인사 메시지
  useEffect(() => {
    if (phase === "conversation" && chatMessages.length === 0) {
      setChatMessages([{
        role: "assistant",
        content: "안녕하세요! 홈페이지 제작을 시작할게요. 먼저 업체명(상호명)을 알려주세요.",
      }]);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // 새 메시지 도착 시 스크롤
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // 파이프라인 폴링 (AWS 모드에서만)
  useEffect(() => {
    if (pipelineMode !== "aws_pipeline" || !siteId) return;
    if (pipelineStatus === "published" || pipelineStatus === "generation_failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await getPipelineStatus(siteId);
        setPipelineStatus(res.pipeline_status);
        if (res.pipeline_status === "generation_complete" || res.pipeline_status === "published") {
          setPublishSuccess(true);
          clearInterval(interval);
          setTimeout(() => {
            onClose();
            window.location.href = "/dashboard";
          }, 2000);
        } else if (res.pipeline_status === "generation_failed") {
          setError(res.error || "생성 에이전트 실행에 실패했습니다.");
          clearInterval(interval);
        }
      } catch {
        // 폴링 에러는 무시하고 계속 시도
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pipelineMode, siteId, pipelineStatus, onClose]);

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
      const res = await publishSite(siteId);
      setPipelineMode(res.mode);
      setPipelineStatus(res.pipeline_status);
      setPipelineMessage(res.message);

      if (res.mode === "local") {
        // 로컬 모드: 즉시 완료
        setPublishSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.href = "/dashboard";
        }, 1500);
      }
      // AWS 모드: useEffect 폴링이 상태 추적
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
    // 백엔드 저장 시도 (실패해도 다음 단계로 진행)
    try {
      const id = siteId || propSiteId;
      if (id) {
        await api.patch(`api/v1/sites/${id}/onboarding/structure`, {
          json: { structure: selectedStructure, template_id: selectedTemplate },
        });
      }
    } catch {
      // 백엔드 없어도 진행
    } finally {
      setLoading(false);
    }
    setPhase("conversation");
  };

  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatSending) return;

    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    setChatSending(true);

    try {
      const tplDomain = TEMPLATE_DOMAIN[selectedTemplate || ""] ?? { domain: "general", domain_label: "비즈니스" };
      const res = await sendChatMessage(siteId || propSiteId || "temp", {
        session_id: chatSessionId,
        user_message: msg,
        answered_slot: currentSlot,
        known_answers: slotFilled,
        domain: tplDomain.domain,
        domain_label: tplDomain.domain_label,
        category: selectedStructure || "landing",
        template_id: selectedTemplate || "",
      });

      setChatMessages((prev) => [...prev, { role: "assistant", content: res.assistant_message }]);
      if (res.current_slot) setCurrentSlot(res.current_slot);
      if (res.slot_filled) setSlotFilled((prev) => ({ ...prev, ...res.slot_filled }));

      if (res.next_stage === "contract_compile") {
        // 슬롯 채우기 완료 → 로컬 데이터로 프리뷰 생성
        setTimeout(() => handleConversationComplete(res.slot_filled), 800);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "일시적인 오류가 발생했습니다. 다시 입력해 주세요." },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const handleConversationComplete = async (overrideSlots?: Record<string, unknown>) => {
    const id = siteId || propSiteId;
    if (!id || !selectedTemplate) return;

    const slots = overrideSlots || slotFilled;
    const kakaoRaw = (slots.kakao_channel as string) || "";

    // 슬롯 저장 (P3 preview에 필요)
    try {
      await api.patch(`api/v1/sites/${id}/onboarding/slots`, {
        json: {
          business_name:   (slots.business_name as string) || "",
          business_region: (slots.business_region as string) || "",
          core_services:   (slots.core_services as string) || "",
          target_audience: (slots.target_audience as string) || "",
          phone:           (slots.phone as string) || "",
          kakao_channel:   kakaoRaw !== "없음" ? kakaoRaw : "",
          business_hours:  (slots.business_hours as string) || "평일 09:00-18:00",
          template_id:     selectedTemplate,
          structure:       selectedStructure || "landing",
        },
      });
    } catch {
      // 슬롯 저장 실패해도 완료 메시지는 표시
    }

    // 완료 메시지 + phase 전환
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant" as const,
        content:
          "홈페이지 구성에 필요한 정보를 모두 수집했습니다! 아래 버튼을 눌러 AI가 만든 홈페이지 초안을 확인해 보세요.",
      },
    ]);
    setPhase("chat_done");
  };

  const handlePreviewRequest = async () => {
    const id = siteId || propSiteId;
    if (!id) { setError("사이트 ID가 없습니다."); return; }
    setLoading(true);
    setError("");
    try {
      const result = await triggerPreview(id);
      if (result.preview_html) {
        setPreviewSrcdoc(result.preview_html);
      }
      setPhase("preview");
    } catch {
      setError("프리뷰 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
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
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-medium text-gray-900">{tpl.name}</h4>
                            {tpl.badge && (
                              <Badge color="brand" size="sm">{tpl.badge}</Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-[10px] text-gray-500">{tpl.desc}</p>
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

            {/* 대화 — P1 LLM 챗봇 */}
            {(phase === "conversation" || phase === "chat_done") && (
              <div className="flex h-full flex-col">
                {/* 메시지 목록 */}
                <div className="flex-1 space-y-3 overflow-y-auto pb-2">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-800",
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatSending && (
                    <div className="flex justify-start">
                      <div className="flex gap-1 rounded-2xl bg-gray-100 px-4 py-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* 대화 완료 CTA */}
                {phase === "chat_done" ? (
                  <div className="mt-3 border-t pt-4">
                    <Button
                      hierarchy="primary"
                      size="lg"
                      onClick={handlePreviewRequest}
                      disabled={loading}
                      className="w-full"
                      iconLeading={loading ? undefined : <Icon name="sparkles" size={16} />}
                    >
                      {loading ? "AI가 홈페이지를 생성하는 중..." : "홈페이지 미리보기 확인하기"}
                    </Button>
                    {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
                  </div>
                ) : (
                  /* 입력창 */
                  <div className="mt-3 flex gap-2 border-t pt-3">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      placeholder="메시지를 입력하세요..."
                      disabled={chatSending}
                      className="flex-1"
                    />
                    <Button
                      hierarchy="primary"
                      size="md"
                      onClick={handleChatSend}
                      disabled={chatSending || !chatInput.trim()}
                      iconLeading={<Icon name="arrow-up" size={15} />}
                    >
                      전송
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 프리뷰 */}
            {phase === "preview" && (
              <div className="flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-gray-900">홈페이지 프리뷰</h2>
                    <p className="text-xs text-gray-500">아래에서 생성된 홈페이지를 확인하세요</p>
                  </div>
                  {siteId && (
                    <button
                      onClick={() => window.open(`/preview/${siteId}`, "_blank")}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      <Icon name="external-link" size={13} /> 전체화면으로 보기
                    </button>
                  )}
                </div>

                {/* 템플릿 HTML + Contract JSON 결합 프리뷰 */}
                <div className="relative mb-3 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-100" style={{ minHeight: "360px" }}>
                  {previewSrcdoc ? (
                    <iframe
                      srcDoc={previewSrcdoc}
                      className="h-full w-full border-0"
                      style={{ minHeight: "360px" }}
                      title="사이트 프리뷰"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center" style={{ minHeight: "360px" }}>
                      <div className="text-center text-gray-400">
                        <Icon name="sparkles" size={24} className="mx-auto mb-2 animate-pulse text-primary-400" />
                        <p className="text-xs">템플릿 렌더링 중...</p>
                      </div>
                    </div>
                  )}
                </div>

                {publishSuccess ? (
                  <div className="rounded-lg border border-success-200 bg-success-50 p-3 text-center">
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                      <Icon name="circle-check-big" size={16} /> 사이트가 성공적으로 발행되었습니다!
                    </p>
                    <p className="mt-1 text-xs text-success-600">잠시 후 대시보드로 이동합니다...</p>
                  </div>
                ) : pipelineMode === "aws_pipeline" && pipelineStatus === "running" ? (
                  /* AWS 파이프라인 실행 중 — 단계별 진행 표시 */
                  <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      </span>
                      <span className="text-sm font-medium text-primary-800">파이프라인 실행 중</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { step: "생성 에이전트", desc: "Contract JSON → render_spec.json 변환 중", active: true },
                        { step: "빌드 워커", desc: "정적 HTML/CSS 파일 생성", active: false },
                        { step: "검증 에이전트", desc: "Lighthouse · Schema.org · AI 점수 검증", active: false },
                        { step: "배포", desc: "S3 + CloudFront 배포", active: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={cn(
                            "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-[9px]",
                            item.active ? "bg-primary-500 text-white" : "bg-gray-200 text-gray-400",
                          )}>
                            {i + 1}
                          </span>
                          <div>
                            <p className={cn("text-xs font-medium", item.active ? "text-primary-800" : "text-gray-400")}>
                              {item.step}
                            </p>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {pipelineMessage && (
                      <p className="mt-3 text-[10px] text-primary-600">{pipelineMessage}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button hierarchy="secondary" size="md" onClick={onClose} className="flex-none">
                      닫기
                    </Button>
                    <Button
                      hierarchy="primary"
                      size="md"
                      onClick={handlePublish}
                      disabled={publishing}
                      className="flex-1"
                      iconLeading={<Icon name="rocket" size={15} />}
                    >
                      {publishing ? "파이프라인 시작 중..." : "사이트 발행하기"}
                    </Button>
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
