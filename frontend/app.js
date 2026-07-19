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
    { name: 'Carlos Medina',    company: 'Tech Solutions C.A.',   amount: '+$350',  dot: '#8b5cf6', type: 'advance'  },
    { name: 'Ana Rodríguez',    company: 'Grupo Empresarial S.A.',amount: '+$210',  dot: '#22d3ee', type: 'cashback' },
    { name: 'Luis García',      company: 'Inversiones Caribe',    amount: '+$520',  dot: '#f59e0b', type: 'advance'  },
    { name: 'María Pérez',      company: 'Corporación Delta',     amount: '+25 LTK',dot: '#10b981', type: 'token'    },
    { name: 'José Hernández',   company: 'Tech Solutions C.A.',   amount: '+$180',  dot: '#8b5cf6', type: 'advance'  },
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
    { type: 'MINT',     emp: 'Carlos Medina',   amount: '+30', reason: 'CASHBACK_CLAIMED',  date: 'hoy 2:14 PM'  },
    { type: 'MINT',     emp: 'Ana Rodríguez',   amount: '+25', reason: 'FIRST_MONTHLY_USE', date: 'hoy 1:48 PM'  },
    { type: 'BURN',     emp: 'Luis García',     amount: '-50', reason: 'REDEEMED_BENEFIT',  date: 'hoy 12:33 PM' },
    { type: 'MINT',     emp: 'María Pérez',     amount: '+10', reason: 'REVIEW_VERIFIED',   date: 'hoy 11:15 AM' },
    { type: 'TRANSFER', emp: 'José Hernández',  amount: '85',  reason: 'WALLET_TRANSFER',   date: 'hoy 10:02 AM' },
    { type: 'MINT',     emp: 'Rosa Martínez',   amount: '+55', reason: 'TIER_UPGRADE',      date: 'ayer 4:50 PM' },
    { type: 'MINT',     emp: 'Pedro Jiménez',   amount: '+5',  reason: 'CASHBACK_CLAIMED',  date: 'ayer 3:27 PM' },
  ],
  cashbackRows: [
    { emp: 'Carlos Medina',  amount: '$350', cb: '$52.50', tier: 'Elite',   rate: '15%', ltk: 30, date: 'hoy 2:14 PM'   },
    { emp: 'Ana Rodríguez',  amount: '$210', cb: '$25.20', tier: 'Platino', rate: '12%', ltk: 30, date: 'hoy 1:48 PM'   },
    { emp: 'Luis García',    amount: '$520', cb: '$41.60', tier: 'Oro',     rate: '8%',  ltk: 5,  date: 'hoy 12:33 PM'  },
    { emp: 'María Pérez',    amount: '$180', cb: '$21.60', tier: 'Platino', rate: '12%', ltk: 5,  date: 'hoy 11:15 AM'  },
    { emp: 'José Hernández', amount: '$300', cb: '$24.00', tier: 'Oro',     rate: '8%',  ltk: 5,  date: 'ayer 5:10 PM'  },
    { emp: 'Rosa Martínez',  amount: '$450', cb: '$22.50', tier: 'Oro',     rate: '5%',  ltk: 5,  date: 'ayer 4:00 PM'  },
  ],
  comercios: [
    { name: 'TechStore Caracas',     city: 'Caracas',                lat: 10.4880, lng: -66.8792, nets: ['Binance Pay','USDT'],      verified: true  },
    { name: 'Café Cripto',           city: 'Caracas',                lat: 10.5000, lng: -66.9200, nets: ['Lightning','Bitcoin'],     verified: true  },
    { name: 'Farmacia Digital',      city: 'Caracas',                lat: 10.4720, lng: -66.8620, nets: ['Tron','USDT'],            verified: false },
    { name: 'Restaurante El Bloque', city: 'San Juan de los Morros', lat: 9.9100,  lng: -67.3500, nets: ['Binance Pay'],            verified: true  },
    { name: 'Librería Token',        city: 'Caracas',                lat: 10.4810, lng: -66.8850, nets: ['Lightning','Binance Pay'], verified: true  },
    { name: 'Supermercado Satoshi',  city: 'Valencia',               lat: 10.1800, lng: -67.9900, nets: ['Bitcoin','USDT'],         verified: false },
    { name: 'Hotel Cripto Suites',   city: 'Caracas',                lat: 10.5100, lng: -66.9100, nets: ['Tron','Binance Pay'],     verified: true  },
    { name: 'Clínica Web3',          city: 'Maracay',                lat: 10.2400, lng: -67.5900, nets: ['USDT','Tron'],            verified: false },
    { name: 'Electrónica DeFi',      city: 'Caracas',                lat: 10.4930, lng: -66.8700, nets: ['Lightning'],              verified: true  },
    { name: 'Peluquería NFT',        city: 'Barquisimeto',           lat: 10.0700, lng: -69.3200, nets: ['Binance Pay'],            verified: false },
    { name: 'Auto Parts Blockchain', city: 'Caracas',                lat: 10.4650, lng: -66.9050, nets: ['Bitcoin','Tron'],         verified: true  },
  ],

  // ── Datos de ejemplo para tablas (cuando API está vacía) ──
  companies: [
    { name: 'Tech Solutions C.A.',      city: 'Caracas',                employees: 87,  tier: 'Elite',   active: true  },
    { name: 'Grupo Empresarial S.A.',   city: 'Caracas',                employees: 54,  tier: 'Platino', active: true  },
    { name: 'Inversiones Caribe',       city: 'Maracay',                employees: 41,  tier: 'Oro',     active: true  },
    { name: 'Corporación Delta C.A.',   city: 'Valencia',               employees: 63,  tier: 'Platino', active: true  },
    { name: 'Desarrollos Andinos',      city: 'San Cristóbal',          employees: 28,  tier: 'Oro',     active: true  },
    { name: 'Distribuidora El Llano',   city: 'San Juan de los Morros', employees: 19,  tier: 'Plata',   active: true  },
    { name: 'Consultores TIC 360',      city: 'Caracas',                employees: 32,  tier: 'Oro',     active: true  },
    { name: 'Agroindustrias del Sur',   city: 'Barquisimeto',           employees: 15,  tier: 'Bronce',  active: false },
  ],

  employees: [
    { name: 'Carlos Medina',     company: 'Tech Solutions C.A.',    salary: 1200, tier: 'Elite',   ltk: 340 },
    { name: 'Ana Rodríguez',     company: 'Grupo Empresarial S.A.', salary: 980,  tier: 'Platino', ltk: 210 },
    { name: 'Luis García',       company: 'Inversiones Caribe',     salary: 850,  tier: 'Platino', ltk: 175 },
    { name: 'María Pérez',       company: 'Corporación Delta C.A.', salary: 920,  tier: 'Platino', ltk: 195 },
    { name: 'José Hernández',    company: 'Tech Solutions C.A.',    salary: 760,  tier: 'Oro',     ltk: 130 },
    { name: 'Rosa Martínez',     company: 'Grupo Empresarial S.A.', salary: 700,  tier: 'Oro',     ltk: 115 },
    { name: 'Pedro Jiménez',     company: 'Inversiones Caribe',     salary: 680,  tier: 'Oro',     ltk: 98  },
    { name: 'Elena Torres',      company: 'Corporación Delta C.A.', salary: 740,  tier: 'Oro',     ltk: 122 },
    { name: 'Miguel Flores',     company: 'Tech Solutions C.A.',    salary: 620,  tier: 'Plata',   ltk: 60  },
    { name: 'Sofía Castro',      company: 'Grupo Empresarial S.A.', salary: 590,  tier: 'Plata',   ltk: 45  },
    { name: 'Roberto Salazar',   company: 'Desarrollos Andinos',    salary: 550,  tier: 'Plata',   ltk: 38  },
    { name: 'Gabriela Morales',  company: 'Distribuidora El Llano', salary: 480,  tier: 'Bronce',  ltk: 15  },
    { name: 'Andrés Rojas',      company: 'Consultores TIC 360',    salary: 870,  tier: 'Oro',     ltk: 140 },
    { name: 'Valentina Núñez',   company: 'Tech Solutions C.A.',    salary: 1050, tier: 'Platino', ltk: 220 },
    { name: 'Diego Contreras',   company: 'Inversiones Caribe',     salary: 730,  tier: 'Oro',     ltk: 110 },
  ],

  advances: [
    { employee: 'Carlos Medina',    company: 'Tech Solutions C.A.',    amount: 350,  status: 'DISBURSED', date: '19/07/2026' },
    { employee: 'Ana Rodríguez',    company: 'Grupo Empresarial S.A.', amount: 210,  status: 'DISBURSED', date: '19/07/2026' },
    { employee: 'Luis García',      company: 'Inversiones Caribe',     amount: 520,  status: 'DISBURSED', date: '18/07/2026' },
    { employee: 'María Pérez',      company: 'Corporación Delta C.A.', amount: 180,  status: 'PENDING',   date: '19/07/2026' },
    { employee: 'José Hernández',   company: 'Tech Solutions C.A.',    amount: 300,  status: 'DISBURSED', date: '17/07/2026' },
    { employee: 'Rosa Martínez',    company: 'Grupo Empresarial S.A.', amount: 450,  status: 'DISBURSED', date: '17/07/2026' },
    { employee: 'Pedro Jiménez',    company: 'Inversiones Caribe',     amount: 280,  status: 'APPROVED',  date: '19/07/2026' },
    { employee: 'Elena Torres',     company: 'Corporación Delta C.A.', amount: 400,  status: 'DISBURSED', date: '16/07/2026' },
    { employee: 'Miguel Flores',    company: 'Tech Solutions C.A.',    amount: 150,  status: 'PENDING',   date: '19/07/2026' },
    { employee: 'Valentina Núñez',  company: 'Tech Solutions C.A.',    amount: 600,  status: 'DISBURSED', date: '15/07/2026' },
  ],

  reviews: [
    { comercio: 'Farmacia Salud Plus',    red: 'TRC-20',    monto: 45,   rating: 5, ltk: 10, date: '19/07/2026' },
    { comercio: 'Supermercado FreshMart', red: 'BEP-20',    monto: 120,  rating: 5, ltk: 25, date: '19/07/2026' },
    { comercio: 'Librería Cultural',      red: 'Lightning', monto: 18,   rating: 4, ltk: 5,  date: '18/07/2026' },
    { comercio: 'Restaurante La Arepa',   red: 'BEP-20',    monto: 35,   rating: 4, ltk: 5,  date: '18/07/2026' },
    { comercio: 'Bodegón Cripto Guárico', red: 'TRC-20',    monto: 65,   rating: 5, ltk: 25, date: '17/07/2026' },
    { comercio: 'Panadería El Trigo',     red: 'TRC-20',    monto: 12,   rating: 3, ltk: 5,  date: '17/07/2026' },
    { comercio: 'Farmacia San Juan',      red: 'BEP-20',    monto: 90,   rating: 5, ltk: 10, date: '16/07/2026' },
    { comercio: 'Taller Mecánico Veloz',  red: 'Lightning', monto: 200,  rating: 4, ltk: 25, date: '15/07/2026' },
  ],
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

  // Load data for the page
  if (page === 'companies')  loadCompanies();
  if (page === 'employees')  loadEmployees();
  if (page === 'advances')   loadAdvances();
  if (page === 'reviews')    loadReviews();

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
  // Soporte para los filtros del CriptoMapa integrado
  if (filter === 'TRC-20')    return (c.nets || c.redes || []).some(n => n.includes('TRC-20') || n.toLowerCase().includes('tron'));
  if (filter === 'BEP-20')    return (c.nets || c.redes || []).some(n => n.includes('BEP-20') || n.toLowerCase().includes('binance'));
  if (filter === 'Lightning') return (c.nets || c.redes || []).some(n => n.toLowerCase().includes('lightning'));
  // Retrocompatibilidad
  if (filter === 'binance')   return (c.nets || []).some(n => n.toLowerCase().includes('binance'));
  if (filter === 'tron')      return (c.nets || []).some(n => n.toLowerCase().includes('tron'));
  return true;
}

