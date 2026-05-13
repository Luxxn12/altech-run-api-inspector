const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const START_PORT = Number(process.env.API_INSPECTOR_DASHBOARD_PORT || 3939);
const HOST = process.env.API_INSPECTOR_DASHBOARD_HOST || '0.0.0.0';
const MAX_LOGS = Number(process.env.API_INSPECTOR_MAX_LOGS || 500);
const MAX_PORT_SCAN = Number(process.env.API_INSPECTOR_MAX_PORT_SCAN || 20);
const AUTO_OPEN = process.argv.includes('--no-open') ? false : true;
let currentPort = START_PORT;
let openedBrowser = false;

/** @type {any[]} */
let logs = [];
/** @type {Set<import('http').ServerResponse>} */
const clients = new Set();
let receivedCount = 0;

function sendJson(res, code, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) {
    client.write(message);
  }
}

function html() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Altech API Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.bunny.net/css?family=poppins:400,500,600,700" rel="stylesheet" />
  <style>
    :root {
      --bg: #0b1220;
      --panel: #111827;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --line: #1f2937;
      --green: #10b981;
      --blue: #3b82f6;
      --yellow: #f59e0b;
      --red: #ef4444;
    }
    * {
      box-sizing: border-box;
      font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    body {
      margin: 0;
      background: radial-gradient(circle at top right, #15223c, var(--bg) 42%);
      color: var(--text);
    }
    .wrap { max-width: 1400px; margin: 0 auto; padding: 16px; }
    h1 { font-size: 20px; margin: 0 0 12px; }
    .toolbar {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr auto auto;
      margin-bottom: 12px;
    }
    input, button, select {
      background: #0f172a;
      border: 1px solid var(--line);
      color: var(--text);
      padding: 10px 12px;
      border-radius: 10px;
      font: inherit;
    }
    button { cursor: pointer; }
    .grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 12px;
      min-height: 70vh;
    }
    .card {
      background: color-mix(in srgb, var(--panel) 94%, black);
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px;
      text-align: left;
      vertical-align: top;
      font-size: 12px;
    }
    th { color: var(--muted); font-weight: 600; position: sticky; top: 0; background: #101827; }
    .table-wrap { max-height: 72vh; overflow: auto; }
    .row { cursor: pointer; }
    .row:hover { background: #0f1b33; }
    .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 11px;
    }
    .s2 { background: #052e20; color: #34d399; }
    .s3 { background: #172554; color: #60a5fa; }
    .s4 { background: #3f2805; color: #fbbf24; }
    .s5, .serr { background: #450a0a; color: #f87171; }
    .method-pill {
      display: inline-block;
      min-width: 62px;
      text-align: center;
      padding: 2px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 11px;
      border: 1px solid transparent;
      letter-spacing: 0.2px;
    }
    .m-get { background: #052e20; color: #34d399; border-color: #14532d; }
    .m-post { background: #172554; color: #93c5fd; border-color: #1d4ed8; }
    .m-put { background: #3f2805; color: #fbbf24; border-color: #b45309; }
    .m-patch { background: #312e81; color: #c4b5fd; border-color: #4f46e5; }
    .m-delete { background: #450a0a; color: #fca5a5; border-color: #dc2626; }
    .m-options { background: #0f172a; color: #67e8f9; border-color: #0891b2; }
    .m-head { background: #111827; color: #d1d5db; border-color: #374151; }
    .m-other { background: #111827; color: #e5e7eb; border-color: #374151; }
    .muted { color: var(--muted); }
    .detail { padding: 12px; max-height: 72vh; overflow: auto; }
    .detail h3 { margin: 0 0 8px; font-size: 15px; }
    .detail h4 { margin: 0; font-size: 13px; font-weight: 600; }
    .detail-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .method-url { word-break: break-all; }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin: 14px 0 6px;
    }
    .copy-btn {
      border: 1px solid #29416f;
      background: #132546;
      color: #bfdbfe;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }
    .copy-btn:hover {
      background: #17305d;
    }
    pre {
      margin: 8px 0 12px;
      background: #0b1220;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 11px;
      line-height: 1.45;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .json-key { color: #93c5fd; }
    .json-string { color: #86efac; }
    .json-number { color: #fca5a5; }
    .json-boolean { color: #fcd34d; }
    .json-null { color: #c4b5fd; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Altech API Dashboard</h1>
    <div class="toolbar">
      <input id="search" placeholder="Search URL..." />
      <select id="status">
        <option value="ALL">ALL</option>
        <option value="2xx">2xx</option>
        <option value="3xx">3xx</option>
        <option value="4xx">4xx</option>
        <option value="5xx">5xx</option>
        <option value="ERROR">ERROR</option>
      </select>
      <button id="clear">Clear</button>
    </div>
    <div class="grid">
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Status</th>
              <th>Duration</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
      <div class="card detail" id="detail">
        <div class="muted">Select a row to view details.</div>
      </div>
    </div>
  </div>

<script>
let logs = [];
let selectedId = null;
const tbody = document.getElementById('tbody');
const detail = document.getElementById('detail');
const search = document.getElementById('search');
const status = document.getElementById('status');
const clearBtn = document.getElementById('clear');

function statusGroup(log) {
  if (log.error) return 'ERROR';
  const s = log.status || 0;
  if (s >= 200 && s < 300) return '2xx';
  if (s >= 300 && s < 400) return '3xx';
  if (s >= 400 && s < 500) return '4xx';
  if (s >= 500) return '5xx';
  return 'ALL';
}

function statusClass(log) {
  const g = statusGroup(log);
  return g === '2xx' ? 's2' : g === '3xx' ? 's3' : g === '4xx' ? 's4' : g === '5xx' ? 's5' : g === 'ERROR' ? 'serr' : '';
}

function methodClass(method) {
  const m = String(method || '').toUpperCase();
  if (m === 'GET') return 'm-get';
  if (m === 'POST') return 'm-post';
  if (m === 'PUT') return 'm-put';
  if (m === 'PATCH') return 'm-patch';
  if (m === 'DELETE') return 'm-delete';
  if (m === 'OPTIONS') return 'm-options';
  if (m === 'HEAD') return 'm-head';
  return 'm-other';
}

function esc(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function pretty(v) {
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

function syntaxHighlightJson(value) {
  const json = esc(pretty(value));
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\\s*:)?|\\btrue\\b|\\bfalse\\b|\\bnull\\b|-?\\d+(?:\\.\\d+)?(?:[eE][+\\-]?\\d+)?)/g,
    function (match) {
      let cls = 'json-number';
      if (match.startsWith('"')) {
        cls = /:\\s*$/.test(match) ? 'json-key' : 'json-string';
      } else if (match === 'true' || match === 'false') {
        cls = 'json-boolean';
      } else if (match === 'null') {
        cls = 'json-null';
      }

      return '<span class="' + cls + '">' + match + '</span>';
    },
  );
}

function detailSection(title, copyKey, value) {
  return [
    '<div class="section-head">',
    '<h4>' + esc(title) + '</h4>',
    '<button class="copy-btn" data-copy="' + esc(copyKey) + '">Copy</button>',
    '</div>',
    '<pre>' + syntaxHighlightJson(value) + '</pre>',
  ].join('');
}

async function copyText(value, btn) {
  const text = pretty(value);

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', 'true');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    fallbackCopy();
  }

  if (btn) {
    const prev = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => {
      btn.textContent = prev;
    }, 1000);
  }
}

function filtered() {
  const q = search.value.trim().toLowerCase();
  const f = status.value;
  return logs.filter((log) => {
    const matchUrl = String(log.url || '').toLowerCase().includes(q);
    if (!matchUrl) return false;
    if (f === 'ALL') return true;
    return statusGroup(log) === f;
  });
}

function renderTable() {
  const rows = filtered();
  tbody.innerHTML = rows.map((log) => {
    const method = String(log.method || '-').toUpperCase();
    return '<tr class="row" data-id="' + esc(log.id) + '">' +
      '<td class="muted">' + esc(new Date(log.timestamp).toLocaleTimeString()) + '</td>' +
      '<td><span class="method-pill ' + methodClass(method) + '">' + esc(method) + '</span></td>' +
      '<td><span class="pill ' + statusClass(log) + '">' + esc(log.error ? 'ERR' : (log.status ?? 'N/A')) + '</span></td>' +
      '<td>' + esc((log.duration ?? 0) + 'ms') + '</td>' +
      '<td>' + esc(log.url || '-') + '</td>' +
    '</tr>';
  }).join('');

  for (const row of tbody.querySelectorAll('.row')) {
    row.addEventListener('click', () => {
      selectedId = row.getAttribute('data-id');
      renderDetail();
    });
  }
}

function renderDetail() {
  const log = logs.find((x) => x.id === selectedId);
  if (!log) {
    detail.innerHTML = '<div class="muted">Select a row to view details.</div>';
    return;
  }
  const method = String(log.method || '-').toUpperCase();

  detail.innerHTML = [
    '<h3 class="detail-title"><span class="method-pill ' + methodClass(method) + '">' + esc(method) + '</span><span class="method-url">' + esc(log.url || '-') + '</span></h3>',
    '<div class="muted">Status: ' + esc(log.error ? 'ERR' : (log.status ?? 'N/A')) + ' • Duration: ' + esc((log.duration ?? 0) + 'ms') + '</div>',
    log.error ? detailSection('Error', 'error', { message: log.error }) : '',
    detailSection('Request Headers', 'requestHeaders', log.requestHeaders ?? {}),
    detailSection('Request Body', 'requestBody', log.requestBody ?? null),
    detailSection('Response Headers', 'responseHeaders', log.responseHeaders ?? {}),
    detailSection('Response Body', 'responseBody', log.responseBody ?? null),
  ].join('');
}

detail.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const btn = target.closest('[data-copy]');
  if (!btn) return;

  const copyKey = btn.getAttribute('data-copy');
  const log = logs.find((x) => x.id === selectedId);
  if (!copyKey || !log) return;

  const valueMap = {
    error: { message: log.error ?? '' },
    requestHeaders: log.requestHeaders ?? {},
    requestBody: log.requestBody ?? null,
    responseHeaders: log.responseHeaders ?? {},
    responseBody: log.responseBody ?? null,
  };

  copyText(valueMap[copyKey], btn).catch(() => undefined);
});

async function loadInitial() {
  const res = await fetch('/logs');
  logs = await res.json();
  renderTable();
  renderDetail();
}

search.addEventListener('input', renderTable);
status.addEventListener('change', renderTable);
clearBtn.addEventListener('click', async () => {
  await fetch('/logs', { method: 'DELETE' });
});

const es = new EventSource('/events');
es.addEventListener('append', (evt) => {
  const log = JSON.parse(evt.data);
  logs = [log, ...logs].slice(0, 500);
  renderTable();
  if (selectedId === log.id) renderDetail();
});
es.addEventListener('clear', () => {
  logs = [];
  selectedId = null;
  renderTable();
  renderDetail();
});

loadInitial().catch((e) => {
  detail.innerHTML = '<pre>' + esc(String(e)) + '</pre>';
});
</script>
</body>
</html>`;
}

function tryOpenBrowser(url) {
  const command =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  exec(command, (error) => {
    if (error) {
      console.log(`[dashboard] Open browser failed. Open manually: ${url}`);
    }
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/') {
    const body = html();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/logs') {
    sendJson(res, 200, logs);
    return;
  }

  if (req.method === 'DELETE' && url.pathname === '/logs') {
    logs = [];
    broadcast('clear', {});
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/logs') {
    try {
      const rawBody = await readBody(req);
      const log = JSON.parse(rawBody);
      logs = [log, ...logs].slice(0, MAX_LOGS);
      receivedCount += 1;
      if (receivedCount <= 5 || receivedCount % 25 === 0) {
        console.log(`[dashboard] received #${receivedCount} ${log.method || '-'} ${log.status || log.error || '-'} ${log.url || '-'}`);
      }
      broadcast('append', log);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String(error) });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('retry: 3000\n\n');
    clients.add(res);
    req.on('close', () => {
      clients.delete(res);
      res.end();
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Not found' });
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    const nextPort = currentPort + 1;
    const maxPort = START_PORT + MAX_PORT_SCAN;
    if (nextPort <= maxPort) {
      console.log(`[dashboard] Port ${currentPort} is in use. Retrying ${nextPort}...`);
      currentPort = nextPort;
      setTimeout(() => {
        server.listen(currentPort, HOST);
      }, 80);
      return;
    }
  }

  throw error;
});

server.listen(currentPort, HOST, () => {
  const localUrl = `http://localhost:${currentPort}`;
  const markerFile = path.join(process.cwd(), '.altech-api-inspector-dashboard-port');
  fs.writeFileSync(markerFile, String(currentPort), 'utf8');

  console.log(`[dashboard] running at ${localUrl}`);
  if (currentPort !== START_PORT) {
    console.log(`[dashboard] fallback from ${START_PORT} to ${currentPort}`);
  }
  console.log('[dashboard] POST logs to /logs from your app');
  if (AUTO_OPEN && !openedBrowser) {
    openedBrowser = true;
    tryOpenBrowser(localUrl);
  }
});
