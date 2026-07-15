/**
 * PagaFácil — Servidor de Demostración
 * ─────────────────────────────────────
 * Usa SOLO módulos built-in de Node.js (sin npm install).
 * Levanta el frontend + API REST completa con datos realistas.
 *
 * Uso: node server.js
 * Luego abre: http://localhost:3001
 */

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const PORT  = 3001;

// ══════════════════════════════════════════════════════════════
//  DATOS DE DEMOSTRACIÓN
// ══════════════════════════════════════════════════════════════
const DB = {
  companies: [
    { id:'c1', name:'Tech Solutions C.A.',     rif:'J-30124567-8', employees:48, city:'Caracas',    active:true,  createdAt:'2023-01-15' },
    { id:'c2', name:'Grupo Empresarial S.A.',  rif:'J-40234512-1', employees:120, city:'Valencia',  active:true,  createdAt:'2022-08-20' },
    { id:'c3', name:'Inversiones Caribe',      rif:'J-29876543-0', employees:34, city:'Maracaibo',  active:true,  createdAt:'2023-03-10' },
    { id:'c4', name:'Corporación Delta',       rif:'J-40123456-9', employees:75, city:'Barquisimeto',active:true, createdAt:'2022-11-05' },
    { id:'c5', name:'Fintech Andina C.A.',     rif:'J-31234567-2', employees:28, city:'Mérida',     active:true,  createdAt:'2024-01-08' },
    { id:'c6', name:'Distribuidora Nación',    rif:'J-20987654-3', employees:92, city:'Caracas',    active:false, createdAt:'2021-06-22' },
    { id:'c7', name:'Constructora Bolívar',    rif:'J-30456789-4', employees:61, city:'Maracay',    active:true,  createdAt:'2023-07-14' },
  ],

  employees: [
    { id:'e1', name:'Carlos Medina',   companyId:'c1', salary:1200, tier:'Elite',   score:94, ltk:2340, active:true },
    { id:'e2', name:'Ana Rodríguez',   companyId:'c2', salary:950,  tier:'Platino', score:88, ltk:1870, active:true },
    { id:'e3', name:'Luis García',     companyId:'c3', salary:800,  tier:'Platino', score:82, ltk:1540, active:true },
    { id:'e4', name:'María Pérez',     companyId:'c4', salary:1100, tier:'Platino', score:76, ltk:1200, active:true },
    { id:'e5', name:'José Hernández',  companyId:'c1', salary:750,  tier:'Oro',     score:71, ltk:920,  active:true },
    { id:'e6', name:'Rosa Martínez',   companyId:'c2', salary:680,  tier:'Oro',     score:68, ltk:840,  active:true },
    { id:'e7', name:'Pedro Jiménez',   companyId:'c3', salary:900,  tier:'Oro',     score:62, ltk:710,  active:true },
    { id:'e8', name:'Elena Torres',    companyId:'c4', salary:1050, tier:'Oro',     score:55, ltk:580,  active:true },
    { id:'e9', name:'Miguel Flores',   companyId:'c1', salary:720,  tier:'Plata',   score:47, ltk:340,  active:true },
    { id:'e10', name:'Sofía Castro',   companyId:'c2', salary:830,  tier:'Plata',   score:42, ltk:280,  active:true },
  ],

  advances: [
    { id:'a1', employeeId:'e1', amount:350,  status:'DISBURSED', date:'2026-07-12 14:05' },
    { id:'a2', employeeId:'e2', amount:210,  status:'DISBURSED', date:'2026-07-12 13:40' },
    { id:'a3', employeeId:'e3', amount:520,  status:'DISBURSED', date:'2026-07-12 12:20' },
    { id:'a4', employeeId:'e4', amount:180,  status:'PENDING',   date:'2026-07-12 11:10' },
    { id:'a5', employeeId:'e5', amount:300,  status:'DISBURSED', date:'2026-07-11 17:00' },
    { id:'a6', employeeId:'e6', amount:450,  status:'FAILED',    date:'2026-07-11 15:30' },
    { id:'a7', employeeId:'e7', amount:280,  status:'DISBURSED', date:'2026-07-11 14:00' },
    { id:'a8', employeeId:'e8', amount:600,  status:'DISBURSED', date:'2026-07-10 10:20' },
  ],

  cashbackClaims: [
    { id:'cb1', employeeId:'e1', advanceId:'a1', cashbackUSD:52.50, tier:'Elite',   rate:0.15, tokensEarned:30, bonusTokens:25, claimedAt:'2026-07-12 14:14' },
    { id:'cb2', employeeId:'e2', advanceId:'a2', cashbackUSD:25.20, tier:'Platino', rate:0.12, tokensEarned:30, bonusTokens:25, claimedAt:'2026-07-12 13:48' },
    { id:'cb3', employeeId:'e3', advanceId:'a3', cashbackUSD:41.60, tier:'Platino', rate:0.08, tokensEarned:5,  bonusTokens:0,  claimedAt:'2026-07-12 12:33' },
    { id:'cb4', employeeId:'e5', advanceId:'a5', cashbackUSD:24.00, tier:'Oro',     rate:0.08, tokensEarned:5,  bonusTokens:0,  claimedAt:'2026-07-11 17:15' },
    { id:'cb5', employeeId:'e7', advanceId:'a7', cashbackUSD:14.00, tier:'Oro',     rate:0.05, tokensEarned:5,  bonusTokens:0,  claimedAt:'2026-07-11 14:20' },
    { id:'cb6', employeeId:'e8', advanceId:'a8', cashbackUSD:48.00, tier:'Platino', rate:0.08, tokensEarned:5,  bonusTokens:0,  claimedAt:'2026-07-10 10:40' },
  ],

  reputationScores: [
    { entityId:'e1', entityType:'EMPLOYEE', score:94, tier:'Elite',   lastUpdated:'2026-07-12' },
    { entityId:'e2', entityType:'EMPLOYEE', score:88, tier:'Platino', lastUpdated:'2026-07-12' },
    { entityId:'e3', entityType:'EMPLOYEE', score:82, tier:'Platino', lastUpdated:'2026-07-12' },
    { entityId:'c1', entityType:'COMPANY',  score:89, tier:'Platino', lastUpdated:'2026-07-12' },
    { entityId:'c2', entityType:'COMPANY',  score:74, tier:'Oro',     lastUpdated:'2026-07-12' },
  ],

  tokenTransactions: [
    { id:'t1', employeeId:'e1', type:'MINT',     amount:30,  reason:'CASHBACK_CLAIMED',  txRef:null, createdAt:'2026-07-12 14:14' },
    { id:'t2', employeeId:'e2', type:'MINT',     amount:25,  reason:'FIRST_MONTHLY_USE', txRef:null, createdAt:'2026-07-12 13:48' },
    { id:'t3', employeeId:'e3', type:'BURN',     amount:-50, reason:'REDEEMED_BENEFIT',  txRef:null, createdAt:'2026-07-12 12:33' },
    { id:'t4', employeeId:'e4', type:'MINT',     amount:10,  reason:'REVIEW_VERIFIED',   txRef:null, createdAt:'2026-07-12 11:15' },
    { id:'t5', employeeId:'e5', type:'TRANSFER', amount:85,  reason:'WALLET_TRANSFER',   txRef:'e6', createdAt:'2026-07-12 10:02' },
    { id:'t6', employeeId:'e6', type:'MINT',     amount:55,  reason:'TIER_UPGRADE',      txRef:null, createdAt:'2026-07-11 16:50' },
    { id:'t7', employeeId:'e7', type:'MINT',     amount:5,   reason:'CASHBACK_CLAIMED',  txRef:null, createdAt:'2026-07-11 14:20' },
  ],

  reviews: [
    { id:'r1', employeeId:'e1', companyId:'c2', rating:5, title:'Excelente servicio', body:'Muy rapido el proceso de adelanto.', helpful:12, createdAt:'2026-07-10' },
    { id:'r2', employeeId:'e2', companyId:'c1', rating:4, title:'Buena experiencia', body:'El sistema es muy intuitivo.',       helpful:8,  createdAt:'2026-07-09' },
    { id:'r3', employeeId:'e3', companyId:'c3', rating:5, title:'Recomendado',       body:'Sin complicaciones, excelente.',     helpful:15, createdAt:'2026-07-08' },
    { id:'r4', employeeId:'e4', companyId:'c4', rating:3, title:'Regular',           body:'Podría mejorar los tiempos.',        helpful:3,  createdAt:'2026-07-07' },
  ],

  loyaltyWallets: [
    { employeeId:'e1', balance:2340, totalMinted:2390, totalBurned:50 },
    { employeeId:'e2', balance:1870, totalMinted:1870, totalBurned:0  },
    { employeeId:'e3', balance:1490, totalMinted:1540, totalBurned:50 },
  ],
};

