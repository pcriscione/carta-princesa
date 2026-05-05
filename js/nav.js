let _navActivo  = null;
let _tabSlugs   = [];   // orden de tabs para detectar dirección

const TRANSICIONES = [
  { id: 'fade',  label: 'Fade',  fwd: 'anim-fade',      bwd: 'anim-fade' },
  { id: 'slide', label: 'Slide', fwd: 'anim-slide-fwd',  bwd: 'anim-slide-bwd' },
  { id: 'scale', label: 'Scale', fwd: 'anim-scale',      bwd: 'anim-scale' },
  { id: 'blur',  label: 'Blur',  fwd: 'anim-blur',       bwd: 'anim-blur' },
];

let _transActiva = TRANSICIONES[0];

function iniciarNav(secciones) {
  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;

  const activas = secciones.filter(s => s.is_active);
  _tabSlugs = activas.map(s => s.slug);

  // Renderizar tabs + pill
  navTabs.innerHTML = '<div class="nav-pill" aria-hidden="true"></div>' +
    activas.map(s => `
      <button class="nav-tab" data-slug="${s.slug}" aria-label="Ir a ${escHtml(s.name)}">
        ${escHtml(s.name)}
      </button>
    `).join('');

  // Click en tab
  navTabs.addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    activarTab(tab.dataset.slug);
  });

  // Picker de transición
  _inyectarPicker();

  // Activar primera sección
  const primera = activas[0];
  if (primera) requestAnimationFrame(() => activarTab(primera.slug));
}

function _moverPill(slug) {
  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;
  const pill = navTabs.querySelector('.nav-pill');
  const tab  = navTabs.querySelector(`.nav-tab[data-slug="${slug}"]`);
  if (!pill || !tab) return;
  pill.style.width     = tab.offsetWidth + 'px';
  pill.style.transform = `translateX(${tab.offsetLeft}px)`;
}

function activarTab(slug) {
  if (_navActivo === slug) return;

  // Dirección: fwd si el nuevo tab está a la derecha del actual
  const prevIdx = _tabSlugs.indexOf(_navActivo);
  const nextIdx = _tabSlugs.indexOf(slug);
  const anim = (prevIdx < nextIdx) ? _transActiva.fwd : _transActiva.bwd;
  document.documentElement.style.setProperty('--section-anim', anim);

  // Ocultar sección anterior
  if (_navActivo) {
    const anterior = document.getElementById(_navActivo);
    if (anterior) anterior.classList.remove('section-visible');
  }

  _navActivo = slug;

  // Mostrar nueva sección
  const nueva = document.getElementById(slug);
  if (nueva) {
    // Reset animación forzando reflow
    nueva.classList.remove('section-visible');
    nueva.offsetHeight; // reflow
    nueva.classList.add('section-visible');
  }

  // Actualizar tabs
  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;
  navTabs.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.slug === slug);
  });

  _moverPill(slug);
}

function _inyectarPicker() {
  const picker = document.createElement('div');
  picker.className = 'transition-picker';
  picker.setAttribute('aria-label', 'Estilo de transición');
  picker.innerHTML = `
    <div class="transition-picker-label">Transición</div>
    ${TRANSICIONES.map(t => `
      <button class="tp-btn${t.id === _transActiva.id ? ' active' : ''}"
              data-trans="${t.id}">${t.label}</button>
    `).join('')}
  `;

  picker.addEventListener('click', e => {
    const btn = e.target.closest('.tp-btn');
    if (!btn) return;
    const t = TRANSICIONES.find(x => x.id === btn.dataset.trans);
    if (!t) return;
    _transActiva = t;
    picker.querySelectorAll('.tp-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.trans === t.id)
    );
    // Demo instantánea: re-mostrar la sección activa con la nueva animación
    if (_navActivo) {
      const seccion = document.getElementById(_navActivo);
      if (seccion) {
        document.documentElement.style.setProperty('--section-anim', t.fwd);
        seccion.classList.remove('section-visible');
        seccion.offsetHeight;
        seccion.classList.add('section-visible');
      }
    }
  });

  document.body.appendChild(picker);
}
