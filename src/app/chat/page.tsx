"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatSession, MAX_REGENERATIONS } from "@/hooks/useChatSession";
import { useChatApi } from "@/hooks/useChatApi";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { createSiteAndAwaitReady, SiteCreationTimeoutError, triggerPreview } from "@/lib/api";

type Phase = "start" | "structure" | "template" | "conversation";

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

const structureOptions: { id: string; label: string; desc: string; icon: IconName; recommended?: boolean }[] = [
  { id: "landing", label: "랜딩페이지", desc: "한 페이지로 핵심 메시지 전달.\n서비스/브랜드 소개에 적합.", icon: "monitor", recommended: true },
  { id: "blog", label: "일반 홈페이지", desc: "여러 페이지로 상세 정보 전달.\n기업, 클리닉 등에 적합.", icon: "file-text" },
  { id: "store", label: "스토어", desc: "상품/메뉴 카탈로그 중심.\n식당, 쇼핑몰에 적합.", icon: "shopping-cart" },
];

const templateOptions: Record<string, { id: string; name: string; desc: string }[]> = {
  landing: [
    { id: "dental-clinic", name: "치과/의원", desc: "치과·의원 진료 안내 랜딩" },
    { id: "saas-startup", name: "SaaS/스타트업", desc: "B2B SaaS 제품 소개 랜딩" },
    { id: "bootcamp", name: "교육/부트캠프", desc: "강의·교육 프로그램 소개 랜딩" },
    { id: "restaurant-franchise", name: "요식업/프랜차이즈", desc: "레스토랑·프랜차이즈 브랜드 랜딩" },
    { id: "law-firm", name: "법률/전문직", desc: "법무법인·전문직 서비스 소개" },
    { id: "beauty-salon", name: "뷰티/살롱", desc: "헤어·뷰티 샵 안내 랜딩" },
  ],
  blog: [
    { id: "corporate", name: "기업 소개", desc: "회사 소개·채용 멀티페이지" },
    { id: "portfolio", name: "포트폴리오", desc: "작업물·경력 소개 멀티페이지" },
    { id: "developer-docs", name: "개발자 블로그", desc: "기술 블로그·문서 사이트" },
  ],
  store: [
    { id: "cafe-menu", name: "카페/음료", desc: "카페·디저트 메뉴 스토어" },
    { id: "fashion-select", name: "패션/셀렉트샵", desc: "의류·액세서리 소규모 쇼핑몰" },
    { id: "food-delivery", name: "배달/포장", desc: "배달 음식점·포장 전문점" },
  ],
};