// ══════════════════════════════════════════════════════════════
//  RUTAS API
// ══════════════════════════════════════════════════════════════
function buildStats() {
  const totalLTK = DB.loyaltyWallets.reduce((s,w)=>s+w.balance,0);
  const totalCashbackUSD = DB.cashbackClaims.reduce((s,c)=>s+c.cashbackUSD,0);
  return {
    companies:    DB.companies.length,
    activeEmployees: DB.employees.filter(e=>e.active).length,
    advancesThisMonth: DB.advances.length,
    totalAdvancedUSD: DB.advances.reduce((s,a)=>s+a.amount,0),
    totalLTKCirculating: totalLTK + 18000,
    totalCashbackUSD: Math.round(totalCashbackUSD*100)/100,
    totalCashbackClaims: DB.cashbackClaims.length,
    tierDistribution: {
      Elite:   DB.employees.filter(e=>e.tier==='Elite').length,
      Platino: DB.employees.filter(e=>e.tier==='Platino').length,
      Oro:     DB.employees.filter(e=>e.tier==='Oro').length,
      Plata:   DB.employees.filter(e=>e.tier==='Plata').length,
      Bronce:  DB.employees.filter(e=>e.tier==='Bronce').length,
    }
  };
}

const ROUTES = {
  'GET /health':       () => ({ status:'ok', timestamp: new Date().toISOString(), version:'1.0.0' }),
  'GET /':             () => null, // handled by file server
  'GET /stats':        () => buildStats(),
  'GET /companies':    () => DB.companies,
  'GET /employees':    () => DB.employees,
  'GET /advances':     () => DB.advances,
  'GET /cashback/stats': () => ({
    totalClaims: DB.cashbackClaims.length,
    totalUSD: DB.cashbackClaims.reduce((s,c)=>s+c.cashbackUSD,0),
    totalTokens: DB.cashbackClaims.reduce((s,c)=>s+c.tokensEarned,0),
    byTier: {
      Elite:   DB.cashbackClaims.filter(c=>c.tier==='Elite'),
      Platino: DB.cashbackClaims.filter(c=>c.tier==='Platino'),
      Oro:     DB.cashbackClaims.filter(c=>c.tier==='Oro'),
    }
  }),
  'GET /cashback/claims': () => DB.cashbackClaims,
  'GET /reputation/scores': () => DB.reputationScores,
  'GET /reviews':      () => DB.reviews,
  'GET /tokens/transactions': () => DB.tokenTransactions,
  'GET /tokens/wallets':      () => DB.loyaltyWallets,
};

