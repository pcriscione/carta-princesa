let _navActivo = null;
let _tabSlugs  = [];

// Emil: ease-out fuerte para entrada (starts fast = feels responsive)
// Tiempos asimétricos: salida más rápida que entrada
const TRANSICIONES = [
  {
    id: 'drift', label: 'Drift',
    inFwd:  { name: 'drift-in',     dur: '260ms', ease: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    inBwd:  { name: 'drift-in',     dur: '260ms', ease: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    outFwd: { name: 'drift-out',    dur: '160ms', ease: 'ease-in' },
    outBwd: { name: 'drift-out',    dur: '160ms', ease: 'ease-in' },
  },
  {
    id: 'push', label: 'Push',
    inFwd:  { name: 'push-in-fwd',  dur: '320ms', ease: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    inBwd:  { name: 'push-in-bwd',  dur: '320ms', ease: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    outFwd: { name: 'push-out-fwd', dur: '220ms', ease: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    outBwd: { name: 'push-out-bwd', dur: '220ms', ease: 'cubic-bezier(0.32, 0.72, 0, 1)' },
  },
  {
    id: 'reveal', label: 'Reveal',
    inFwd:  { name: 'reveal-in',    dur: '350ms', ease: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    inBwd:  { name: 'reveal-in',    dur: '350ms', ease: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    outFwd: { name: 'reveal-out',   dur: '150ms', ease: 'ease-in' },
    outBwd: { name: 'reveal-out',   dur: '150ms', ease: 'ease-in' },
  },
  {
    id: 'morph', label: 'Morph',
    inFwd:  { name: 'morph-in',     dur: '280ms', ease: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    inBwd:  { name: 'morph-in',     dur: '280ms', ease: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    outFwd: { name: 'morph-out',    dur: '180ms', ease: 'ease-in' },
    outBwd: { name: 'morph-out',    dur: '180ms', ease: 'ease-in' },
  },
];

let _transActiva = TRANSICIONES[0];

function _css(anim) {
  return `${anim.name} ${anim.dur} ${anim.ease} both`;
}

function iniciarNav(secciones) {
  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;

  const activas = secciones.filter(s => s.is_active);
  _tabSlugs = activas.map(s => s.slug);

  navTabs.innerHTML = '<div class="nav-pill" aria-hidden="true"></div>' +
    activas.map(s => `
      <button class="nav-tab" data-slug="${s.slug}" aria-label="Ir a ${escHtml(s.name)}">
        ${escHtml(s.name)}
      </button>
    `).join('');

  navTabs.addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    activarTab(tab.dataset.slug);
  });

  _inyectarPicker();

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

function activarTab(slug, trans) {
  if (_navActivo === slug) return;

  const t       = trans || _transActiva;
  const prevIdx = _tabSlugs.indexOf(_navActivo);
  const nextIdx = _tabSlugs.indexOf(slug);
  const esFwd   = prevIdx < nextIdx || prevIdx === -1;

  // Animar SALIDA (más rápida — el sistema responde)
  if (_navActivo) {
    const anterior = document.getElementById(_navActivo);
    if (anterior) {
      anterior.classList.remove('section-visible');
      anterior.classList.add('section-leaving');
      anterior.style.animation = _css(esFwd ? t.outFwd : t.outBwd);
      const dur = parseInt(esFwd ? t.outFwd.dur : t.outBwd.dur);
      setTimeout(() => anterior.classList.remove('section-leaving'), dur + 50);
    }
  }

  _navActivo = slug;

  // Animar ENTRADA (con punch — el usuario ve respuesta inmediata)
  const nueva = document.getElementById(slug);
  if (nueva) {
    nueva.classList.remove('section-leaving');
    nueva.style.animation = '';
    nueva.offsetHeight; // reflow
    nueva.style.animation = _css(esFwd ? t.inFwd : t.inBwd);
    nueva.classList.add('section-visible');
    // Scroll al top del contenido al cambiar sección
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Re-observar cards no reveladas aún (scroll reveal)
    if (typeof reobservarSeccion === 'function') reobservarSeccion(nueva);
  }

  // Actualizar tabs y pill
  const navTabs = document.getElementById('nav-tabs');
  if (navTabs) {
    navTabs.querySelectorAll('.nav-tab').forEach(tab =>
      tab.classList.toggle('active', tab.dataset.slug === slug)
    );
  }
  _moverPill(slug);
}

function _inyectarPicker() {
  const picker = document.createElement('div');
  picker.className = 'transition-picker';
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
    // Demo: re-animar sección activa con el nuevo estilo
    if (_navActivo) {
      const seccion = document.getElementById(_navActivo);
      if (seccion) {
        seccion.classList.remove('section-visible');
        seccion.style.animation = '';
        seccion.offsetHeight;
        seccion.style.animation = _css(t.inFwd);
        seccion.classList.add('section-visible');
      }
    }
  });

  document.body.appendChild(picker);
}
