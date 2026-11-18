// raw/<날짜>/ 수집 원본 → snapshots/<날짜>.json 정리
// 사용: node parse.mjs <rawDir> [--date YYYY-MM-DD] [--out snapshots/<날짜>.json]
// 데이터 출처 (2026-11-18 확인):
//   유독  : udok-all.xhr.json 의 display-prod-list (상품), udok.xhr.json 의 banner-list (배너/프로모션)
//   T우주 : tuniverse-all.xhr.json 의 getCtgSearch 페이지들 (상품), tuniverse-event.xhr.json 의 getEventList (이벤트)
//   KT    : ktsub.html 의 li[data-ottprodid] 카드 (상품). 이벤트 데이터 출처는 아직 없음
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = process.argv.slice(2);
const rawDir = path.resolve(args[0] ?? '');
const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
const date = opt('--date') ?? path.basename(rawDir);
const outFile = path.resolve(opt('--out') ?? path.join(root, 'snapshots', `${date}.json`));

const readJson = async f => JSON.parse(await fs.readFile(path.join(rawDir, f), 'utf8'));
const log = await readJson('_fetch-log.json').catch(() => []);
const logOf = id => log.find(r => r.target === id) ?? {};
const num = v => (v === null || v === undefined || v === '' ? null : Number(String(v).replace(/[^0-9.-]/g, '')));
const ymd = s => (s && /^\d{8}/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null);
const decode = s => (s == null ? s : String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&trade;/g, '™').replace(/&reg;/g, '®').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)));
export const norm = s => String(s ?? '').toLowerCase().replace(/[\s()\[\]{}·・,.+&/_\-⁺]/g, '');

async function xhr(file, match) {
  const list = await readJson(file);
  return list.filter(r => r.url.includes(match)).map(r => { try { return JSON.parse(r.body); } catch { return null; } }).filter(Boolean);
}
function siteFail(id, url, e) {
  return { status: 'failed', url, fetchedAt: logOf(id).fetchedAt ?? null, error: String(e?.message ?? e).slice(0, 300), products: [], events: [] };
}

// ---------- 유독 ----------
async function udok() {
  const L = logOf('udok-all');
  const url = 'https://www.lguplus.com/pogg/category/전체';
  if (!L.ok) return siteFail('udok-all', url, L.error ?? '수집 로그 없음');
  const [data] = await xhr('udok-all.xhr.json', 'display-prod-list');
  const rows = data?.sppsFoDtoList ?? [];
  const products = rows.map(p => {
    const name = p.mainDispProdNm || p.prodNm || p.dispProdNm;
    // 화면 가격 = 프로모션 중이면 pmtnAmt, 아니면 dispDcntPrcInfo (2026-11-18 화면 대조로 확인)
    const promoOn = p.pmtnYn === 'Y' && num(p.pmtnAmt) > 0;
    const regular = num(p.normPrcInfo), sale = promoOn ? num(p.pmtnAmt) : num(p.dispDcntPrcInfo);
    const tags = [p.tagNm1, p.tagNm2, p.tagNm3].filter(Boolean);
    const promotions = [];
    if (p.pmtnYn === 'Y') promotions.push({ title: `${p.pmtnTerm ? `${p.pmtnTerm}개월 ` : ''}할인 프로모션`, period: `${ymd(p.pmtnStrtDttm) ?? ''}~${p.pmtnEndDttm?.startsWith('9999') ? '상시' : ymd(p.pmtnEndDttm) ?? ''}`, text: `프로모션가 월 ${num(p.pmtnAmt)}원 (프로모션 전 할인가 월 ${num(p.dispDcntPrcInfo)}원)` });
    if (p.agmtPlcyTerm > 0) promotions.push({ title: `${p.agmtPlcyTerm}개월 할인 프로모션`, period: null, text: p.agmtPlcyDcntAmt ? `약정 할인 ${p.agmtPlcyDcntAmt}원` : null });
    const detail = p.detlUrlPc ? new URL(p.detlUrlPc, 'https://www.lguplus.com').href : url;
    return {
      key: `udok:${p.dispProdNo}`, id: p.dispProdNo, partner: p.jncoNm ?? null, name, desc: p.oneLinCopy ?? null,
      category: p.baseCatgNm ?? null, tags,
      price: { regular, sale, unit: '월', discountRate: regular && sale && regular > sale ? Math.round((1 - sale / regular) * 100) : 0 },
      promotions, url: detail,
    };
  });
  let events = [];
  try {
    const [b] = await xhr('udok.xhr.json', 'banner-list');
    events = (b?.bnnrBasList ?? []).flatMap(g => g.bnnrLst ?? []).map(x => ({
      key: `udok:bnnr${x.bnnrNo}`, title: x.bnnrTit, period: [ymd(x.dispStrtDttm), x.dispEndDttm?.startsWith('9999') ? '상시' : ymd(x.dispEndDttm)].join('~'),
      url: x.pcBnnrLinkUrl ? new URL(x.pcBnnrLinkUrl, 'https://www.lguplus.com').href : null, kind: '배너',
    }));
  } catch {}
  return { status: products.length ? 'ok' : 'failed', error: products.length ? undefined : '상품 0개', url, fetchedAt: L.fetchedAt, products, events };
}

