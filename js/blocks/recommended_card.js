function renderRecommendedCard(block) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);
  const badge  = badge_text || 'Recomendado';

  return `
    <div class="block-card block-recommended-card block--full"
         data-item-id="${item.id}"
         data-block-type="recommended_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${imagenOPlaceholder(item.image_url, nombre, 'recommended')}
      <div class="card-overlay"></div>
      <span class="card-badge">${escHtml(badge)}</span>
      <div class="card-text">
        <div class="card-name">${escHtml(nombre)}</div>
        ${item.description ? `<div class="card-desc">${escHtml(item.description)}</div>` : ''}
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}
