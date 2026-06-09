import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const publicChecks = [
  "사업자등록번호 10자리 체크섬 검증",
  "통신판매업 신고번호 연동 확인",
  "의료광고심의 번호 연동 확인",
  "개인정보처리방침 템플릿 자동 생성",
];

const legalItems = [
  "사업자등록번호 자동 반영",
  "통신판매업 신고번호 자동 반영",
  "의료광고심의 번호 반영",
  "개인정보보호 약관 생성",
  "필수 안내 문구 자동 적용",
];

export default function BusinessContextPage() {
  return (
    <>
      <TopBar
        title="한국형 비즈니스 컨텍스트 맞춤 개발"
        subtitle="사업자등록번호, 통신판매업 신고번호, 의료광고심의 번호, 개인정보보호 약관 등을 사이트 생성 시 자동 적용합니다."
      >
        <Badge color="success" size="md">저장 완료</Badge>
        <Button hierarchy="primary" iconLeading={<Icon name="sparkles" size={18} />}>
          사이트 재생성
        </Button>
      </TopBar>

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        {/* 좌측 */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* 사이트 프리뷰 목업 */}
          <Card padding={0} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                  <Icon name="leaf" size={14} className="text-primary-600" /> 헤조클리닉
                </span>
                {["진료소개", "의료진", "피부클리닉", "커뮤니티", "예약/문의"].map((n) => (
                  <span key={n} className="hidden text-gray-500 sm:inline">{n}</span>
                ))}
              </div>
              <span className="rounded bg-primary-500 px-3 py-1 text-[10px] font-semibold text-white">
                예약하기
              </span>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-white p-8">
              <div className="max-w-md">
                <h2 className="mb-2 font-display text-lg font-bold text-gray-900">
                  당신의 피부, 가장 건강한 빛을 찾아드립니다
                </h2>
                <p className="mb-4 text-xs text-gray-500">
                  개인 맞춤 진료로 자연스러운 아름다움을 완성합니다.
                </p>
                <div className="flex gap-2">
                  <span className="rounded bg-primary-500 px-4 py-2 text-xs font-semibold text-white">
                    진료 예약하기
                  </span>
                  <span className="rounded border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600">
                    진료 안내 보기
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-4 my-4 rounded-lg border border-primary-200 bg-primary-50 p-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                <Icon name="circle-check-big" size={16} /> 자동 적용 완료
              </span>
              <p className="mt-1 text-xs text-primary-600">
                법적 필수 정보가 사이트에 자동으로 적용되었습니다.
              </p>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-500 sm:grid-cols-4">
                <div>
                  <p className="mb-1 font-semibold text-gray-700">상호</p>
                  <p>헤조클리닉</p>
                  <p className="mt-2 font-semibold text-gray-700">대표자</p>
                  <p>홍길동</p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-700">사업자등록번호</p>
                  <p className="font-mono font-semibold text-primary-700">123-45-67890</p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-700">통신판매업 신고번호</p>
                  <p className="font-mono">2024-서울강남-01234</p>
                  <p className="mt-2 font-semibold text-gray-700">의료광고심의 번호</p>
                  <p className="font-mono">2024-I10-123456</p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-700">이메일</p>
                  <p>hello@hezoclinic.kr</p>
                  <p className="mt-2 font-semibold text-gray-700">대표전화</p>
                  <p>02-1234-5678</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 border-t border-gray-200 pt-3 text-[10px] text-gray-400">
                <span className="cursor-pointer underline">개인정보처리방침</span>
                <span className="cursor-pointer underline">이용약관</span>
                <span className="cursor-pointer underline">환불정책</span>
                <span className="cursor-pointer underline">사이트맵</span>
                <span className="ml-auto">© HEZO CLINIC. All rights reserved.</span>
              </div>
            </div>
          </Card>

          {/* 사업자 정보 원본 + 공공데이터 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                사업자 정보 원본 <span className="font-normal text-gray-400">(공공데이터 연동)</span>
              </h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col items-center py-8 text-center text-xs text-gray-400">
                  <Icon name="file-text" size={28} className="mb-2 text-gray-300" />
                  <p>사 업 자 등 록 증</p>
                  <p className="mt-2 font-mono">123-45-67890</p>
                  <p className="mt-4 text-[9px] text-gray-300">등록일: 2024년 1월 15일</p>
                  <p className="text-[9px] text-gray-300">강남 세무서장</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-sm font-semibold text-gray-700">공공데이터 연동 및 자동 확인</h3>
              <div className="flex flex-col gap-3">
                {publicChecks.map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
                  >
                    <span className="text-xs text-gray-600">{label}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-600">
                      <Icon name="check" size={12} /> 완료
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-50 p-3">
                <Icon name="building-2" size={16} className="text-primary-600" />
                <span className="text-[10px] text-primary-700">공공데이터포털 API 연동</span>
                <span className="ml-auto text-[10px] font-semibold text-primary-600">연동 확인 완료</span>
              </div>
            </Card>
          </div>
        </div>

        {/* 우측 */}
        <div className="flex flex-col gap-4">
          <Card padding={20}>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">법적 필수 정보 자동 반영</h3>
            <div className="flex flex-col gap-3">
              {legalItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-50">
                    <Icon name="check" size={12} className="text-success-600" />
                  </span>
                  <span className="text-xs text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={20}>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">MVP 검증 범위</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">사업자등록번호 10자리 체크섬 검증</span>
                <Badge color="success" size="sm">검증 완료</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600">공공데이터포털 API 연동 확인</span>
                <Badge color="success" size="sm">연동 완료</Badge>
              </div>
            </div>
          </Card>

          <Card padding={20}>
            <div className="mb-3 flex items-center gap-2">
              <Icon name="triangle-alert" size={18} className="text-warning-500" />
              <h3 className="text-sm font-semibold text-gray-700">법적 리스크 대응</h3>
            </div>
            <div className="flex flex-col gap-2">
              {["전자상거래법 관련 필수 안내 문구 자동 제공", "사이트 운영 시 누락 위험 최소화"].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <Icon name="check" size={14} className="mt-0.5 flex-none text-success-600" />
                  <span className="text-xs text-gray-600">{t}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={20}>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">운영 상태</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>마지막 검증</span>
                <span className="text-gray-900">2024.05.20 10:30</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>다음 자동 검증</span>
                <span className="text-gray-900">2024.05.27 예정</span>
              </div>
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-success-600">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> 정기 검증이 정상적으로 진행 중입니다.
            </p>
          </Card>
        </div>

        {/* 하단 요약 */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800">
              <Icon name="circle-check-big" size={16} /> 모든 법적 필수 정보가 사이트 생성 시 자동으로 적용되었습니다.
            </p>
            <div className="mt-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-white px-4 py-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50">
                <Icon name="search" size={14} /> 검증 리포트 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
