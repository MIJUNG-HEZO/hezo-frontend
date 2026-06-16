/**
 * templateRenderer.ts
 *
 * 역할: public/templates/*.html 파일에 Contract JSON 데이터를 주입해
 *       완성된 HTML 문자열(srcdoc용)을 반환한다.
 *
 * 주입 방식:
 *   1. data-hezo="*" 속성 기반 (explicit — 수정된 템플릿)
 *   2. CSS 셀렉터 휴리스틱 (fallback — 수정되지 않은 템플릿)
 *   3. </body> 직전에 인라인 <script> 삽입
 */

import type { ContractJson } from "@/lib/api";

/** 템플릿 ID → 퍼블릭 경로 매핑 */
export const TEMPLATE_PATHS: Record<string, string> = {
  // ── landing (3종 테스트) ──────────────────────────────────
  "01-clinic-landing":   "/templates/landing/01-clinic-landing.html",
  "medical-clinic":      "/templates/landing/01-clinic-landing.html",  // alias
  "02-course-landing":   "/templates/landing/02-course-landing.html",
  "03-saas-product":     "/templates/landing/03-saas-product.html",
  "17-solar-energy":     "/templates/landing/17-solar-energy.html",
  // 기타 landing (mapped but not in test set)
  "05-lifting-clinic":   "/templates/landing/05-lifting-clinic.html",
  "consulting":          "/templates/landing/07-legal-consulting.html",
  // ── store (3종 테스트) ────────────────────────────────────
  "01-cafe-menu":        "/templates/store/01-cafe-menu.html",
  "05-booking-service":  "/templates/store/05-booking-service.html",
  "06-oops-nail":        "/templates/store/06-oops-nail.html",
  "10-wine-market":      "/templates/store/10-wine-market.html",
  "beauty-salon":        "/templates/store/05-booking-service.html",   // alias
  // ── blog (3종 테스트) ─────────────────────────────────────
  "01-food-travel-blog": "/templates/blog/01-food-travel-blog.html",
  "03-developer-docs":   "/templates/blog/03-developer-docs.html",
  "05-expert-column":    "/templates/blog/05-expert-column.html",
  "17-career-notebook":  "/templates/blog/17-career-notebook.html",
  "01-study-notebook":   "/templates/blog/01-food-travel-blog.html",   // alias
  "tech-blog":           "/templates/blog/03-developer-docs.html",     // alias
};

/** 선택된 구조(structure)에 따른 기본 템플릿 */
const DEFAULT_TEMPLATE_BY_STRUCTURE: Record<string, string> = {
  landing: "/templates/landing/01-clinic-landing.html",
  multi: "/templates/blog/01-food-travel-blog.html",
  store: "/templates/store/01-cafe-menu.html",
};

/**
 * Contract JSON을 DOM에 주입하는 인라인 스크립트 생성.
 * data-hezo 속성이 있으면 우선 적용, 없으면 CSS 셀렉터 휴리스틱 적용.
 */
