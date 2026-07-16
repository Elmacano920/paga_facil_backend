// ══════════════════════════════════════════════════════════
//  PagaFácil Dashboard — app.js
// ══════════════════════════════════════════════════════════

// Detecta automáticamente si está en producción o local
const API = (() => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3001';               // Desarrollo local
  }
  // Producción: backend en Render
  return 'https://pagafacil-backend.onrender.com';
})();

let apiOnline = false;
let map = null;
let mapMarkers = [];

// ─── DEMO DATA ──────────────────────────────────────────────
const DEMO = {
  activity: [
    { name: 'Carlos Medina',    company: 'Tech Solutions C.A.', amount: '+$350',  dot: '#8b5cf6', type: 'advance' },
    { name: 'Ana Rodríguez',    company: 'Grupo Empresarial S.A.', amount: '+$210', dot: '#22d3ee', type: 'cashback' },
    { name: 'Luis García',      company: 'Inversiones Caribe', amount: '+$520',   dot: '#f59e0b', type: 'advance' },
    { name: 'María Pérez',      company: 'Corporación Delta', amount: '+25 LTK', dot: '#10b981', type: 'token' },
    { name: 'José Hernández',   company: 'Tech Solutions C.A.', amount: '+$180',  dot: '#8b5cf6', type: 'advance' },
  ],
  reputationRows: [
    { emp: 'Carlos Medina',  company: 'Tech Solutions C.A.',   score: 94, tier: 'Elite',   rate: '15%' },
    { emp: 'Ana Rodríguez',  company: 'Grupo Empresarial',     score: 88, tier: 'Platino',  rate: '12%' },
    { emp: 'Luis García',    company: 'Inversiones Caribe',    score: 82, tier: 'Platino',  rate: '12%' },
    { emp: 'María Pérez',    company: 'Corporación Delta',     score: 76, tier: 'Platino',  rate: '12%' },
    { emp: 'José Hernández', company: 'Tech Solutions C.A.',   score: 71, tier: 'Oro',      rate: '8%'  },
    { emp: 'Rosa Martínez',  company: 'Grupo Empresarial',     score: 68, tier: 'Oro',      rate: '8%'  },
    { emp: 'Pedro Jiménez',  company: 'Inversiones Caribe',    score: 62, tier: 'Oro',      rate: '8%'  },
    { emp: 'Elena Torres',   company: 'Corporación Delta',     score: 55, tier: 'Oro',      rate: '8%'  },
    { emp: 'Miguel Flores',  company: 'Tech Solutions C.A.',   score: 47, tier: 'Plata',    rate: '5%'  },
    { emp: 'Sofía Castro',   company: 'Grupo Empresarial',     score: 42, tier: 'Plata',    rate: '5%'  },
  ],
  tokenTx: [
    { type: 'MINT',     emp: 'Carlos Medina',   amount: '+30',  reason: 'CASHBACK_CLAIMED', date: 'hoy 2:14 PM' },
    { type: 'MINT',     emp: 'Ana Rodríguez',   amount: '+25',  reason: 'FIRST_MONTHLY_USE', date: 'hoy 1:48 PM' },
    { type: 'BURN',     emp: 'Luis García',     amount: '-50',  reason: 'REDEEMED_BENEFIT',  date: 'hoy 12:33 PM' },
    { type: 'MINT',     emp: 'María Pérez',     amount: '+10',  reason: 'REVIEW_VERIFIED',   date: 'hoy 11:15 AM' },
    { type: 'TRANSFER', emp: 'José Hernández',  amount: '85',   reason: 'WALLET_TRANSFER',   date: 'hoy 10:02 AM' },
    { type: 'MINT',     emp: 'Rosa Martínez',   amount: '+55',  reason: 'TIER_UPGRADE',      date: 'ayer 4:50 PM' },
    { type: 'MINT',     emp: 'Pedro Jiménez',   amount: '+5',   reason: 'CASHBACK_CLAIMED',  date: 'ayer 3:27 PM' },
  ],
  cashbackRows: [
    { emp: 'Carlos Medina',  amount: '$350', cb: '$52.50', tier: 'Elite',   rate: '15%', ltk: 30,  date: 'hoy 2:14 PM' },
    { emp: 'Ana Rodríguez',  amount: '$210', cb: '$25.20', tier: 'Platino', rate: '12%', ltk: 30,  date: 'hoy 1:48 PM' },
    { emp: 'Luis García',    amount: '$520', cb: '$41.60', tier: 'Oro',     rate: '8%',  ltk: 5,   date: 'hoy 12:33 PM' },
    { emp: 'María Pérez',    amount: '$180', cb: '$21.60', tier: 'Platino', rate: '12%', ltk: 5,   date: 'hoy 11:15 AM' },
    { emp: 'José Hernández', amount: '$300', cb: '$24.00', tier: 'Oro',     rate: '8%',  ltk: 5,   date: 'ayer 5:10 PM' },
    { emp: 'Rosa Martínez',  amount: '$450', cb: '$22.50', tier: 'Oro',     rate: '5%',  ltk: 5,   date: 'ayer 4:00 PM' },
  ],
  comercios: [
    { name: 'TechStore Caracas',      city: 'Caracas',                lat: 10.4880, lng: -66.8792, nets: ['Binance Pay','USDT'],      verified: true  },
    { name: 'Café Cripto',            city: 'Caracas',                lat: 10.5000, lng: -66.9200, nets: ['Lightning','Bitcoin'],     verified: true  },
    { name: 'Farmacia Digital',       city: 'Caracas',                lat: 10.4720, lng: -66.8620, nets: ['Tron','USDT'],            verified: false },
    { name: 'Restaurante El Bloque',  city: 'San Juan de los Morros', lat: 9.9100,  lng: -67.3500, nets: ['Binance Pay'],            verified: true  },
    { name: 'Librería Token',         city: 'Caracas',                lat: 10.4810, lng: -66.8850, nets: ['Lightning','Binance Pay'], verified: true  },
    { name: 'Supermercado Satoshi',   city: 'Valencia',               lat: 10.1800, lng: -67.9900, nets: ['Bitcoin','USDT'],         verified: false },
    { name: 'Hotel Cripto Suites',    city: 'Caracas',                lat: 10.5100, lng: -66.9100, nets: ['Tron','Binance Pay'],     verified: true  },
    { name: 'Clínica Web3',           city: 'Maracay',                lat: 10.2400, lng: -67.5900, nets: ['USDT','Tron'],            verified: false },
    { name: 'Electrónica DeFi',       city: 'Caracas',                lat: 10.4930, lng: -66.8700, nets: ['Lightning'],              verified: true  },
    { name: 'Peluquería NFT',         city: 'Barquisimeto',           lat: 10.0700, lng: -69.3200, nets: ['Binance Pay'],            verified: false },
    { name: 'Auto Parts Blockchain',  city: 'Caracas',                lat: 10.4650, lng: -66.9050, nets: ['Bitcoin','Tron'],         verified: true  },
  ]
};