function renderMapMarkers(filter) {
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  const source = window.COMERCIOS_DATA || DEMO.comercios;
  source.filter(c => matchFilter(c, filter)).forEach((c, i) => {
    const nets = c.nets || c.redes || [];
    const color = c.wallets ? getColorFromRedes(nets) : getColor(nets);
    const icon  = createIcon(color, c.verified !== false);
    const nombre = c.name || c.nombre;
    const ciudad = c.city || c.direccion || '';
    const popup = `
      <div style="font-family:Inter,sans-serif;padding:4px;min-width:180px">
        <div style="font-weight:800;font-size:.9rem;margin-bottom:4px">${nombre}</div>
        <div style="font-size:.75rem;color:#64748b;margin-bottom:8px">📍 ${ciudad}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${nets.map(n => `<span style="background:#1e1e2e;color:#8b5cf6;border:1px solid #8b5cf6;border-radius:10px;padding:2px 8px;font-size:.65rem;font-weight:700">${n}</span>`).join('')}
        </div>
        ${c.verified !== false ? '<div style="margin-top:8px;font-size:.68rem;color:#10b981;font-weight:700">✓ Verificado</div>' : '<div style="margin-top:8px;font-size:.68rem;color:#64748b">Pendiente verificación</div>'}
        ${c.wallets ? `<button onclick="abrirQRModal(${c.id || i})" style="margin-top:10px;width:100%;padding:7px;background:#00ffcc;color:#0d1117;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.8rem">⚡ Pagar con QR</button>` : ''}
      </div>`;
    const marker = L.marker([c.lat || c.lat, c.lng || c.lng], { icon }).addTo(map).bindPopup(popup);
    mapMarkers.push(marker);
  });
}

