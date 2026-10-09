// 로컬 개발 서버 (외부 패키지 없음)
//
//   npm run dev                 → http://localhost:3000
//   npm run dev -- --port 4000  → 포트 지정 (사용 중이면 다음 번호로 자동 이동)
//   npm run dev -- --host       → 같은 네트워크의 휴대폰 등에서 접속 허용
//
// vercel.json 과 같은 방식으로 동작합니다.
//   - cleanUrls: /about → about.html
//   - 없는 주소: 404.html (상태 코드 404)
// 점(.)으로 시작하는 경로(.git, .env 등)는 내보내지 않습니다.

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const START_PORT = Number(argValue('--port') || process.env.PORT || 3000);
const HOST = args.includes('--host') ? '0.0.0.0' : '127.0.0.1';
const MAX_PORT_TRIES = 10;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// .git, .env, .vercel 같은 점(.) 경로는 --host 로 열었을 때 노출되지 않도록 막습니다
const isDotPath = (rel) => rel.split(/[\\/]/).some((p) => p.startsWith('.'));

// 요청 경로 → 실제 파일. 루트 밖이거나 막힌 경로면 null
function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath);
  const abs = path.resolve(ROOT, '.' + path.posix.normalize('/' + rel));
  const inside = path.relative(ROOT, abs);
  if (inside.startsWith('..') || path.isAbsolute(inside) || isDotPath(inside)) return null;
  const candidates = inside === '' ? [path.join(ROOT, 'index.html')] : [abs, abs + '.html', path.join(abs, 'index.html')];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {}
  }
  return null;
}

function send(req, res, status, file) {
  const size = fs.statSync(file).size;
  const headers = {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes'
  };
  // 동영상(hero-loop.mp4) 탐색용 Range 요청
  const range = status === 200 && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(size - Number(range[2]), 0);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
  }
  res.writeHead(status, { ...headers, 'Content-Length': size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  const urlPath = (req.url || '/').split(/[?#]/)[0];
  let file;
  try {
    file = resolveFile(urlPath);
  } catch {
    res.writeHead(400);
    return res.end('Bad Request');
  }
  if (file) return send(req, res, 200, file);
  console.log(`[404] ${req.method} ${req.url}`);
  send(req, res, 404, path.join(ROOT, '404.html'));
});

let port = START_PORT;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && port < START_PORT + MAX_PORT_TRIES - 1) {
    console.log(`포트 ${port} 사용 중 → ${port + 1} 시도`);
    port += 1;
    return server.listen(port, HOST);
  }
  console.error(`서버를 시작하지 못했습니다: ${err.message}`);
  process.exit(1);
});
server.on('listening', () => {
  console.log(`\n  ALL DETAIL CLINIC dev server`);
  console.log(`  Local:   http://localhost:${port}`);
  if (HOST === '0.0.0.0') {
    for (const list of Object.values(os.networkInterfaces())) {
      for (const i of list || []) {
        if (i.family === 'IPv4' && !i.internal) console.log(`  Network: http://${i.address}:${port}`);
      }
    }
  } else {
    console.log('  Network: --host 옵션을 붙이면 같은 네트워크에서 접속할 수 있습니다');
  }
  console.log('\n  종료: Ctrl + C\n');
});
server.listen(port, HOST);

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
