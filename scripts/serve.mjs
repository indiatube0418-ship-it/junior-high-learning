import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const outDir = path.resolve(process.cwd(), 'out');

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);

    // 剝除 basePath
    if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
      pathname = pathname.slice(BASE_PATH.length);
    }

    const safePath = pathname.slice(1);
    let filePath = path.join(outDir, safePath);
    filePath = path.resolve(filePath);

    // 防止路徑穿越
    if (path.relative(outDir, filePath).startsWith('..')) {
      serve404(res);
      return;
    }

    let stats;
    try {
      stats = await fs.promises.stat(filePath);
    } catch {
      stats = null;
    }

    if (stats?.isFile()) {
      serveFile(filePath, res);
      return;
    }

    if (stats?.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      const indexResolved = path.resolve(indexPath);
      if (!path.relative(outDir, indexResolved).startsWith('..')) {
        try {
          const indexStats = await fs.promises.stat(indexPath);
          if (indexStats.isFile()) {
            serveFile(indexPath, res);
            return;
          }
        } catch {}
      }
      serve404(res);
      return;
    }

    // 若無副檔名，試加 .html
    if (!path.extname(safePath)) {
      const htmlCandidate = safePath + '.html';
      const htmlPath = path.join(outDir, htmlCandidate);
      const htmlResolved = path.resolve(htmlPath);
      if (!path.relative(outDir, htmlResolved).startsWith('..')) {
        try {
          const htmlStats = await fs.promises.stat(htmlPath);
          if (htmlStats.isFile()) {
            serveFile(htmlPath, res);
            return;
          }
        } catch {}
      }
    }

    serve404(res);
  } catch (err) {
    console.error(err);
    serve404(res);
  }
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

async function serve404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  const notFoundPath = path.join(outDir, '404.html');
  try {
    const stats = await fs.promises.stat(notFoundPath);
    if (stats.isFile()) {
      const ext = path.extname(notFoundPath);
      res.setHeader('Content-Type', mimeTypes[ext] || 'text/html; charset=utf-8');
      fs.createReadStream(notFoundPath).pipe(res);
      return;
    }
  } catch {}
  res.end('<h1>404 - 找不到頁面</h1>');
}

server.listen(PORT, () => {
  console.log(`靜態伺服器運行於 http://localhost:${PORT}`);
});
