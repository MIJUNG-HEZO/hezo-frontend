"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  getSubscriptionStatus,
  publishSite,
  sendChatMessage,
  triggerPreview,
  createSiteAndAwaitReady,
  SiteCreationTimeoutError,
} from "@/lib/api";
import { setPublishingState } from "@/lib/publishing-store";
import PricingModal from "@/components/chat/PricingModal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = "start" | "structure" | "template" | "conversation" | "chat_done" | "preview";
type ChatMessage = { role: "user" | "assistant"; content: string };

const PHASE_IDX: Record<Phase, number> = {
  start: 0,
  structure: 1,
  template: 2,
  conversation: 3,
  chat_done: 3,
  preview: 4,
};

// ── Static data ────────────────────────────────────────────────────────────────

const structureOptions: {
  id: string;
  label: string;
  desc: string;
  icon: IconName;
  recommended?: boolean;
}[] = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달", icon: "monitor", recommended: true },
  { id: "blog",    label: "블로그",     desc: "콘텐츠·기록 중심 블로그형",   icon: "file-text" },
  { id: "store",   label: "스토어",     desc: "상품/메뉴 카탈로그 중심",     icon: "shopping-cart" },
];

const TEMPLATE_DOMAIN: Record<string, { domain: string; domain_label: string }> = {
  "13-tax-accounting":   { domain: "tax-accounting",  domain_label: "세무/회계" },
  "01-clinic-landing":   { domain: "medical-clinic",  domain_label: "병원/임플란트" },
  "02-course-landing":   { domain: "education",        domain_label: "교육/강의" },
  "17-solar-energy":     { domain: "construction",     domain_label: "시공/설치 서비스" },
  "05-lifting-clinic":   { domain: "medical-clinic",  domain_label: "병원/클리닉" },
  "17-career-notebook":  { domain: "career",           domain_label: "커리어/취업" },
  "01-food-travel-blog": { domain: "food-travel",      domain_label: "음식/여행 블로그" },
  "03-developer-docs":   { domain: "developer",        domain_label: "개발자 블로그" },
  "10-wine-market":      { domain: "wine-market",      domain_label: "와인/주류 셀렉샵" },
  "01-cafe-menu":        { domain: "cafe-dessert",     domain_label: "카페/디저트" },
  "06-oops-nail":        { domain: "beauty-salon",     domain_label: "네일/뷰티샵" },
};

const templateOptions: Record<
  string,
  { id: string; name: string; desc: string; previewUrl: string; badge?: string }[]
