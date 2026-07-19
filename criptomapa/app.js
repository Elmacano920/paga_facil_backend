/* CriptoMapa – app.js — v2.0
   Nuevas funciones: validador wallets, generador QR, escáner QR, confirmación de pago
*/

// ══════════════════════════════════════════════════════════
//  BASE DE DATOS DE COMERCIOS
// ══════════════════════════════════════════════════════════
const COMERCIOS = [
  { id:1,  nombre:"Panadería El Trigo",      categoria:"Panadería",    direccion:"Av. Libertador, Caracas",                   lat:10.4806, lng:-66.9036, redes:["TRC-20","BEP-20"],             monedas:["USDT","USDC"],            wallets:{ "TRC-20":"TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE", "BEP-20":"0x742d35Cc6634C0532925a3b8D4C9E2E3f1A2bC4d" }, telefono:"+58 412-555-0101", horario:"Lun-Sab 6am-8pm",   verificado:true  },
  { id:2,  nombre:"Farmacia Salud Plus",     categoria:"Farmacia",     direccion:"C.C. Las Mercedes, Caracas",                lat:10.4775, lng:-66.8534, redes:["TRC-20","Lightning"],          monedas:["USDT","BTC"],             wallets:{ "TRC-20":"TYASr5UV6HEcXatwdFyfindTKeTvvbgBKA", "Lightning":"lnbc150n1pj5xg3xsp5" }, telefono:"+58 414-555-0202", horario:"Lun-Dom 8am-10pm",  verificado:true  },
  { id:3,  nombre:"Restaurante La Arepa",    categoria:"Restaurante",  direccion:"Chacao, Caracas",                           lat:10.4910, lng:-66.8530, redes:["BEP-20"],                      monedas:["USDT","BNB"],             wallets:{ "BEP-20":"0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454" }, telefono:"+58 416-555-0303", horario:"Lun-Dom 12pm-9pm",  verificado:false },
  { id:4,  nombre:"Librería Cultural",       categoria:"Librería",     direccion:"El Rosal, Caracas",                         lat:10.4855, lng:-66.8612, redes:["TRC-20","BEP-20","Lightning"], monedas:["USDT","USDC","BTC"],      wallets:{ "TRC-20":"TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7", "BEP-20":"0x4E9Ce36E442e55EcD9025B9a6E0D88485d628A8", "Lightning":"lnbc500n1pj5xa2q" }, telefono:"+58 412-555-0404", horario:"Lun-Vie 9am-6pm",   verificado:true  },
  { id:5,  nombre:"Taller Mecánico Veloz",   categoria:"Taller",       direccion:"Petare, Caracas",                           lat:10.4953, lng:-66.7985, redes:["Lightning"],                   monedas:["BTC"],                    wallets:{ "Lightning":"lnbc1u1pj5xb3r" }, telefono:"+58 424-555-0505", horario:"Lun-Sab 8am-5pm",   verificado:true  },
  { id:6,  nombre:"Supermercado FreshMart",  categoria:"Supermercado", direccion:"Los Palos Grandes, Caracas",                lat:10.4990, lng:-66.8420, redes:["TRC-20","BEP-20","Lightning"], monedas:["USDT","USDC","BTC","BNB"],wallets:{ "TRC-20":"TKFLQDu4fqmRUFfxDChsHSRWiDZUhf8", "BEP-20":"0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE", "Lightning":"lnbc1m1pj5xc5x" }, telefono:"+58 412-555-0606", horario:"Lun-Dom 7am-11pm",  verificado:true  },
  { id:7,  nombre:"Farmacia San Juan",       categoria:"Farmacia",     direccion:"Av. Bolívar, San Juan de los Morros",       lat:9.9094,  lng:-67.3558, redes:["TRC-20","BEP-20"],             monedas:["USDT","USDC"],            wallets:{ "TRC-20":"TM1zzNDZD2DPASbKcgdVoTYhfmYgtfwkKR", "BEP-20":"0x28C6c06298d514Db089934071355E5743bf21d60" }, telefono:"+58 412-555-0707", horario:"Lun-Dom 8am-9pm",   verificado:true  },
  { id:8,  nombre:"Panadería La Guariqueña", categoria:"Panadería",    direccion:"Calle Comercio, San Juan de los Morros",    lat:9.9120,  lng:-67.3610, redes:["TRC-20"],                      monedas:["USDT"],                   wallets:{ "TRC-20":"TLyqzVGLV1srkB7dToTAEqgDkvZDefnZjb" }, telefono:"+58 414-555-0808", horario:"Lun-Sab 5am-7pm",   verificado:true  },
  { id:9,  nombre:"Restaurante El Llanero",  categoria:"Restaurante",  direccion:"Av. Miranda, San Juan de los Morros",       lat:9.9075,  lng:-67.3590, redes:["BEP-20","Lightning"],          monedas:["USDT","BTC","BNB"],       wallets:{ "BEP-20":"0xF977814e90dA44bFA03b6295A0616a897441aceE", "Lightning":"lnbc2u1pj5xd9p" }, telefono:"+58 416-555-0909", horario:"Lun-Dom 11am-10pm", verificado:true  },
  { id:10, nombre:"Ferretería El Tornillo",  categoria:"Ferretería",   direccion:"Sector Centro, San Juan de los Morros",     lat:9.9058,  lng:-67.3542, redes:["TRC-20","BEP-20"],             monedas:["USDT"],                   wallets:{ "TRC-20":"TDqSquXBgUCLYvYC4XZgrprLK589dkhSh5", "BEP-20":"0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8" }, telefono:"+58 424-555-1010", horario:"Lun-Sab 7am-6pm",   verificado:false },
  { id:11, nombre:"Bodegón Cripto Guárico",  categoria:"Bodegón",      direccion:"Urb. Los Jardines, San Juan de los Morros", lat:9.9140,  lng:-67.3625, redes:["TRC-20","BEP-20","Lightning"], monedas:["USDT","USDC","BTC"],      wallets:{ "TRC-20":"TKVEWbA7pMiTMNDKE7J7ExBY1mQtAAbBsK", "BEP-20":"0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a", "Lightning":"lnbc5u1pj5xe2t" }, telefono:"+58 412-555-1111", horario:"Lun-Dom 8am-8pm",   verificado:true  },
];

