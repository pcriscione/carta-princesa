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

// Forzar autoplay en iOS al entrar al viewport
function iniciarSmallVideos() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('.sv-video');
      if (!video) return;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.block-small-video').forEach(card => observer.observe(card));
}
