let _navActivo = null;
let _scrollObserver = null;

function iniciarNav(secciones) {
  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;

  // Pill deslizante
  navTabs.insertAdjacentHTML('afterbegin', '<div class="nav-pill" aria-hidden="true"></div>');

  // Renderizar tabs
  navTabs.innerHTML += secciones
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

  // Activar el primer tab por defecto (esperar un frame para que los tabs tengan dimensiones)
  const primera = secciones.find(s => s.is_active);
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
  _navActivo = slug;

  const navTabs = document.getElementById('nav-tabs');
  if (!navTabs) return;

  navTabs.querySelectorAll('.nav-tab').forEach(tab => {
    const esActivo = tab.dataset.slug === slug;
    tab.classList.toggle('active', esActivo);
    if (esActivo) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  _moverPill(slug);
}

function _conectarObserver(secciones) {
  if (_scrollObserver) _scrollObserver.disconnect();

  const NAV_H = 48;

  _scrollObserver = new IntersectionObserver(
    entries => {
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