function getColorFromRedes(redes) {
  if (redes.includes('TRC-20'))    return '#ef3837';
  if (redes.includes('BEP-20'))    return '#f0b90b';
  if (redes.includes('Lightning')) return '#f7931a';
  return '#22d3ee';
}

function populateCommerceList(filter) {
  const list = document.getElementById('map-commerce-list');
  if (!list) return;
  const source   = window.COMERCIOS_DATA || DEMO.comercios;
  const filtered = source.filter(c => matchFilter(c, filter));
  list.innerHTML = filtered.map((c, i) => {
    const nets   = c.nets || c.redes || [];
    const nombre = c.name || c.nombre;
    const ciudad = c.city || c.direccion || '';
    return `
    <div class="commerce-item" onclick="flyToCommerceData(${i}, '${filter}')">
      <div class="commerce-name">${c.verified !== false ? '✓ ' : ''}${nombre}</div>
      <div class="commerce-addr">📍 ${ciudad}</div>
      <div class="commerce-tags">
        ${nets.map(n => `<span class="commerce-tag">${n}</span>`).join('')}
      </div>
      ${c.wallets ? `<button onclick="event.stopPropagation();abrirQRModal(${c.id || i})" style="margin-top:6px;width:100%;padding:5px;background:#00ffcc22;color:#00ffcc;border:1px solid #00ffcc44;border-radius:6px;cursor:pointer;font-size:.75rem;font-weight:700">⚡ Generar QR de Pago</button>` : ''}
    </div>`;
  }).join('');
}

