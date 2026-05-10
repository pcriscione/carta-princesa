function renderSmallVideo(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  const videoHtml = item.video_url ? `
    <video class="sv-video" autoplay muted loop playsinline webkit-playsinline
           poster="${item.image_url || ''}" aria-hidden="true">
      <source src="${item.video_url}">
    </video>` : '';

  const imgHtml = item.image_url
    ? `<img class="sv-img" src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : '';

  return `
    <div class="block-card block-small-video block--half rotated"
         style="--rot: var(${rot})"
         data-item-id="${item.id}"
         data-block-type="small_video"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${videoHtml || imgHtml}
      ${videoHtml ? imgHtml : ''}
      <div class="card-overlay"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="card-text">
        <div class="card-name">${escHtml(nombre)}</div>
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}

// Toggle video ↔ imagen al tocar
document.addEventListener('click', e => {
  const card = e.target.closest('.block-small-video');
  if (!card) return;
  const video = card.querySelector('.sv-video');
  const img   = card.querySelector('.sv-img');
  if (!video || !img) return;
  e.stopPropagation();
  const showing = card.classList.toggle('sv-show-img');
  if (showing) {
    video.pause();
  } else {
    video.play().catch(() => {});
  }
});