// Tier color helper
const TIER_STYLES = {
  Elite:   { bg: 'rgba(139,92,246,.2)',  color: '#c4b5fd',  border: 'rgba(139,92,246,.4)' },
  Platino: { bg: 'rgba(203,213,225,.1)', color: '#e2e8f0',  border: 'rgba(203,213,225,.25)' },
  Oro:     { bg: 'rgba(245,158,11,.2)',  color: '#fbbf24',  border: 'rgba(245,158,11,.4)' },
  Plata:   { bg: 'rgba(100,116,139,.2)', color: '#94a3b8',  border: 'rgba(100,116,139,.4)' },
  Bronce:  { bg: 'rgba(146,64,14,.2)',   color: '#d97706',  border: 'rgba(146,64,14,.4)' },
};

function tierPill(tier) {
  const s = TIER_STYLES[tier] || {};
  return `<span class="tier-pill" style="background:${s.bg};color:${s.color};border:1px solid ${s.border}">${tier}</span>`;
}

function txBadge(type) {
  const map = {
    MINT:     { bg:'rgba(16,185,129,.15)',  color:'#6ee7b7' },
    BURN:     { bg:'rgba(239,68,68,.15)',   color:'#fca5a5' },
    TRANSFER: { bg:'rgba(34,211,238,.15)',  color:'#67e8f9' },
  };
  const s = map[type] || {};
  return `<span class="tier-pill" style="background:${s.bg};color:${s.color};border:1px solid ${s.bg}">${type}</span>`;
}