function flyToCommerceData(idx, filter) {
  const source   = window.COMERCIOS_DATA || DEMO.comercios;
  const filtered = source.filter(c => matchFilter(c, filter));
  const c = filtered[idx];
  if (!c || !map) return;
  map.flyTo([c.lat, c.lng], 15, { duration: 1.2 });
}

function flyToCommerce(idx) { flyToCommerceData(idx, currentFilter); }

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
    const res = await fetch(API + '/', { signal: AbortSignal.timeout(5000) });
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

// ─── COMERCIOS DATA (con wallets reales) ─────────────────────
window.COMERCIOS_DATA = [
  { id:1,  nombre:'Panadía El Trigo',      name:'Panadía El Trigo',      city:'Caracas',                lat:10.4806, lng:-66.9036, redes:['TRC-20','BEP-20'],             nets:['TRC-20','BEP-20'],             wallets:{'TRC-20':'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE','BEP-20':'0x742d35Cc6634C0532925a3b8D4C9E2E3f1A2bC4d'}, verified:true  },
  { id:2,  nombre:'Farmacia Salud Plus',     name:'Farmacia Salud Plus',     city:'Caracas',                lat:10.4775, lng:-66.8534, redes:['TRC-20','Lightning'],          nets:['TRC-20','Lightning'],          wallets:{'TRC-20':'TYASr5UV6HEcXatwdFyfindTKeTvvbgBKA','Lightning':'lnbc150n1pj5xg3xsp5'}, verified:true  },
  { id:3,  nombre:'Restaurante La Arepa',    name:'Restaurante La Arepa',    city:'Caracas',                lat:10.4910, lng:-66.8530, redes:['BEP-20'],                      nets:['BEP-20'],                      wallets:{'BEP-20':'0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454'}, verified:false },
  { id:4,  nombre:'Librería Cultural',       name:'Librería Cultural',       city:'Caracas',                lat:10.4855, lng:-66.8612, redes:['TRC-20','BEP-20','Lightning'], nets:['TRC-20','BEP-20','Lightning'], wallets:{'TRC-20':'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7','BEP-20':'0x4E9Ce36E442e55EcD9025B9a6E0D88485d628A8','Lightning':'lnbc500n1pj5xa2q'}, verified:true  },
  { id:5,  nombre:'Taller Mecánico Veloz',   name:'Taller Mecánico Veloz',   city:'Caracas',                lat:10.4953, lng:-66.7985, redes:['Lightning'],                   nets:['Lightning'],                   wallets:{'Lightning':'lnbc1u1pj5xb3r'}, verified:true  },
  { id:6,  nombre:'Supermercado FreshMart',  name:'Supermercado FreshMart',  city:'Caracas',                lat:10.4990, lng:-66.8420, redes:['TRC-20','BEP-20','Lightning'], nets:['TRC-20','BEP-20','Lightning'], wallets:{'TRC-20':'TKFLQDu4fqmRUFfxDChsHSRWiDZUhf8','BEP-20':'0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE','Lightning':'lnbc1m1pj5xc5x'}, verified:true  },
  { id:7,  nombre:'Farmacia San Juan',       name:'Farmacia San Juan',       city:'San Juan de los Morros', lat:9.9094,  lng:-67.3558, redes:['TRC-20','BEP-20'],             nets:['TRC-20','BEP-20'],             wallets:{'TRC-20':'TM1zzNDZD2DPASbKcgdVoTYhfmYgtfwkKR','BEP-20':'0x28C6c06298d514Db089934071355E5743bf21d60'}, verified:true  },
  { id:8,  nombre:'Panadía La Guariqueña',  name:'Panadía La Guariqueña',  city:'San Juan de los Morros', lat:9.9120,  lng:-67.3610, redes:['TRC-20'],                      nets:['TRC-20'],                      wallets:{'TRC-20':'TLyqzVGLV1srkB7dToTAEqgDkvZDefnZjb'}, verified:true  },
  { id:9,  nombre:'Restaurante El Llanero',  name:'Restaurante El Llanero',  city:'San Juan de los Morros', lat:9.9075,  lng:-67.3590, redes:['BEP-20','Lightning'],          nets:['BEP-20','Lightning'],          wallets:{'BEP-20':'0xF977814e90dA44bFA03b6295A0616a897441aceE','Lightning':'lnbc2u1pj5xd9p'}, verified:true  },
  { id:10, nombre:'Ferretera El Tornillo',   name:'Ferretera El Tornillo',   city:'San Juan de los Morros', lat:9.9058,  lng:-67.3542, redes:['TRC-20','BEP-20'],             nets:['TRC-20','BEP-20'],             wallets:{'TRC-20':'TDqSquXBgUCLYvYC4XZgrprLK589dkhSh5','BEP-20':'0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8'}, verified:false },
  { id:11, nombre:'Bodegón Cripto Guárico',  name:'Bodegón Cripto Guárico',  city:'San Juan de los Morros', lat:9.9140,  lng:-67.3625, redes:['TRC-20','BEP-20','Lightning'], nets:['TRC-20','BEP-20','Lightning'], wallets:{'TRC-20':'TKVEWbA7pMiTMNDKE7J7ExBY1mQtAAbBsK','BEP-20':'0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a','Lightning':'lnbc5u1pj5xe2t'}, verified:true  },
];

