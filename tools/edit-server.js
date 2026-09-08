#!/usr/bin/env node
// Local dev server for the portfolio.
//
//   node tools/edit-server.js      →  http://localhost:4321
//
// Serves the site statically (so fetch('projects.json') works) and exposes a
// small save endpoint that the in-page editor posts to. Edits made in the
// browser are written straight back into projects.json.
//
// Node stdlib only — no install step, no dependencies.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'projects.json');
const BACKUP_FILE = path.join(ROOT, '.projects.json.bak');
const PORT = Number(process.env.PORT) || 4321;
const INDENT = 4; // matches the existing formatting of projects.json

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function sendJSON(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Cache-Control': 'no-store'
    });
    res.end(payload);
}

// Resolve a dotted path like "projects.3.sections.2.bullets.0" against the data
// object. Returns { parent, key } so the caller can assign, or null if the path
// does not already exist (we only ever edit values that are already there).
function resolvePath(data, dotted) {
    const parts = String(dotted).split('.');
    if (parts.length < 2) return null;

    let node = data;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!/^[A-Za-z0-9_]+$/.test(key)) return null;
        if (node === null || typeof node !== 'object') return null;
        node = Array.isArray(node) ? node[Number(key)] : node[key];
    }

    const last = parts[parts.length - 1];
    if (!/^[A-Za-z0-9_]+$/.test(last)) return null;
    if (node === null || typeof node !== 'object') return null;

    const key = Array.isArray(node) ? Number(last) : last;
    if (Array.isArray(node) && !Number.isInteger(key)) return null;
    if (!(key in node)) return null;             // never create new keys
    if (typeof node[key] !== 'string') return null; // text edits only

    return { parent: node, key };
}

function applyPatches(patches) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);

    const applied = [];
    const rejected = [];

    for (const patch of patches) {
        if (!patch || typeof patch.path !== 'string' || typeof patch.value !== 'string') {
            rejected.push({ path: patch && patch.path, reason: 'malformed patch' });
            continue;
        }
        const target = resolvePath(data, patch.path);
        if (!target) {
            rejected.push({ path: patch.path, reason: 'path not found or not a string' });
            continue;
        }
        if (target.parent[target.key] === patch.value) continue; // no-op
        target.parent[target.key] = patch.value;
        applied.push(patch.path);
    }

    if (applied.length > 0) {
        fs.writeFileSync(BACKUP_FILE, raw);                     // keep the previous version
        const out = JSON.stringify(data, null, INDENT) + '\n';
        const tmp = DATA_FILE + '.tmp';
        fs.writeFileSync(tmp, out);
        fs.renameSync(tmp, DATA_FILE);                          // atomic swap
    }

    return { applied, rejected };
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', chunk => {
            size += chunk.length;
            if (size > 5 * 1024 * 1024) {
                reject(new Error('request body too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

function serveStatic(req, res, pathname) {
    let rel = decodeURIComponent(pathname);
    if (rel.endsWith('/')) rel += 'index.html';

    const filePath = path.join(ROOT, rel);
    if (!filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Content-Length': stat.size,
            // Always fresh: the editor rewrites projects.json underneath us.
            'Cache-Control': 'no-store'
        });
        fs.createReadStream(filePath).pipe(res);
    });
}

const server = http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    if (pathname === '/__api/ping') {
        sendJSON(res, 200, { ok: true, file: path.relative(ROOT, DATA_FILE) });
        return;
    }

    if (pathname === '/__api/save') {
        if (req.method !== 'POST') {
            sendJSON(res, 405, { ok: false, error: 'POST only' });
            return;
        }
        try {
            const { patches } = JSON.parse(await readBody(req));
            if (!Array.isArray(patches)) throw new Error('patches must be an array');

            const { applied, rejected } = applyPatches(patches);
            console.log(`saved ${applied.length} edit(s)` + (rejected.length ? `, ${rejected.length} rejected` : ''));
            applied.forEach(p => console.log(`   ✓ ${p}`));
            rejected.forEach(r => console.log(`   ✗ ${r.path} — ${r.reason}`));

            sendJSON(res, 200, { ok: true, applied, rejected });
        } catch (error) {
            console.error('save failed:', error.message);
            sendJSON(res, 400, { ok: false, error: error.message });
        }
        return;
    }

    serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
    console.log(`\n  Portfolio editor running\n`);
    console.log(`    http://localhost:${PORT}\n`);
    console.log(`  Editing is on automatically on localhost.`);
    console.log(`  Click any highlighted text, type, then ⌘S to write it into projects.json.`);
    console.log(`  A copy of the previous file is kept at .projects.json.bak\n`);
});