// Dynamic route matcher for parameterized routes
function matchDynamic(method, url) {
  const clean = url.split('?')[0];
  // GET /companies/:id
  let m = clean.match(/^\/companies\/([^/]+)$/);
  if (method==='GET' && m) return DB.companies.find(c=>c.id===m[1]) || { error:'Not found', statusCode:404 };
  // GET /employees/:id
  m = clean.match(/^\/employees\/([^/]+)$/);
  if (method==='GET' && m) return DB.employees.find(e=>e.id===m[1]) || { error:'Not found', statusCode:404 };
  // GET /reputation/employee/:id
  m = clean.match(/^\/reputation\/employee\/([^/]+)$/);
  if (method==='GET' && m) return DB.reputationScores.find(r=>r.entityId===m[1]&&r.entityType==='EMPLOYEE') || { error:'Not found', statusCode:404 };
  // GET /tokens/wallet/:id
  m = clean.match(/^\/tokens\/wallet\/([^/]+)$/);
  if (method==='GET' && m) return DB.loyaltyWallets.find(w=>w.employeeId===m[1]) || { error:'Not found', statusCode:404 };
  // GET /cashback/employee/:id
  m = clean.match(/^\/cashback\/employee\/([^/]+)$/);
  if (method==='GET' && m) return DB.cashbackClaims.filter(c=>c.employeeId===m[1]);
  return null;
}

// ══════════════════════════════════════════════════════════════
//  MIME TYPES & FILE SERVER
// ══════════════════════════════════════════════════════════════
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

function serveFile(res, filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control':'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}

// ══════════════════════════════════════════════════════════════
//  HTTP SERVER
// ══════════════════════════════════════════════════════════════
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const urlPath = req.url.split('?')[0];

  // API routes
  const routeKey = `${req.method} ${urlPath}`;
  if (ROUTES[routeKey]) {
    const data = ROUTES[routeKey]();
    if (data === null) {
      // serve index.html for root
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
      return;
    }
  }

  // Dynamic routes
  const dynamic = matchDynamic(req.method, urlPath);
  if (dynamic) {
    const code = dynamic.statusCode || 200;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dynamic, null, 2));
    return;
  }

  // Static file server (frontend)
  const staticDir = __dirname;
  if (urlPath === '/' || urlPath === '') {
    serveFile(res, path.join(staticDir, 'index.html'));
    return;
  }
  const filePath = path.join(staticDir, urlPath);
  // Security: prevent directory traversal
  if (!filePath.startsWith(staticDir)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  serveFile(res, filePath);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   ⚡ PagaFácil — Servidor de Demostración ║');
  console.log('  ╠═══════════════════════════════════════════╣');
  console.log(`  ║   Frontend:  http://localhost:${PORT}         ║`);
  console.log(`  ║   API REST:  http://localhost:${PORT}/health   ║`);
  console.log('  ║   Base de datos: In-Memory (Demo)         ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('\n  Presiona Ctrl+C para detener el servidor.\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌ El puerto ${PORT} ya está en uso. Cambia PORT en server.js.\n`);
  } else {
    console.error('\n  ❌ Error:', err.message);
  }
  process.exit(1);
});
