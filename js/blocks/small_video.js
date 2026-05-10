function renderSmallVideo(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  const mediaHtml = item.video_url ? `
    <video class="sv-video" autoplay muted loop playsinline webkit-playsinline
           aria-hidden="true">
      <source src="${item.video_url}">
    </video>` : item.image_url
      ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
      : `<div class="card-placeholder"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;

  return `
    <div class="block-card block-small-video block--half rotated"
         style="--rot: var(${rot})"
         data-item-id="${item.id}"
         data-block-type="small_video"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${mediaHtml}
      <div class="card-overlay"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="card-text">
        <div class="card-name">${escHtml(nombre)}</div>
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}

// Forzar autoplay en iOS — llamar play() cuando la card se hace visible
function iniciarSmallVideos() {
  document.querySelectorAll('.block-small-video').forEach(card => {
    const video = card.querySelector('.sv-video');
    if (!video) return;

    // Propiedades críticas para iOS
    video.muted  = true;
    video.loop   = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Llamar play() cuando la card recibe la clase 'revealed' (scroll-reveal)
    const mo = new MutationObserver(() => {
      if (card.classList.contains('revealed')) {
        mo.disconnect();
        // Pequeño delay para que el browser procese la visibilidad
        setTimeout(() => video.play().catch(() => {}), 100);
      }
    });
    mo.observe(card, { attributes: true, attributeFilter: ['class'] });

    // Pausa/reanuda según visibilidad en scroll
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 });
    io.observe(card);
  });
}
