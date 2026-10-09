// 사이트 점검 (파일을 고치지 않습니다)
//
//   npm run check
//
// 커밋 · push 전에 실행해 아래 오류를 미리 잡습니다. 오류가 있으면 종료 코드 1.
//   1. JS 문법      : 루트의 *.js, tools/*.mjs (예: 데이터 배열의 쉼표 누락)
//   2. 페이지 스크립트: 각 HTML 안의 컴포넌트 스크립트(data-dc-script), JSON-LD
//   3. 파일 경로    : src · href · url() · import() · <dc-import>, 데이터 파일의 이미지 이름
//                     대소문자까지 비교합니다 (Windows 에서는 열려도 Vercel 에서는 404)
//   4. 칼럼 페이지  : columns-data.js 의 글마다 column-<slug>.html 이 있는지
//   5. 설정 파일    : vercel.json 문법, sitemap.xml 주소

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const errors = [];
const fail = (where, msg) => errors.push(`${where}  ${msg}`);
const results = [];

const rootFiles = fs.readdirSync(ROOT).filter((f) => fs.statSync(path.join(ROOT, f)).isFile());
const htmlFiles = rootFiles.filter((f) => f.endsWith('.html')).sort();
const jsFiles = rootFiles.filter((f) => f.endsWith('.js')).sort();
const toolFiles = fs.readdirSync(path.join(ROOT, 'tools')).filter((f) => f.endsWith('.mjs')).map((f) => 'tools/' + f);

// ---------------------------------------------------------------- 1. JS 문법

const isModule = (src) => /^\s*(import|export)\s/m.test(src);

// 실행하지 않고 문법만 확인합니다
function checkModuleSyntax(file, src) {
  const r = spawnSync(process.execPath, ['--check', '--input-type=module', '-'], { input: src, encoding: 'utf8' });
  if (r.status === 0) return;
  const lines = (r.stderr || '').split(/\r?\n/);
  const at = lines.find((l) => /^\[stdin\]:\d+/.test(l)) || '';
  const msg = lines.find((l) => /^\w*Error:/.test(l)) || 'SyntaxError';
  fail(file + (at ? ':' + at.split(':')[1] : ''), msg.trim());
}

function checkScriptSyntax(file, src) {
  try {
    new vm.Script(src, { filename: file });
  } catch (e) {
    const at = /:(\d+)\s*$/m.exec(e.stack.split('\n')[0]);
    fail(file + (at ? ':' + at[1] : ''), `${e.name}: ${e.message}`);
  }
}

for (const f of [...jsFiles, ...toolFiles]) {
  const src = read(f);
  if (f.endsWith('.mjs') || isModule(src)) checkModuleSyntax(f, src);
  else checkScriptSyntax(f, src);
}
results.push(`JS 문법            ${jsFiles.length + toolFiles.length}개 파일`);

// ---------------------------------------------------------------- 2. 페이지 스크립트

let inlineCount = 0;
for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attrs, body] = m;
    if (/\bsrc\s*=/.test(attrs)) continue;
    const where = `${f}:${lineOf(html, m.index)}`;
    inlineCount++;
    if (/data-dc-script/.test(attrs)) {
      // support.js 의 evalDcLogic 과 같은 방식으로 컴파일만 합니다
      try {
        new Function('DCLogic', 'StreamableLogic', 'React', body + '\n;return (typeof Component!=="undefined"&&Component)||undefined;');
      } catch (e) {
        fail(where, `컴포넌트 스크립트 ${e.name}: ${e.message}`);
      }
    } else if (/application\/ld\+json/.test(attrs)) {
      try {
        JSON.parse(body);
      } catch (e) {
        fail(where, `JSON-LD ${e.message}`);
      }
    } else if (!/\btype\s*=/.test(attrs) || /text\/javascript/.test(attrs)) {
      checkScriptSyntax(where, body);
    } else if (/type\s*=\s*["']module["']/.test(attrs)) {
      checkModuleSyntax(where, body);
    } else {
      inlineCount--;
    }
  }
}
results.push(`페이지 스크립트    ${inlineCount}개`);

// ---------------------------------------------------------------- 3. 파일 경로

// 대소문자까지 정확히 일치하는 파일이 있는지 (Vercel 은 대소문자를 구분합니다)
const dirCache = new Map();
function existsExact(rel) {
  let dir = ROOT;
  const parts = rel.split('/').filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    if (!dirCache.has(dir)) {
      try {
        dirCache.set(dir, new Set(fs.readdirSync(dir)));
      } catch {
        dirCache.set(dir, new Set());
      }
    }
    if (!dirCache.get(dir).has(parts[i])) return false;
    dir = path.join(dir, parts[i]);
  }
  return parts.length === 0 || fs.statSync(dir).isFile();
}

