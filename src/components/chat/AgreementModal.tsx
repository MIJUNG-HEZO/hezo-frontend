"use client";

import { useState } from "react";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  loading?: boolean;
}

export default function AgreementModal({ isOpen, onClose, onAgree, loading }: AgreementModalProps) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);

  const allChecked = checked1 && checked2 && checked3;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="px-8 pt-8 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-900">사이트 생성 동의</h2>
          <p className="text-sm text-gray-500 mt-1">HEZO 서비스를 이용하여 사이트를 생성하기 전, 아래 약관에 동의해 주세요.</p>
        </div>

        {/* 약관 체크리스트 */}
        <div className="px-8 py-4 space-y-3">
          {/* 전체 동의 */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => { setChecked1(e.target.checked); setChecked2(e.target.checked); setChecked3(e.target.checked); }}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-900">전체 동의</span>
          </label>

          <div className="border-t border-gray-100 pt-3 space-y-2.5">
            {/* 약관 1: 서비스 이용약관 */}
            <label className="flex items-start gap-3 px-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked1}
                onChange={(e) => setChecked1(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="text-sm text-gray-700">[필수] HEZO 서비스 이용약관 동의</span>
                <p className="text-[10px] text-gray-400 mt-0.5">생성된 사이트의 운영, 관리, 해지에 관한 조건을 포함합니다.</p>
              </div>
              <button className="ml-auto text-[10px] text-gray-400 underline flex-shrink-0">보기</button>
            </label>

            {/* 약관 2: 저작권/콘텐츠 */}
            <label className="flex items-start gap-3 px-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked2}
                onChange={(e) => setChecked2(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="text-sm text-gray-700">[필수] AI 생성 콘텐츠 저작권 및 사용 동의</span>
                <p className="text-[10px] text-gray-400 mt-0.5">AI가 생성한 텍스트, 이미지, 구조화 데이터의 저작권과 사용 범위에 동의합니다.</p>
              </div>
              <button className="ml-auto text-[10px] text-gray-400 underline flex-shrink-0">보기</button>
            </label>

            {/* 약관 3: 개인정보 */}
            <label className="flex items-start gap-3 px-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked3}
                onChange={(e) => setChecked3(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="text-sm text-gray-700">[필수] 개인정보 수집 및 이용 동의</span>
                <p className="text-[10px] text-gray-400 mt-0.5">사이트 생성에 필요한 사업자 정보, 연락처 등의 수집·이용에 동의합니다.</p>
              </div>
              <button className="ml-auto text-[10px] text-gray-400 underline flex-shrink-0">보기</button>
            </label>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onAgree}
            disabled={!allChecked || loading}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
              allChecked && !loading
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "처리 중..." : "동의하고 사이트 만들기"}
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            약관에 동의하시면 사이트 생성 프로세스가 시작됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
