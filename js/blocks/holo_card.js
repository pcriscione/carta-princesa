function renderHoloCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  const imgHtml = item.image_url
    ? `<img src="${escHtml(item.image_url)}" alt="${escHtml(nombre)}" loading="lazy">`
    : '';

  return `
    <div class="block-card block-holo-card block--full"
         data-item-id="${item.id}"
         data-block-type="holo_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <div class="holo-wrap">
        <div class="holo-inner">
          <div class="holo-inside"></div>
          <div class="holo-img-wrap">${imgHtml}</div>
          <div class="holo-shine"></div>
          <div class="holo-glare"></div>
          <div class="holo-content">
            <div class="holo-name">${escHtml(nombre)}</div>
            <div class="holo-price">${escHtml(precio)}</div>
          </div>
          <span class="star-shimmer" aria-hidden="true">
            <img src="./assets/corona.png" alt="corona" style="display:block;width:36px;height:36px;">
          </span>
        </div>
      </div>
      ${badge_text ? `<span class="card-badge" style="z-index:10">${escHtml(badge_text)}</span>` : ''}
    </div>
  `;
}
