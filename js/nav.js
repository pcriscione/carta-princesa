let _navActivo = null;
let _scrollObserver = null;

function iniciarNav(secciones) {
  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;

  // Renderizar tabs
  navTabs.innerHTML = secciones
    .filter(s => s.is_active)
    .map(s => `
      <button class="nav-tab"
              data-slug="${s.slug}"
              aria-label="Ir a ${escHtml(s.name)}">
        ${escHtml(s.name)}
      </button>
    `).join('');

  // Click en tab → scroll suave a sección
  navTabs.addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    const slug = tab.dataset.slug;
    const seccion = document.getElementById(slug);
    if (!seccion) return;

    activarTab(slug);
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Observer: activa el tab según qué sección está visible
  _conectarObserver(secciones);

  // Activar el primer tab por defecto
  const primera = secciones.find(s => s.is_active);
  if (primera) activarTab(primera.slug);
}

function activarTab(slug) {
  if (_navActivo === slug) return;
  _navActivo = slug;

  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;

  navTabs.querySelectorAll('.nav-tab').forEach(tab => {
    const esActivo = tab.dataset.slug === slug;
    tab.classList.toggle('active', esActivo);
    // Centrar el tab activo dentro del scroll horizontal
    if (esActivo) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}

function _conectarObserver(secciones) {
  if (_scrollObserver) _scrollObserver.disconnect();

  // El nav sticky tiene ~48px de altura; el offset compensa eso
  const NAV_H = 48;

  _scrollObserver = new IntersectionObserver(
    entries => {
      // Tomar la primera sección que cruce el umbral superior
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        activarTab(visible[0].target.id);
      }
    },
    {
      rootMargin: `-${NAV_H}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  secciones.filter(s => s.is_active).forEach(s => {
    const el = document.getElementById(s.slug);
    if (el) _scrollObserver.observe(el);
  });
}

// Fade suave de las cards al cambiar de sección (llamado desde nav click)
function fadeSecciones(slugActivo) {
  document.querySelectorAll('.menu-section').forEach(el => {
    if (el.id !== slugActivo) {
      el.classList.add('fading');
      setTimeout(() => el.classList.remove('fading'), 300);
    }
  });
}
