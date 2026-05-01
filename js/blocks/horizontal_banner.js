function renderHorizontalBanner(block) {
  const { item, badge_text, title_override, subtitle_override } = block;
  const nombre    = title_override || item.name;
  const subtitulo = subtitle_override || item.description || '';
  const precio    = formatPrecio(item.price);

  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : `<div class="card-placeholder" style="height:130px"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;

  return `
    <div class="block-card block-horizontal-banner block--full"
         data-item-id="${item.id}"
         data-block-type="horizontal_banner"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="banner-img">
        ${imgHtml}
      </div>
      <div class="banner-body">
        ${badge_text ? `<span class="card-badge" style="position:static;margin-bottom:0.2rem;display:inline-block;align-self:flex-start">${escHtml(badge_text)}</span>` : ''}
        <div class="banner-name">${escHtml(nombre)}</div>
        ${subtitulo ? `<div class="banner-subtitle">${escHtml(subtitulo)}</div>` : ''}
        <div class="banner-price">${precio}</div>
      </div>
    </div>
  `;
}
