// 두 스냅샷 비교 → 변경 목록 JSON 출력
// 사용: node diff.mjs [오늘 스냅샷 경로]   (이전 스냅샷은 snapshots/에서 오늘보다 앞선 가장 최근 파일)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const snapDir = path.resolve(here, '..', 'snapshots');
const files = (await fs.readdir(snapDir)).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
const curFile = path.resolve(process.argv[2] ?? path.join(snapDir, files.at(-1)));
const curDate = path.basename(curFile, '.json');
const prevName = files.filter(f => f.slice(0, 10) < curDate).at(-1);
const cur = JSON.parse(await fs.readFile(curFile, 'utf8'));
if (!prevName) {
  console.log(JSON.stringify({ current: curDate, previous: null, firstSnapshot: true }, null, 1));
  process.exit(0);
}
const prev = JSON.parse(await fs.readFile(path.join(snapDir, prevName), 'utf8'));

const priceStr = p => p ? `${p.sale ?? '?'}원${p.regular && p.regular !== p.sale ? `(정가 ${p.regular})` : ''}${p.from ? '~' : ''}/${p.unit ?? ''}` : null;
const promoStr = arr => (arr ?? []).map(x => [x.title, x.period, x.text].filter(Boolean).join(' ')).sort().join(' | ');

const out = { current: curDate, previous: prevName.slice(0, 10), sites: {} };
for (const [id, c] of Object.entries(cur.sites)) {
  const p = prev.sites?.[id];
  const r = { status: c.status, prevStatus: p?.status ?? null, counts: { prev: p?.products?.length ?? null, cur: c.products.length }, changes: [], warnings: [] };
  out.sites[id] = r;
  if (c.status !== 'ok' || !p || p.status !== 'ok') { r.skipped = '오늘 또는 이전 읽기 실패로 비교 안 함'; continue; }
  const suspicious = p.products.length > 0 && c.products.length <= p.products.length * 0.5;
  if (suspicious) r.warnings.push(`읽기 이상 의심: 상품 수 ${p.products.length} → ${c.products.length}`);
  const pm = new Map(p.products.map(x => [x.key, x]));
  const cm = new Map(c.products.map(x => [x.key, x]));
  for (const [k, x] of cm) {
    const o = pm.get(k);
    if (!o) { r.changes.push({ type: '신규', key: k, name: x.name, partner: x.partner, now: priceStr(x.price), url: x.url }); continue; }
    if (o.name !== x.name) r.changes.push({ type: '상품명', key: k, name: x.name, before: o.name, now: x.name, url: x.url });
    if (priceStr(o.price) !== priceStr(x.price)) r.changes.push({ type: '가격', key: k, name: x.name, partner: x.partner, before: priceStr(o.price), now: priceStr(x.price), url: x.url });
    if (promoStr(o.promotions) !== promoStr(x.promotions)) r.changes.push({ type: '프로모션', key: k, name: x.name, before: promoStr(o.promotions) || '없음', now: promoStr(x.promotions) || '없음', url: x.url });
    if ((o.tags ?? []).join(',') !== (x.tags ?? []).join(',')) r.changes.push({ type: '배지', key: k, name: x.name, before: (o.tags ?? []).join(','), now: (x.tags ?? []).join(','), url: x.url });
  }
  for (const [k, o] of pm) if (!cm.has(k)) r.changes.push({ type: suspicious ? '종료(미확정)' : '종료', key: k, name: o.name, partner: o.partner, before: priceStr(o.price), url: o.url });
  const pe = new Map((p.events ?? []).map(e => [e.key, e]));
  const ce = new Map((c.events ?? []).map(e => [e.key, e]));
  for (const [k, e] of ce) if (!pe.has(k)) r.changes.push({ type: '이벤트 신규', key: k, name: e.title, now: e.period, url: e.url });
  for (const [k, e] of pe) if (!ce.has(k)) r.changes.push({ type: '이벤트 종료', key: k, name: e.title, before: e.period, url: e.url });
}
console.log(JSON.stringify(out, null, 1));
