// subs-watch 수집 스크립트 (읽기 전용: 클릭·로그인·입력 없음)
// 사용: node fetch.mjs <siteId|URL> [...] [--out <dir>]
// 아직 실행·검증하지 않은 초안이다 (2026-11-18 작성).
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const { sites } = JSON.parse(await fs.readFile(path.join(root, 'sites.json'), 'utf8'));

const args = process.argv.slice(2);
let outDir = null;
const targets = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') outDir = args[++i];
  else targets.push(args[i]);
}
if (!targets.length) {
  console.error('usage: node fetch.mjs <siteId|URL> [...] [--out <dir>]');
  process.exit(2);
}
outDir = path.resolve(outDir ?? path.join(root, 'raw', new Date().toISOString().slice(0, 10)));
await fs.mkdir(outDir, { recursive: true });

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

async function launch() {
  // PC에 설치된 Chrome → Edge → Playwright Chromium 순서 (2026-11-18: 이 PC에서 Edge는 자동 실행 시 바로 닫힘)
  for (const channel of ['chrome', 'msedge', undefined]) {
    try { return await chromium.launch({ channel, headless: true }); } catch {}
  }
  throw new Error('브라우저 실행 실패: Chrome/Edge/Chromium 모두 안 됨');
}

function slugOf(url) {
  const u = new URL(url);
  return (u.hostname + u.pathname + u.search).replace(/[^a-zA-Z0-9가-힣]+/g, '_').slice(0, 100);
}

// 브라우저 종료가 가끔 몇 분씩 걸려서(2026-11-18) 10초만 기다리고 넘어간다
const withTimeout = (p, ms) => Promise.race([p.catch(() => {}), new Promise(r => setTimeout(r, ms))]);
const browser = await launch();
const results = [];
for (const t of targets) {
  const site = sites.find(s => s.id === t);
  const url = site ? site.url : t;
  const mobile = site ? !!site.mobile : /\/\/m\./.test(url);
  const slug = site ? site.id : slugOf(url);
  const ctx = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, userAgent: MOBILE_UA, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul' }
    : { viewport: { width: 1366, height: 900 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  const page = await ctx.newPage();
  const pending = [];
  const jsons = [];
  page.on('response', r => {
    const ct = r.headers()['content-type'] || '';
    if (!ct.includes('json')) return;
    pending.push(r.text().then(body => {
      if (body.length < 2_000_000) jsons.push({ url: r.url(), status: r.status(), body });
    }).catch(() => {}));
  });
  const rec = { target: t, url, slug, fetchedAt: new Date().toISOString(), ok: false };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    // 무한 스크롤 목록(T우주 20개씩)을 끝까지 불러오도록, 높이가 3번 연속 그대로일 때까지 스크롤 (최대 60회)
    let lastH = 0, still = 0;
    for (let i = 0; i < 60 && still < 3; i++) {
      await page.mouse.wheel(0, 2500);
      await page.waitForTimeout(700);
      const h = await page.evaluate(() => document.body.scrollHeight);
      still = h === lastH ? still + 1 : 0;
      lastH = h;
    }
    await page.waitForTimeout(1500);
    await Promise.all(pending);
    const data = await page.evaluate(() => ({
      title: document.title,
      finalUrl: location.href,
      text: document.body.innerText,
      links: [...document.querySelectorAll('a[href]')]
        .map(a => ({ text: a.innerText.trim().replace(/\s+/g, ' ').slice(0, 120), href: a.href }))
        .filter(l => l.href && !l.href.startsWith('javascript:')),
    }));
    await fs.writeFile(path.join(outDir, `${slug}.txt`), data.text, 'utf8');
    // 숨김 카드(예: KT '더보기' 전 상품)까지 보려고 HTML 원본도 저장
    await fs.writeFile(path.join(outDir, `${slug}.html`), await page.content(), 'utf8');
    await fs.writeFile(path.join(outDir, `${slug}.links.json`), JSON.stringify(data.links, null, 1), 'utf8');
    await fs.writeFile(path.join(outDir, `${slug}.xhr.json`), JSON.stringify(jsons, null, 1), 'utf8');
    await page.screenshot({ path: path.join(outDir, `${slug}.png`), fullPage: true }).catch(() => {});
    Object.assign(rec, {
      ok: true,
      title: data.title,
      finalUrl: data.finalUrl,
      textLength: data.text.length,
      wonCount: (data.text.match(/[0-9][0-9,]*\s*원/g) || []).length,
      linkCount: data.links.length,
      xhrCount: jsons.length,
    });
  } catch (e) {
    rec.error = String(e?.message || e).slice(0, 500);
  }
  results.push(rec);
  await withTimeout(ctx.close(), 10000);
}
await withTimeout(browser.close(), 10000);
// 같은 폴더에 나눠 실행해도 로그가 덮어써지지 않도록 target 기준으로 합친다
const logFile = path.join(outDir, '_fetch-log.json');
const prevLog = JSON.parse(await fs.readFile(logFile, 'utf8').catch(() => '[]'));
const merged = [...prevLog.filter(p => !results.some(r => r.target === p.target)), ...results];
await fs.writeFile(logFile, JSON.stringify(merged, null, 1), 'utf8');
console.log(JSON.stringify({ outDir, results }, null, 1));
process.exit(results.every(r => r.ok) ? 0 : 1);