// cleanUrls 포함: /about → about.html, / → index.html
function resolveRef(rel) {
  const clean = rel.replace(/^\.?\//, '');
  if (clean === '' || clean.endsWith('/')) return existsExact(clean + 'index.html');
  return existsExact(clean) || (!path.posix.extname(clean) && existsExact(clean + '.html'));
}

const SKIP = /^(#|https?:|\/\/|mailto:|tel:|sms:|data:|javascript:|blob:)/i;
let refCount = 0;
function checkRef(where, raw, { bareImage = false } = {}) {
  let ref = raw.trim();
  if (!ref || SKIP.test(ref) || ref.includes('{{') || ref.includes('${')) return;
  ref = ref.split(/[?#]/)[0];
  try {
    ref = decodeURI(ref);
  } catch {}
  if (bareImage && !ref.includes('/')) ref = 'images/' + ref;
  refCount++;
  if (!resolveRef(ref)) {
    const lower = ref.replace(/^\.?\//, '').toLowerCase();
    const near = rootFiles.concat(fs.readdirSync(path.join(ROOT, 'images')).map((f) => 'images/' + f)).find((f) => f.toLowerCase() === lower);
    fail(where, near ? `"${raw}" 대소문자 불일치 → 실제 파일 "${near}"` : `"${raw}" 파일 없음`);
  }
}

for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/\s(?:src|href|poster)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    checkRef(`${f}:${lineOf(html, m.index)}`, m[1] ?? m[2]);
  }
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
    checkRef(`${f}:${lineOf(html, m.index)}`, m[1]);
  }
  for (const m of html.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    checkRef(`${f}:${lineOf(html, m.index)}`, m[1]);
  }
  for (const m of html.matchAll(/<dc-import\b[^>]*\bname\s*=\s*"([^"]+)"/gi)) {
    checkRef(`${f}:${lineOf(html, m.index)}`, m[1] + '.dc.html');
  }
}

// import() 로 읽는 데이터 파일 안의 이미지 이름 ('ba-naso-before.jpg' → images/ba-naso-before.jpg)
const dataFiles = jsFiles.filter((f) => isModule(read(f)));
for (const f of dataFiles) {
  const src = read(f);
  for (const m of src.matchAll(/['"`]([^'"`\s]+\.(?:jpe?g|png|svg|webp|gif|mp4))['"`]/gi)) {
    checkRef(`${f}:${lineOf(src, m.index)}`, m[1], { bareImage: true });
  }
}
results.push(`파일 경로          ${refCount}개 참조`);

// ---------------------------------------------------------------- 4. 칼럼 페이지

if (rootFiles.includes('columns-data.js')) {
  try {
    const { POSTS } = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(read('columns-data.js')));
    const slugs = new Set();
    for (const p of POSTS) {
      if (slugs.has(p.slug)) fail('columns-data.js', `slug "${p.slug}" 중복`);
      slugs.add(p.slug);
      if (!/^[a-z0-9-]+$/.test(p.slug)) fail('columns-data.js', `slug "${p.slug}" 는 영문 소문자 · 숫자 · 하이픈만 쓸 수 있습니다`);
      if (!rootFiles.includes(`column-${p.slug}.html`)) {
        fail('columns-data.js', `column-${p.slug}.html 없음 → npm run columns 실행 필요`);
      }
    }
    for (const f of htmlFiles.filter((f) => /^column-.+\.html$/.test(f))) {
      if (!slugs.has(f.slice(7, -5)) && read(f).includes('generated by tools/build-columns.mjs')) {
        fail(f, 'columns-data.js 에 없는 글 → npm run columns 실행 필요');
      }
    }
    results.push(`칼럼 페이지        ${POSTS.length}편`);
  } catch (e) {
    fail('columns-data.js', `불러오기 실패: ${e.message}`);
  }
}

// ---------------------------------------------------------------- 5. 설정 파일

try {
  JSON.parse(read('vercel.json'));
} catch (e) {
  fail('vercel.json', `JSON 문법 오류: ${e.message}`);
}
if (rootFiles.includes('sitemap.xml')) {
  const xml = read('sitemap.xml');
  for (const m of xml.matchAll(/<loc>\s*https?:\/\/[^/<]+(\/[^<]*?)\s*<\/loc>/g)) {
    if (!resolveRef(decodeURI(m[1]))) fail(`sitemap.xml:${lineOf(xml, m.index)}`, `"${m[1]}" 에 해당하는 페이지 없음`);
  }
}
results.push('설정 파일          vercel.json, sitemap.xml');

// ---------------------------------------------------------------- 결과

console.log('\n  ALL DETAIL CLINIC check\n');
for (const r of results) console.log('  - ' + r);
if (errors.length) {
  console.log(`\n  오류 ${errors.length}건\n`);
  for (const e of errors) console.log('  x ' + e);
  console.log('');
  process.exit(1);
}
console.log('\n  오류 없음\n');
