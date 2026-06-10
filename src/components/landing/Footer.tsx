import { Section } from "./Section";
import { Logo } from "./Logo";

const cols = [
  { title: "제품", links: ["기능", "작동 방식", "요금제", "템플릿"] },
  { title: "회사", links: ["소개", "블로그", "채용", "고객 사례"] },
  { title: "지원", links: ["도움말 센터", "도입 문의", "이용약관", "개인정보처리방침"] },
];

export function Footer() {
  return (
    <Section className="border-t border-gray-200 pb-12 pt-16">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 pb-10">
        <div className="max-w-[280px]">
          <Logo />
          <p className="mt-4 text-sm leading-[1.6] text-gray-500 [word-break:keep-all]">
            챗봇과 대화하면 AI 검색에 최적화된 홈페이지가 완성됩니다. 한국 소상공인을 위한
            GEO 자동화 플랫폼.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="mb-3.5 text-[13px] font-semibold text-gray-400">{c.title}</div>
            <ul className="flex flex-col gap-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-gray-200 pt-6">
        <span className="text-[13px] text-gray-400 [word-break:keep-all]">
          (주)헤조 · 대표 OOO · 사업자등록번호 000-00-00000 · 통신판매업 신고
          2026-서울강남-00000
        </span>
        <span className="text-[13px] text-gray-400">
          © 2026 HEZO, Inc. All rights reserved.
        </span>
      </div>
    </Section>
  );
}
