"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  loading?: boolean;
}

const terms = [
  {
    label: "[필수] HEZO 서비스 이용약관 동의",
    desc: "생성된 사이트의 운영, 관리, 해지에 관한 조건을 포함합니다.",
  },
  {
    label: "[필수] AI 생성 콘텐츠 저작권 및 사용 동의",
    desc: "AI가 생성한 텍스트, 이미지, 구조화 데이터의 저작권과 사용 범위에 동의합니다.",
  },
  {
    label: "[필수] 개인정보 수집 및 이용 동의",
    desc: "사이트 생성에 필요한 사업자 정보, 연락처 등의 수집·이용에 동의합니다.",
  },
];

export default function AgreementModal({ isOpen, onClose, onAgree, loading }: AgreementModalProps) {
  const [checks, setChecks] = useState([false, false, false]);
  const allChecked = checks.every(Boolean);

  if (!isOpen) return null;

  const toggle = (i: number) =>
    setChecks((c) => c.map((v, idx) => (idx === i ? !v : v)));
  const toggleAll = (v: boolean) => setChecks([v, v, v]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-[500px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative px-8 pb-4 pt-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
          >
            <Icon name="x" size={20} />
          </button>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
            <Icon name="clipboard-list" size={24} className="text-primary-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900">사이트 생성 동의</h2>
          <p className="mt-1 text-sm text-gray-500 [word-break:keep-all]">
            HEZO 서비스를 이용하여 사이트를 생성하기 전, 아래 약관에 동의해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-8 py-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 accent-primary-600"
            />
            <span className="text-sm font-medium text-gray-900">전체 동의</span>
          </label>

          <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-3">
            {terms.map((t, i) => (
              <label key={i} className="flex cursor-pointer items-start gap-3 px-3">
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => toggle(i)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary-600"
                />
                <div>
                  <span className="text-sm text-gray-700">{t.label}</span>
                  <p className="mt-0.5 text-[10px] text-gray-400">{t.desc}</p>
                </div>
                <button className="ml-auto flex-shrink-0 text-[10px] text-gray-400 underline">보기</button>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
          <Button
            hierarchy="primary"
            size="lg"
            onClick={onAgree}
            disabled={!allChecked || loading}
            className="w-full"
          >
            {loading ? "처리 중..." : "동의하고 사이트 만들기"}
          </Button>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            약관에 동의하시면 사이트 생성 프로세스가 시작됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