// ─── GPS ─────────────────────────────────────────────────────
function activarGPS() {
  const btn = document.getElementById('btn-gps');
  if (!navigator.geolocation) { showToast('⚠️ Geolocalización no disponible'); return; }
  btn.textContent = '⏳ Localizando...';
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    if (map) {
      L.circleMarker([coords.latitude, coords.longitude], {
        radius:9, fillColor:'#3b82f6', color:'#fff', fillOpacity:1, weight:2.5,
      }).addTo(map).bindPopup('<strong>📍 Tu ubicación</strong>').openPopup();
      map.setView([coords.latitude, coords.longitude], 14);
    }
    btn.textContent = '📍 Ubicación activa';
    btn.disabled = false;
    showToast('📍 Ubicación GPS activada');
  }, () => { btn.textContent = '📍 Usar mi ubicación GPS'; btn.disabled = false; showToast('⚠️ No se pudo obtener ubicación'); });
}

// ─── QR MODAL ────────────────────────────────────────────────
const TASA_BS = 91.5;
let _redQRActual = '';

function abrirQRModal(comercioId) {
  const c = window.COMERCIOS_DATA.find(x => x.id === comercioId || x.id === Number(comercioId));
  if (!c) return;
  const redes = c.redes || c.nets || [];
  const iconMap = { 'TRC-20':'fa-brands fa-ethereum','BEP-20':'fa-brands fa-bitcoin','Lightning':'fa-solid fa-bolt' };
  const redBtns = redes.map((r, i) =>
    `<div class="qr-mb-btn ${i===0?'qr-mb-active':''}" data-red="${r}" onclick="selRedQR('${r}',${c.id})">
       <i class="${iconMap[r]||'fa-solid fa-circle-nodes'}"></i>${r}
     </div>`).join('');

  document.getElementById('qr-modal-body').innerHTML = `
    <div style="color:#00ffcc;font-weight:700;font-size:1rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;text-align:center">⚡ ${c.nombre || c.name}</div>
    <div style="font-size:12px;color:#8b949e;margin-bottom:4px">Monto (USD):</div>
    <div style="position:relative;margin-bottom:4px">
      <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8b949e;font-weight:700">$</span>
      <input id="qrm-monto" type="number" min="0.01" step="0.01" placeholder="0.00" oninput="qrmCalcBs()"
        style="width:100%;padding:11px 12px 11px 28px;border-radius:10px;border:2px solid #30363d;background:#0d1117;color:#fff;font-size:17px;font-weight:700;box-sizing:border-box"
        onfocus="this.style.borderColor='#00ffcc'" onblur="this.style.borderColor='#30363d'"/>
    </div>
    <div id="qrm-bs" style="font-size:12px;color:#58a6ff;font-weight:700;margin-bottom:14px">Ref: 0.00 Bs</div>
    <div style="font-size:12px;color:#8b949e;margin-bottom:8px">Red de pago:</div>
    <div style="display:grid;grid-template-columns:repeat(${redes.length},1fr);gap:8px;margin-bottom:14px">${redBtns}</div>
    <div style="font-size:12px;color:#8b949e;margin-bottom:4px">Wallet del comercio:</div>
    <input id="qrm-wallet" readonly style="width:100%;padding:8px;border-radius:8px;border:1px solid #30363d;background:#0d1117;color:#d2a8ff;font-size:10px;font-family:monospace;box-sizing:border-box;margin-bottom:14px"/>
    <button onclick="generarQRModal(${c.id})"
      style="width:100%;padding:13px;background:#00ffcc;color:#0d1117;border:none;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;text-transform:uppercase">
      Generar QR
    </button>
    <div style="margin-top:18px;text-align:center">
      <div id="qrm-spinner" style="border:4px solid rgba(255,255,255,.1);width:36px;height:36px;border-radius:50%;border-left-color:#00ffcc;animation:qrspin 1s linear infinite;display:none;margin:0 auto"></div>
      <div id="qrm-qr" style="background:#fff;padding:14px;border-radius:12px;display:inline-block;display:none"></div>
      <div id="qrm-texto" onclick="qrmCopiar()" title="Clic para copiar"
        style="display:none;margin-top:10px;font-size:10px;color:#d2a8ff;font-family:monospace;background:#211335;padding:10px;border-radius:8px;border:1px solid #6e2cb2;cursor:pointer;word-break:break-all;text-align:left"></div>
      <button id="qrm-confirmar" onclick="qrmConfirmar(${c.id})" style="display:none;margin-top:10px;width:100%;padding:11px;background:#238636;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer">✅ Confirmar pago — recibir LTK</button>
    </div>
  `;

  if (!document.getElementById('qr-mb-style')) {
    const s = document.createElement('style');
    s.id = 'qr-mb-style';
    s.textContent = `
      @keyframes qrspin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      .qr-mb-btn{border:2px solid #30363d;background:#0d1117;padding:10px 4px;border-radius:10px;cursor:pointer;text-align:center;font-weight:700;font-size:10px;transition:.3s;display:flex;flex-direction:column;align-items:center;gap:4px;color:#8b949e}
      .qr-mb-btn i{font-size:18px}
      .qr-mb-btn.qr-mb-active[data-red="TRC-20"]{border-color:#2ea043;background:rgba(46,160,67,.1);color:#2ea043}
      .qr-mb-btn.qr-mb-active[data-red="TRC-20"] i{color:#2ea043}
      .qr-mb-btn.qr-mb-active[data-red="BEP-20"]{border-color:#f3ba2f;background:rgba(243,186,47,.1);color:#f3ba2f}
      .qr-mb-btn.qr-mb-active[data-red="BEP-20"] i{color:#f3ba2f}
      .qr-mb-btn.qr-mb-active[data-red="Lightning"]{border-color:#f7931a;background:rgba(247,147,26,.1);color:#f7931a}
      .qr-mb-btn.qr-mb-active[data-red="Lightning"] i{color:#f7931a}
    `;
    document.head.appendChild(s);
  }

  selRedQR(redes[0], c.id);
  const modal = document.getElementById('qr-modal');
  modal.style.display = 'flex';
}