> = {
  landing: [
    { id: "13-tax-accounting", name: "세무/회계 사무소",   desc: "신뢰형 전문직 랜딩페이지",  previewUrl: "/templates/landing/13-tax-accounting.html", badge: "추천" },
    { id: "01-clinic-landing", name: "병원/임플란트 상담", desc: "상담 전환형 랜딩페이지",     previewUrl: "/templates/landing/01-clinic-landing.html" },
    { id: "02-course-landing", name: "강의/부트캠프",      desc: "수강 신청형 랜딩페이지",     previewUrl: "/templates/landing/02-course-landing.html" },
  ],
  blog: [
    { id: "17-career-notebook",  name: "커리어 성장 노트",  desc: "이직·취업 기록 블로그",   previewUrl: "/templates/blog/17-career-notebook.html",  badge: "추천" },
    { id: "01-food-travel-blog", name: "음식/여행 블로그",  desc: "감성 콘텐츠 블로그",       previewUrl: "/templates/blog/01-food-travel-blog.html" },
    { id: "03-developer-docs",   name: "개발자 블로그",     desc: "기술 문서/포트폴리오",      previewUrl: "/templates/blog/03-developer-docs.html" },
  ],
  store: [
    { id: "10-wine-market", name: "와인/주류 셀렉샵", desc: "큐레이션 상품 스토어",  previewUrl: "/templates/store/10-wine-market.html", badge: "추천" },
    { id: "01-cafe-menu",   name: "카페/디저트 메뉴", desc: "메뉴 주문형 스토어",    previewUrl: "/templates/store/01-cafe-menu.html" },
    { id: "06-oops-nail",   name: "네일/뷰티샵",      desc: "스타일 예약형 스토어",  previewUrl: "/templates/store/06-oops-nail.html" },
  ],
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function AssistantMsg({ children, delay }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className="flex items-start gap-2.5 animate-[msg-in_220ms_ease-out_both]"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white shadow-sm">
        H
      </span>
      <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-2.5 text-sm leading-relaxed text-gray-800">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end animate-[msg-in_200ms_ease-out_both]">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary-500 px-3.5 py-2.5 text-sm leading-relaxed text-white">
        {children}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId?: string | null;
}

export default function ChatModal({ isOpen, onClose, siteId: propSiteId }: ChatModalProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("start");
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  useState(() => { if (propSiteId) setSiteId(propSiteId); });
  if (propSiteId && propSiteId !== siteId) setSiteId(propSiteId);

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

  useEffect(() => {
    getSubscriptionStatus()
      .then((s) => setCurrentPlan(s.plan))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === "conversation" && chatMessages.length === 0) {
      setChatMessages([{
        role: "assistant",
        content: "좋아요! 이제 몇 가지 질문을 드릴게요. 먼저 업체명(상호명)을 알려주세요.",
      }]);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [phase, chatMessages.length]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (currentPlan === "free") { setShowPricingInChat(true); return; }
    if (!siteId) { setError("사이트 ID가 없습니다. 다시 시도해 주세요."); return; }
    setPublishing(true);
    setError("");
    try {
      await publishSite(siteId);
      setPublishingState(siteId);
      onClose();
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response: Response }).response;
        if (response.status === 403) {
          setShowPricingInChat(true);
        } else {
          try {
            const body = await response.json();
            setError((body as { detail?: string }).detail || "발행에 실패했습니다");
          } catch { setError("발행에 실패했습니다"); }
        }
      } else { setError("네트워크 오류가 발생했습니다"); }
    } finally { setPublishing(false); }
  };

  const handleUpgradeSuccess = () => {
    getSubscriptionStatus().then((s) => setCurrentPlan(s.plan)).catch(() => {});
  };

  if (!isOpen) return null;

  const currentIdx = PHASE_IDX[phase];
  const structureLabel = structureOptions.find((o) => o.id === selectedStructure)?.label ?? "";
  const templateLabel =
    selectedStructure && selectedTemplate
      ? (templateOptions[selectedStructure] ?? []).find((t) => t.id === selectedTemplate)?.name ?? ""
      : "";

  const handleStructureNext = () => { if (selectedStructure) setPhase("template"); };

  const handleTemplateNext = async () => {
    if (!selectedTemplate || !selectedStructure) return;
    setLoading(true);
    setError("");
    try {
      let id = siteId || propSiteId;
      if (!id) {
        const newSite = await createSiteAndAwaitReady(selectedTemplate, selectedStructure);
        id = newSite.id;
        setSiteId(id);
      }
      if (id) {
        await api.patch(`api/v1/sites/${id}/onboarding/structure`, {
          json: { structure: selectedStructure, template_id: selectedTemplate },
        });
      }
    } catch (err) {
      if (err instanceof SiteCreationTimeoutError) {
        setLoading(false);
        setError("사이트 생성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      /* 그 외 에러는 백엔드 없어도 진행 */
    }
    finally { setLoading(false); }
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
      if (res.next_stage === "contract_compile" || res.turn_status === "ready_for_contract_compile") {
        setTimeout(() => handleConversationComplete(res.slot_filled), 800);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "일시적인 오류가 발생했습니다. 다시 입력해 주세요." }]);
    } finally { setChatSending(false); }
  };

  const handleConversationComplete = async (overrideSlots?: Record<string, unknown>) => {
    const id = siteId || propSiteId;
    const slots = overrideSlots || slotFilled;
    const kakaoRaw = (slots.kakao_channel as string) || "";
    if (id && selectedTemplate) {
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
      } catch { /* 슬롯 저장 실패해도 완료 */ }
    }
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant" as const, content: "홈페이지 구성에 필요한 정보를 모두 수집했습니다! 아래 버튼을 눌러 AI가 만든 홈페이지 초안을 확인해 보세요." },
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
      if (result.preview_html) setPreviewSrcdoc(result.preview_html);
      setPhase("preview");
    } catch { setError("프리뷰 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."); }
    finally { setLoading(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal shell */}
        <div className="relative flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl">

          {/* ── Dark header ──────────────────────────────────────────────── */}
          <div className="flex-none bg-gray-900 px-5 pb-3.5 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-400" />
                <span className="text-sm font-semibold text-white">HEZO 어시스턴트</span>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="rounded-md p-1 text-gray-500 transition-colors hover:text-gray-300"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Progress track — 5 segments */}
            <div
              className="mt-3.5 flex gap-1.5"
              role="progressbar"
              aria-valuenow={currentIdx}
              aria-valuemax={4}
              aria-label="진행 단계"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-[3px] flex-1 rounded-full transition-all duration-500",
                    i < currentIdx
                      ? "bg-primary-400"
                      : i === currentIdx
                        ? "bg-primary-500"
                        : "bg-gray-700",
                  )}
                />
              ))}
            </div>
          </div>

          {/* ── Chat feed ────────────────────────────────────────────────── */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-white px-5 py-5">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-error-200 bg-error-50 px-3.5 py-2.5">
                <Icon name="triangle-alert" size={14} className="flex-none text-error-500" />
                <p className="text-xs text-error-700">{error}</p>
              </div>
            )}

            {/* Welcome — always visible */}
            <AssistantMsg>
              안녕하세요! 5분 대화로 AI 검색에 최적화된 홈페이지를 만들어 드릴게요.
            </AssistantMsg>

            {/* ── Structure phase ── */}
            {currentIdx >= 1 && (
              <>
                <UserBubble>시작할게요!</UserBubble>
                <AssistantMsg delay={120}>어떤 형태의 사이트가 필요하신가요?</AssistantMsg>
              </>
            )}

            {currentIdx === 1 && (
              <div
                className="grid grid-cols-3 gap-2.5 animate-[msg-in_220ms_ease-out_both]"
                style={{ animationDelay: "200ms" }}
              >
                {structureOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedStructure(opt.id)}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-xl border-2 p-3.5 text-left transition-colors",
                      selectedStructure === opt.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 bg-white hover:border-gray-300",
                    )}
                  >
                    {opt.recommended && <Badge color="brand" size="sm">추천</Badge>}
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selectedStructure === opt.id ? "text-primary-700" : "text-gray-900",
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[11px] leading-snug text-gray-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {currentIdx > 1 && <UserBubble>{structureLabel}로 할게요</UserBubble>}

            {/* ── Template phase ── */}
            {currentIdx >= 2 && (
              <AssistantMsg delay={currentIdx === 2 ? 160 : 0}>
                어떤 스타일로 만들까요? 템플릿을 골라 주세요.
              </AssistantMsg>
            )}

            {currentIdx === 2 && selectedStructure && (
              <div
                className="grid grid-cols-3 gap-2.5 animate-[msg-in_220ms_ease-out_both]"
                style={{ animationDelay: "280ms" }}
              >
                {(templateOptions[selectedStructure] ?? []).map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "cursor-pointer overflow-hidden rounded-xl border-2 transition-colors",
                      selectedTemplate === tpl.id
                        ? "border-primary-500"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    {tpl.previewUrl ? (
                      <div className="relative h-24 overflow-hidden bg-gray-50">
                        <iframe
                          src={tpl.previewUrl}
                          className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-[0.5]"
                          title={tpl.name}
                        />
                        {selectedTemplate === tpl.id && (
                          <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                            <Icon name="check" size={11} className="text-white" />
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewModalUrl(tpl.previewUrl);
                          }}
                          aria-label="전체 미리보기"
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
                        >
                          <Icon name="search" size={11} className="text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-gray-50 text-xs text-gray-400">
                        준비 중
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-900">{tpl.name}</span>
                        {tpl.badge && <Badge color="brand" size="sm">{tpl.badge}</Badge>}
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-500">{tpl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentIdx > 2 && <UserBubble>{templateLabel} 선택했어요</UserBubble>}

            {/* ── Conversation messages ── */}
            {currentIdx >= 3 &&
              chatMessages.map((msg, i) =>
                msg.role === "user" ? (
                  <UserBubble key={i}>{msg.content}</UserBubble>
                ) : (
                  <AssistantMsg key={i}>{msg.content}</AssistantMsg>
                ),
              )}

            {/* Typing indicator */}
            {chatSending && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white shadow-sm">
                  H
                </span>
                <div className="flex gap-1.5 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Preview ── */}
            {phase === "preview" && (
              <div className="animate-[msg-in_220ms_ease-out_both] space-y-3">
                <AssistantMsg>
                  홈페이지 초안이 완성됐어요! 아래에서 확인하고 발행해 보세요.
                </AssistantMsg>

                {/* Browser chrome mockup */}
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-error-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
                    {siteId && (
                      <span className="ml-2 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-gray-400 shadow-xs">
                        preview.hezo.asia/{siteId.slice(0, 8)}
                      </span>
                    )}
                    {siteId && (
                      <button
                        onClick={() => window.open(`/preview/${siteId}`, "_blank")}
                        aria-label="전체화면으로 보기"
                        className="flex-none text-gray-400 hover:text-gray-600"
                      >
                        <Icon name="external-link" size={12} />
                      </button>
                    )}
                  </div>
                  <div style={{ height: "340px" }}>
                    {previewSrcdoc ? (
                      <iframe
                        srcDoc={previewSrcdoc}
                        className="h-full w-full border-0"
                        title="사이트 프리뷰"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <Icon name="sparkles" size={20} className="mx-auto mb-2 animate-pulse text-primary-400" />
                          <p className="text-xs text-gray-400">렌더링 중...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} className="h-px" />
          </div>

          {/* ── Footer CTA ───────────────────────────────────────────────── */}
          <div className="flex-none border-t border-gray-100 bg-white px-4 py-3.5">

            {phase === "start" && (
              <Button
                hierarchy="primary"
                size="lg"
                onClick={() => setPhase("structure")}
                className="w-full"
                iconTrailing={<Icon name="arrow-right" size={16} />}
              >
                시작하기
              </Button>
            )}

            {phase === "structure" && (
              <Button
                hierarchy="primary"
                size="lg"
                onClick={handleStructureNext}
                disabled={!selectedStructure}
                className="w-full"
                iconTrailing={<Icon name="arrow-right" size={16} />}
              >
                다음
              </Button>
            )}

            {phase === "template" && (
              <div className="flex gap-2.5">
                <Button
                  hierarchy="secondary"
                  size="lg"
                  onClick={() => setPhase("structure")}
                  iconLeading={<Icon name="arrow-left" size={15} />}
                >
                  뒤로
                </Button>
                <Button
                  hierarchy="primary"
                  size="lg"
                  onClick={handleTemplateNext}
                  disabled={!selectedTemplate || loading}
                  className="flex-1"
                  iconTrailing={loading ? undefined : <Icon name="arrow-right" size={16} />}
                >
                  {loading ? "저장 중..." : "다음"}
                </Button>
              </div>
            )}

            {phase === "conversation" && (
              <div className="flex gap-2">
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

            {phase === "chat_done" && (
              <Button
                hierarchy="primary"
                size="lg"
                onClick={handlePreviewRequest}
                disabled={loading}
                className="w-full"
                iconLeading={loading ? undefined : <Icon name="sparkles" size={16} />}
              >
                {loading ? "AI가 홈페이지를 만드는 중..." : "홈페이지 미리보기 확인하기"}
              </Button>
            )}

            {phase === "preview" && (
              <div className="flex gap-2.5">
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
                  {publishing ? "발행 요청 중..." : "사이트 발행하기"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template full-preview modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewModalUrl(null)} />
          <div className="relative h-[85vh] w-[80vw] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-600">템플릿 미리보기</span>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <iframe
              src={previewModalUrl}
              className="h-[calc(100%-48px)] w-full"
              title="템플릿 미리보기"
            />
          </div>
        </div>
      )}

      {/* Pricing modal */}
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
                setPublishingState(siteId);
                onClose();
                router.push("/dashboard");
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
    </>
  );
}