// ---------- T우주 ----------
async function tuniverse() {
  const L = logOf('tuniverse-all');
  const url = 'https://m.sktuniverse.co.kr/category/sub/tab/detail?ctanId=CC00000012&ctgId=CA00000001';
  if (!L.ok) return siteFail('tuniverse-all', url, L.error ?? '수집 로그 없음');
  const pages = (await xhr('tuniverse-all.xhr.json', 'getCtgSearch')).map(j => j.data).filter(Boolean);
  const total = pages[0]?.total_count ?? null;
  const seen = new Map();
  for (const p of pages.flatMap(d => d.products ?? [])) if (!seen.has(p.prdId)) seen.set(p.prdId, p);
  const products = [...seen.values()].map(p => {
    const sale = num(p.prdSprcAmt), regular = num(p.prdFprcAmt) ?? (Number(p.dcRate) > 0 ? null : sale);
    const promotions = [];
    if (p.fstScbDcYn === 'Y') promotions.push({ title: '첫 구독 할인', text: p.fstScbDcPrc ? `첫 구독가 ${p.fstScbDcPrc}원` : null });
    if (p.plusDcYn === 'Y') promotions.push({ title: '플러스 할인', text: p.plusDcPrc ? `플러스 할인가 ${p.plusDcPrc}원` : null });
    if (p.dcTypNm) promotions.push({ title: p.dcTypNm, text: null });
    return {
      key: `tuniverse:${p.prdId}`, id: p.prdId, partner: decode(p.brndNm) ?? null, name: decode(p.prdNm), desc: decode(p.bnfDesc) ?? null,
      category: null, tags: p.badgeLst ?? [],
      price: { regular, sale, unit: p.trmNm ?? null, discountRate: Number(p.dcRate) || 0, from: p.prcTildeYn === '~' },
      promotions, url: `https://m.sktuniverse.co.kr/product/detail?prdId=${p.prdId}`,
    };
  });
  let events = [];
  try {
    const [e] = await xhr('tuniverse-event.xhr.json', 'getEventList');
    // 종료일이 스냅샷 날짜보다 앞선 이벤트는 '진행 중'에서 제외 (S07=종료로 보임, 가정)
    events = (e?.data?.list ?? []).filter(x => !ymd(x.evtEndDtm) || ymd(x.evtEndDtm) >= date).map(x => ({
      key: `tuniverse:evt${x.evtId}`, title: decode(x.evtTtlNm).replace(/<br\s*\/?>/gi, ' '), subtitle: decode(x.evtSttlNm) ?? null,
      period: `${ymd(x.evtStaDtm)}~${ymd(x.evtEndDtm)}`, end: ymd(x.evtEndDtm), statusCode: x.evtStCd,
      url: `https://m.sktuniverse.co.kr/etc/event/detail?evtId=${x.evtId}`, kind: '이벤트',
    }));
  } catch {}
  const warn = total && products.length < total ? `목록 ${products.length}/${total}개만 수집` : undefined;
  return { status: products.length ? 'ok' : 'failed', error: products.length ? undefined : '상품 0개', warning: warn, totalOnPage: total, url, fetchedAt: L.fetchedAt, products, events };
}