function cerrarQRModal() {
  document.getElementById('qr-modal').style.display = 'none';
}

function selRedQR(red, cid) {
  _redQRActual = red;
  document.querySelectorAll('.qr-mb-btn').forEach(b => b.classList.remove('qr-mb-active'));
  const btn = document.querySelector(`.qr-mb-btn[data-red="${red}"]`);
  if (btn) btn.classList.add('qr-mb-active');
  const c = window.COMERCIOS_DATA.find(x => x.id === cid || x.id === Number(cid));
  const w = (c?.wallets || {})[red] || '';
  const wi = document.getElementById('qrm-wallet');
  if (wi) wi.value = w;
}

function qrmCalcBs() {
  const m = parseFloat(document.getElementById('qrm-monto')?.value || 0);
  const el = document.getElementById('qrm-bs');
  if (el) el.textContent = m > 0 ? `Ref: ${(m*TASA_BS).toLocaleString('es-VE',{minimumFractionDigits:2})} Bs (Tasa: ${TASA_BS})` : 'Ref: 0.00 Bs';
}

function generarQRModal(cid) {
  const c      = window.COMERCIOS_DATA.find(x => x.id === cid || x.id === Number(cid));
  const monto  = parseFloat(document.getElementById('qrm-monto')?.value || 0);
  const wallet = (c?.wallets || {})[_redQRActual] || '';
  if (!monto || monto <= 0) { showToast('⚠️ Ingresa un monto válido'); return; }
  if (!wallet) { showToast('⚠️ Sin wallet para esta red'); return; }

  const qrDiv   = document.getElementById('qrm-qr');
  const spinner = document.getElementById('qrm-spinner');
  const texto   = document.getElementById('qrm-texto');
  const conf    = document.getElementById('qrm-confirmar');
  qrDiv.style.display = 'none'; texto.style.display = 'none'; if(conf)conf.style.display='none';
  spinner.style.display = 'block';

  setTimeout(() => {
    spinner.style.display = 'none';
    const payload = `${monto}|${_redQRActual}|${wallet}|${c.nombre||c.name}`;
    qrDiv.innerHTML = '';
    qrDiv.style.display = 'inline-block';
    new QRCode(qrDiv, { text: payload, width:170, height:170, correctLevel: QRCode.CorrectLevel.H });
    texto.textContent = payload; texto.style.display = 'block';
    if (conf) conf.style.display = 'block';
    showToast(`✅ QR generado — $${monto.toFixed(2)} en ${_redQRActual}`);
  }, 1000);
}

