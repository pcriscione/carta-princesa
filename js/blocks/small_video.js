function renderSmallVideo(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const rot    = ROTACIONES[idx % ROTACIONES.length];
  const precio = formatPrecio(item.price);

  let mediaHtml;
  if (item.video_url) {
    mediaHtml = `
      <video autoplay muted loop playsinline webkit-playsinline
             preload="auto"
             poster="${item.image_url || ''}"
             aria-hidden="true">
        <source src="${item.video_url}" type="video/mp4">
      </video>
    `;
  } else if (item.image_url) {
    mediaHtml = `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`;
  } else {
    mediaHtml = `<div class="card-placeholder block-small-video"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;
  }

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
