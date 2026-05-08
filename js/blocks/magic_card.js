function renderMagicCard(block, idx = 0) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  return `
    <div class="block-card block-magic-card block--full"
         data-item-id="${item.id}"
         data-block-type="magic_card"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      <canvas class="magic-canvas"
              data-image="${escHtml(item.image_url || '')}"
              data-name="${escHtml(nombre)}"
              data-price="${escHtml(precio)}">
      </canvas>
      ${badge_text ? `<span class="card-badge" style="z-index:10">${escHtml(badge_text)}</span>` : ''}
    </div>
  `;
}
