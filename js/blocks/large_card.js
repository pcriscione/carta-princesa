function renderLargeCard(block) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  return `
    <div class="block-card block-large-card block--full"
         data-item-id="${item.id}"
         data-block-type="large_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${imagenOPlaceholder(item.image_url, nombre, 'large')}
      <div class="card-overlay"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="card-text">
        <div class="card-name">${escHtml(nombre)}</div>
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}