// ══════════════════════════════════════════════════════════
//  VALIDADOR DE DIRECCIONES WALLET (Integrante 1)
// ══════════════════════════════════════════════════════════
const WALLET_PATTERNS = {
  'TRC-20':    { regex: /^T[A-Za-z1-9]{33}$/,                      label: 'Tron (TRC-20)',            color: '#ef4444' },
  'BEP-20':    { regex: /^0x[a-fA-F0-9]{40}$/,                     label: 'BNB Smart Chain (BEP-20)', color: '#f59e0b' },
  'Lightning': { regex: /^(lnbc|lnbtc|lntb)[0-9a-z]+$/i,          label: 'Lightning Network (BTC)',   color: '#f97316' },
  'Bitcoin':   { regex: /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/, label: 'Bitcoin', color: '#f59e0b' },
};

function validarWallet(address) {
  if (!address || address.trim().length < 10) return null;
  const addr = address.trim();
  for (const [red, { regex, label, color }] of Object.entries(WALLET_PATTERNS)) {
    if (regex.test(addr)) return { red, label, color };
  }
  return { red: 'Desconocida', label: 'Dirección no reconocida', color: '#6b7280' };
}

function onWalletInput(input) {
  const resultado = document.getElementById('wallet-deteccion');
  if (!resultado) return;
  const r = validarWallet(input.value);
  if (!r) { resultado.innerHTML = ''; return; }
  resultado.innerHTML = `<span style="background:${r.color}22;color:${r.color};border:1px solid ${r.color}55;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:700">${r.red === 'Desconocida' ? '⚠️ ' : '✅ '}${r.label}</span>`;
}

