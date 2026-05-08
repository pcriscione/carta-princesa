/**
 * Scroll Reveal — equivalente vanilla a Framer Motion whileInView + staggerChildren
 *
 * Cada .block-card arranca invisible (opacity:0, translateY:28px).
 * Al entrar al viewport el IntersectionObserver agrega .revealed con
 * un delay escalonado de 60ms por tarjeta visible en el mismo batch.
 * Una vez revelada, la tarjeta deja de observarse (once: true).
 * Respeta prefers-reduced-motion.
 */

let _revealObserver = null;

function iniciarScrollReveal(contenedor) {
  // Respetar prefers-reduced-motion (accesibilidad)
  const reducida = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marcar todas las cards para reveal (progressive enhancement:
  // si JS no corre, las cards son visibles por defecto)
  contenedor.querySelectorAll('.block-card').forEach(card => {
    card.classList.add('will-reveal');
  });

  if (_revealObserver) _revealObserver.disconnect();

  _revealObserver = new IntersectionObserver(entries => {
    const visibles = entries.filter(e => e.isIntersecting);
    if (!visibles.length) return;

    visibles.forEach((entry, batchIdx) => {
      const card = entry.target;
      // Stagger: 60ms entre cada tarjeta del mismo batch visible
      const delay = reducida ? 0 : batchIdx * 110;
      card.style.transitionDelay = `${delay}ms`;

      // Un frame de margen para que el delay se registre antes de la clase
      requestAnimationFrame(() => {
        card.classList.add('revealed');
        // Limpiar el delay inline tras la animación para no interferir
        // con interacciones posteriores (hover, etc.)
        setTimeout(() => {
          card.style.transitionDelay = '';
        }, (reducida ? 150 : 900) + delay);
      });

      _revealObserver.unobserve(card);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -32px 0px', // empieza antes de que esté 100% visible
  });

  contenedor.querySelectorAll('.block-card').forEach(card => {
    _revealObserver.observe(card);
  });
}

// Re-observar cards nuevas cuando una sección cambia
// (llamado desde nav.js al mostrar una sección)
function reobservarSeccion(seccionEl) {
  if (!_revealObserver) return;
  seccionEl.querySelectorAll('.block-card:not(.revealed)').forEach(card => {
    _revealObserver.observe(card);
  });
}