// ─── PAGE NAVIGATION ────────────────────────────────────────
const PAGE_TITLES = {
  dashboard:  'Dashboard',
  companies:  'Empresas',
  employees:  'Empleados',
  advances:   'Adelantos',
  reputation: 'Reputación',
  tokens:     'Tokens LTK',
  cashback:   'Cashback',
  reviews:    'Reseñas',
  map:        'CriptoMapa Venezuela',
};

function navigate(page) {
  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.getElementById('nav-' + page);
  if (nav) nav.classList.add('active');

  // Update title
  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

  // Close sidebar on mobile
  if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');

  // Init map if needed
  if (page === 'map' && !map) setTimeout(initMap, 100);

  // Animate counters
  setTimeout(animateCounters, 100);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ─── COUNTER ANIMATION ──────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.page.active [data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1200;
    const start = Date.now();
    const startVal = 0;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(startVal + (target - startVal) * eased).toLocaleString('es-VE');
      if (progress < 1) requestAnimationFrame(tick);
    }
    tick();
  });
  document.querySelectorAll('.page.active .counter').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1400;
    const start = Date.now();
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased).toLocaleString('es-VE');
      if (progress < 1) requestAnimationFrame(tick);
    }
    tick();
  });
}

// Animate tier bars
function animateTierBars() {
  document.querySelectorAll('.tier-bar').forEach(bar => {
    const target = bar.style.width;
    bar.style.setProperty('--w', target);
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.transition = 'width .9s cubic-bezier(.4,0,.2,1)';
      bar.style.width = target;
    }, 200);
  });
}

