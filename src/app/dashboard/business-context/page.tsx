"use client";

export default function BusinessContextDashboard() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">한국형 비즈니스 컨텍스트 맞춤 개발</h1>
          <p className="text-sm text-gray-500 mt-1">
            사업자등록번호, 통신판매업 신고번호, 의료광고심의 번호, 개인정보보호 약관 등을 사이트 생성 시 <span className="font-medium text-gray-700">자동 적용</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2">
            ✨ 사이트 재생성
          </button>
          <span className="text-xs text-gray-400 px-3 py-1 bg-green-50 text-green-700 rounded-full">✓ 저장 완료</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 좌측: 사이트 프리뷰 + 푸터 + 사업자등록증 */}
        <div className="col-span-2 space-y-6">
          {/* 사이트 프리뷰 (헤더+히어로+푸터 포함) */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 사이트 네비게이션 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-800">🌿 헤조클리닉</span>
                <span className="text-gray-500">진료소개</span>
                <span className="text-gray-500">의료진</span>
                <span className="text-gray-500">피부클리닉</span>
                <span className="text-gray-500">커뮤니티</span>
                <span className="text-gray-500">예약/문의</span>
              </div>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-[10px]">예약하기 ▾</button>
            </div>

            {/* 히어로 */}
            <div className="relative bg-gradient-to-r from-green-50 to-white p-8">
              <div className="max-w-md">
                <h2 className="text-lg font-bold text-gray-900 mb-2">당신의 피부, 가장 건강한 빛을<br/>찾아드립니다</h2>
                <p className="text-xs text-gray-500 mb-4">개인 맞춤 진료로 자연스러운 아름다움을 완성합니다.</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white text-xs rounded">진료 예약하기</button>
                  <button className="px-4 py-2 border border-gray-300 text-xs rounded text-gray-600">진료 안내 보기</button>
                </div>
              </div>
              <div className="absolute right-8 top-4 w-32 h-24 bg-gray-200 rounded-lg"></div>
            </div>

            {/* 자동 적용 완료 배너 */}
            <div className="mx-4 my-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <span className="text-green-700 text-sm font-medium">✓ 자동 적용 완료</span>
              <p className="text-xs text-green-600 mt-1">법적 필수 정보가 사이트에 자동으로 적용되었습니다.</p>
            </div>

            {/* 푸터 (법적 정보 표시) */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-[10px] text-gray-500">
                <div>
                  <p className="text-gray-700 font-medium mb-1">상호</p>
                  <p>헤조클리닉</p>
                  <p className="mt-2 text-gray-700 font-medium">대표자</p>
                  <p>홍길동</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-1">● 사업자등록번호</p>
                  <p className="font-mono text-green-700 font-medium">123-45-67890</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-1">● 통신판매업 신고번호</p>
                  <p className="font-mono">2024-서울강남-01234</p>
                  <p className="text-gray-700 font-medium mt-2">● 의료광고심의 번호</p>
                  <p className="font-mono">2024-I10-123456</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-1">이메일</p>
                  <p>hello@hezoclinic.kr</p>
                  <p className="text-gray-700 font-medium mt-2">대표전화</p>
                  <p>02-1234-5678</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 text-[10px] text-gray-400">
                <span className="underline cursor-pointer">개인정보처리방침</span>
                <span className="underline cursor-pointer">이용약관</span>
                <span className="underline cursor-pointer">환불정책</span>
                <span className="underline cursor-pointer">사이트맵</span>
                <span className="ml-auto">© HEZO CLINIC. All rights reserved.</span>
              </div>
            </div>
          </div>

          {/* 하단: 사업자 정보 원본 + 공공데이터 연동 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 사업자 정보 원본 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">사업자 정보 원본 <span className="text-gray-400 font-normal">(공공데이터 연동)</span></h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-center text-xs text-gray-400 py-8">
                  <p className="text-2xl mb-2">📄</p>
                  <p>사 업 자 등 록 증</p>
                  <p className="font-mono mt-2">123-45-67890</p>
                  <p className="text-[9px] mt-4 text-gray-300">등록일: 2024년 1월 15일</p>
                  <p className="text-[9px]">강남 세무서장</p>
                </div>
              </div>
            </div>

            {/* 공공데이터 연동 및 자동 확인 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">공공데이터 연동 및 자동 확인</h3>
              <div className="space-y-3">
                {[
                  { label: "사업자등록번호 10자리 체크섬 검증", status: "자동 확인 완료" },
                  { label: "통신판매업 신고번호 연동 확인", status: "자동 확인 완료" },
                  { label: "의료광고심의 번호 연동 확인", status: "자동 확인 완료" },
                  { label: "개인정보처리방침 템플릿 자동 생성", status: "자동 생성 완료" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <span className="text-[10px] text-green-600 font-medium">{item.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://www.data.go.kr/images/common/logo.png" alt="" className="h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
                <span className="text-[10px] text-green-700">🏛 공공데이터포털 API 연동</span>
                <span className="text-[10px] text-green-600 ml-auto font-medium">연동 확인 완료</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 법적 필수 정보 자동 반영 + MVP 검증 + 법적 리스크 + 운영 상태 */}
        <div className="space-y-4">
          {/* 법적 필수 정보 자동 반영 */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">법적 필수 정보 자동 반영</h3>
            <div className="space-y-3">
              {[
                "사업자등록번호 자동 반영",
                "통신판매업 신고번호 자동 반영",
                "의료광고심의 번호 반영",
                "개인정보보호 약관 생성",
                "필수 안내 문구 자동 적용",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                  <span className="text-xs text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MVP 검증 범위 */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">MVP 검증 범위</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">사업자등록번호 10자리<br/>체크섬 검증</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded">검증 완료</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">공공데이터포털 API<br/>연동 확인</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded">연동 완료</span>
              </div>
            </div>
          </div>

          {/* 법적 리스크 대응 */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚠️</span>
              <h3 className="text-sm font-medium text-gray-700">법적 리스크 대응</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-xs text-gray-600">전자상거래법 관련 필수 안내 문구 자동 제공</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-xs text-gray-600">사이트 운영 시 누락 위험 최소화</span>
              </div>
            </div>
          </div>

          {/* 운영 상태 */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">운영 상태</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>마지막 검증</span>
                <span className="text-gray-900">2024.05.20 10:30</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>다음 자동 검증</span>
                <span className="text-gray-900">2024.05.27 예정</span>
              </div>
            </div>
            <p className="text-[10px] text-green-600 mt-3 flex items-center gap-1">
              🟢 정기 검증이 정상적으로 진행 중입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 최하단 요약 */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-sm text-green-800 font-medium">
          ✓ 모든 법적 필수 정보가 사이트 생성 시 자동으로 적용되었습니다.
        </p>
        <button className="mt-2 px-4 py-2 text-xs text-green-700 border border-green-300 rounded-lg hover:bg-green-100">
          🔍 검증 리포트 보기
        </button>
      </div>
    </div>
  );
}
