let _navActivo  = null;
let _tabSlugs   = [];

const TRANSICIONES = [
  {
    id: 'fade',  label: 'Fade',
    inFwd:  'anim-fade-in',       inBwd:  'anim-fade-in',
    outFwd: 'anim-fade-out',      outBwd: 'anim-fade-out',
  },
  {
    id: 'slide', label: 'Slide',
    inFwd:  'anim-slide-in-fwd',  inBwd:  'anim-slide-in-bwd',
    outFwd: 'anim-slide-out-fwd', outBwd: 'anim-slide-out-bwd',
  },
  {
    id: 'scale', label: 'Scale',
    inFwd:  'anim-scale-in',      inBwd:  'anim-scale-in',
    outFwd: 'anim-scale-out',     outBwd: 'anim-scale-out',
  },
  {
    id: 'blur',  label: 'Blur',
    inFwd:  'anim-blur-in',       inBwd:  'anim-blur-in',
    outFwd: 'anim-blur-out',      outBwd: 'anim-blur-out',
  },
];

let _transActiva = TRANSICIONES[0];

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

  const t = trans || _transActiva;
  const prevIdx = _tabSlugs.indexOf(_navActivo);
  const nextIdx = _tabSlugs.indexOf(slug);
  const esFwd   = prevIdx < nextIdx || prevIdx === -1;

  const animIn  = esFwd ? t.inFwd  : t.inBwd;
  const animOut = esFwd ? t.outFwd : t.outBwd;

  // Animar salida de la sección anterior
  if (_navActivo) {
    const anterior = document.getElementById(_navActivo);
    if (anterior) {
      anterior.classList.remove('section-visible');
      anterior.classList.add('section-leaving');
      anterior.style.animation = `${animOut} 0.3s ease-in forwards`;
      setTimeout(() => anterior.classList.remove('section-leaving'), 350);
    }
  }

  _navActivo = slug;

  // Animar entrada de la nueva sección
  const nueva = document.getElementById(slug);
  if (nueva) {
    nueva.classList.remove('section-leaving');
    nueva.style.animation = '';
    nueva.offsetHeight; // reflow
    nueva.style.animation = `${animIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both`;
    nueva.classList.add('section-visible');
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
    // Demo: re-animar la sección activa para que se vea el efecto
    if (_navActivo) {
      const seccion = document.getElementById(_navActivo);
      if (seccion) {
        seccion.classList.remove('section-visible');
        seccion.style.animation = '';
        seccion.offsetHeight;
        seccion.style.animation = `${t.inFwd} 0.45s cubic-bezier(0.22, 1, 0.36, 1) both`;
        seccion.classList.add('section-visible');
      }
    }
  });

  document.body.appendChild(picker);
}