// ---------- KT ----------
async function ktsub() {
  const L = logOf('ktsub');
  const url = 'https://my.kt.com/product/OttSubscribeView.do';
  if (!L.ok) return siteFail('ktsub', url, L.error ?? '수집 로그 없음');
  const html = await fs.readFile(path.join(rawDir, 'ktsub.html'), 'utf8');
  const strip = s => s.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const attr = (tag, a) => (tag.match(new RegExp(`${a}="([^"]*)"`)) ?? [])[1] ?? null;
  const blocks = html.split(/(?=<li[^>]*data-ottprodid=)/).slice(1).map(b => b.slice(0, b.indexOf('</li>') + 5));
  const seen = new Map();
  for (const b of blocks) {
    const tag = b.slice(0, b.indexOf('>') + 1);
    const id = attr(tag, 'data-ottprodid');
    if (seen.has(id)) continue; // 슬라이드 복제 카드 제거
    const name = (decode(attr(tag, 'data-ottprodnm')) ?? strip((b.match(/class="opage-name"[^>]*>([\s\S]*?)<\/strong>/) ?? [])[1] ?? '')).trim();
    // 가격 문구에서 금액을 따로 뽑는다. '월 7,000원 ~ 월 17,000원' 같은 범위는 최저가 + from 표시
    const amounts = s => [...strip(s ?? '').matchAll(/[0-9][0-9,]*/g)].map(m => num(m[0])).filter(n => n > 0);
    const regA = amounts((b.match(/class="opage-price"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1]);
    const saleA = amounts((b.match(/class="opage-discount-price"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1]);
    const regular = regA.length ? Math.max(...regA) : null;
    const sale = saleA.length ? Math.min(...saleA) : null;
    const from = saleA.length > 1 || regA.length > 1;
    const badges = [...b.matchAll(/class="item[^"]*"[^>]*>([\s\S]*?)<\/strong>/g)].map(m => strip(m[1]));
    const promos = badges.filter(x => /할인|프로모션|무료|혜택/.test(x));
    seen.set(id, {
      key: `ktsub:${id}`, id, partner: attr(tag, 'data-ottprodctg'), name, desc: attr(tag, 'data-ottprodnmwdic'),
      category: null, tags: badges.filter(x => !promos.includes(x)),
      price: { regular: regular ?? null, sale: sale ?? regular, unit: '월', discountRate: regular && sale && regular > sale ? Math.round((1 - sale / regular) * 100) : 0, from },
      promotions: promos.map(t => ({ title: t, text: null })), url: attr(tag, 'data-wdiclinkpcurl') ?? url,
    });
  }
  const products = [...seen.values()];
  return { status: products.length ? 'ok' : 'failed', error: products.length ? undefined : '상품 0개', url, fetchedAt: L.fetchedAt, products, events: [], note: 'KT 이벤트 출처 미정 (이벤트 비교 안 함)' };
}

const sites = {};
for (const [id, fn] of Object.entries({ udok, tuniverse, ktsub })) {
  try { sites[id] = await fn(); } catch (e) { sites[id] = siteFail(id, null, e); }
}
const snap = { date, createdAt: new Date().toISOString(), rawDir: path.relative(root, rawDir).replace(/\\/g, '/'), sites };
await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(outFile, JSON.stringify(snap, null, 1), 'utf8');
console.log(JSON.stringify({ outFile, summary: Object.fromEntries(Object.entries(sites).map(([k, v]) => [k, { status: v.status, products: v.products.length, events: v.events.length, warning: v.warning, error: v.error }])) }, null, 1));

