// Recibe dos blocks consecutivos con block_type === 'featured_pair'
// Si solo llega uno (impar al final de sección), lo renderiza como large_card
function renderFeaturedPair(blockA, blockB) {
  if (!blockB) {
    return renderLargeCard(blockA);
  }

  return `
    <div class="block-card block-featured-pair block--full"
         data-block-type="featured_pair"
         aria-label="${escHtml(blockA.item.name)} y ${escHtml(blockB.item.name)}">
      ${_renderPanel(blockA, 'featured-pair-primary')}
      ${_renderPanel(blockB, 'featured-pair-secondary')}
    </div>
  `;
}

function _renderPanel(block, clasePanel) {
  const { item, badge_text, title_override } = block;
  const nombre = title_override || item.name;
  const precio = formatPrecio(item.price);

  const imgHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escHtml(nombre)}" loading="lazy">`
    : `<div class="card-placeholder" style="height:200px;width:100%"><span class="card-placeholder-name">${escHtml(nombre)}</span></div>`;

  return `
    <div class="${clasePanel}"
         data-item-id="${item.id}"
         role="button" tabindex="0"
         aria-label="${escHtml(nombre)}">
      ${imgHtml}
      <div class="card-overlay"></div>
      ${badge_text ? `<span class="card-badge">${escHtml(badge_text)}</span>` : ''}
      <div class="card-text">
        <div class="card-name">${escHtml(nombre)}</div>
        <div class="card-price">${precio}</div>
      </div>
    </div>
  `;
}
