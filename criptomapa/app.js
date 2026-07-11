/* CriptoMapa – app.js */

const COMERCIOS = [
  { id:1,  nombre:"Panadería El Trigo",      categoria:"Panadería",    direccion:"Av. Libertador, Caracas",                   lat:10.4806, lng:-66.9036, redes:["TRC-20","BEP-20"],             monedas:["USDT","USDC"],            telefono:"+58 412-555-0101", horario:"Lun-Sab 6am-8pm",   verificado:true  },
  { id:2,  nombre:"Farmacia Salud Plus",     categoria:"Farmacia",     direccion:"C.C. Las Mercedes, Caracas",                lat:10.4775, lng:-66.8534, redes:["TRC-20","Lightning"],          monedas:["USDT","BTC"],             telefono:"+58 414-555-0202", horario:"Lun-Dom 8am-10pm",  verificado:true  },
  { id:3,  nombre:"Restaurante La Arepa",    categoria:"Restaurante",  direccion:"Chacao, Caracas",                           lat:10.4910, lng:-66.8530, redes:["BEP-20"],                      monedas:["USDT","BNB"],             telefono:"+58 416-555-0303", horario:"Lun-Dom 12pm-9pm",  verificado:false },
  { id:4,  nombre:"Librería Cultural",       categoria:"Librería",     direccion:"El Rosal, Caracas",                         lat:10.4855, lng:-66.8612, redes:["TRC-20","BEP-20","Lightning"], monedas:["USDT","USDC","BTC"],      telefono:"+58 412-555-0404", horario:"Lun-Vie 9am-6pm",   verificado:true  },
  { id:5,  nombre:"Taller Mecánico Veloz",   categoria:"Taller",       direccion:"Petare, Caracas",                           lat:10.4953, lng:-66.7985, redes:["Lightning"],                   monedas:["BTC"],                    telefono:"+58 424-555-0505", horario:"Lun-Sab 8am-5pm",   verificado:true  },
  { id:6,  nombre:"Supermercado FreshMart",  categoria:"Supermercado", direccion:"Los Palos Grandes, Caracas",                lat:10.4990, lng:-66.8420, redes:["TRC-20","BEP-20","Lightning"], monedas:["USDT","USDC","BTC","BNB"],telefono:"+58 412-555-0606", horario:"Lun-Dom 7am-11pm",  verificado:true  },
  { id:7,  nombre:"Farmacia San Juan",       categoria:"Farmacia",     direccion:"Av. Bolívar, San Juan de los Morros",       lat:9.9094,  lng:-67.3558, redes:["TRC-20","BEP-20"],             monedas:["USDT","USDC"],            telefono:"+58 412-555-0707", horario:"Lun-Dom 8am-9pm",   verificado:true  },
  { id:8,  nombre:"Panadería La Guariqueña", categoria:"Panadería",    direccion:"Calle Comercio, San Juan de los Morros",    lat:9.9120,  lng:-67.3610, redes:["TRC-20"],                      monedas:["USDT"],                   telefono:"+58 414-555-0808", horario:"Lun-Sab 5am-7pm",   verificado:true  },
  { id:9,  nombre:"Restaurante El Llanero",  categoria:"Restaurante",  direccion:"Av. Miranda, San Juan de los Morros",       lat:9.9075,  lng:-67.3590, redes:["BEP-20","Lightning"],          monedas:["USDT","BTC","BNB"],       telefono:"+58 416-555-0909", horario:"Lun-Dom 11am-10pm", verificado:true  },
  { id:10, nombre:"Ferretería El Tornillo",  categoria:"Ferretería",   direccion:"Sector Centro, San Juan de los Morros",     lat:9.9058,  lng:-67.3542, redes:["TRC-20","BEP-20"],             monedas:["USDT"],                   telefono:"+58 424-555-1010", horario:"Lun-Sab 7am-6pm",   verificado:false },
  { id:11, nombre:"Bodegón Cripto Guárico",  categoria:"Bodegón",      direccion:"Urb. Los Jardines, San Juan de los Morros", lat:9.9140,  lng:-67.3625, redes:["TRC-20","BEP-20","Lightning"], monedas:["USDT","USDC","BTC"],      telefono:"+58 412-555-1111", horario:"Lun-Dom 8am-8pm",   verificado:true  },
];

// Estado
const estado = {
  ubicacion: null,
  marcadores: {},
  filtros: { red: '', moneda: '', radio: 5 },
};

// Mapa (tile oscuro de Carto)
const mapa = L.map('mapa', { center: [9.9094, -67.3558], zoom: 13 });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors', maxZoom: 19,
}).addTo(mapa);

let marcadorUsr = null, circulo = null;