// ─── POPULATE TABLES ────────────────────────────────────────
function populateActivity() {
  const list = document.getElementById('activity-list');
  if (!list) return;
  list.innerHTML = DEMO.activity.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.dot}; box-shadow:0 0 6px ${a.dot}"></div>
      <div class="activity-text">
        <div class="activity-name">${a.name}</div>
        <div class="activity-sub">${a.company}</div>
      </div>
      <div class="activity-amount ${a.amount.startsWith('+') ? 'positive' : ''}">${a.amount}</div>
    </div>
  `).join('');
}

function populateReputation() {
  const tbody = document.getElementById('reputation-tbody');
  if (!tbody) return;
  tbody.innerHTML = DEMO.reputationRows.map((r, i) => {
    const bar = Math.round(r.score);
    return `<tr>
      <td style="color:var(--t3)">${i + 1}</td>
      <td>${r.emp}</td>
      <td style="color:var(--t2)">${r.company}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${bar}%;background:linear-gradient(90deg,#7c3aed,#06b6d4);border-radius:3px"></div>
          </div>
          <strong style="color:var(--t1);font-size:.85rem;min-width:28px">${r.score}</strong>
        </div>
      </td>
      <td>${tierPill(r.tier)}</td>
      <td style="color:#6ee7b7;font-weight:700">${r.rate}</td>
    </tr>`;
  }).join('');
}

function populateTokenTx() {
  const tbody = document.getElementById('token-tx-tbody');
  if (!tbody) return;
  tbody.innerHTML = DEMO.tokenTx.map(t => `<tr>
    <td>${txBadge(t.type)}</td>
    <td>${t.emp}</td>
    <td style="font-weight:700;color:${t.type==='MINT'?'#6ee7b7':t.type==='BURN'?'#fca5a5':'#67e8f9'}">${t.amount} LTK</td>
    <td style="font-family:monospace;font-size:.72rem;color:var(--t3)">${t.reason}</td>
    <td style="color:var(--t3)">${t.date}</td>
  </tr>`).join('');
}

function populateCashback() {
  const tbody = document.getElementById('cashback-tbody');
  if (!tbody) return;
  tbody.innerHTML = DEMO.cashbackRows.map(c => `<tr>
    <td>${c.emp}</td>
    <td style="color:var(--t2)">${c.amount}</td>
    <td style="color:#6ee7b7;font-weight:700">${c.cb}</td>
    <td>${tierPill(c.tier)}</td>
    <td style="color:var(--t1);font-weight:600">${c.rate}</td>
    <td style="color:#c4b5fd;font-weight:600">+${c.ltk} LTK</td>
    <td style="color:var(--t3)">${c.date}</td>
  </tr>`).join('');
}

// ─── CRIPTO MAPA ─────────────────────────────────────────────
function initMap() {
  if (map) return;
  map = L.map('leaflet-map', {
    center: [10.2, -67.5],
    zoom: 6,
    zoomControl: true,
  });

  // Dark tile
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CartoDB',
    maxZoom: 19,
  }).addTo(map);

  renderMapMarkers('all');
  populateCommerceList('all');
}

function createIcon(color, verified) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <path d="M16 0C7.2 0 0 7.2 0 16c0 11.1 16 24 16 24S32 27.1 32 16C32 7.2 24.8 0 16 0z" fill="${color}" opacity="${verified ? 1 : 0.6}"/>
    <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">₿</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function getColor(nets) {
  if (nets.includes('Binance Pay')) return '#f0b90b';
  if (nets.includes('Lightning'))   return '#f7931a';
  if (nets.includes('Tron'))        return '#ef3837';
  return '#22d3ee';
}

let currentFilter = 'all';

function filterMap(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderMapMarkers(filter);
  populateCommerceList(filter);
}

function matchFilter(c, filter) {
  if (filter === 'all') return true;
  if (filter === 'binance')   return c.nets.some(n => n.toLowerCase().includes('binance'));
  if (filter === 'tron')      return c.nets.some(n => n.toLowerCase().includes('tron'));
  if (filter === 'lightning') return c.nets.some(n => n.toLowerCase().includes('lightning'));
  return true;
}

function renderMapMarkers(filter) {
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  DEMO.comercios.filter(c => matchFilter(c, filter)).forEach(c => {
    const color = getColor(c.nets);
    const icon = createIcon(color, c.verified);
    const popup = `
      <div style="font-family:Inter,sans-serif;padding:4px;min-width:180px">
        <div style="font-weight:800;font-size:.9rem;margin-bottom:4px">${c.name}</div>
        <div style="font-size:.75rem;color:#64748b;margin-bottom:8px">📍 ${c.city}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${c.nets.map(n => `<span style="background:#1e1e2e;color:#8b5cf6;border:1px solid #8b5cf6;border-radius:10px;padding:2px 8px;font-size:.65rem;font-weight:700">${n}</span>`).join('')}
        </div>
        ${c.verified ? '<div style="margin-top:8px;font-size:.68rem;color:#10b981;font-weight:700">✓ Verificado</div>' : '<div style="margin-top:8px;font-size:.68rem;color:#64748b">Pendiente verificación</div>'}
      </div>`;
    const marker = L.marker([c.lat, c.lng], { icon }).addTo(map).bindPopup(popup);
    mapMarkers.push(marker);
  });
}

function populateCommerceList(filter) {
  const list = document.getElementById('map-commerce-list');
  if (!list) return;
  const filtered = DEMO.comercios.filter(c => matchFilter(c, filter));
  list.innerHTML = filtered.map((c, i) => `
    <div class="commerce-item" onclick="flyToCommerce(${i})">
      <div class="commerce-name">${c.verified ? '✓ ' : ''}${c.name}</div>
      <div class="commerce-addr">📍 ${c.city}</div>
      <div class="commerce-tags">
        ${c.nets.map(n => `<span class="commerce-tag">${n}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function flyToCommerce(idx) {
  const filtered = DEMO.comercios.filter(c => matchFilter(c, currentFilter));
  const c = filtered[idx];
  if (!c || !map) return;
  map.flyTo([c.lat, c.lng], 14, { duration: 1.2 });
}

// ─── CLOCK ──────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('topbar-time');
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── API FETCH HELPER ─────────────────────────────────────────
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API + endpoint, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ─── LOAD REAL DATA FROM API ──────────────────────────────────
async function loadApiData() {
  const [stats, employees, advances, claims, txs] = await Promise.all([
    apiFetch('/stats'),
    apiFetch('/employees'),
    apiFetch('/advances'),
    apiFetch('/cashback/claims'),
    apiFetch('/tokens/transactions'),
  ]);

  if (!stats) return; // API not available, keep demo data

  // Update stat cards
  document.querySelectorAll('[data-count]').forEach(el => {
    const key = el.closest('.stat-card')?.dataset?.apiKey;
  });

  // Update stat values from real API
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards[0]) statCards[0].querySelector('.stat-value').textContent = stats.companies;
  if (statCards[1]) statCards[1].querySelector('.stat-value').textContent = stats.activeEmployees;
  if (statCards[2]) statCards[2].querySelector('.stat-value').textContent = stats.advancesThisMonth;
  if (statCards[3]) statCards[3].querySelector('.stat-value').textContent = stats.totalLTKCirculating.toLocaleString('es-VE');

  // Update activity from real advances
  if (advances && employees) {
    const empMap = {};
    employees.forEach(e => empMap[e.id] = e);
    const recentActivity = advances.slice(0, 5).map(a => {
      const emp = empMap[a.employeeId] || {};
      const colors = { DISBURSED:'#10b981', PENDING:'#f59e0b', FAILED:'#ef4444' };
      return { name: emp.name || a.employeeId, company: a.status, amount: `+$${a.amount}`, dot: colors[a.status] || '#8b5cf6', type:'advance' };
    });
    DEMO.activity = recentActivity;
    populateActivity();
  }

  // Update cashback table from real claims
  if (claims && employees) {
    const empMap = {};
    employees.forEach(e => empMap[e.id] = e);
    DEMO.cashbackRows = claims.slice(0, 8).map(c => ({
      emp:    (empMap[c.employeeId] || {}).name || c.employeeId,
      amount: `$${c.cashbackUSD ? ((empMap[c.employeeId]||{}).salary||0) : '?'}`,
      cb:     `$${c.cashbackUSD}`,
      tier:   c.tier,
      rate:   `${Math.round(c.rate * 100)}%`,
      ltk:    c.tokensEarned,
      date:   new Date(c.claimedAt).toLocaleString('es-VE'),
    }));
    populateCashback();
  }

  // Update token transactions
  if (txs && employees) {
    const empMap = {};
    employees.forEach(e => empMap[e.id] = e);
    DEMO.tokenTx = txs.slice(0, 8).map(t => ({
      type:   t.type,
      emp:    (empMap[t.employeeId] || {}).name || t.employeeId,
      amount: `${t.amount > 0 ? '+' : ''}${t.amount}`,
      reason: t.reason,
      date:   new Date(t.createdAt).toLocaleString('es-VE'),
    }));
    populateTokenTx();
  }
}

// ─── API STATUS CHECK ────────────────────────────────────────
async function checkApi() {
  const el    = document.getElementById('api-status');
  const badge = document.getElementById('demo-badge');
  try {
    const res = await fetch(API + '/health', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      apiOnline = true;
      el.textContent = '⬤ Servidor Online';
      el.className   = 'api-status online';
      if (badge) badge.style.display = 'none';
      showToast('🟢 Servidor PagaFácil conectado en localhost:3001');
      loadApiData();
    } else { throw new Error(); }
  } catch {
    el.textContent = '⬤ Demo Mode';
    el.className   = 'api-status offline';
  }
}

// ─── TOAST ──────────────────────────────────────────────────
function showToast(msg, duration = 3500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateActivity();
  populateReputation();
  populateTokenTx();
  populateCashback();
  animateCounters();
  animateTierBars();
  checkApi();
  setInterval(updateClock, 1000);
  updateClock();

  // Show welcome toast
  setTimeout(() => showToast('👋 Bienvenido al Dashboard de PagaFácil — Modo Demo activo'), 800);
});
