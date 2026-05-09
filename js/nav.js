let _navActivo  = null;
let _tabSlugs   = [];
let _scrollLock = false; // evita que el observer cambie el tab durante scroll programático

/* ── Inicializar nav ── */
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

  // Click → scroll suave a la sección
  navTabs.addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    _scrollASeccion(tab.dataset.slug);
  });

  // Marcar primera sección activa y arrancar observer
  requestAnimationFrame(() => {
    const primera = activas[0];
    if (primera) _actualizarTabActivo(primera.slug);
    _iniciarObservadorScroll();
  });
}

/* ── Scroll suave a una sección ── */
function _scrollASeccion(slug) {
  const section = document.getElementById(slug);
  if (!section) return;

  _scrollLock = true;
  _actualizarTabActivo(slug);

  const navH = document.querySelector('.nav-bar')?.offsetHeight || 56;
  const top  = section.getBoundingClientRect().top + window.scrollY - navH - 4;
  window.scrollTo({ top, behavior: 'smooth' });

  // Liberar lock después de que termine el scroll suave (~700ms)
  setTimeout(() => { _scrollLock = false; }, 750);
}

/* ── Observer: actualiza el tab activo mientras el usuario hace scroll ── */
function _iniciarObservadorScroll() {
  const navH = document.querySelector('.nav-bar')?.offsetHeight || 56;

  const observer = new IntersectionObserver(entries => {
    if (_scrollLock) return;
    // Toma la sección que entra en vista más arriba
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) _actualizarTabActivo(visible[0].target.id);
  }, {
    rootMargin: `-${navH + 4}px 0px -55% 0px`,
    threshold: 0,
  });

  document.querySelectorAll('.menu-section').forEach(s => observer.observe(s));
}

/* ── Actualiza pill y clase active sin scroll ── */
function _actualizarTabActivo(slug) {
  if (_navActivo === slug) return;
  _navActivo = slug;

  const navTabs = document.getElementById('nav-tabs');
  if (navTabs) {
    navTabs.querySelectorAll('.nav-tab').forEach(tab =>
      tab.classList.toggle('active', tab.dataset.slug === slug)
    );
  }
  _moverPill(slug);
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

/* ── Compatibilidad: activarTab era llamado desde app.js ── */
function activarTab(slug) {
  _actualizarTabActivo(slug);
}
