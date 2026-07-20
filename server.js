const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const querystring = require('node:querystring');

const ROOT = __dirname;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const apiHandlers = {
  '/api/meta-webhook': require('./api/meta-webhook'),
  '/api/create-mercadopago-checkout': require('./api/create-mercadopago-checkout'),
  '/api/mercadopago-webhook': require('./api/mercadopago-webhook'),
  '/api/payment-status': require('./api/payment-status'),
  '/api/available-slots': require('./api/available-slots'),
  '/api/appointment-action-notify': require('./api/appointment-action-notify'),
  '/api/send-reminders': require('./api/send-reminders')
};

function enhanceResponse(res) {
  res.status = function status(code) {
    res.statusCode = code;
    return res;
  };

  res.json = function json(payload) {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
    return res;
  };

  res.send = function send(payload) {
    if (Buffer.isBuffer(payload)) {
      res.end(payload);
      return res;
    }
    if (typeof payload === 'object' && payload !== null) return res.json(payload);
    res.end(payload == null ? '' : String(payload));
    return res;
  };

  return res;
}

async function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Corpo da requisição muito grande.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();

  if (contentType === 'application/json') {
    try {
      return JSON.parse(raw);
    } catch {
      const error = new Error('JSON inválido.');
      error.statusCode = 400;
      throw error;
    }
  }

  if (contentType === 'application/x-www-form-urlencoded') return querystring.parse(raw);
  return raw;
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
  })[ext] || 'application/octet-stream';
}

function serveStatic(req, res, pathname) {
  let requested = pathname === '/' ? '/index.html' : pathname;
  try {
    requested = decodeURIComponent(requested);
  } catch {
    res.statusCode = 400;
    return res.end('Requisição inválida.');
  }

  const filePath = path.resolve(ROOT, `.${requested}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) && filePath !== ROOT) {
    res.statusCode = 403;
    return res.end('Acesso negado.');
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('404: NOT_FOUND');
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', mimeType(filePath));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, rawRes) => {
  const res = enhanceResponse(rawRes);
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : url.pathname;

  req.query = Object.fromEntries(url.searchParams.entries());

  const handler = apiHandlers[pathname];
  if (handler) {
    try {
      req.body = await readBody(req);
      return await handler(req, res);
    } catch (error) {
      console.error(`Erro na rota ${pathname}:`, error);
      if (!res.headersSent) {
        return res.status(error.statusCode || 500).json({
          error: error.statusCode ? error.message : 'Erro interno do servidor.'
        });
      }
      return res.end();
    }
  }

  if (pathname.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota de API não encontrada.' });
  }

  return serveStatic(req, res, url.pathname);
});

server.listen(Number(process.env.PORT || 3000));