function qrmCopiar() {
  const t = document.getElementById('qrm-texto')?.textContent || '';
  navigator.clipboard.writeText(t).then(() => showToast('📋 Copiado al portapapeles'));
}

function qrmConfirmar(cid) {
  const c     = window.COMERCIOS_DATA.find(x => x.id === cid || x.id === Number(cid));
  const monto = parseFloat(document.getElementById('qrm-monto')?.value || 0);
  if (!monto) { showToast('Ingresa el monto antes de confirmar'); return; }
  const ltk   = monto >= 50 ? 25 : monto >= 20 ? 10 : 5;
  const total = parseInt(localStorage.getItem('ltk')||'0') + ltk;
  localStorage.setItem('ltk', total);
  const zona = document.getElementById('qrm-qr').parentElement;
  zona.insertAdjacentHTML('beforeend',
    `<div style="margin-top:14px;padding:14px;background:rgba(46,160,67,.12);border:1px solid #2ea043;border-radius:10px;text-align:center">
      <div style="font-size:1.6rem">🎉</div>
      <div style="color:#2ea043;font-weight:700">¡Pago confirmado!</div>
      <div style="color:#56d364;font-size:.85rem;margin-top:4px">+${ltk} LTK acreditados</div>
      <div style="color:#8b949e;font-size:.75rem">Balance: ${total} LTK</div>
    </div>`);
  document.getElementById('qrm-confirmar').style.display = 'none';
  showToast(`🎉 +${ltk} LTK — Pago en ${c?.nombre||c?.name} confirmado`);
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', e => {
  const modal = document.getElementById('qr-modal');
  if (modal && e.target === modal) cerrarQRModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarQRModal(); });

// ─── DATA LOADERS (API → tablas) ─────────────────────────────
const TIER_MAP = { Elite:'Elite', Platino:'Platino', Oro:'Oro', Plata:'Plata', Bronce:'Bronce' };

async function loadCompanies() {
  const tbody = document.getElementById('companies-tbody');
  const badge = document.getElementById('companies-count');
  if (!tbody) return;
  let data = await apiFetch('/companies');
  const isDemo = !data || !data.length;
  if (isDemo) data = DEMO.companies;
  if (badge) badge.textContent = `${data.length} empresas${isDemo ? ' — Demo' : ''}`;
  const stColors = { true: '#10b981', false: '#ef4444' };
  tbody.innerHTML = data.map((c, i) => `<tr>
    <td style="color:#8b5cf6">${i+1}</td>
    <td><strong>${c.name || c.nombre || '—'}</strong></td>
    <td style="color:#94a3b8">${c.city || c.ciudad || '—'}</td>
    <td style="color:#22d3ee">${c.employees || c.employeeCount || '—'}</td>
    <td>${tierPill(c.tier || 'Bronce')}</td>
    <td><span style="color:${c.active !== false ? '#10b981' : '#ef4444'};font-weight:600">${c.active !== false ? '✓ Activa' : '✕ Inactiva'}</span></td>
  </tr>`).join('');
  if (isDemo) tbody.innerHTML += `<tr><td colspan="6" style="text-align:center;font-size:.75rem;color:#4a5568;padding:8px;border-top:1px solid rgba(255,255,255,.05)">⚠️ Datos de ejemplo — conecta el backend para ver datos reales</td></tr>`;
}