function buildInjectionScript(contract: ContractJson): string {
  const brand = contract.brand ?? {};
  const contact = contract.contact ?? {};
  const landing = contract.content?.landing?.domain_data;
  const hero = landing?.hero ?? {};
  const services = landing?.services ?? [];
  const values = landing?.values ?? [];
  const reviews = landing?.reviews ?? [];
  const faq = landing?.faq ?? [];

  const contractJson = JSON.stringify({ brand, contact, hero, services, values, reviews, faq });

  return `
<script>
(function() {
  var C = ${contractJson};
  var brand = C.brand, contact = C.contact, hero = C.hero;
  var services = C.services, values = C.values, reviews = C.reviews, faq = C.faq;

  /* ── 헬퍼 ── */
  function setText(el, text) { if (el) el.textContent = text; }
  function setHtml(el, html) { if (el) el.innerHTML = html; }
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.from(document.querySelectorAll(sel)); }
  function hezo(key) { return q('[data-hezo="' + key + '"]'); }
  function hezoAll(key) { return qa('[data-hezo="' + key + '"]'); }

  /* ── 브랜드명 ── */
  var brandEl = hezo('brand-name') || q('.logo-text h1') || q('.brand') || q('.logo h1') || q('header h1');
  setText(brandEl, brand.name);

  /* ── title 태그 ── */
  document.title = brand.name || document.title;

  /* ── 히어로 헤드라인 ── */
  var hlEl = hezo('hero-headline') || q('.hero-text h2') || q('.hero h1') || q('.hero h2');
  if (hlEl && hero.headline) setHtml(hlEl, hero.headline.replace(/\\n/g, '<br>'));

  /* ── 히어로 서브헤드라인 ── */
  var subEl = hezo('hero-subheadline') || q('.hero-text > p') || q('.hero > div > p') || q('.hero p');
  setText(subEl, hero.subheadline);

  /* ── CTA 버튼 ── */
  hezoAll('cta').forEach(function(el) { setText(el, hero.cta_text); });
  if (!hezo('cta')) {
    var cta = q('.primary') || q('.btn-primary') || q('.cta-btn');
    setText(cta, hero.cta_text);
  }

  /* ── 전화번호 ── */
  hezoAll('phone').forEach(function(el) { setText(el, '전화 상담 ' + contact.phone); });
  if (!hezo('phone')) {
    qa('.glass-btn, [data-hezo="phone"]').forEach(function(el) {
      if (el.textContent && (el.textContent.indexOf('전화') >= 0 || el.textContent.indexOf('02-') >= 0)) {
        setText(el, '전화 상담 ' + contact.phone);
      }
    });
  }

  /* ── Floating CTA ── */
  var floatingEl = hezo('floating-cta') || q('.floating');
  setText(floatingEl, contact.phone);

  /* ── 서비스 카드 (info-card) ── */
  var infoCards = qa('[data-hezo-idx].info-card, .info-card');
  infoCards.forEach(function(card, i) {
    var svc = services[i];
    if (!svc) return;
    var nameEl = card.querySelector('[data-hezo="service-name"]') || card.querySelector('h3');
    var descEl = card.querySelector('[data-hezo="service-desc"]') || card.querySelector('p');
    setText(nameEl, svc.name);
    setText(descEl, svc.desc);
  });

  /* ── 상세 카드 (detail-overlay) ── */
  var detailOverlays = qa('[data-hezo-idx].detail-overlay, .detail-overlay');
  detailOverlays.forEach(function(overlay, i) {
    var svc = services[i];
    if (!svc) return;
    var categoryEl = overlay.querySelector('[data-hezo="detail-category"]') || overlay.querySelector('span');
    var nameEl = overlay.querySelector('[data-hezo="detail-name"]') || overlay.querySelector('h3');
    var descEl = overlay.querySelector('[data-hezo="detail-desc"]') || overlay.querySelector('p');
    var listEl = overlay.querySelector('[data-hezo="detail-list"]') || overlay.querySelector('ul');
    if (categoryEl) setText(categoryEl, svc.name);
    if (nameEl) setText(nameEl, svc.name);
    if (descEl) setText(descEl, svc.desc);
    if (listEl) listEl.style.display = 'none'; // 템플릿 리스트는 숨김
  });

  /* ── 섹션 CTA ── */
  var sectionTitle = hezo('section-cta-title');
  setText(sectionTitle, brand.name + ' 상담 신청');
  var sectionDesc = hezo('section-cta-desc');
  setText(sectionDesc, contact.phone + ' | 무료 상담 접수 중');

  /* ── 카페/스토어 템플릿 (01-cafe-menu) ── */
  var brandEl2 = q('.brand');
  if (brandEl2) setText(brandEl2, brand.name);

  /* 상품/서비스 카드 (product) */
  var productCards = qa('.product .body');
  productCards.forEach(function(body, i) {
    var svc = services[i];
    if (!svc) return;
    var h3 = body.querySelector('h3');
    var p = body.querySelector('p');
    setText(h3, svc.name);
    setText(p, svc.desc);
  });

  /* 번들 미니 카드 (mini) */
  var miniCards = qa('.mini');
  miniCards.forEach(function(mini, i) {
    var svc = services[i] || values[i];
    if (!svc) return;
    var h3 = mini.querySelector('h3');
    var p = mini.querySelector('p');
    setText(h3, svc.name);
    setText(p, svc.desc);
  });

  /* ── 리프팅 클리닉 / 05-lifting-clinic ── */
  var headerLogo = q('.logo');
  if (headerLogo && headerLogo.textContent) {
    var logoText = headerLogo.childNodes;
    logoText.forEach(function(node) {
      if (node.nodeType === 3 && node.textContent && node.textContent.trim()) {
        node.textContent = brand.name;
      }
    });
  }

  /* ── 블로그 템플릿 공통 ── */
  var blogTitle = q('.blog-title, .site-title, .brand-name');
  setText(blogTitle, brand.name);

})();
</script>`;
}

/**
 * 템플릿 HTML을 가져와서 Contract JSON 데이터를 주입한 HTML 문자열 반환.
 *
 * @param contract  Contract JSON
 * @param templateId  선택된 템플릿 ID (e.g. "01-clinic-landing")
 * @param structure  선택된 구조 (e.g. "landing", "multi", "store")
 * @returns  srcdoc에 사용할 수 있는 완성된 HTML 문자열
 */
export async function renderTemplate(
  contract: ContractJson,
  templateId: string | null | undefined,
  structure: string | null | undefined,
): Promise<string> {
  // 템플릿 경로 결정
  const path =
    (templateId && TEMPLATE_PATHS[templateId]) ||
    (structure && DEFAULT_TEMPLATE_BY_STRUCTURE[structure]) ||
    "/templates/landing/01-clinic-landing.html";

  let html: string;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    // 가져오기 실패 시 기본 fallback
    html = `<!DOCTYPE html><html><body><p style="padding:2rem;color:#999">템플릿을 불러올 수 없습니다 (${path})</p></body></html>`;
  }

  // </body> 직전에 주입 스크립트 삽입
  const injectionScript = buildInjectionScript(contract);
  return html.replace(/<\/body>/i, `${injectionScript}\n</body>`);
}
