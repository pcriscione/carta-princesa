// ── TOAST ──────────────────────────────────────────────────────────────
let _toastTimer = null;

function mostrarToast(mensaje, duracion = 4000) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  // Forzar reflow para que la transición CSS se dispare
  toast.getBoundingClientRect();
  toast.classList.add('visible');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('visible'), duracion);
}

// ── ARRANQUE ────────────────────────────────────────────────────────────
async function arrancar() {
  const contenedor = document.getElementById('carta');
  if (!contenedor) return;

  // 1. Skeletons inmediatos
  contenedor.innerHTML = renderSkeletons();

  // 2. Inicializar modales (inyectan DOM una vez)
  iniciarModal();
  iniciarFlareModal();

  // 3. Cargar datos
  let datos;
  try {
    datos = await cargarCarta();
  } catch (err) {
    console.error('Error cargando carta:', err);
    mostrarToast('Sin conexión — carta en modo offline');
    contenedor.innerHTML = `
      <div style="
        text-align:center;
        padding: 3rem var(--pad);
        font-family: var(--font-title);
        font-style: italic;
        font-size: 1.2rem;
        color: rgba(240,232,216,0.35);
      ">No se pudo cargar la carta.</div>
    `;
    return;
  }

  const { secciones, blocks } = datos;

  // 4. Renderizar carta
  contenedor.innerHTML = renderCarta({ secciones, blocks });


  // 5. Registrar items para el modal
  registrarItems(blocks);

  // 5b. Scroll reveal: staggered entrance de cada card
  iniciarScrollReveal(contenedor);
  registrarFlareItems(blocks);

  // 6. Iniciar navegación
  iniciarNav(secciones);

  // 7. Iniciar cinematic cards
  initCinematicCards();

  // 8. Iniciar flare cards
  initFlareCards();

  // 9. Iniciar magic cards (canvas engine)
  iniciarMagicCards(contenedor);

  // 10. Iniciar holo cards (tilt + shine)
  iniciarHoloCards(contenedor);

  // 11. Forzar autoplay en small videos (iOS Safari)
  iniciarSmallVideos();

  // 7. Si los datos vienen de cache (Supabase falló pero había cache), avisar
  if (!USE_MOCK && datos._desdeCache) {
    mostrarToast('Sin conexión — carta en modo offline');
  }
}

// Flip para large_card (cualquier zona de la tarjeta)
document.addEventListener('click', e => {
  const card = e.target.closest('.block-large-card[data-item-id]');
  if (!card) return;
  card.classList.toggle('flipped');
});

// Flip para magic_card — solo la estrella abre el reverso
document.addEventListener('click', e => {
  // Estrella → mostrar reverso
  const star = e.target.closest('.star-shimmer');
  if (star) {
    e.stopPropagation();
    const card = star.closest('.block-magic-card');
    if (card) card.classList.add('flipped');
    return;
  }
  // Click en el reverso → volver al frente
  const back = e.target.closest('.mc-back');
  if (back) {
    e.stopPropagation();
    const card = back.closest('.block-magic-card');
    if (card) card.classList.remove('flipped');
  }
});


document.addEventListener('DOMContentLoaded', arrancar);