export default function ChatPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("start");
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [rightTab, setRightTab] = useState<"preview" | "schema">("preview");
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [redirectingToPreview, setRedirectingToPreview] = useState(false);
  const [creatingSite, setCreatingSite] = useState(false);
  const [siteCreationError, setSiteCreationError] = useState<string | null>(null);

  const { sessionState, sendMessage, requestRegeneration, startNewSession, formatTime } =
    useChatSession();

  const chatApi = useChatApi(currentSiteId ?? "__no_site__");

  const progressItems = getProgressItems(phase);
  const currentStepNum = progressItems.filter((i) => i.status === "done").length + 1;
  const totalSteps = progressItems.length;

  const handleStartConversation = useCallback(async () => {
    if (!currentSiteId) {
      setCreatingSite(true);
      setSiteCreationError(null);
      try {
        const site = await createSiteAndAwaitReady("새 홈페이지", selectedStructure ?? "landing");
        setCurrentSiteId(site.id);
      } catch (err) {
        setCreatingSite(false);
        if (err instanceof SiteCreationTimeoutError) {
          setSiteCreationError("사이트 생성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
        setCurrentSiteId(sessionState.sessionId);
      }
      setCreatingSite(false);
    }
    setPhase("conversation");
  }, [currentSiteId, selectedStructure, sessionState.sessionId]);

  // 대화 완료 시 P3 preview 트리거 + /preview 이동
  useEffect(() => {
    if (chatApi.turnStatus === "ready_for_contract_compile" && currentSiteId && !redirectingToPreview) {
      setRedirectingToPreview(true);
      triggerPreview(currentSiteId).catch(() => {}); // non-blocking
      const t = setTimeout(() => router.push(`/preview/${currentSiteId}`), 1500);
      return () => clearTimeout(t);
    }
  }, [chatApi.turnStatus, currentSiteId, redirectingToPreview, router]);

  const handleSendMessage = async () => {
    if (!input.trim() || sessionState.isExpired) return;
    const canSend = sendMessage(input.trim());
    if (canSend) {
      const text = input.trim();
      setInput("");
      await chatApi.sendMessage(
        sessionState.sessionId,
        text,
        selectedStructure ?? "",
        selectedTemplate ?? "",
      );
    }
  };

  const handleRegeneration = () => requestRegeneration();

  const handleStartNewSession = () => {
    startNewSession();
    setPhase("start");
    setSelectedStructure(null);
    setSelectedTemplate(null);
    setInput("");
    setCurrentSiteId(null);
    chatApi.clearMessages();
  };

  const canRegenerate =
    sessionState.regenerationCount < MAX_REGENERATIONS && !sessionState.isExpired;
  const stepIdx = { start: 0, structure: 1, template: 2, conversation: 3 }[phase] ?? 0;

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* 좌측: 진행 상황 */}
      <div className="hidden w-60 flex-none flex-col border-r border-gray-200 bg-white p-5 md:flex">
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-display text-lg font-bold text-gray-900">HEZO</span>
            <Badge color="brand" size="sm">베타</Badge>
          </div>
          <h2 className="mt-3 font-display text-base font-bold text-gray-900">사이트 만들기</h2>
          <p className="mt-1 text-[11px] text-gray-500">
            단계별로 진행하여 AI가 최적의 사이트를 만들어 드립니다.
          </p>
        </div>

        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">진행 상황</span>
            <span className="text-[10px] text-gray-400">{currentStepNum} / {totalSteps} 단계</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {progressItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 py-1">
                {item.status === "done" && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100">
                    <Icon name="check" size={10} className="text-primary-600" />
                  </span>
                )}
                {item.status === "in_progress" && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  </span>
                )}
                {item.status === "pending" && (
                  <span className="h-4 w-4 rounded-full border border-gray-300" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    item.status === "done"
                      ? "text-gray-600"
                      : item.status === "in_progress"
                        ? "font-medium text-primary-700"
                        : "text-gray-400",
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="flex items-center gap-1 text-[9px] text-gray-400">
            <Icon name="lock" size={10} /> 입력 정보는 안전하게 보호됩니다.
          </p>
        </div>
      </div>

      {/* 중앙 */}
      <div className="flex flex-1 flex-col bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            {["세션 시작", "구조 선택", "템플릿 선택", "정보 수집", "프리뷰"].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium",
                    i < stepIdx
                      ? "bg-primary-600 text-white"
                      : i === stepIdx
                        ? "bg-primary-100 text-primary-700 ring-2 ring-primary-400"
                        : "bg-gray-200 text-gray-400",
                  )}
                >
                  {i < stepIdx ? <Icon name="check" size={11} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px]",
                    i === stepIdx ? "font-medium text-primary-700" : "text-gray-400",
                  )}
                >
                  {step}
                </span>
                {i < 4 && <div className="h-px w-5 bg-gray-300" />}
              </div>
            ))}
          </div>
          {phase === "conversation" && sessionState.startedAt !== null && (
            <div className="mt-2 flex items-center justify-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  sessionState.isExpired
                    ? "bg-error-50 text-error-700"
                    : sessionState.remainingSeconds <= 60
                      ? "bg-warning-50 text-warning-700"
                      : "bg-gray-100 text-gray-600",
                )}
              >
                <Icon name="clock" size={13} />
                <span>{formatTime(sessionState.remainingSeconds)}</span>
                {sessionState.isExpired && <span className="ml-1">만료</span>}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {phase === "start" && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <Icon name="rocket" size={30} className="text-primary-600" />
              </div>
              <h2 className="mb-2 font-display text-xl font-bold text-gray-900">새 사이트를 만들어 볼까요?</h2>
              <p className="mb-8 max-w-md text-sm text-gray-500">
                AI 챗봇과 대화하면서 5분 만에 AI 검색에 최적화된 홈페이지를 자동으로 생성합니다.
              </p>
              <Button
                hierarchy="primary"
                size="xl"
                onClick={() => setPhase("structure")}
                iconTrailing={<Icon name="arrow-right" size={18} />}
              >
                대화 세션 시작하기
              </Button>
              <p className="mt-4 text-[10px] text-gray-400">예상 소요 시간: 5~10분</p>
            </div>
          )}

          {phase === "structure" && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-gray-900">사이트 구조를 선택하세요</h2>
              <p className="mb-6 text-xs text-gray-500">
                업종에 맞는 최적의 구조를 추천합니다. 원하시는 구조를 선택해 주세요.
              </p>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {structureOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedStructure(opt.id)}
                    className={cn(
                      "relative cursor-pointer rounded-xl border-2 p-5 text-center transition-all",
                      selectedStructure === opt.id
                        ? "border-primary-500 bg-primary-50 shadow"
                        : "border-gray-200 bg-white hover:border-gray-300",
                    )}
                  >
                    {opt.recommended && (
                      <span className="absolute -top-2 left-3">
                        <Badge color="brand" size="sm">추천</Badge>
                      </span>
                    )}
                    <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50">
                      <Icon name={opt.icon} size={22} className="text-primary-600" />
                    </span>
                    <h3 className="mb-1 text-sm font-bold text-gray-900">{opt.label}</h3>
                    <p className="whitespace-pre-line text-[10px] text-gray-500">{opt.desc}</p>
                  </div>
                ))}
              </div>
              {selectedStructure && (
                <Button hierarchy="primary" size="lg" onClick={() => setPhase("template")} className="w-full">
                  다음: 템플릿 선택 →
                </Button>
              )}
            </div>
          )}

          {phase === "template" && selectedStructure && (
            <div>
              <h2 className="mb-1 font-display text-lg font-bold text-gray-900">템플릿을 선택하세요</h2>
              <p className="mb-6 text-xs text-gray-500">
                선택한 구조({structureOptions.find((s) => s.id === selectedStructure)?.label})에 맞는 템플릿 목록입니다.
              </p>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {(templateOptions[selectedStructure] || []).map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                      selectedTemplate === tpl.id ? "border-primary-500 shadow" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex h-32 items-center justify-center bg-gray-100 text-xs text-gray-400">
                      미리보기
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900">{tpl.name}</h4>
                      <p className="mt-1 text-[10px] text-gray-500">{tpl.desc}</p>
                    </div>
                    {selectedTemplate === tpl.id && (
                      <div className="flex items-center justify-center gap-1 bg-primary-50 px-4 py-2 text-[10px] font-medium text-primary-700">
                        <Icon name="check" size={12} /> 선택됨
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {siteCreationError && (
                <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-error-200 bg-error-50 px-3.5 py-2.5">
                  <Icon name="triangle-alert" size={14} className="flex-none text-error-500" />
                  <p className="text-xs text-error-700">{siteCreationError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button hierarchy="secondary" size="lg" onClick={() => setPhase("structure")}>← 구조 다시 선택</Button>
                {selectedTemplate && (
                  <Button
                    hierarchy="primary"
                    size="lg"
                    onClick={handleStartConversation}
                    disabled={creatingSite}
                    className="flex-1"
                  >
                    {creatingSite ? "사이트 준비 중..." : "다음: 대화 시작하기 →"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {phase === "conversation" && (
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {chatApi.messages.length === 0 && (
                <div className="flex gap-2">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-100">
                    <Icon name="message-circle" size={14} className="text-primary-600" />
                  </span>
                  <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                    안녕하세요! 어떤 비즈니스를 운영하고 계신지 알려주세요.
                  </div>
                </div>
              )}
              {chatApi.messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="rounded-2xl rounded-br-md bg-gray-800 px-4 py-3 text-sm text-white">{msg.content}</div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-2">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-100">
                      <Icon name="message-circle" size={14} className="text-primary-600" />
                    </span>
                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                      {msg.content}
                    </div>
                  </div>
                ),
              )}
              {chatApi.loading && (
                <div className="flex gap-2">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-100">
                    <Icon name="message-circle" size={14} className="text-primary-600" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  </div>
                </div>
              )}

              {chatApi.turnStatus === "ready_for_contract_compile" && currentSiteId && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="rounded-xl border border-success-200 bg-success-50 px-5 py-4 text-center">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-success-700">
                      <Icon name="check" size={14} /> 정보 수집 완료!
                    </p>
                    <p className="text-xs text-success-600">프리뷰를 생성하고 있습니다...</p>
                  </div>
                  <Button
                    hierarchy="primary"
                    size="md"
                    onClick={() => router.push(`/preview/${currentSiteId}`)}
                  >
                    프리뷰 보기 →
                  </Button>
                </div>
              )}

              {sessionState.isExpired && chatApi.turnStatus !== "ready_for_contract_compile" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="rounded-xl border border-error-200 bg-error-50 px-5 py-4 text-center">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-sm font-medium text-error-700">
                      <Icon name="clock" size={14} /> 세션이 만료되었습니다
                    </p>
                    <p className="text-xs text-error-600">세션이 만료되었습니다. 새 세션을 시작해주세요.</p>
                  </div>
                  <Button hierarchy="primary" size="md" onClick={handleStartNewSession}>새 세션 시작</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {phase === "conversation" && (
          <div className="border-t border-gray-200 bg-white px-6 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSendMessage();
                }}
                placeholder={sessionState.isExpired ? "세션이 만료되었습니다" : "메시지를 입력하세요..."}
                disabled={sessionState.isExpired}
                className={cn(
                  "flex-1 rounded-full border px-4 py-2.5 text-sm focus:outline-none focus-visible:border-primary-400 focus-visible:ring-4 focus-visible:ring-[var(--focus-ring-brand)]",
                  sessionState.isExpired
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                    : "border-gray-200 bg-gray-50",
                )}
              />
              <button
                onClick={() => void handleSendMessage()}
                disabled={sessionState.isExpired || !input.trim() || chatApi.loading}
                className={cn(
                  "flex h-9 w-9 flex-none items-center justify-center rounded-full transition-colors",
                  sessionState.isExpired || !input.trim()
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-primary-500 text-white hover:bg-primary-600",
                )}
              >
                <Icon name="arrow-right" size={16} />
              </button>
              <button
                onClick={handleRegeneration}
                disabled={!canRegenerate}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  canRegenerate
                    ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                )}
              >
                <Icon name="refresh-cw" size={13} /> 재생성 ({sessionState.regenerationCount}/{MAX_REGENERATIONS})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 우측: 미리보기 */}
      <div className="hidden w-72 flex-none flex-col border-l border-gray-200 bg-white md:flex">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setRightTab("preview")}
            className={cn(
              "flex-1 py-3 text-xs font-medium",
              rightTab === "preview" ? "border-b-2 border-primary-600 text-primary-700" : "text-gray-400",
            )}
          >
            미리보기
          </button>
          <button
            onClick={() => setRightTab("schema")}
            className={cn(
              "flex-1 py-3 text-xs font-medium",
              rightTab === "schema" ? "border-b-2 border-primary-600 text-primary-700" : "text-gray-400",
            )}
          >
            Schema
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {phase === "start" ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <Icon name="monitor" size={28} className="mb-2" />
              <p className="text-xs">세션을 시작하면 미리보기가 표시됩니다.</p>
            </div>
          ) : rightTab === "preview" ? (
            <div>
              <div className="overflow-hidden rounded-lg border border-gray-200 text-[9px]">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                  <span className="font-bold text-gray-800">Timeless</span>
                  <div className="flex gap-2 text-gray-500"><span>Shop</span><span>Lookbook</span></div>
                </div>
                <div className="bg-gradient-to-br from-stone-100 to-stone-50 p-4">
                  <p className="mb-1 text-[8px] uppercase tracking-wider text-stone-500">Timeless</p>
                  <h3 className="mb-1 text-xs font-bold text-stone-900">Elegance Redefined</h3>
                  <p className="mb-2 text-[8px] text-stone-600">Premium accessories crafted for refined luxury.</p>
                  <span className="rounded bg-stone-900 px-2 py-0.5 text-[7px] text-white">Shop →</span>
                </div>
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {["Leather Bags", "Jewelry", "Watches"].map((c) => (
                      <div key={c} className="rounded bg-stone-50 p-1.5 text-center">
                        <div className="mx-auto mb-0.5 h-5 w-5 rounded bg-stone-200" />
                        <span className="text-[6px] text-stone-600">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-stone-900 p-2 text-center text-[6px] text-stone-400">
                  Luxury Accessory · Shop · Lookbook
                </div>
              </div>
              <p className="mt-2 text-center text-[9px] text-gray-400">
                {selectedTemplate
                  ? `${templateOptions[selectedStructure!]?.find((t) => t.id === selectedTemplate)?.name} 템플릿`
                  : "랜딩페이지 템플릿"}
              </p>
              {phase === "conversation" && currentSiteId && chatApi.turnStatus === "ready_for_contract_compile" && (
                <Button
                  hierarchy="primary"
                  size="md"
                  onClick={() => router.push(`/preview/${currentSiteId}`)}
                  className="mt-4 w-full"
                >
                  프리뷰 보기 →
                </Button>
              )}
            </div>
          ) : (
            <pre className="rounded-lg bg-gray-900 p-3 font-mono text-[8px] leading-relaxed text-primary-300">
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

    </div>
  );
}