// Haversine
function km(la1, lo1, la2, lo2) {
  const R = 6371, r = Math.PI/180;
  const a = Math.sin((la2-la1)*r/2)**2 + Math.cos(la1*r)*Math.cos(la2*r)*Math.sin((lo2-lo1)*r/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// Filtrar
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
    .sort((a,b) => (a.d ?? 999) - (b.d ?? 999));
}

// Badges
const RC = { 'TRC-20':'b-trc','BEP-20':'b-bep','Lightning':'b-ln' };
const br = r => `<span class="badge ${RC[r]||'b-trc'}">${r}</span>`;
const bc = m => `<span class="badge b-coin">${m}</span>`;

// Icono
function icono(c) {
  const col = c.verificado ? '#3b82f6' : '#4b5563';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="28" height="37">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11 14 26 16 26s16-15 16-26C32 7.16 24.84 0 16 0z"
          fill="${col}" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>
    <text x="16" y="21" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#fff" font-weight="bold">₿</text>
  </svg>`;
  return L.divIcon({ html: svg, className:'', iconSize:[28,37], iconAnchor:[14,37], popupAnchor:[0,-38] });
}

// Popup
function popup(c) {
  const ds = c.d != null ? ` · ${c.d.toFixed(1)} km` : '';
  return `<div class="p-nombre">${c.nombre}</div>
    <div class="p-cat">${c.categoria}${ds}</div>
    <div class="p-redes">${c.redes.map(br).join('')}</div>
    <button class="p-btn" onclick="abrirModal(${c.id})">Ver detalles</button>`;
}

// Renderizar
function render() {
  const lista = filtrar();

  Object.values(estado.marcadores).forEach(m => mapa.removeLayer(m));
  estado.marcadores = {};

  lista.forEach(c => {
    const m = L.marker([c.lat, c.lng], { icon: icono(c) })
      .addTo(mapa).bindPopup(popup(c));
    m.on('click', () => resaltarCard(c.id));
    estado.marcadores[c.id] = m;
  });

  // Lista
  const el = document.getElementById('lista');
  if (!lista.length) {
    el.innerHTML = '<li class="hint">No hay comercios con esos filtros.</li>';
  } else {
    el.innerHTML = lista.map(c => {
      const verif = c.verificado
        ? '<span class="badge b-ok">✓</span>'
        : '<span class="badge b-warn">Sin verificar</span>';
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

// Focus marcador
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
  if (c) { c.classList.add('activo'); c.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// Modal
function abrirModal(id) {
  const c = COMERCIOS.find(x => x.id === id);
  if (!c) return;
  const ds = estado.ubicacion
    ? `${km(estado.ubicacion.lat, estado.ubicacion.lng, c.lat, c.lng).toFixed(2)} km`
    : '—';
  const verif = c.verificado ? '✓ Verificado' : 'Sin verificar';
  document.getElementById('modal-body').innerHTML = `
    <div class="m-nombre">${c.nombre}</div>
    <div class="m-cat">${c.categoria} · ${verif}</div>
    <div class="m-row"><span class="m-label">Dirección</span><span>${c.direccion}</span></div>
    <div class="m-row"><span class="m-label">Teléfono</span><span>${c.telefono}</span></div>
    <div class="m-row"><span class="m-label">Horario</span><span>${c.horario}</span></div>
    <div class="m-row"><span class="m-label">Distancia</span><span>${ds}</span></div>
    <div class="m-redes">${c.redes.map(br).join('')}</div>
    <div class="m-monedas">${c.monedas.map(bc).join('')}</div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}
function cerrarModal() { document.getElementById('modal').classList.add('hidden'); }

// Geolocalización
function usarUbicacion() {
  const btn = document.getElementById('btn-ubicacion');
  btn.textContent = '⏳ Localizando…';
  btn.disabled = true;

  if (!navigator.geolocation) { alert('Geolocalización no disponible.'); resetBtn(); return; }

  navigator.geolocation.getCurrentPosition(({ coords }) => {
    estado.ubicacion = { lat: coords.latitude, lng: coords.longitude };

    if (marcadorUsr) mapa.removeLayer(marcadorUsr);
    if (circulo)     mapa.removeLayer(circulo);

    marcadorUsr = L.circleMarker([coords.latitude, coords.longitude], {
      radius: 8, fillColor: '#3b82f6', color: '#fff', fillOpacity: 1, weight: 2,
    }).addTo(mapa).bindPopup('Tu ubicación').openPopup();

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
  }, err => {
    alert('No se pudo obtener la ubicación.');
    resetBtn();
  }, { enableHighAccuracy: true, timeout: 10000 });
}
function resetBtn() {
  const btn = document.getElementById('btn-ubicacion');
  btn.textContent = '📍 Mi ubicación';
  btn.disabled = false;
}

// Eventos filtros
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

window.abrirModal    = abrirModal;
window.focusMarcador = focusMarcador;

render();
