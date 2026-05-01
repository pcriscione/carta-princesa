function renderHeroVideo(block) {
  const { item, badge_text, title_override, subtitle_override } = block;
  const nombre    = title_override || item.name;
  const subtitulo = subtitle_override || '';
  const precio    = formatPrecio(item.price);

  let mediaHtml;
  if (item.video_url) {
    mediaHtml = `
      <video autoplay muted loop playsinline
             poster="${item.image_url || ''}"
             aria-hidden="true">
        <source src="${item.video_url}">
      </video>
    `;
  } else if (item.image_url) {
    mediaHtml = `
      <img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">
      <div class="hero-play-icon" aria-hidden="true"></div>
    `;
  } else {
    mediaHtml = `<div class="card-placeholder block-hero-video"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;
  }

  return `
    <div class="block-card block-hero-video block--full"
         data-item-id="${item.id}"
         data-block-type="hero_video"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${mediaHtml}
      <div class="card-overlay"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="card-text">
        <div class="card-name">${escHtml(nombre)}</div>
        ${subtitulo ? `<div class="hero-subtitle">${escHtml(subtitulo)}</div>` : ''}
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}
