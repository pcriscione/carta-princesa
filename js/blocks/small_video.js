function renderSmallVideo(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  const mediaHtml = item.video_url ? `
    <video class="sv-video" autoplay muted loop playsinline webkit-playsinline
           preload="auto" aria-hidden="true"
           src="${item.video_url}"></video>` : item.image_url
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

// Forzar autoplay en iOS — propiedades por JS y play() en visibilidad
function iniciarSmallVideos() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const video = e.target.querySelector('.sv-video');
      if (!video) return;
      if (e.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.block-small-video').forEach(card => {
    const video = card.querySelector('.sv-video');
    if (!video) return;

    // Propiedades críticas para iOS — más confiable que solo atributos
    video.muted        = true;
    video.defaultMuted = true;
    video.loop         = true;
    video.playsInline  = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');

    // Intentar play() inmediatamente (HTML autoplay) y en eventos clave
    video.play().catch(() => {});
    video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), { once: true });
    video.addEventListener('canplay',        () => video.play().catch(() => {}), { once: true });

    io.observe(card);
  });
}