// ══════════════════════════════════════════════════════════
//  ESTADO Y MAPA
// ══════════════════════════════════════════════════════════
const estado = {
  ubicacion: null,
  marcadores: {},
  filtros: { red: '', moneda: '', radio: 5 },
  ltk: parseInt(localStorage.getItem('ltk') || '0'),
};

const mapa = L.map('mapa', { center: [9.9094, -67.3558], zoom: 13 });
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap © CartoDB', maxZoom: 19,
}).addTo(mapa);

let marcadorUsr = null, circulo = null;

// ══════════════════════════════════════════════════════════
//  DISTANCIA HAVERSINE
// ══════════════════════════════════════════════════════════
function km(la1, lo1, la2, lo2) {
  const R = 6371, r = Math.PI / 180;
  const a = Math.sin((la2 - la1) * r / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ══════════════════════════════════════════════════════════
//  FILTRADO (Integrante 2)
// ══════════════════════════════════════════════════════════
function filtrar() {
  const { red, moneda, radio } = estado.filtros;
  return COMERCIOS
    .map(c => ({ ...c, d: estado.ubicacion ? km(estado.ubicacion.lat, estado.ubicacion.lng, c.lat, c.lng) : null }))
    .filter(c => {
      if (red    && !c.redes.includes(red))      return false;
      if (moneda && !c.monedas.includes(moneda)) return false;
      if (estado.ubicacion && radio > 0 && c.d > radio) return false;
      return true;
    })
    .sort((a, b) => (a.d ?? 999) - (b.d ?? 999));
}

// ══════════════════════════════════════════════════════════
//  BADGES Y ESTILOS
// ══════════════════════════════════════════════════════════
const RC = { 'TRC-20': 'b-trc', 'BEP-20': 'b-bep', 'Lightning': 'b-ln' };
const br = r => `<span class="badge ${RC[r] || 'b-trc'}">${r}</span>`;
const bc = m => `<span class="badge b-coin">${m}</span>`;

// ══════════════════════════════════════════════════════════
//  ICONOS DE MAPA
// ══════════════════════════════════════════════════════════
function icono(c) {
  const col = c.verificado ? '#3b82f6' : '#4b5563';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="28" height="37">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11 14 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z"
          fill="${col}" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>
    <text x="16" y="21" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#fff" font-weight="bold">₿</text>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 37], iconAnchor: [14, 37], popupAnchor: [0, -38] });
}

// ══════════════════════════════════════════════════════════
//  POPUP Y RENDER
// ══════════════════════════════════════════════════════════
function popup(c) {
  const ds = c.d != null ? ` · ${c.d.toFixed(1)} km` : '';
  return `<div class="p-nombre">${c.nombre}</div>
    <div class="p-cat">${c.categoria}${ds}</div>
    <div class="p-redes">${c.redes.map(br).join('')}</div>
    <button class="p-btn" onclick="abrirModal(${c.id})">Ver detalles / Pagar</button>`;
}

function render() {
  const lista = filtrar();
  Object.values(estado.marcadores).forEach(m => mapa.removeLayer(m));
  estado.marcadores = {};
  lista.forEach(c => {
    const m = L.marker([c.lat, c.lng], { icon: icono(c) }).addTo(mapa).bindPopup(popup(c));
    m.on('click', () => resaltarCard(c.id));
    estado.marcadores[c.id] = m;
  });
  const el = document.getElementById('lista');
  if (!lista.length) {
    el.innerHTML = '<li class="hint">No hay comercios con esos filtros.</li>';
  } else {
    el.innerHTML = lista.map(c => {
      const verif = c.verificado ? '<span class="badge b-ok">✓</span>' : '<span class="badge b-warn">Sin verificar</span>';
      const distEl = c.d != null ? `<span class="card-dist">${c.d.toFixed(1)} km</span>` : '';
      return `<li class="card" id="card-${c.id}" onclick="focusMarcador(${c.id})">
        <div class="card-top"><span class="card-nombre">${c.nombre}</span>${distEl}</div>
        <div class="card-cat">${c.categoria}</div>
        <div class="card-redes">${c.redes.map(br).join('')} ${verif}</div>
      </li>`;
    }).join('');
  }
  document.getElementById('contador').textContent = lista.length;
}

function focusMarcador(id) {
  const m = estado.marcadores[id];
  if (!m) return;
  mapa.setView(m.getLatLng(), 16, { animate: true });
  m.openPopup();
  resaltarCard(id);
}

function resaltarCard(id) {
  document.querySelectorAll('.card').forEach(el => el.classList.remove('activo'));
  const c = document.getElementById(`card-${id}`);
  if (c) { c.classList.add('activo'); c.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

// ══════════════════════════════════════════════════════════
//  MODAL DETALLE + PASARELA DE PAGO QR (Integrante 3)
// ══════════════════════════════════════════════════════════
function abrirModal(id) {
  const c = COMERCIOS.find(x => x.id === id);
  if (!c) return;
  const ds = estado.ubicacion ? `${km(estado.ubicacion.lat, estado.ubicacion.lng, c.lat, c.lng).toFixed(2)} km` : '—';
  const verif = c.verificado ? '✓ Verificado' : 'Sin verificar';
  const redOpts = c.redes.map(r => `<option value="${r}">${r}</option>`).join('');

  document.getElementById('modal-body').innerHTML = `
    <div class="m-nombre">${c.nombre}</div>
    <div class="m-cat">${c.categoria} · ${verif}</div>
    <div class="m-row"><span class="m-label">Dirección</span><span>${c.direccion}</span></div>
    <div class="m-row"><span class="m-label">Teléfono</span><span>${c.telefono}</span></div>
    <div class="m-row"><span class="m-label">Horario</span><span>${c.horario}</span></div>
    <div class="m-row"><span class="m-label">Distancia</span><span>${ds}</span></div>
    <div class="m-redes">${c.redes.map(br).join('')}</div>
    <div class="m-monedas">${c.monedas.map(bc).join('')}</div>

    <!-- ── PASARELA QR ── -->
    <div style="margin-top:18px;padding:16px;background:rgba(255,255,255,.04);border-radius:12px;border:1px solid rgba(255,255,255,.1)">
      <div style="font-weight:700;color:#f59e0b;margin-bottom:12px;font-size:.9rem">💳 Generar QR de Pago</div>

      <div style="display:grid;gap:10px">
        <div>
          <label style="font-size:.75rem;color:#94a3b8;display:block;margin-bottom:4px">Red de pago</label>
          <select id="qr-red" onchange="actualizarWalletQR(${id})" style="width:100%;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:8px;font-size:.85rem">
            ${redOpts}
          </select>
        </div>

        <div>
          <label style="font-size:.75rem;color:#94a3b8;display:block;margin-bottom:4px">Monto (USD)</label>
          <input id="qr-monto" type="number" min="0.01" step="0.01" placeholder="Ej: 25.50"
            style="width:100%;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:8px;font-size:.85rem;box-sizing:border-box" />
        </div>

        <div>
          <label style="font-size:.75rem;color:#94a3b8;display:block;margin-bottom:4px">Wallet del comercio (auto)</label>
          <input id="qr-wallet" type="text" readonly
            style="width:100%;background:#0f172a;color:#64748b;border:1px solid #1e293b;border-radius:8px;padding:8px;font-size:.7rem;font-family:monospace;box-sizing:border-box" />
          <div id="wallet-deteccion" style="margin-top:4px"></div>
        </div>

        <div>
          <label style="font-size:.75rem;color:#94a3b8;display:block;margin-bottom:4px">Wallet del cliente (verificar)</label>
          <input id="cliente-wallet" type="text" placeholder="Pega tu wallet para validarla"
            oninput="onWalletInput(this)"
            style="width:100%;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:8px;font-size:.75rem;font-family:monospace;box-sizing:border-box" />
        </div>

        <button onclick="generarQR(${id})"
          style="background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;border:none;padding:10px;border-radius:10px;font-weight:700;cursor:pointer;font-size:.9rem">
          ⚡ Generar QR de Pago
        </button>
      </div>

      <!-- Contenedor QR -->
      <div id="qr-container" style="display:none;margin-top:16px;text-align:center">
        <canvas id="qr-canvas" style="border-radius:12px;box-shadow:0 0 20px rgba(124,58,237,.4)"></canvas>
        <div id="qr-info" style="margin-top:8px;font-size:.7rem;color:#94a3b8;word-break:break-all"></div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
          <button onclick="descargarQR()" style="background:#1e293b;color:#e2e8f0;border:1px solid #334155;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.8rem">⬇ Descargar</button>
          <button onclick="confirmarPago(${id})" style="background:#10b981;color:#fff;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-weight:700;font-size:.8rem">✅ Confirmar pago exitoso</button>
        </div>
      </div>
    </div>
  `;

  // Auto-llenar wallet de la primera red
  actualizarWalletQR(id);
  document.getElementById('modal').classList.remove('hidden');
}

// actualizarWalletQR ya está reemplazada por seleccionarRedQR — se mantiene por compatibilidad
function actualizarWalletQR(comercioId) { /* compatibilidad — ver seleccionarRedQR */ }

// ══════════════════════════════════════════════════════════
//  GENERADOR DE QR — diseño fusionado con qr.html (Integrante 3)
// ══════════════════════════════════════════════════════════
function generarQR(comercioId) {
  const c      = COMERCIOS.find(x => x.id === comercioId);
  const red    = window._redQRActual || c.redes[0];
  const monto  = parseFloat(document.getElementById('qr-monto')?.value || 0);
  const wallet = c.wallets[red] || '';

  const cuadroQR = document.getElementById('cuadro-qr');
  const output   = document.getElementById('output-qr');
  const spinner  = document.getElementById('qr-spinner');
  const textoQR  = document.getElementById('texto-qr');
  const btnConf  = document.getElementById('btn-confirmar');

  if (!monto || monto <= 0) {
    mostrarToast('⚠️ Ingresa un monto válido', '#ef4444');
    return;
  }
  if (!wallet) {
    mostrarToast('⚠️ Este comercio no tiene wallet para esta red', '#ef4444');
    return;
  }

  // Ocultar anterior y mostrar spinner (igual que qr.html)
  cuadroQR.style.display = 'none';
  output.style.display   = 'none';
  if (btnConf) btnConf.style.display = 'none';
  spinner.style.display  = 'block';

  setTimeout(() => {
    spinner.style.display = 'none';

    // Texto unificado: mismo formato de qr.html + datos del comercio
    const textoUnificado = `${monto}|${red}|${wallet}|${c.nombre}`;

    // Generar QR con qrcodejs (div-based, igual que qr.html)
    cuadroQR.innerHTML = '';
    cuadroQR.style.display = 'block';
    new QRCode(cuadroQR, {
      text: textoUnificado,
      width: 185,
      height: 185,
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Mostrar cadena copiable (igual que qr.html)
    output.style.display = 'block';
    textoQR.textContent  = textoUnificado;

    // Mostrar botón confirmar pago
    if (btnConf) btnConf.style.display = 'block';

    mostrarToast(`✅ QR generado — $${monto.toFixed(2)} en ${red}`, '#00ffcc');
  }, 1000); // spinner de 1 seg como en qr.html
}

function copiarTextoQR() {
  const texto = document.getElementById('texto-qr')?.textContent || '';
  navigator.clipboard.writeText(texto).then(() => {
    const toast = document.getElementById('toast-qr');
    if (!toast) return;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
  });
}

// ══════════════════════════════════════════════════════════
//  CONFIRMACIÓN DE PAGO → CASHBACK LTK (Integrante 4)
// ══════════════════════════════════════════════════════════
function confirmarPago(comercioId) {
  const c = COMERCIOS.find(x => x.id === comercioId);
  const monto = parseFloat(document.getElementById('qr-monto')?.value || 0);
  if (!monto || monto <= 0) {
    mostrarToast('Ingresa el monto antes de confirmar', '#ef4444');
    return;
  }

  // Lógica de incentivos: tokens LTK según monto
  const ltkGanados = monto >= 50 ? 25 : monto >= 20 ? 10 : 5;
  estado.ltk += ltkGanados;
  localStorage.setItem('ltk', estado.ltk);

  // Simulación de reseña automática
  const reseña = {
    comercioId,
    comercio: c.nombre,
    monto,
    red: window._redQRActual || '',  // red seleccionada en el modal
    ltkGanados,
    timestamp: new Date().toISOString(),
  };
  const reseñas = JSON.parse(localStorage.getItem('reseñas') || '[]');
  reseñas.push(reseña);
  localStorage.setItem('reseñas', JSON.stringify(reseñas));

  // Feedback visual (estilo verde de qr.html)
  const zona = document.getElementById('output-qr');
  if (zona) zona.innerHTML += `
    <div style="margin-top:14px;padding:14px;background:rgba(46,160,67,.12);border:1px solid #2ea043;border-radius:10px;text-align:center">
      <div style="font-size:1.8rem">🎉</div>
      <div style="color:#2ea043;font-weight:700;font-size:1rem">¡Pago confirmado!</div>
      <div style="color:#56d364;font-size:.85rem;margin-top:4px">+${ltkGanados} LTK acreditados a tu wallet</div>
      <div style="color:#8b949e;font-size:.75rem;margin-top:2px">Balance total: ${estado.ltk} LTK</div>
    </div>`;
  const btnConf = document.getElementById('btn-confirmar');
  if (btnConf) btnConf.style.display = 'none';

  mostrarToast(`🎉 ¡+${ltkGanados} LTK! Pago en ${c.nombre} confirmado`);
}

// ══════════════════════════════════════════════════════════
//  ESCÁNER QR (Integrante 3)
// ══════════════════════════════════════════════════════════
let html5QrScanner = null;

function abrirEscaner() {
  document.getElementById('modal-scan').classList.remove('hidden');
  document.getElementById('scan-result').textContent = 'Iniciando cámara…';

  html5QrScanner = new Html5Qrcode('qr-reader');
  html5QrScanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText) => {
      procesarQRLeido(decodedText);
      cerrarEscaner();
    },
    (err) => {}
  ).catch(() => {
    document.getElementById('scan-result').textContent = '⚠️ No se pudo acceder a la cámara. Permite el acceso en tu navegador.';
  });
}

function cerrarEscaner() {
  document.getElementById('modal-scan').classList.add('hidden');
  if (html5QrScanner) {
    html5QrScanner.stop().catch(() => {});
    html5QrScanner = null;
  }
}

function procesarQRLeido(texto) {
  // Parsear el formato: pagafacil://pay?merchant=X&amount=Y&wallet=Z&network=W
  try {
    const url = new URL(texto.replace('pagafacil://', 'https://pagafacil.app/'));
    const merchant = decodeURIComponent(url.searchParams.get('merchant') || '');
    const amount   = url.searchParams.get('amount') || '0';
    const wallet   = url.searchParams.get('wallet') || '';
    const network  = url.searchParams.get('network') || '';
    const valid    = validarWallet(wallet);

    mostrarToast(`📷 QR leído: $${amount} para ${merchant} vía ${network}`, '#7c3aed', 5000);

    // Buscar comercio en la lista
    const comercio = COMERCIOS.find(c => c.nombre === merchant);
    if (comercio) {
      focusMarcador(comercio.id);
      setTimeout(() => abrirModal(comercio.id), 600);
    }
  } catch {
    mostrarToast('⚠️ QR no reconocido como pago CriptoMapa', '#ef4444');
  }
}

// ══════════════════════════════════════════════════════════
//  GEOLOCALIZACIÓN (Integrante 2)
// ══════════════════════════════════════════════════════════
function usarUbicacion() {
  const btn = document.getElementById('btn-ubicacion');
  btn.textContent = '⏳ Localizando…';
  btn.disabled = true;

  if (!navigator.geolocation) { mostrarToast('Geolocalización no disponible', '#ef4444'); resetBtn(); return; }

  navigator.geolocation.getCurrentPosition(({ coords }) => {
    estado.ubicacion = { lat: coords.latitude, lng: coords.longitude };

    if (marcadorUsr) mapa.removeLayer(marcadorUsr);
    if (circulo)     mapa.removeLayer(circulo);

    marcadorUsr = L.circleMarker([coords.latitude, coords.longitude], {
      radius: 9, fillColor: '#3b82f6', color: '#fff', fillOpacity: 1, weight: 2.5,
    }).addTo(mapa).bindPopup('<strong>📍 Tu ubicación</strong>').openPopup();

    const r = estado.filtros.radio;
    if (r > 0) {
      circulo = L.circle([coords.latitude, coords.longitude], {
        radius: r * 1000, color: '#3b82f6', fillColor: '#3b82f6',
        fillOpacity: 0.06, weight: 1.5, dashArray: '6',
      }).addTo(mapa);
    }
    mapa.setView([coords.latitude, coords.longitude], 14);
    resetBtn();
    render();
    mostrarToast('📍 Ubicación activada — comercios ordenados por cercanía');
  }, () => {
    mostrarToast('No se pudo obtener la ubicación', '#ef4444');
    resetBtn();
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function resetBtn() {
  const btn = document.getElementById('btn-ubicacion');
  btn.textContent = '📍 Mi ubicación';
  btn.disabled = false;
}

// ══════════════════════════════════════════════════════════
//  TOAST Y MODAL HELPERS
// ══════════════════════════════════════════════════════════
function mostrarToast(msg, color = '#10b981', dur = 3500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.background = color;
  el.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => { el.style.transform = 'translateX(-50%) translateY(80px)'; }, dur);
}

function cerrarModal() { document.getElementById('modal').classList.add('hidden'); }

// ══════════════════════════════════════════════════════════
//  EVENTOS
// ══════════════════════════════════════════════════════════
document.getElementById('filtro-red').addEventListener('change', e => { estado.filtros.red = e.target.value; render(); });
document.getElementById('filtro-moneda').addEventListener('change', e => { estado.filtros.moneda = e.target.value; render(); });
document.getElementById('filtro-radio').addEventListener('change', e => {
  estado.filtros.radio = parseFloat(e.target.value);
  if (estado.ubicacion) {
    if (circulo) mapa.removeLayer(circulo);
    const r = estado.filtros.radio;
    if (r > 0) {
      circulo = L.circle([estado.ubicacion.lat, estado.ubicacion.lng], {
        radius: r * 1000, color: '#3b82f6', fillColor: '#3b82f6',
        fillOpacity: 0.06, weight: 1.5, dashArray: '6',
      }).addTo(mapa);
    }
  }
  render();
});
document.getElementById('btn-ubicacion').addEventListener('click', usarUbicacion);
document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') cerrarModal(); });
document.getElementById('modal-scan').addEventListener('click', e => { if (e.target.id === 'modal-scan') cerrarEscaner(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { cerrarModal(); cerrarEscaner(); } });

// Exponer globales
window.abrirModal        = abrirModal;
window.focusMarcador     = focusMarcador;
window.cerrarModal       = cerrarModal;
window.abrirEscaner      = abrirEscaner;
window.cerrarEscaner     = cerrarEscaner;
window.generarQR         = generarQR;
window.descargarQR       = descargarQR;
window.confirmarPago     = confirmarPago;
window.actualizarWalletQR = actualizarWalletQR;
window.onWalletInput     = onWalletInput;

render();