async function loadEmployees() {
  const tbody = document.getElementById('employees-tbody');
  const badge = document.getElementById('employees-count');
  if (!tbody) return;
  let data = await apiFetch('/employees');
  const isDemo = !data || !data.length;
  if (isDemo) data = DEMO.employees;
  if (badge) badge.textContent = `${data.length} empleados${isDemo ? ' — Demo' : ''}`;
  tbody.innerHTML = data.map((e, i) => `<tr>
    <td style="color:#22d3ee">${i+1}</td>
    <td><strong>${e.name || e.nombre || '—'}</strong></td>
    <td style="color:#94a3b8">${e.company?.name || e.companyName || e.company || '—'}</td>
    <td style="color:#f59e0b;font-weight:600">$${(e.baseSalary || e.salary || 0).toLocaleString('es-VE')}</td>
    <td>${tierPill(e.reputationTier || e.tier || 'Bronce')}</td>
    <td style="color:#c4b5fd;font-weight:700">${e.ltkBalance || e.tokens || e.ltk || 0} LTK</td>
  </tr>`).join('');
  if (isDemo) tbody.innerHTML += `<tr><td colspan="6" style="text-align:center;font-size:.75rem;color:#4a5568;padding:8px;border-top:1px solid rgba(255,255,255,.05)">⚠️ Datos de ejemplo — conecta el backend para ver datos reales</td></tr>`;
}

async function loadAdvances() {
  const tbody = document.getElementById('advances-tbody');
  const badge = document.getElementById('advances-count');
  if (!tbody) return;
  let data = await apiFetch('/advances');
  const isDemo = !data || !data.length;
  if (isDemo) data = DEMO.advances;
  if (badge) badge.textContent = `${data.length} adelantos${isDemo ? ' — Demo' : ''}`;
  const stColors = { DISBURSED:'#10b981', PENDING:'#f59e0b', FAILED:'#ef4444', APPROVED:'#22d3ee' };
  tbody.innerHTML = data.map((a, i) => {
    const st = a.status || 'PENDING';
    return `<tr>
      <td style="color:#f59e0b">${i+1}</td>
      <td><strong>${a.employee?.name || a.employeeName || a.employee || '—'}</strong></td>
      <td style="color:#94a3b8">${a.company?.name || a.companyName || a.company || '—'}</td>
      <td style="color:#6ee7b7;font-weight:700">$${(a.amount || 0).toLocaleString('es-VE')}</td>
      <td><span style="color:${stColors[st]||'#94a3b8'};font-weight:700">${st}</span></td>
      <td style="color:#64748b">${a.createdAt ? new Date(a.createdAt).toLocaleDateString('es-VE') : a.date || '—'}</td>
    </tr>`;
  }).join('');
  if (isDemo) tbody.innerHTML += `<tr><td colspan="6" style="text-align:center;font-size:.75rem;color:#4a5568;padding:8px;border-top:1px solid rgba(255,255,255,.05)">⚠️ Datos de ejemplo — conecta el backend para ver datos reales</td></tr>`;
}

async function loadReviews() {
  const list  = document.getElementById('reviews-list');
  const badge = document.getElementById('reviews-count');
  if (!list) return;
  const localReviews = JSON.parse(localStorage.getItem('reseñas') || '[]');
  const apiReviews   = await apiFetch('/reviews') || [];
  let all = [...apiReviews, ...localReviews];
  const isDemo = !all.length;
  if (isDemo) all = DEMO.reviews;
  if (badge) badge.textContent = `${all.length} reseñas${isDemo ? ' — Demo' : ''}`;
  const stars = n => '★'.repeat(Math.min(5,Math.max(1,n||5))) + '☆'.repeat(5-Math.min(5,Math.max(1,n||5)));
  list.innerHTML = all.map(r => `
    <div style="padding:14px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <strong style="color:#e2e8f0">${r.comercio || r.merchantName || r.comment || 'Reseña'}</strong>
        <span style="color:#f59e0b;font-size:.9rem">${stars(r.rating)}</span>
      </div>
      <div style="font-size:.8rem;color:#64748b">
        ${r.red ? `Red: <span style="color:#8b5cf6">${r.red}</span> · ` : ''}Monto: <span style="color:#10b981">$${r.monto || r.amount || '—'}</span>
        ${r.ltkGanados || r.ltk ? ` · <span style="color:#c4b5fd">+${r.ltkGanados || r.ltk} LTK</span>` : ''}
        ${r.date ? ` · ${r.date}` : r.timestamp ? ` · ${new Date(r.timestamp).toLocaleDateString('es-VE')}` : ''}
      </div>
    </div>`).join('');
  if (isDemo) list.innerHTML += `<div style="text-align:center;font-size:.75rem;color:#4a5568;padding:10px">⚠️ Datos de ejemplo — confirma un pago en el CriptoMapa para ver reseñas reales</div>`;
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
  setTimeout(() => showToast('👋 Bienvenido al Dashboard de PagaFácil — Modo Demo activo'), 800);
});
